import { VertexAI } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";

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
    // 1. Kimlik Bilgilerini Al (.env.local'dan)
    const projectId = process.env.VERTEX_PROJECT_ID;
    const location = process.env.VERTEX_LOCATION;
    const clientEmail = process.env.VERTEX_CLIENT_EMAIL;
    // Private Key'deki \n karakterlerini düzeltiyoruz (Çok Önemli)
    const privateKey = process.env.VERTEX_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        // Hata detayını console'a yazalım ki eksik olanı gör
        console.error("Eksik Env:", { projectId, clientEmail, hasKey: !!privateKey });import { VertexAI } from "@google-cloud/vertexai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// --- CORS ---
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

// --- MAIN CHAT HANDLER ---
export async function POST(req: Request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "text/plain; charset=utf-8",
  };

  try {
    // 1. Gelen isteği ve Supabase bağlantı bilgilerini al (Env'den)
    // Not: Supabase keyleri build time'da değil runtime'da okunur, sorun olmaz.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase ortam değişkenleri eksik!");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // 2. Veritabanından EN SON Config ve Kimlik Bilgilerini Çek
    const { data: config, error } = await supabase
      .from('vertex_configs')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single();

    if (error || !config) {
        throw new Error("Veritabanından konfigürasyon çekilemedi.");
    }

    // 3. Kimlik Bilgilerini Belirle (DB Öncelikli, Yoksa Env)
    const projectId = config.vertex_project_id || process.env.VERTEX_PROJECT_ID;
    const clientEmail = config.vertex_client_email || process.env.VERTEX_CLIENT_EMAIL;
    // Private Key'deki \n karakterlerini düzeltiyoruz
    const privateKey = (config.vertex_private_key || process.env.VERTEX_PRIVATE_KEY || "").replace(/\\n/g, '\n');

    // 4. Runtime Kontrolü (Build'de çalışmaz, sadece istek gelince çalışır)
    if (!projectId || !clientEmail || !privateKey) {
       return NextResponse.json({ error: "Vertex AI Kimlik Bilgileri Eksik! Admin panelinden ekleyin." }, { status: 500, headers });
    }

    // 5. Vertex AI Başlat
    const vertex_ai = new VertexAI({
      project: projectId,
      location: 'europe-west1', // Sabit veya DB'den de alınabilir
      googleAuthOptions: {
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        }
      }
    });

    // 6. Chat Parametrelerini Hazırla
    const body = await req.json();
    const { messages } = body;
    const lastMessage = messages[messages.length - 1].content;

    const generativeModel = vertex_ai.preview.getGenerativeModel({
      model: config.model_name || "gemini-1.5-flash-001",
      generationConfig: {
        maxOutputTokens: config.max_output_tokens || 8192,
        temperature: config.temperature ?? 0.1,
        topP: config.top_p ?? 0.95,
      },
      systemInstruction: {
        parts: [{ text: config.system_instruction || "Sen yardımcı bir asistansın." }]
      },
      tools: config.rag_corpus ? [{
        retrieval: {
          vertexRagStore: {
            ragResources: [{
              ragResource: { ragCorpus: config.rag_corpus }
            }],
            similarityTopK: config.similarity_top_k || 10,
          }
        }
      }] : undefined,
    });

    // 7. Sohbeti Başlat ve Cevabı Stream Et
    const chat = generativeModel.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
    });

    const result = await chat.sendMessageStream(lastMessage);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const item of result.stream) {
            const text = item.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) controller.enqueue(encoder.encode(text));
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
        return NextResponse.json({ error: "Vertex AI Kimlik Bilgileri Eksik!" }, { status: 500, headers });
    }

    // 2. Vertex AI Başlat
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

    const body = await req.json();
    const { messages } = body;
    const lastMessage = messages[messages.length - 1].content;

    // 3. Modeli ve RAG Aracını Hazırla
    // Model adı: Vertex AI'da "gemini-1.5-flash-001" kararlı sürümdür.
    const generativeModel = vertex_ai.preview.getGenerativeModel({
      model: "gemini-1.5-flash-001",
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.1,
        topP: 0.95,
      },
      systemInstruction: {
        parts: [{ text: `
GÖREVİN: Türkiye Yatırım Teşvik Sistemi uzmanı olarak, SADECE YÜKLENEN BELGELERİ kullanarak soruları yanıtlamak.

KURALLAR:
1. BELGE DIŞINA ÇIKMA: Cevabı belgelerde bulamazsan uydurma.
2. LİSTELEME: "Hangi illerde?" sorularına belgelerdeki TÜM illeri listele.
3. TABLO OKUMA: Excel tablolarındaki verileri (True/False, Oranlar) anlamlı cümlelere dök.
4. FORMAT: Cevabın sonuna "Bilgiler dokümanlardan derlenmiştir." notunu ekle.
        ` }]
      },
      // 👇 DÜZELTİLEN KISIM BURASI 👇
      tools: [{
        retrieval: {
          vertexRagStore: {
            ragResources: [
              {
                ragCorpus: `projects/${projectId}/locations/${location}/ragCorpora/6917529027641081856`
              }
            ],
            similarityTopK: 10, // Kaç parça veri getirsin?
          }
        }
      }],
    });

    // 4. Sohbeti Başlat
    const chat = generativeModel.startChat({
      history: messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
    });

    // 5. Mesajı Gönder (Stream)
    const result = await chat.sendMessageStream(lastMessage);

    // 6. Stream Yanıtı İlet
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const item of result.stream) {
            // Vertex SDK'sında text yapısı bazen değişebilir, güvenli erişim:
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
    // Hatayı detaylı görelim
    console.error("Vertex API Detaylı Hata:", JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { error: error.message || "Sunucu hatası" }, 
      { status: 500, headers }
    );
  }
}
