-- ============================================
-- Jurnal Malam — Tambah kolom title & tags
-- + query statistik mood
-- ============================================

-- Tambah kolom title dan tags kalau belum ada
ALTER TABLE entries ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Index untuk tags (GIN array)
CREATE INDEX IF NOT EXISTS idx_entries_tags ON entries USING gin (tags);

-- Index trigram untuk title biar ILIKE cepat
CREATE INDEX IF NOT EXISTS idx_entries_title_trgm ON entries USING gin (title gin_trgm_ops);

-- ============================================
-- VIEW: statistik mood per bulan
-- ============================================
CREATE OR REPLACE VIEW mood_stats AS
SELECT
  user_id,
  date_trunc('month', created_at)::date AS bulan,
  mood,
  COUNT(*) AS jumlah
FROM entries
WHERE mood IS NOT NULL
GROUP BY user_id, date_trunc('month', created_at), mood
ORDER BY bulan DESC;

-- ============================================
-- Cara cek statistik via SQL:
-- ============================================
-- SELECT * FROM mood_stats
-- WHERE user_id = '[user-id]'
-- ORDER BY bulan DESC;
-- ============================================
