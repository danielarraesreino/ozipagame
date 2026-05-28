-- Rodar no Supabase SQL Editor: https://supabase.com/dashboard/project/huzctpaqgpfptncbkuwo/sql
CREATE TABLE IF NOT EXISTS video_urls (
  dilema_id  TEXT PRIMARY KEY,
  url        TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Permite leitura pública (anon key)
ALTER TABLE video_urls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leitura publica" ON video_urls FOR SELECT USING (true);
-- Escrita só via service_role (API admin)
CREATE POLICY "escrita admin" ON video_urls FOR ALL USING (auth.role() = 'service_role');
