import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function AdminPanel() {
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPending()
  }, [])

  async function loadPending() {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from('user_approvals')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: true })

    // Get email from auth.users for each pending user
    if (data && data.length > 0) {
      const enriched = await Promise.all(data.map(async (p) => {
        const { data: userData } = await supabase.auth.admin.getUserById(p.user_id)
        return {
          ...p,
          email: userData?.user?.email || 'Unknown',
        }
      }))
      setPendingUsers(enriched)
    } else {
      setPendingUsers([])
    }
    setLoading(false)
  }

  async function approve(userId) {
    await supabase
      .from('user_approvals')
      .update({ approved: true })
      .eq('user_id', userId)
    loadPending()
  }

  async function reject(userId) {
    // Delete the approval record
    await supabase
      .from('user_approvals')
      .delete()
      .eq('user_id', userId)
    loadPending()
  }

  return (
    <div style={s.page}>
      <div style={s.lampGlow} aria-hidden="true" />

      <div style={s.card} className="jh-fade-in">
        <h2 style={s.title}>🔑 Admin Panel</h2>
        <p style={s.subtitle}>Persetujuan pengguna baru</p>

        {loading && (
          <p style={s.loading}>Memuat…</p>
        )}

        {!loading && pendingUsers.length === 0 && (
          <p style={s.empty}>Tidak ada pengguna menunggu persetujuan.</p>
        )}

        {!loading && pendingUsers.length > 0 && (
          <div style={s.list}>
            {pendingUsers.map(u => (
              <div key={u.user_id} style={s.userCard}>
                <div style={s.userInfo}>
                  <span style={s.email}>{u.email}</span>
                  <span style={s.time}>
                    {new Date(u.created_at).toLocaleString('id-ID', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <div style={s.actions}>
                  <button onClick={() => approve(u.user_id)} style={s.approveBtn} className="jh-btn">
                    ✓ Setuju
                  </button>
                  <button onClick={() => reject(u.user_id)} style={s.rejectBtn} className="jh-icon-btn">
                    ✕ Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={loadPending} style={s.refreshBtn} className="jh-icon-btn">
          ↻ Muat ulang
        </button>
      </div>
    </div>
  )
}

const s = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    overflow: 'hidden',
  },
  lampGlow: {
    position: 'absolute',
    top: -120,
    left: '18%',
    width: 420,
    height: 420,
    background: 'radial-gradient(circle, #E8A94C22 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    background: 'linear-gradient(180deg, #ffffff09, #ffffff03)',
    border: '1px solid #ffffff17',
    borderRadius: 16,
    padding: '32px 28px',
    maxWidth: 480,
    width: '100%',
    boxShadow: '0 0 0 1px #00000020, 0 12px 30px -12px #00000060',
  },
  title: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: 24,
    fontWeight: 600,
    color: '#F7F3E9',
    margin: '0 0 4px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#8B90A3',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 24,
  },
  loading: {
    color: '#8B90A3',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  empty: {
    color: '#8B90A3',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
    border: '1px dashed #ffffff1a',
    borderRadius: 12,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#ffffff07',
    border: '1px solid #ffffff14',
    borderRadius: 11,
    padding: '12px 14px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  email: {
    color: '#EDEBE3',
    fontSize: 14,
    fontWeight: 500,
  },
  time: {
    color: '#7C8093',
    fontSize: 11.5,
  },
  actions: {
    display: 'flex',
    gap: 8,
  },
  approveBtn: {
    background: '#7FA6A0',
    color: '#1B2438',
    border: 'none',
    padding: '7px 14px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  rejectBtn: {
    background: 'transparent',
    color: '#E0846B',
    border: '1px solid #E0846B44',
    padding: '7px 12px',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
  },
  refreshBtn: {
    display: 'block',
    margin: '16px auto 0',
    background: 'transparent',
    border: '1px solid #ffffff1f',
    color: '#B7BAC7',
    padding: '8px 16px',
    borderRadius: 8,
    fontSize: 13,
    cursor: 'pointer',
  },
}
