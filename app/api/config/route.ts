import { NextResponse } from "next/server"

// Konfigürasyonu kaydetme endpoint'i
export async function POST(req: Request) {
  try {
    const config = await req.json()

    // Burada config'i veritabanına kaydedebilirsin
    // Şimdilik sadece başarılı yanıt döndürüyoruz

    return NextResponse.json({ success: true, config })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Konfigürasyonu okuma endpoint'i
export async function GET() {
  try {
    // Burada config'i veritabanından okuyabilirsin
    // Şimdilik default config döndürüyoruz

    const defaultConfig = {
      modelName: "gemini-2.5-flash-preview-09-2025",
      systemInstruction: `GÖREVİN: Türkiye Yatırım Teşvik Sistemi uzmanı olarak, SADECE YÜKLENEN BELGELERİ kullanarak soruları yanıtlamak.

KURALLAR:
1. SADECE BELGE ODAKLI OL: Cevabı belgelerde bulamazsan uydurma.
2. LİSTELEME: "Hangi illerde?" sorusuna tüm illeri listele.
3. FORMAT: Cevabın sonuna "Bilgiler dokümanlardan derlenmiştir." notunu ekle.`,
      ragCorpus: "projects/394408754498/locations/europe-west1/ragCorpora/6917529027641081856",
      similarityTopK: 10,
      temperature: 0.1,
      topP: 0.95,
      maxOutputTokens: 65535,
    }

    return NextResponse.json(defaultConfig)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
