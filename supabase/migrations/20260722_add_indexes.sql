-- ============================================================
-- Jurnal Malam — Optimasi Index PostgreSQL untuk Pencarian Cepat
-- ============================================================
-- Jalankan di Supabase SQL Editor (https://supabase.com > SQL Editor)
-- atau lewat `supabase migration up`
-- ============================================================

-- 1. Index untuk filter by user (paling sering dipakai)
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries (user_id);

-- 2. Index komposit untuk full-text search di title + content
--    Gunakan GIN trigram supaya ILIKE '%keyword%' tetap cepat
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_entries_title_trgm ON entries USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_entries_content_trgm ON entries USING gin (content gin_trgm_ops);

-- 3. Index untuk filter mood (kardinalitas rendah, tapi tetap bantu)
CREATE INDEX IF NOT EXISTS idx_entries_mood ON entries (mood);

-- 4. Index untuk filter tags (GIN karena array)
CREATE INDEX IF NOT EXISTS idx_entries_tags ON entries USING gin (tags);

-- 5. Index komposit untuk urutan waktu (paling umum)
--    user_id + created_at = query utama halaman daftar
CREATE INDEX IF NOT EXISTS idx_entries_user_created ON entries (user_id, created_at DESC);

-- 6. Partial index untuk pencarian dengan mood spesifik
--    (berguna kalau user sering filter "berat" saja)
CREATE INDEX IF NOT EXISTS idx_entries_user_mood ON entries (user_id, mood);

-- 7. Index full-text search dengan tsvector (alternatif, lebih cepat dari ILIKE untuk teks panjang)
--    Uncomment kalau mau pakai pencarian full-text PostgreSQL
/*
ALTER TABLE entries ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('indonesian', coalesce(title, '') || ' ' || coalesce(content, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_entries_fts ON entries USING gin (search_vector);
*/

-- ============================================================
-- Cara test kecepatan:
-- ============================================================
-- 1. Buka Supabase Dashboard > SQL Editor
-- 2. Paste SQL di atas
-- 3. Jalankan (Ctrl+Enter)
-- 4. Bandingkan dengan EXPLAIN ANALYZE:
--
--    EXPLAIN ANALYZE
--    SELECT * FROM entries
--    WHERE user_id = '[user-id-kamu]'
--      AND content ILIKE '%cari%'
--    ORDER BY created_at DESC
--    LIMIT 30;
-- ============================================================
