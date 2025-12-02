-- Add staging_bucket column to vertex_configs table
ALTER TABLE public.vertex_configs
ADD COLUMN IF NOT EXISTS staging_bucket TEXT;