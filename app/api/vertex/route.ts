import { NextResponse } from "next/server"

// CORS için OPTIONS metodu
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key",
    },
  })
}

// POST metodu - Asıl işlem
export async function POST(req: Request) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "text/plain; charset=utf-8",
  }

  try {
    // API Key kontrolü
    const apiKey = req.headers.get("x-api-key")
    if (apiKey !== process.env.TESVIKSOR_API_KEY) {
      return NextResponse.json({ error: "Yetkisiz Erişim" }, { status: 401, headers })
    }

    const body = await req.json()
    const { messages, config } = body

    // Dinamik import - @google/genai paketi
    const { GoogleGenAI } = await import("@google/genai")

    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_CLOUD_API_KEY!,
    })

    const lastMessage = messages[messages.length - 1].content

    // Config'den gelen değerleri kullan veya default değerleri al
    const modelName = config?.modelName || "gemini-2.5-flash-preview-09-2025"
    const systemInstruction = config?.systemInstruction || ""
    const ragCorpus = config?.ragCorpus || ""
    const similarityTopK = config?.similarityTopK || 10
    const temperature = config?.temperature ?? 0.1
    const topP = config?.topP ?? 0.95
    const maxOutputTokens = config?.maxOutputTokens || 65535

    // Tools oluştur
    const tools = ragCorpus
      ? [
          {
            retrieval: {
              vertexRagStore: {
                ragResources: [
                  {
                    ragResource: {
                      ragCorpus: ragCorpus,
                    },
                  },
                ],
                similarityTopK: similarityTopK,
              },
            },
          },
        ]
      : []

    const generationConfig = {
      maxOutputTokens: maxOutputTokens,
      temperature: temperature,
      topP: topP,
      safetySettings: [
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
      ],
      ...(tools.length > 0 && { tools }),
    }

    const model = ai.getGenerativeModel({
      model: modelName,
      ...(systemInstruction && { systemInstruction }),
    })

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: lastMessage }] }],
      ...(tools.length > 0 && { tools }),
      config: generationConfig,
    })

    // Stream yanıtı
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
        } catch (err) {
          controller.error(err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, { headers })
  } catch (error: any) {
    console.error("API Hatası:", error)
    return NextResponse.json({ error: error.message }, { status: 500, headers })
  }
}
