import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Base64URL encoding (Google JWT requires this, not standard base64)
function base64url(data: string | Uint8Array): string {
  let base64: string;
  if (typeof data === "string") {
    base64 = btoa(data);
  } else {
    base64 = btoa(String.fromCharCode(...data));
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Supabase Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Fetch Config
    const { data: config, error: configError } = await supabase
      .from("vertex_configs")
      .select("*")
      .eq("config_key", "default")
      .maybeSingle();

    if (configError || !config) {
      console.error("Config error:", configError);
      throw new Error("Config bulunamadı: " + configError?.message);
    }

    // 3. Get Request Body
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // 4. Prepare Vertex AI Request
    const projectId = config.vertex_project_id;
    const location = "europe-west1";
    const modelName = config.model_name || "gemini-2.5-flash";

    const clientEmail = config.vertex_client_email;
    const privateKey = (config.vertex_private_key || "").replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      console.error(
        "Missing credentials - projectId:",
        !!projectId,
        "clientEmail:",
        !!clientEmail,
        "privateKey:",
        !!privateKey,
      );
      throw new Error("Vertex AI credentials eksik");
    }

    console.log("Starting JWT generation for:", clientEmail);

    // 5. Generate JWT Token for Google Auth (using base64url)
    const jwtHeader = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const now = Math.floor(Date.now() / 1000);
    const jwtClaimObj = {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };
    const jwtClaim = base64url(JSON.stringify(jwtClaimObj));

    // Import crypto for signing
    const encoder = new TextEncoder();
    const keyData = privateKey
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/[\r\n\s]/g, "");

    let binaryKey: Uint8Array;
    try {
      binaryKey = Uint8Array.from(atob(keyData), (c) => c.charCodeAt(0));
    } catch (e) {
      console.error("Private key decode error:", e);
      throw new Error("Private key formatı hatalı");
    }

    let cryptoKey;
    try {
      cryptoKey = await crypto.subtle.importKey(
        "pkcs8",
        binaryKey.buffer as ArrayBuffer,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["sign"],
      );
    } catch (e) {
      console.error("Crypto key import error:", e);
      throw new Error("Private key import edilemedi");
    }

    const signatureBuffer = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      encoder.encode(`${jwtHeader}.${jwtClaim}`),
    );

    const jwtSignature = base64url(new Uint8Array(signatureBuffer));
    const jwtToken = `${jwtHeader}.${jwtClaim}.${jwtSignature}`;

    console.log("JWT generated, requesting access token...");

    // 6. Get Access Token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`,
    });

    const tokenData = await tokenResponse.json();
    console.log("Token response status:", tokenResponse.status);

    if (!tokenData.access_token) {
      console.error("Token error:", JSON.stringify(tokenData));
      throw new Error(
        "Google access token alınamadı: " + (tokenData.error_description || tokenData.error || "Unknown"),
      );
    }

    const access_token = tokenData.access_token;
    console.log("Access token received, calling Vertex AI...");

    // 7. Prepare Vertex AI Request Payload
    const vertexPayload: any = {
      contents: messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
      systemInstruction: {
        parts: [{ text: config.system_instruction || "Sen yardımcı bir asistansın." }],
      },
      generationConfig: {
        maxOutputTokens: config.max_output_tokens || 65535,
        temperature: config.temperature ?? 0.1,
        topP: config.top_p ?? 0.95,
      },
    };

    // Add RAG tools if corpus is configured
    if (config.rag_corpus) {
      vertexPayload.tools = [
        {
          retrieval: {
            vertexRagStore: {
              ragResources: [{ ragCorpus: config.rag_corpus }],
              similarityTopK: config.similarity_top_k || 50,
              vectorDistanceThreshold: config.vector_distance_threshold || 0.4,
            },
          },
        },
      ];
    }

    // 8. Call Vertex AI Streaming API
    const vertexUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelName}:streamGenerateContent`;

    const vertexResponse = await fetch(vertexUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vertexPayload),
    });

    if (!vertexResponse.ok) {
      const errorText = await vertexResponse.text();
      console.error("Vertex AI Error:", errorText);
      throw new Error(`Vertex AI error: ${vertexResponse.status} - ${errorText}`);
    }

    console.log("Vertex AI response received, streaming...");

    // 9. Stream Response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = vertexResponse.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let collectedMetadata: any = null;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Vertex AI returns JSON array, parse incrementally
            try {
              // Try to parse as JSON array
              const parsed = JSON.parse(buffer);
              if (Array.isArray(parsed)) {
                for (const item of parsed) {
                  const text = item.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(new TextEncoder().encode(text));
                  }
                  if (item.candidates?.[0]?.groundingMetadata) {
                    collectedMetadata = item.candidates[0].groundingMetadata;
                  }
                }
                buffer = "";
              }
            } catch {
              // Not complete JSON yet, continue buffering
            }
          }

          // Final parse attempt
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer);
              if (Array.isArray(parsed)) {
                for (const item of parsed) {
                  const text = item.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(new TextEncoder().encode(text));
                  }
                  if (item.candidates?.[0]?.groundingMetadata) {
                    collectedMetadata = item.candidates[0].groundingMetadata;
                  }
                }
              }
            } catch (e) {
              console.error("Final parse error:", e, "Buffer:", buffer.substring(0, 200));
            }
          }

          // Send metadata at the end
          if (collectedMetadata) {
            const sources =
              collectedMetadata.groundingChunks?.map((chunk: any, index: number) => ({
                index: index + 1,
                title: chunk.retrievedContext?.title || "Bilinmeyen Belge",
                uri: chunk.retrievedContext?.uri || "",
                text: chunk.retrievedContext?.text || "",
              })) || [];

            if (sources.length > 0) {
              const metadataString = `\n\n__METADATA__${JSON.stringify(sources)}`;
              controller.enqueue(new TextEncoder().encode(metadataString));
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
