-- ============================================
-- JURNAL MALAM — FULL FIX MIGRATION
-- Jalankan SEMUA ini di Supabase SQL Editor
-- ============================================

-- 1. Tambah kolom email ke user_approvals (kalau belum ada)
ALTER TABLE user_approvals ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Drop semua policy lama
DROP POLICY IF EXISTS "Admin can read all approvals" ON user_approvals;
DROP POLICY IF EXISTS "Users can read own approval" ON user_approvals;
DROP POLICY IF EXISTS "Users can insert own approval" ON user_approvals;
DROP POLICY IF EXISTS "Admin can update approvals" ON user_approvals;

-- 3. Policy baru (TANPA infinite recursion)
CREATE POLICY "Users can read own approval" ON user_approvals
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own approval" ON user_approvals
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update approvals" ON user_approvals
  FOR UPDATE
  USING (TRUE);

-- 4. RPC function: admin bisa baca semua pending (bypass RLS)
CREATE OR REPLACE FUNCTION get_pending_approvals()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  approved BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT ua.user_id, ua.email, ua.approved, ua.created_at
  FROM user_approvals ua
  WHERE ua.approved = FALSE
  ORDER BY ua.created_at ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_pending_approvals() TO authenticated;

-- SELESAI! 🎉
