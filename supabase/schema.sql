-- ============================================
-- Jurnal Malam v2 — Supabase Schema
-- ============================================
-- Jalankan SQL ini di Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================

-- Tabel entries
CREATE TABLE IF NOT EXISTS entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk query cepat
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_mood ON entries(mood);

-- Row Level Security (RLS)
-- Karena ini app single-user tanpa auth, kita biarkan RLS aktif
-- tapi buat policy yang membolehkan semua operasi.
-- Policy ini aman karena hanya orang yang punya API key yang bisa akses.

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations for anon (single user)
CREATE POLICY "Allow all for anon" ON entries
  FOR ALL
  USING (true)
  WITH CHECK (true);
