-- Vertex AI Config tablosunu oluştur
CREATE TABLE IF NOT EXISTS vertex_configs (
  id BIGSERIAL PRIMARY KEY,
  model_name TEXT NOT NULL,
  system_instruction TEXT,
  rag_corpus TEXT,
  similarity_top_k INTEGER DEFAULT 10,
  temperature FLOAT DEFAULT 0.1,
  top_p FLOAT DEFAULT 0.95,
  max_output_tokens INTEGER DEFAULT 65535,
  internal_api_key TEXT,
  vertex_project_id TEXT,
  vertex_client_email TEXT,
  vertex_private_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_vertex_configs_updated_at ON vertex_configs(updated_at DESC);

-- RLS (Row Level Security) politikaları
ALTER TABLE vertex_configs ENABLE ROW LEVEL SECURITY;

-- Politikaları tekrar çalıştırılabilir hale getir
-- Önce mevcut politikaları sil
DROP POLICY IF EXISTS "Allow public read access" ON vertex_configs;
DROP POLICY IF EXISTS "Allow public insert access" ON vertex_configs;
DROP POLICY IF EXISTS "Allow public update access" ON vertex_configs;

-- Herkes okuyabilir
CREATE POLICY "Allow public read access" ON vertex_configs
  FOR SELECT USING (true);

-- Herkes ekleyebilir
CREATE POLICY "Allow public insert access" ON vertex_configs
  FOR INSERT WITH CHECK (true);

-- Herkes güncelleyebilir
CREATE POLICY "Allow public update access" ON vertex_configs
  FOR UPDATE USING (true);
