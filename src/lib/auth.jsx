import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(null)

// Admin email — ganti dengan email kamu sendiri!
const ADMIN_EMAIL = 'bowo@gmail.com'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approved, setApproved] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setUser({ id: 'local-user', email: 'local@jurnal.dev' })
      setApproved(true)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) checkApproval(u.id, u.email)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) checkApproval(u.id, u.email)
      else {
        setApproved(false)
        setPendingApproval(false)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkApproval(userId, email) {
    // Admin langsung approved
    if (email === ADMIN_EMAIL) {
      setApproved(true)
      setLoading(false)
      return
    }

    try {
      const { data } = await supabase
        .from('user_approvals')
        .select('approved')
        .eq('user_id', userId)
        .single()

      if (data && data.approved) {
        setApproved(true)
        setPendingApproval(false)
      } else {
        setApproved(false)
        setPendingApproval(true)
      }
    } catch {
      // Belum ada record → belum di-approve
      setApproved(false)
      setPendingApproval(true)
    }
    setLoading(false)
  }

  async function signUp(email, password) {
    if (!isSupabaseConfigured) return { error: 'Supabase tidak dikonfigurasi' }

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error }

    // Buat record approval (default: belum di-approve)
    if (data?.user) {
      await supabase.from('user_approvals').insert({
        user_id: data.user.id,
        approved: false,
      })
    }

    return { error: null }
  }

  async function signIn(email, password) {
    if (!isSupabaseConfigured) return { error: 'Supabase tidak dikonfigurasi' }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  async function signOut() {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
    setApproved(false)
    setPendingApproval(false)
  }

  return (
    <AuthContext.Provider value={{ user, loading, approved, pendingApproval, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export { ADMIN_EMAIL }
