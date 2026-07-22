import { useState, useEffect, useRef } from 'react'
import { formatTanggal, formatWaktu, moodOf } from '../utils/helpers'
import TagBadge from './TagBadge'

export default function EntryDetail({ entry, onClose, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const deleteTimerRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    }
  }, [])

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      deleteTimerRef.current = setTimeout(() => setConfirmDelete(false), 5000)
      return
    }
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    onDelete(entry.id)
  }

  const mood = moodOf(entry.mood)

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.card} onClick={e => e.stopPropagation()} className="jh-fade-in">
        <div style={s.header}>
          <div>
            <div style={{ ...s.dateRow, marginBottom: 4 }}>
              {formatTanggal(entry.date)} · {formatWaktu(entry.createdAt)}
            </div>
            <div style={{
              ...s.moodTag,
              color: mood.color,
              borderColor: `${mood.color}55`,
            }}>
              {mood.glyph} {mood.label}
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn} className="jh-icon-btn">✕</button>
        </div>

        {entry.title && <h2 style={s.title}>{entry.title}</h2>}
        <p style={s.body}>{entry.body}</p>

        {(entry.tags || []).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
            {(entry.tags || []).map(t => <TagBadge key={t} tagId={t} />)}
          </div>
        )}

        <div style={s.footer}>
          <button
            onClick={handleDelete}
            style={{
              ...s.dangerBtn,
              ...(confirmDelete ? { background: '#E0846B22', animation: 'jhPulse 1s ease infinite' } : {}),
            }}
            className="jh-icon-btn"
          >
            {confirmDelete ? 'Yakin hapus?' : 'Hapus'}
          </button>
          <button onClick={() => onEdit(entry)} style={s.primaryBtn} className="jh-btn">
            Ubah catatan
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#0B0F1BCC',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 50,
  },
  card: {
    background: 'linear-gradient(180deg, #232C46, #1B2438)',
    border: '1px solid #ffffff1c',
    borderRadius: 16,
    padding: 26,
    maxWidth: 560,
    width: '100%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px -15px #00000090',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  dateRow: {
    fontSize: 13,
    color: '#B7BAC7',
    fontFamily: "'Source Serif 4', serif",
    fontStyle: 'italic',
  },
  moodTag: {
    display: 'inline-block',
    fontSize: 12,
    padding: '3px 10px',
    borderRadius: 999,
    border: '1px solid',
  },
  closeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#8B90A3',
    fontSize: 16,
    cursor: 'pointer',
    padding: 4,
    borderRadius: 6,
  },
  title: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: 22,
    color: '#F7F3E9',
    margin: '0 0 10px',
  },
  body: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: 15.5,
    lineHeight: 1.8,
    color: '#DDD9CE',
    whiteSpace: 'pre-wrap',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  primaryBtn: {
    background: '#E8A94C',
    color: '#1B2438',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 9,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'filter .15s ease',
  },
  dangerBtn: {
    background: 'transparent',
    color: '#E0846B',
    border: '1px solid #E0846B44',
    padding: '10px 16px',
    borderRadius: 9,
    fontSize: 13.5,
    cursor: 'pointer',
    transition: 'all .15s ease',
  },
}
