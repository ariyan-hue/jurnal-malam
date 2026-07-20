-- ============================================
-- Jurnal Malam v2 — Schema dengan Admin Approval
-- ============================================
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Buat tabel approvals
CREATE TABLE IF NOT EXISTS user_approvals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan RLS
ALTER TABLE user_approvals ENABLE ROW LEVEL SECURITY;

-- Admin bisa baca semua
CREATE POLICY "Admin can read all approvals" ON user_approvals
  FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM user_approvals WHERE approved = TRUE AND user_id = auth.uid())
    OR
    auth.uid() = '***'
  );

-- User bisa insert approval diri sendiri (saat daftar)
CREATE POLICY "Users can insert own approval" ON user_approvals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin bisa update status approval
CREATE POLICY "Admin can update approvals" ON user_approvals
  FOR UPDATE
  USING (TRUE);

-- ============================================
-- Jalankan ini juga jika sudah ada tabel entries:
-- ============================================
-- (paste migrasi dari sebelumnya jika belum jalan)
