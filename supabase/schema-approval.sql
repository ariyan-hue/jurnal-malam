-- ============================================
-- Jurnal Malam v2 — Schema dengan Admin Approval
-- ============================================
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Buat tabel approvals
CREATE TABLE IF NOT EXISTS user_approvals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Aktifkan RLS
ALTER TABLE user_approvals ENABLE ROW LEVEL SECURITY;

-- User bisa baca status approval diri sendiri
CREATE POLICY "Users can read own approval" ON user_approvals
  FOR SELECT
  USING (auth.uid() = user_id);

-- Catatan: Admin akses semua data lewat app code (ADMIN_EMAIL check), bukan RLS.

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
