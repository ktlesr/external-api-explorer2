-- Add vector_distance_threshold column if not exists
ALTER TABLE public.vertex_configs
ADD COLUMN IF NOT EXISTS vector_distance_threshold DOUBLE PRECISION DEFAULT 0.5;

-- Update default for similarity_top_k to 20
ALTER TABLE public.vertex_configs
ALTER COLUMN similarity_top_k SET DEFAULT 20;