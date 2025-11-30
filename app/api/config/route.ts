import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Sunucu tarafı client oluşturucu (Env'den okur)
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase env değişkenleri eksik!")
  }
  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getSupabaseAdmin();

    const dbPayload = {
      config_key: "default",
      model_name: body.modelName,
      system_instruction: body.systemInstruction,
      rag_corpus: body.ragCorpus,
      similarity_top_k: body.similarityTopK,
      temperature: body.temperature,
      top_p: body.topP,
      max_output_tokens: body.maxOutputTokens,
      internal_api_key: process.env.INTERNAL_API_KEY,
      updated_at: new Date().toISOString(),
    };

    // 1) Check if a row with config_key='default' already exists
    const { data: existing, error: selectError } = await supabase
      .from("vertex_configs")
      .select("id")
      .eq("config_key", "default")
      .maybeSingle();

    if (selectError) throw selectError;

    let error;

    if (existing) {
      // 2) Update existing row
      const updateRes = await supabase
        .from("vertex_configs")
        .update(dbPayload)
        .eq("id", existing.id);

      error = updateRes.error;
    } else {
      // 3) Insert new row
      const insertRes = await supabase
        .from("vertex_configs")
        .insert(dbPayload);

      error = insertRes.error;
    }

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Config POST hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// POST: Ayarları Kaydet
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getSupabaseAdmin();

    const dbPayload = {
      config_key: 'default',
      model_name: body.modelName,
      system_instruction: body.systemInstruction,
      rag_corpus: body.ragCorpus,
      similarity_top_k: body.similarityTopK,
      temperature: body.temperature,
      top_p: body.topP,
      max_output_tokens: body.maxOutputTokens,
      internal_api_key: process.env.INTERNAL_API_KEY,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("vertex_configs")
      .upsert(dbPayload, {
        onConflict: "config_key",   // 🔴 mutlaka böyle
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Config POST hatası:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


