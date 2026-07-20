-- ============================================
-- Jurnal Malam v2 — Supabase Schema (Multi-Akun)
-- ============================================
-- Jalankan SQL ini di Supabase SQL Editor
-- ============================================

-- Tabel entries (dengan user_id)
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  title TEXT,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries(created_at DESC);

-- Enable RLS
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own entries
CREATE POLICY "Users can read own entries" ON entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own entries
CREATE POLICY "Users can insert own entries" ON entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own entries
CREATE POLICY "Users can update own entries" ON entries
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own entries
CREATE POLICY "Users can delete own entries" ON entries
  FOR DELETE
  USING (auth.uid() = user_id);
