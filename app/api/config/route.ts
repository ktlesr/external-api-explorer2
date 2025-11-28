import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Sunucu tarafı client oluşturucu (Env'den okur)
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase env değişkenleri eksik!")
  }
  return createClient(supabaseUrl, supabaseKey)
}

// GET: Ayarları Çek
export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    
    // En son eklenen kaydı çek
    const { data, error } = await supabase
      .from('vertex_configs')
      .select('*')
      .order('id', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    // Veri yoksa varsayılan dön
    if (!data) {
        return NextResponse.json(null) // Frontend varsayılanı kullanır
    }

    // Veritabanı formatını (snake_case) Frontend formatına (camelCase) çevir
    const config = {
      modelName: data.model_name,
      systemInstruction: data.system_instruction,
      ragCorpus: data.rag_corpus,
      similarityTopK: data.similarity_top_k,
      temperature: data.temperature,
      topP: data.top_p,
      maxOutputTokens: data.max_output_tokens,
    }

    return NextResponse.json(config)

  } catch (error: any) {
    console.error("Config GET hatası:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Ayarları Kaydet
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = getSupabaseAdmin()

    // Veritabanına INSERT et
    const dbPayload = {
      model_name: body.modelName,
      system_instruction: body.systemInstruction,
      rag_corpus: body.ragCorpus,
      similarity_top_k: body.similarityTopK,
      temperature: body.temperature,
      top_p: body.topP,
      max_output_tokens: body.maxOutputTokens,
      internal_api_key: process.env.INTERNAL_API_KEY, // Env'den alıp kaydediyoruz
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('vertex_configs')
      .insert([dbPayload])

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("Config POST hatası:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
