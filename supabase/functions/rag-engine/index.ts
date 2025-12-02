import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Base64URL encoding for Google JWT
function base64url(data: string | Uint8Array): string {
  let base64: string;
  if (typeof data === "string") {
    base64 = btoa(data);
  } else {
    base64 = btoa(String.fromCharCode(...data));
  }
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
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

  const encoder = new TextEncoder();
  const keyData = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/[\r\n\s]/g, "");

  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey.buffer as ArrayBuffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(`${jwtHeader}.${jwtClaim}`)
  );

  const jwtSignature = base64url(new Uint8Array(signatureBuffer));
  const jwtToken = `${jwtHeader}.${jwtClaim}.${jwtSignature}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`,
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw new Error("Google access token alınamadı: " + (tokenData.error_description || tokenData.error));
  }
  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch config
    const { data: config, error: configError } = await supabase
      .from("vertex_configs")
      .select("*")
      .eq("config_key", "default")
      .maybeSingle();

    if (configError || !config) {
      throw new Error("Config bulunamadı: " + configError?.message);
    }

    const projectId = config.vertex_project_id;
    const clientEmail = config.vertex_client_email;
    const privateKey = (config.vertex_private_key || "").replace(/\\n/g, "\n");
    const ragCorpus = config.rag_corpus;
    const location = "europe-west1";

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Vertex AI credentials eksik");
    }

    const { action, ...params } = await req.json();
    console.log("RAG Engine action:", action, params);

    const accessToken = await getAccessToken(clientEmail, privateKey);

    switch (action) {
      case "list-files": {
        const url = `https://${location}-aiplatform.googleapis.com/v1/${ragCorpus}/ragFiles`;
        console.log("Listing files from:", url);
        
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("List files error:", errorText);
          throw new Error(`List files failed: ${response.status}`);
        }
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get-corpus": {
        const url = `https://${location}-aiplatform.googleapis.com/v1/${ragCorpus}`;
        console.log("Getting corpus info from:", url);
        
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Get corpus error:", errorText);
          throw new Error(`Get corpus failed: ${response.status}`);
        }
        
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "import-files": {
        const { source, chunkSize, chunkOverlap, maxEmbeddingRequestsPerMin, parserType, parserConfig } = params;
        
        const importConfig: any = {
          ragFileTransformationConfig: {
            ragFileChunkingConfig: {
              chunkSize: chunkSize || 1024,
              chunkOverlap: chunkOverlap || 256,
            },
          },
          maxEmbeddingRequestsPerMin: maxEmbeddingRequestsPerMin || 1000,
        };

        // Set source
        if (source.type === "gcs") {
          importConfig.gcsSource = { uris: [source.uri] };
        } else if (source.type === "googleDrive") {
          importConfig.googleDriveSource = { resourceIds: [{ resourceId: source.resourceId, resourceType: source.resourceType || "RESOURCE_TYPE_FILE" }] };
        } else if (source.type === "slack") {
          importConfig.slackSource = { channels: source.channels };
        } else if (source.type === "jira") {
          importConfig.jiraSource = source.jiraConfig;
        }

        // Set parser config
        if (parserType === "llm") {
          importConfig.ragFileParsingConfig = {
            llmParser: {
              model: `projects/${projectId}/locations/${location}/publishers/google/models/${parserConfig.model || "gemini-1.5-flash"}`,
              ...(parserConfig.maxParsingRequestsPerMin && { maxParsingRequestsPerMin: parserConfig.maxParsingRequestsPerMin }),
              ...(parserConfig.customParsingPrompt && { customParsingPrompt: parserConfig.customParsingPrompt }),
            },
          };
        } else if (parserType === "layout") {
          importConfig.ragFileParsingConfig = {
            layoutParser: {
              processorName: `projects/${projectId}/locations/${parserConfig.processorRegion}/processors/${parserConfig.processorId}`,
              maxParsingRequestsPerMin: parserConfig.maxParsingRequestsPerMin || 120,
            },
          };
        }

        const url = `https://${location}-aiplatform.googleapis.com/v1/${ragCorpus}/ragFiles:import`;
        console.log("Importing files to:", url, "with config:", JSON.stringify({ importRagFilesConfig: importConfig }));

        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ importRagFilesConfig: importConfig }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Import files error:", errorText);
          throw new Error(`Import failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "delete-file": {
        const { fileName } = params;
        const url = `https://${location}-aiplatform.googleapis.com/v1beta1/${fileName}`;
        console.log("Deleting file:", url);

        const response = await fetch(url, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Delete file error:", errorText);
          throw new Error(`Delete failed: ${response.status}`);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get-operation": {
        const { operationName } = params;
        const url = `https://${location}-aiplatform.googleapis.com/v1/${operationName}`;
        console.log("Getting operation:", url);

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Get operation error:", errorText);
          throw new Error(`Get operation failed: ${response.status}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error("RAG Engine Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
