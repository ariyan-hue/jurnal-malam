import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function PasswordReset({ onClose }) {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim() || !newPassword.trim()) {
      setError('Email dan password baru wajib diisi.')
      return
    }
    if (newPassword.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    // Cari user di localStorage
    try {
      const usersKey = '***'
      const raw = localStorage.getItem(usersKey)
      const users = raw ? JSON.parse(raw) : []
      const idx = users.findIndex(u => u.email === email.trim().toLowerCase())
      if (idx === -1) {
        setError('Email tidak ditemukan.')
        return
      }
      users[idx].password = newPassword
      localStorage.setItem(usersKey, JSON.stringify(users))
      setSuccess(`Password untuk "${email}" berhasil direset!`)
      setEmail('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setError('Terjadi kesalahan sistem.')
    }
  }

  return (
    <div style={{
      position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    }} onClick={onClose}>
      <div style={{
        background: '#1B2438', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px',
        padding: '28px 24px', maxWidth: '400px', width: '100%',
        color: '#F7F3E9', fontFamily: 'Inter, sans-serif'
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: '"Source Serif 4", serif', fontSize: '20px', margin: 0 }}>🔐 Reset Password</h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: '#8B90A3', fontSize: '20px', cursor: 'pointer'
          }}>✕</button>
        </div>

        {user?.role === 'admin' ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email user"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
                color: '#EDEBE3', padding: '10px 12px', borderRadius: '9px', fontSize: '14px' }}
              required
            />
            <input
              type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              placeholder="Password baru"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
                color: '#EDEBE3', padding: '10px 12px', borderRadius: '9px', fontSize: '14px' }}
              required minLength={6}
            />
            <input
              type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Konfirmasi password"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
                color: '#EDEBE3', padding: '10px 12px', borderRadius: '9px', fontSize: '14px' }}
              required minLength={6}
            />
            <button type="submit" style={{
              background: '#7FA6A0', color: '#1B2438', border: 'none',
              padding: '10px 16px', borderRadius: '9px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
            }}>Reset Password</button>
            {error && <p style={{ fontSize: '13px', color: '#E0846B', textAlign: 'center', margin: 0 }}>{error}</p>}
            {success && <p style={{ fontSize: '13px', color: '#7FA6A0', textAlign: 'center', margin: 0 }}>{success}</p>}
          </form>
        ) : (
          <p style={{ color: '#8B90A3', fontSize: '14px', textAlign: 'center' }}>
            Hubungi admin untuk mereset password.
          </p>
        )}
      </div>
    </div>
  )
}
