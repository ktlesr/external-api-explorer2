import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

// --- AYARLAR ---
const apiKey = process.env.GOOGLE_CLOUD_API_KEY || "";

// 👇 DÜZELTME BURADA: Vertex AI kullanacağını açıkça belirtiyoruz
const ai = new GoogleGenAI({
  apiKey: apiKey,
  vertexAI: {
    project: '394408754498', // Senin Proje Numaran (Corpus ID'den aldım)
    location: 'europe-west1', // Senin Bölgen
  }
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

  // Güvenlik Kontrolü
  if (!process.env.GOOGLE_CLOUD_API_KEY) {
    return NextResponse.json(
      { error: "Sunucu hatası: GOOGLE_CLOUD_API_KEY tanımlanmamış." }, 
      { status: 500, headers }
    );
  }

  try {
    const body = await req.json();
    const { messages } = body; 

    const lastMessage = messages[messages.length - 1].content;

    // Model Adı (Vertex AI için uyumlu model)
    // Not: "preview" modeller bazen Vertex'te farklı isimlendirilir. 
    // Eğer hata alırsan "gemini-1.5-flash-001" dene.
    const modelName = 'gemini-1.5-flash-001'; 
    
    const ragCorpus = 'projects/394408754498/locations/europe-west1/ragCorpora/6917529027641081856';
    
    // Modeli Çağır
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
                similarityTopK: 10, // Chunk sayısı
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

    // Stream Yanıtı Hazırla
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
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
