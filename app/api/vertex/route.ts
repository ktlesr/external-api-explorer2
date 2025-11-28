import { VertexAI } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    },
  });
}

export async function POST(req: Request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "text/plain; charset=utf-8",
  };

  try {
    // 1. Supabase Bağlantısı
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) throw new Error("Supabase env eksik!");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Config Çekme
    const { data: config } = await supabase
      .from('vertex_configs')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (!config) throw new Error("Config bulunamadı.");

    // 3. Vertex AI Başlatma
    const projectId = config.vertex_project_id || process.env.VERTEX_PROJECT_ID;
    const location = "europe-west1";
    const clientEmail = config.vertex_client_email || process.env.VERTEX_CLIENT_EMAIL;
    const privateKey = (config.vertex_private_key || process.env.VERTEX_PRIVATE_KEY || "").replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        return NextResponse.json({ error: "Kimlik eksik." }, { status: 500, headers });
    }

    const vertex_ai = new VertexAI({
      project: projectId,
      location: location,
      googleAuthOptions: { credentials: { client_email: clientEmail, private_key: privateKey } }
    });

    const body = await req.json();
    const { messages } = body;
    const lastMessage = messages[messages.length - 1].content;

    // 4. Model Ayarları ve Prompt
    const generativeModel = vertex_ai.preview.getGenerativeModel({
      model: config.model_name || "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 65535,
        temperature: 0.1, 
        topP: 0.95,
      },
      systemInstruction: {
        parts: [{ text: `
GÖREVİN: T.C. Yatırım Teşvik Sistemi uzmanı olarak soruları yanıtlamak.

KAYNAK GÖSTERİM KURALI (ÇOK ÖNEMLİ):
Cevap verirken kullandığın bilgilerin sonuna mutlaka referans numarası ekle. Örn: [1], [2].
Bu numaralar, kullanılan doküman parçalarına (chunks) karşılık gelmelidir.
Asla referanssız bilgi verme.
        ` }]
      },
      tools: [{
        retrieval: {
          vertexRagStore: {
            ragResources: [{
              ragResource: { ragCorpus: config.rag_corpus }
            }],
            similarityTopK: 50,
            vectorDistanceThreshold: 0.5, 
          }
        }
      }],
    });

    const chat = generativeModel.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
    });

    const result = await chat.sendMessageStream(lastMessage);

    // 5. STREAM YÖNETİMİ VE METADATA YAKALAMA
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let collectedMetadata: any = null; // Metaveriyi burada tutacağız

        try {
          for await (const item of result.stream) {
            // A. Metni Yakala ve Gönder
            const text = item.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }

            // B. Metaveriyi (Sources) Yakala (Genelde ilk veya son chunk'ta gelir)
            if (item.candidates?.[0]?.groundingMetadata) {
              collectedMetadata = item.candidates[0].groundingMetadata;
            }
          }

          // C. Sohbet Bitince Kaynakları JSON Olarak En Sona Ekle
          if (collectedMetadata) {
            // Kaynakları sadeleştir
            const sources = collectedMetadata.groundingChunks?.map((chunk: any, index: number) => ({
                index: index + 1, // [1], [2] için numara
                title: chunk.retrievedContext?.title || "Bilinmeyen Belge",
                uri: chunk.retrievedContext?.uri || "",
                text: chunk.retrievedContext?.text || "" // İstersen içeriği de gönderebilirsin
            })) || [];

            if (sources.length > 0) {
                // Özel bir ayraç ile JSON verisini gönderiyoruz
                const metadataString = `\n\n__METADATA__${JSON.stringify(sources)}`;
                controller.enqueue(encoder.encode(metadataString));
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

    return new Response(stream, { headers });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500, headers });
  }
}
