import { VertexAI } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";

// --- AYARLAR ---
// Ortam değişkenlerini alıyoruz
const projectId = process.env.VERTEX_PROJECT_ID;
const location = process.env.VERTEX_LOCATION;
const clientEmail = process.env.VERTEX_CLIENT_EMAIL;
const privateKey = process.env.VERTEX_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Satır sonlarını düzelt

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Vertex AI kimlik bilgileri eksik! .env dosyasını kontrol edin.");
}

// Vertex AI İstemcisini Başlat (Service Account ile)
const vertex_ai = new VertexAI({
  project: projectId,
  location: location,
  googleAuthOptions: {
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    }
  }
});

// Modeli Seç (Vertex AI'da kararlı sürümü kullanmak daha güvenlidir)
// RAG destekleyen model: gemini-1.5-flash-001
const modelName = "gemini-1.5-flash-001"; 

// --- CORS (Preflight) ---
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

// --- POST (Chat) ---
export async function POST(req: Request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "text/plain; charset=utf-8",
  };

  try {
    const body = await req.json();
    const { messages } = body;
    const lastMessage = messages[messages.length - 1].content;

    // Generative Model'i RAG Ayarlarıyla Başlat
    const generativeModel = vertex_ai.preview.getGenerativeModel({
      model: modelName,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.1,
        topP: 0.95,
      },
      // 👇 İŞTE SİHİRLİ NOKTA: Vertex RAG Tool Tanımı
      tools: [{
        retrieval: {
          vertexRagStore: {
            ragResources: [{
              ragResource: {
                ragCorpus: `projects/${projectId}/locations/${location}/ragCorpora/6917529027641081856`
              }
            }],
            similarityTopK: 10, // Kaç parça veri getirsin?
          }
        }
      }],
    });

    // Sistem Talimatı (Prompt)
    const chat = generativeModel.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
    });

    // Mesajı Gönder (Stream)
    const result = await chat.sendMessageStream(lastMessage);

    // Stream Yanıtı Hazırla
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const item of result.stream) {
            // Vertex SDK yanıt yapısı
            const text = item.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          console.error("Stream hatası:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, { headers });

  } catch (error: any) {
    console.error("Vertex API Hatası:", error);
    return NextResponse.json(
      { error: error.message || "Sunucu hatası" }, 
      { status: 500, headers }
    );
  }
}
