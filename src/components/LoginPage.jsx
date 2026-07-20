import { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function LoginPage() {
  const { signIn, signUp } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (isRegister) {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Akun dibuat! Cek email untuk verifikasi, lalu login.')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError('Email atau password salah.')
      }
    }

    setLoading(false)
  }

  return (
    <div style={s.page}>
      <div style={s.lampGlow} aria-hidden="true" />

      <div style={s.card} className="jh-fade-in">
        {/* Logo */}
        <div style={s.logoWrap}>
          <span style={{ fontSize: 36 }}>🌙</span>
        </div>

        <h1 style={s.title}>Jurnal Malam</h1>
        <p style={s.subtitle}>Catatan pribadi yang aman untukmu</p>

        {/* Tab Toggle */}
        <div style={s.tabRow}>
          <button
            onClick={() => { setIsRegister(false); setError(''); setSuccess('') }}
            style={{ ...s.tab, ...(isRegister ? {} : s.tabActive) }}
          >
            Masuk
          </button>
          <button
            onClick={() => { setIsRegister(true); setError(''); setSuccess('') }}
            style={{ ...s.tab, ...(isRegister ? s.tabActive : {}) }}
          >
            Daftar
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form}>
          <div>
            <label style={s.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@kamu.com"
              required
              style={s.input}
            />
          </div>
          <div>
            <label style={s.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={s.input}
            />
          </div>

          {error && <p style={s.error}>{error}</p>}
          {success && <p style={s.success}>{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="jh-btn"
            style={{
              ...s.submitBtn,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Memproses…' : isRegister ? 'Buat Akun' : 'Masuk'}
          </button>
        </form>

        <p style={s.footer}>
          {isRegister ? 'Sudah punya akun? ' : 'Belum punya akun? '}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess('') }}
            style={s.link}
          >
            {isRegister ? 'Masuk di sini' : 'Daftar di sini'}
          </button>
        </p>
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
    padding: '36px 32px',
    maxWidth: 400,
    width: '100%',
    boxShadow: '0 0 0 1px #00000020, 0 12px 30px -12px #00000060',
    textAlign: 'center',
  },
  logoWrap: { marginBottom: 12 },
  title: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: 28,
    fontWeight: 600,
    color: '#F7F3E9',
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: 13,
    color: '#8B90A3',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  tabRow: {
    display: 'flex',
    gap: 4,
    marginBottom: 24,
    background: '#ffffff08',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: '8px 0',
    borderRadius: 8,
    border: 'none',
    background: 'transparent',
    color: '#8B90A3',
    fontSize: 13.5,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all .15s ease',
    fontFamily: "'Inter', sans-serif",
  },
  tabActive: {
    background: '#E8A94C',
    color: '#1B2438',
    fontWeight: 600,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: 12,
    color: '#B7BAC7',
    marginBottom: 6,
    fontWeight: 500,
  },
  input: {
    width: '100%',
    background: '#ffffff08',
    border: '1px solid #ffffff17',
    color: '#EDEBE3',
    padding: '10px 12px',
    borderRadius: 9,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
  },
  submitBtn: {
    background: '#E8A94C',
    color: '#1B2438',
    border: 'none',
    padding: '11px 20px',
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
    transition: 'filter .15s ease',
  },
  error: {
    fontSize: 13,
    color: '#E0846B',
    textAlign: 'center',
    margin: 0,
  },
  success: {
    fontSize: 13,
    color: '#7FA6A0',
    textAlign: 'center',
    margin: 0,
  },
  footer: {
    fontSize: 13,
    color: '#8B90A3',
    marginTop: 20,
    textAlign: 'center',
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#E8A94C',
    cursor: 'pointer',
    fontSize: 13,
    textDecoration: 'underline',
    fontFamily: "'Inter', sans-serif",
  },
}
