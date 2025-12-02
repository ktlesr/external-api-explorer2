-- Enable RLS on vertex_configs table
ALTER TABLE vertex_configs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins to manage vertex configs
CREATE POLICY "Admins can manage vertex configs"
ON vertex_configs
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Allow public read access to vertex configs (needed for the admin panel to load config)
CREATE POLICY "Public can read vertex configs"
ON vertex_configs
FOR SELECT
TO public
USING (true);