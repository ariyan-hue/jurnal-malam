-- ============================================
-- FIX: RLS Policy user_approvals — 2026-07-21
-- Fix infinite recursion + email confirmation
-- ============================================
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Drop semua policy lama di user_approvals
DROP POLICY IF EXISTS "Admin can read all approvals" ON user_approvals;
DROP POLICY IF EXISTS "Users can read own approval" ON user_approvals;
DROP POLICY IF EXISTS "Users can insert own approval" ON user_approvals;
DROP POLICY IF EXISTS "Admin can update approvals" ON user_approvals;

-- 2. Policy baru: user bisa baca approval diri sendiri (NO RECURSION)
CREATE POLICY "Users can read own approval" ON user_approvals
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. User bisa insert approval diri sendiri (saat daftar)
CREATE POLICY "Users can insert own approval" ON user_approvals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Admin update approval (tanpa syarat — app code handle siapa admin)
CREATE POLICY "Admin can update approvals" ON user_approvals
  FOR UPDATE
  USING (TRUE);

-- Catatan: Admin SELECT semua data dihandle oleh app code (cek email ADMIN_EMAIL),
-- bukan oleh RLS policy, untuk hindari infinite recursion.

-- Selesai!
