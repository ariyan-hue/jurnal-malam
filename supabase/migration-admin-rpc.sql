-- ============================================
-- RPC: Admin bisa baca semua pending approvals
-- ============================================
-- Jalankan di Supabase SQL Editor SETELAH migration-fix-approval-policy.sql
-- ============================================

-- Function: ambil semua pending approvals (bypass RLS via SECURITY DEFINER)
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

-- Beri akses ke authenticated users (app code handle siapa admin)
GRANT EXECUTE ON FUNCTION get_pending_approvals() TO authenticated;
