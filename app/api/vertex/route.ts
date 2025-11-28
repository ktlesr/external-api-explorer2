import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// --- AYARLAR ---
// API Key kontrolü
if (!process.env.GOOGLE_CLOUD_API_KEY) {
  throw new Error("GOOGLE_CLOUD_API_KEY eksik!");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_CLOUD_API_KEY,
});

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
    const { messages, config } = body; // Config'i opsiyonel olarak frontend'den de alabiliriz

    // 1. Son kullanıcı mesajını al
    const lastMessage = messages[messages.length - 1].content;

    // 2. Vertex AI Ayarları (Varsayılanlar veya Gelenler)
    // Not: Config endpoint'inden çektiğin ayarları buraya manuel de gömebilirsin
    // ama en garantisi burada sabit tanımlamaktır.
    const modelName = 'gemini-2.5-flash-preview-09-2025';
    
    const ragCorpus = 'projects/394408754498/locations/europe-west1/ragCorpora/6917529027641081856';
    
    // 3. Modeli Çağır (YENİ SÜRÜM SDK KULLANIMI)
    // DİKKAT: getGenerativeModel yerine models.generateContentStream kullanıyoruz
    const result = await ai.models.generateContentStream({
      model: modelName,
      contents: [{ role: 'user', parts: [{ text: lastMessage }] }],
      config: {
        temperature: 0.1,
        topP: 0.95,
        maxOutputTokens: 8192,
        systemInstruction: {
            parts: [{ text: `
GÖREVİN: Türkiye Yatırım Teşvik Sistemi uzmanı olarak, SADECE YÜKLENEN BELGELERİ kullanarak soruları yanıtlamak.

BELGE KULLANIM KURALLARI:
1. **ASLA UYDURMA:** Cevabı belgelerde bulamazsan "Belgelerde bilgi yok" de.
2. **LİSTELEME:** Kullanıcı "Hangi illerde?" derse, belgede geçen TÜM illeri listele.
3. **TABLO OKUMA:** Excel verilerini okurken satırları dikkatli birleştir.
            ` }]
        },
        tools: [
          {
            retrieval: {
              vertexRagStore: {
                ragResources: [
                  {
                    ragResource: { ragCorpus: ragCorpus },
                  },
                ],
                similarityTopK: 13,
              },
            },
          },
        ],
        safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' }
        ]
      },
    });

    // 4. Stream Yanıtı Hazırla
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            // Yeni SDK'da metin chunk.text() fonksiyonu ile değil, 
            // chunk.text veya chunk.candidates[0].content.parts[0].text ile gelir.
            const text = chunk.text(); 
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          console.error("Stream okuma hatası:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, { headers });

  } catch (error: any) {
    console.error("API Hatası:", error);
    return NextResponse.json(
      { error: error.message || "Sunucu hatası" }, 
      { status: 500, headers }
    );
  }
}
