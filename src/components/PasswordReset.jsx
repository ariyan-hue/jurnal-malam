import { useState } from 'react'
import { useAuth } from '../lib/auth'

const DEFAULT_PASSWORD = 'user123@'

export default function PasswordReset({ onClose }) {
  const { user, changePassword, resetUserPassword } = useAuth()
  const isAdmin = user?.role === 'admin'

  // Admin mode
  const [targetEmail, setTargetEmail] = useState('')
  const [defaultPw, setDefaultPw] = useState(DEFAULT_PASSWORD)

  // User mode (ganti sendiri)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleUserChange(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!oldPassword.trim() || !newPassword.trim()) {
      setError('Semua field wajib diisi.')
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
    if (oldPassword === newPassword) {
      setError('Password baru harus berbeda dari password lama.')
      return
    }

    const { error: err } = await changePassword(user.email, oldPassword, newPassword)
    if (err) {
      setError(err)
    } else {
      setSuccess('✅ Password berhasil diganti!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  async function handleAdminReset(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!targetEmail.trim()) {
      setError('Masukkan email user.')
      return
    }
    if (!defaultPw.trim() || defaultPw.length < 6) {
      setError('Password default minimal 6 karakter.')
      return
    }

    const { error: err } = await resetUserPassword(targetEmail.trim().toLowerCase(), defaultPw)
    if (err) {
      setError(err)
    } else {
      setSuccess(`✅ Password ${targetEmail} direset ke "${defaultPw}"`)
      setTargetEmail('')
    }
  }

  const sharedStyles = {
    wrapper: {
      position: 'fixed', left: 0, top: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
    },
    card: {
      background: '#1B2438', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '16px',
      padding: '28px 24px', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
      color: '#F7F3E9', fontFamily: 'Inter, sans-serif'
    },
    header: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'
    },
    heading: {
      fontFamily: '"Source Serif 4", serif', fontSize: '20px', margin: 0
    },
    closeBtn: {
      background: 'transparent', border: 'none', color: '#8B90A3', fontSize: '20px', cursor: 'pointer'
    },
    input: {
      width: '100%',
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
      color: '#EDEBE3', padding: '10px 12px', borderRadius: '9px', fontSize: '14px',
      fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
    },
    label: {
      display: 'block', fontSize: '12px', color: '#B7BAC7', marginBottom: '5px', fontWeight: 500,
    },
    btn: {
      background: '#E8A94C', color: '#1B2438', border: 'none',
      padding: '10px 16px', borderRadius: '9px', fontSize: '14px', fontWeight: 600,
      cursor: 'pointer', marginTop: '4px', transition: 'filter .15s ease',
    },
    dangerBtn: {
      background: '#7FA6A0', color: '#1B2438', border: 'none',
      padding: '10px 16px', borderRadius: '9px', fontSize: '14px', fontWeight: 600,
      cursor: 'pointer', marginTop: '4px',
    },
    error: {
      fontSize: '13px', color: '#E0846B', textAlign: 'center', margin: 0,
      padding: '8px', background: 'rgba(224,132,107,0.07)', borderRadius: '8px',
    },
    success: {
      fontSize: '13px', color: '#7FA6A0', textAlign: 'center', margin: 0,
      padding: '8px', background: 'rgba(127,166,160,0.07)', borderRadius: '8px',
    },
    divider: {
      border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '20px 0',
    },
  }

  return (
    <div style={sharedStyles.wrapper} onClick={onClose}>
      <div style={sharedStyles.card} onClick={e => e.stopPropagation()}>

        {/* ─── HEADER ─── */}
        <div style={sharedStyles.header}>
          <h2 style={sharedStyles.heading}>
            {isAdmin ? '🔐 Reset Password User' : '🔐 Ganti Password'}
          </h2>
          <button onClick={onClose} style={sharedStyles.closeBtn}>✕</button>
        </div>

        {/* ─── USER MODE: GANTI SENDIRI ─── */}
        {!isAdmin && (
          <form onSubmit={handleUserChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '13px', color: '#8B90A3', fontStyle: 'italic', margin: 0 }}>
              Masukkan password lama dan password baru kamu.
            </p>

            <div>
              <label style={sharedStyles.label}>Email</label>
              <input style={{ ...sharedStyles.input, opacity: 0.7 }} value={user?.email} disabled />
            </div>
            <div>
              <label style={sharedStyles.label}>Password Lama</label>
              <input
                type="password" value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="••••••••" required
                style={sharedStyles.input}
              />
            </div>
            <div>
              <label style={sharedStyles.label}>Password Baru</label>
              <input
                type="password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="min 6 karakter" required minLength={6}
                style={sharedStyles.input}
              />
            </div>
            <div>
              <label style={sharedStyles.label}>Konfirmasi Password Baru</label>
              <input
                type="password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="ketik ulang" required minLength={6}
                style={sharedStyles.input}
              />
            </div>

            {error && <p style={sharedStyles.error}>{error}</p>}
            {success && <p style={sharedStyles.success}>{success}</p>}

            <button type="submit" style={sharedStyles.btn}>Ganti Password</button>
          </form>
        )}

        {/* ─── ADMIN MODE: RESET USER PASSWORD ─── */}
        {isAdmin && (
          <>
            <form onSubmit={handleAdminReset} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: '13px', color: '#8B90A3', fontStyle: 'italic', margin: 0 }}>
                Reset password user ke default. User bisa login dengan password baru ini dan menggantinya nanti.
              </p>

              <div>
                <label style={sharedStyles.label}>Email User</label>
                <input
                  type="email" value={targetEmail}
                  onChange={e => setTargetEmail(e.target.value)}
                  placeholder="user@contoh.com" required
                  style={sharedStyles.input}
                />
              </div>
              <div>
                <label style={sharedStyles.label}>Password Default Baru</label>
                <input
                  type="text" value={defaultPw}
                  onChange={e => setDefaultPw(e.target.value)}
                  required minLength={6}
                  style={sharedStyles.input}
                />
                <p style={{ fontSize: '11px', color: '#7C8093', margin: '4px 0 0' }}>
                  Default: <code style={{ color: '#E8A94C' }}>{DEFAULT_PASSWORD}</code>
                </p>
              </div>

              {error && <p style={sharedStyles.error}>{error}</p>}
              {success && <p style={sharedStyles.success}>{success}</p>}

              <button type="submit" style={sharedStyles.dangerBtn}>Reset Password</button>
            </form>

            <hr style={sharedStyles.divider} />

            {/* ─── ADMIN ALSO CAN CHANGE OWN PASSWORD ─── */}
            <div>
              <h3 style={{ fontFamily: '"Source Serif 4", serif', fontSize: '16px', margin: '0 0 12px', color: '#F7F3E9' }}>
                Atau ganti password admin sendiri
              </h3>
              <form onSubmit={handleUserChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={sharedStyles.label}>Password Lama</label>
                  <input
                    type="password" value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder="••••••••" required
                    style={sharedStyles.input}
                  />
                </div>
                <div>
                  <label style={sharedStyles.label}>Password Baru</label>
                  <input
                    type="password" value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="min 6 karakter" required minLength={6}
                    style={sharedStyles.input}
                  />
                </div>
                <div>
                  <label style={sharedStyles.label}>Konfirmasi</label>
                  <input
                    type="password" value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="ketik ulang" required minLength={6}
                    style={sharedStyles.input}
                  />
                </div>
                <button type="submit" style={sharedStyles.btn}>Ganti Password Admin</button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
