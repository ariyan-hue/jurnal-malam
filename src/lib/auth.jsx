import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const ADMIN_EMAIL = 'bowo@gmail.com'
const ADMIN_PASSWORD = 'bowo321@'
const USERS_KEY = '***' + '_users'
const SESSION_KEY = '***'

// Load users dari localStorage
function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.email) {
          setUser(parsed)
        }
      } catch {}
    }
    setLoading(false)
  }, [])

  async function signIn(email, password) {
    // Cek admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const u = { id: 'admin', email: ADMIN_EMAIL, role: 'admin' }
      localStorage.setItem(SESSION_KEY, JSON.stringify(u))
      setUser(u)
      return { error: null }
    }

    // Cek user biasa
    const users = getUsers()
    const found = users.find(u => u.email === email && u.password === password)
    if (found) {
      const u = { id: found.id, email: found.email, role: 'user' }
      localStorage.setItem(SESSION_KEY, JSON.stringify(u))
      setUser(u)
      return { error: null }
    }

    return { error: 'Email atau password salah.' }
  }

  async function signUp() {
    return { error: 'Pendaftaran ditutup. Hubungi admin untuk membuat akun.' }
  }

  // Admin: tambah user baru
  async function addUser(email, password) {
    const users = getUsers()

    // Cek duplikat
    if (users.find(u => u.email === email) || email === ADMIN_EMAIL) {
      return { error: 'Email sudah terdaftar.' }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      createdAt: new Date().toISOString(),
    }
    users.push(newUser)
    saveUsers(users)
    return { error: null, user: { id: newUser.id, email: newUser.email } }
  }

  // Admin: hapus user
  async function removeUser(userId) {
    const users = getUsers().filter(u => u.id !== userId)
    saveUsers(users)
  }

  // Admin: list semua user
  function listUsers() {
    const users = getUsers()
    if (!Array.isArray(users)) return []
    return users.map(u => ({ id: u.id, email: u.email, createdAt: u.createdAt }))
  }

  async function signOut() {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, approved: true, pendingApproval: false, signUp, signIn, signOut, addUser, removeUser, listUsers }}>
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
