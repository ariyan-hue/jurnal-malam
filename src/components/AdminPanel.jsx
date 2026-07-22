import { useState } from 'react'
import { useAuth } from '../lib/auth'
import PasswordReset from './PasswordReset'

export default function AdminPanel({ onClose }) {
  const { addUser, removeUser, listUsers, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [users, setUsers] = useState(listUsers())
  const [showReset, setShowReset] = useState(false)
  const [msg, setMsg] = useState('')

  function refresh() {
    setUsers(listUsers())
  }

  async function handleAdd(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email.trim() || !password.trim()) {
      setError('Email dan password wajib diisi.')
      return
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    const result = await addUser(email.trim(), password)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`User "${email}" berhasil dibuat!`)
      setEmail('')
      setPassword('')
      refresh()
    }
  }

  async function handleRemove(uid, uemail) {
    if (!confirm(`Hapus user "${uemail}"?`)) return
    removeUser(uid)
    refresh()
  }

  return (
    <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,background:'rgba(0,0,0,0.6)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}} onClick={onClose}>
      <div style={{background:'#1B2438',border:'1px solid rgba(255,255,255,0.09)',borderRadius:'16px',padding:'28px 24px',maxWidth:'500px',width:'100%',maxHeight:'85vh',overflowY:'auto',color:'#F7F3E9',fontFamily:'Inter, sans-serif'}} onClick={e => e.stopPropagation()}>

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h2 style={{fontFamily:'"Source Serif 4", serif',fontSize:'22px',margin:0,color:'#F7F3E9'}}>🔑 Admin Panel</h2>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:'#8B90A3',fontSize:'20px',cursor:'pointer'}}>✕</button>
        </div>

        <p style={{fontSize:'13px',color:'#8B90A3',fontStyle:'italic',margin:'0 0 20px'}}>Login sebagai: {user?.email || '-'}</p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'10px',marginBottom:'24px'}}>
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'14px',textAlign:'center'}}>
            <div style={{fontSize:'26px',fontWeight:700,color:'#E8A94C'}}>{users.length + 1}</div>
            <div style={{fontSize:'11px',color:'#8B90A3',textTransform:'uppercase'}}>Total User</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'14px',textAlign:'center'}}>
            <div style={{fontSize:'26px',fontWeight:700,color:'#E8A94C'}}>{users.length}</div>
            <div style={{fontSize:'11px',color:'#8B90A3',textTransform:'uppercase'}}>User Aktif</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'14px',textAlign:'center'}}>
            <div style={{fontSize:'26px',fontWeight:700,color:'#E8A94C'}}>1</div>
            <div style={{fontSize:'11px',color:'#8B90A3',textTransform:'uppercase'}}>Admin</div>
          </div>
        </div>

        <div style={{marginBottom:'20px'}}>
          <h3 style={{fontFamily:'"Source Serif 4", serif',fontSize:'15px',margin:'0 0 10px',color:'#F7F3E9'}}>➕ Tambah User</h3>
          <form onSubmit={handleAdd} style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@contoh.com" required
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.09)',color:'#EDEBE3',padding:'10px 12px',borderRadius:'9px',fontSize:'14px'}} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6)" required minLength={6}
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.09)',color:'#EDEBE3',padding:'10px 12px',borderRadius:'9px',fontSize:'14px'}} />
            <button type="submit" style={{background:'#7FA6A0',color:'#1B2438',border:'none',padding:'10px 16px',borderRadius:'9px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>+ Tambah User</button>
          </form>
          {error ? <p style={{fontSize:'13px',color:'#E0846B',textAlign:'center',margin:'8px 0 0',padding:'8px',background:'rgba(224,132,107,0.07)',borderRadius:'8px'}}>{error}</p> : null}
          {success ? <p style={{fontSize:'13px',color:'#7FA6A0',textAlign:'center',margin:'8px 0 0',padding:'8px',background:'rgba(127,166,160,0.07)',borderRadius:'8px'}}>{success}</p> : null}
        </div>

        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
            <h3 style={{fontFamily:'"Source Serif 4", serif',fontSize:'15px',margin:0,color:'#F7F3E9'}}>👥 Daftar User</h3>
            <button onClick={refresh} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.12)',color:'#B7BAC7',padding:'4px 10px',borderRadius:'7px',fontSize:'12px',cursor:'pointer'}}>↻ Refresh</button>
          </div>

          <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'11px 14px',marginBottom:'6px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{color:'#EDEBE3',fontSize:'13px'}}>📧 {user?.email}</span>
            <span style={{background:'#E8A94C',color:'#1B2438',fontSize:'11px',fontWeight:600,padding:'4px 10px',borderRadius:'6px'}}>Admin</span>
          </div>

          {users.length === 0 ? (
            <div style={{textAlign:'center',padding:'24px 16px',border:'1px dashed rgba(255,255,255,0.1)',borderRadius:'12px'}}>
              <p style={{color:'#8B90A3',fontSize:'14px',margin:'0 0 4px'}}>Belum ada user selain admin.</p>
              <p style={{color:'#7C8093',fontSize:'12px',margin:0}}>Gunakan form di atas untuk menambah user.</p>
            </div>
          ) : (
            users.map(u => (
              <div key={u.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'10px',padding:'11px 14px',marginBottom:'6px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <span style={{color:'#EDEBE3',fontSize:'13px'}}>📧 {u.email}</span>
                </div>
                <button onClick={() => handleRemove(u.id, u.email)} style={{background:'transparent',color:'#E0846B',border:'1px solid rgba(224,132,107,0.27)',padding:'4px 10px',borderRadius:'6px',fontSize:'12px',cursor:'pointer'}}>Hapus</button>
              </div>
            ))
          )}
        </div>

        <div style={{marginTop:'16px',textAlign:'center',display:'flex',gap:'8px',justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={() => setShowReset(true)} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.12)',color:'#8B90A3',padding:'8px 24px',borderRadius:'9px',fontSize:'13px',cursor:'pointer'}}>🔐 Reset Password</button>
          <button onClick={onClose} style={{background:'transparent',border:'1px solid rgba(255,255,255,0.12)',color:'#B7BAC7',padding:'8px 24px',borderRadius:'9px',fontSize:'13px',cursor:'pointer'}}>Tutup Panel</button>
        </div>
        {showReset && <PasswordReset onClose={() => setShowReset(false)} />}

      </div>
    </div>
  )
}
