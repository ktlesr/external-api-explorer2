import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
      .single();

    if (configError || !config) {
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
      throw new Error("Vertex AI credentials eksik");
    }

    // 5. Generate JWT Token for Google Auth
    const jwtHeader = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const now = Math.floor(Date.now() / 1000);
    const jwtClaim = btoa(JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }));

    // Import crypto for signing
    const encoder = new TextEncoder();
    const keyData = privateKey
      .replace("-----BEGIN PRIVATE KEY-----", "")
      .replace("-----END PRIVATE KEY-----", "")
      .replace(/\s/g, "");
    
    const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      encoder.encode(`${jwtHeader}.${jwtClaim}`)
    );

    const jwtToken = `${jwtHeader}.${jwtClaim}.${btoa(String.fromCharCode(...new Uint8Array(signature)))}`;

    // 6. Get Access Token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`,
    });

    const { access_token } = await tokenResponse.json();

    if (!access_token) {
      throw new Error("Google access token alınamadı");
    }

    // 7. Prepare Vertex AI Request Payload
    const vertexPayload = {
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
      tools: config.rag_corpus ? [{
        retrieval: {
          vertexRagStore: {
            ragResources: [{ ragCorpus: config.rag_corpus }],
            similarityTopK: config.similarity_top_k || 50,
            vectorDistanceThreshold: 0.3,
          },
        },
      }] : undefined,
    };

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
      throw new Error(`Vertex AI error: ${vertexResponse.status}`);
    }

    // 9. Stream Response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = vertexResponse.body!.getReader();
        const decoder = new TextDecoder();
        let collectedMetadata: any = null;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split("\n").filter(line => line.trim());

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6);
                try {
                  const parsed = JSON.parse(jsonStr);
                  
                  // Extract text
                  const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(new TextEncoder().encode(text));
                  }

                  // Extract metadata
                  if (parsed.candidates?.[0]?.groundingMetadata) {
                    collectedMetadata = parsed.candidates[0].groundingMetadata;
                  }
                } catch (e) {
                  console.error("JSON parse error:", e);
                }
              }
            }
          }

          // Send metadata at the end
          if (collectedMetadata) {
            const sources = collectedMetadata.groundingChunks?.map((chunk: any, index: number) => ({
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
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
