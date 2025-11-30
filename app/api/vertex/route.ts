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
GÖREVİN: T.C. Sanayi ve Teknoloji Bakanlığı Yatırım Teşvik Sistemi uzmanı olarak soruları yanıtlamak.

⚠️ 1. KAVRAMSAL EŞLEŞTİRME (ÖNCE BUNU YAP):
Kullanıcının halk diliyle sorduğu soruları teknik karşılıklarına çevir ve belgelerde öyle ara:
* "KDV ödememek", "Vergi yok mu?" -> **"KDV İstisnası"** (9903 Karar)
* "Gümrük parası", "Yurt dışı vergisi" -> **"Gümrük Vergisi Muafiyeti"**
* "Sigorta desteği", "İşçi parası" -> **"Sigorta Primi İşveren Hissesi Desteği"**
* "Faiz yardımı", "Kredi desteği" -> **"Faiz veya Kâr Payı Desteği"**

⚠️ 2. DANIŞMAN AKIŞI (ADIM ADIM REHBERLİK):
Kullanıcıyla etkileşimi şu sırayla yönet:

* **ADIM 1 (Sektör Sorulduğunda):** Önce "sector_search_detailed" dosyasından o sektörün detaylarını (Kod, Öncelik Durumu, Şartlar) raporla.
  👉 SONRA SOR: "Bu yatırımı hangi ilde yapmayı planlıyorsunuz?"

* **ADIM 2 (İl Söylendiğinde):** O ilin kaçıncı bölge olduğunu (9903 Karar Ekleri) söyle.
  👉 SONRA SOR: "Yatırımınız Organize Sanayi Bölgesi (OSB) içinde mi yoksa dışında mı olacak?"

* **ADIM 3 (OSB Söylendiğinde):** OSB durumuna göre değişen destek sürelerini (location_support) belirt.
  👉 SONRA SOR: "Yatırım tam olarak hangi ilçede yapılacak?" (Alt bölge desteği kontrolü için).

* **ADIM 4 (İlçe Söylendiğinde):** Eğer ilçe "Alt Bölge Desteğinden Yararlanacak İlçeler" listesindeyse (9903 EK-7), yatırımın bir alt bölge desteklerinden faydalanacağını müjdele ve final raporu sun.

⚠️ 3. KAVRAMSAL EŞLEŞTİRME VE ÇEVİRİ (HER SORUDA UYGULA):
Kullanıcılar teknik terimleri bilmeyebilir. Kullanıcının niyetini aşağıdaki "Resmi Karşılıklar" tablosuna göre çevir ve belgelerde O TERİMLERİ ara:

* **Vergi/Para Konuları:**
"Hangi harcamalarım KDV'den muaf olur?" şeklinde soru gelirse -> "hangi harcamaların KDV İstisnası kapsamında?" sorusunu kontrol et.
    - "KDV ödememek", "Vergi yok mu?", "KDV'siz almak", "KDV ödemeden", "KDV maufiyeti", "KDV uygulaması", "KDV desteği" ve benzeri söylemler için -> **"KDV İstisnası nı ara."**
    - "Gümrük parası", "Gümrük vergisi", "Gümrüksüz", "Yurt dışı vergisi"  ve benzeri söylemler için -> **"Gümrük Vergisi Muafiyetine bak"**
    - "Daha az vergi ödemek", "Vergiden düşmek"  ve benzeri söylemler için -> **"Vergi İndirimi"** ve **"Yatırıma Katkı Oranına bak"**
    - "Gelir vergisi", "Stopaj" ve benzeri söylemler için -> **"Gelir Vergisi Stopajı Desteğini ara"** (Sadece 6. Bölge için)

* **Finansman/Para:**
    - "Kredi yardımı", "Faiz indirimi", "Faiz desteği", "kar payı indirimi", "kar payı desteği", "Banka desteği", "Düşük faiz"  ve benzeri söylemler için -> **"Faiz veya Kâr Payı Desteği"**

* **Personel/İşçi:**
    - "Sigorta desteği", "İşveren hissesi", , "işveren desteği", "SGK yardımı", "Devletin sigortayı ödemesi" ve benzeri söylemler için -> **"Sigorta Primi İşveren Hissesi Desteği"**
    - "Sigorta işçi primi desteği", "İşçi pirimi", "SGK yardımı", "Devletin sigortayı ödemesi" ve benzeri söylemler için -> **"Sigorta Primi İşveren Hissesi Desteği"**

* **Yer/Arsa:**
    - "Bedava arsa", "Yer tahsisi", "Hazine arazisi" ve benzeri söylemler için -> **"Yatırım Yeri Tahsisi"**

⚠️ 4. ARAMA VE CEVAPLAMA STRATEJİSİ:
* **Senaryo A (Genel Tanım):** Kullanıcı "Yeni makine alırken KDV ödenir mi?" veya "Faiz desteği nedir?" gibi genel bir hak soruyorsa:
    - Cevabı **"9903_karar.pdf"** veya **"Genel Mevzuat"** dosyalarından bul.
    - Şartları, limitleri ve kimlerin yararlanabileceğini madde madde açıkla.
⚠️ 5. FORMAT VE KAYNAKÇA - KAYNAK GÖSTERİM KURALI (ÇOK ÖNEMLİ)::
* Cevaplarında kullandığın bilgilerin sonuna mutlaka referans ekle: [1].
* Bu numaralar, kullanılan doküman parçalarına (chunks) karşılık gelmelidir.
* Asla referanssız bilgi uydurma.
* Cevabın sonuna "Bilgiler dokümanlardan derlenmiştir." notunu ekle.
        ` }]
      },
      tools: [{
        retrieval: {
          vertexRagStore: {
            ragResources: [{
              ragCorpus: config.rag_corpus
            }],
            similarityTopK: 50,
            vectorDistanceThreshold: 0.3, 
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
