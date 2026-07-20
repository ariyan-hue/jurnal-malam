import { useState, useEffect, useMemo, useRef } from 'react'
import { MOODS, todayISO, formatTanggal, formatWaktu, moodOf } from './utils/helpers'
import { fetchEntries, createEntry, updateEntry, deleteEntry, saveDraft, loadDraft, clearDraft } from './utils/storage'
import MoodSelector from './components/MoodSelector'
import EntryList from './components/EntryList'
import EntryDetail from './components/EntryDetail'
import { useAutosave } from './hooks/useAutosave'

export default function App() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const [draftTitle, setDraftTitle] = useState('')
  const [draftBody, setDraftBody] = useState('')
  const [draftMood, setDraftMood] = useState('tenang')
  const [editingId, setEditingId] = useState(null)

  const [query, setQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState('semua')
  const [selectedId, setSelectedId] = useState(null)

  const textareaRef = useRef(null)

  // Autosave draft
  const { forceSave, clearSavedDraft } = useAutosave(draftBody, draftMood)

  // Load entries on mount
  useEffect(() => {
    (async () => {
      const { data, error: err } = await fetchEntries()
      if (!err) setEntries(data || [])
      setLoading(false)
    })()
  }, [])

  // Restore draft on mount
  useEffect(() => {
    const saved = loadDraft()
    if (saved && saved.body) {
      setDraftTitle(saved.title || '')
      setDraftBody(saved.body || '')
      setDraftMood(saved.mood || 'tenang')
    }
  }, [])

  async function persist(next) {
    setSaving(true)
    setError(null)
    try {
      // For localStorage, we handle it in storage.js
      // For Supabase, we save individually
      // This function is mainly for the localStorage path
    } catch (e) {
      setError('Catatan belum tersimpan ke server. Coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  function resetDraft() {
    setDraftTitle('')
    setDraftBody('')
    setDraftMood('tenang')
    setEditingId(null)
    clearSavedDraft()
  }

  async function simpanEntri() {
    const body = draftBody.trim()
    if (!body) return

    setSaving(true)
    setError(null)

    if (editingId) {
      const { data, error: err } = await updateEntry(editingId, {
        content: body,
        title: draftTitle.trim(),
        mood: draftMood,
      })
      if (err) {
        setError('Gagal memperbarui. Coba lagi.')
        setSaving(false)
        return
      }
      setEntries(prev => prev.map(e => e.id === editingId ? { ...e, ...data } : e))
    } else {
      const { data, error: err } = await createEntry({
        content: body,
        title: draftTitle.trim(),
        mood: draftMood,
      })
      if (err) {
        setError('Gagal menyimpan. Coba lagi.')
        setSaving(false)
        return
      }
      setEntries(prev => [data, ...prev])
    }

    setSaving(false)
    resetDraft()
  }

  function mulaiEdit(entry) {
    setEditingId(entry.id)
    setDraftTitle(entry.title || '')
    setDraftBody(entry.body)
    setDraftMood(entry.mood)
    setSelectedId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => textareaRef.current && textareaRef.current.focus(), 300)
  }

  async function hapusEntri(id) {
    const { error: err } = await deleteEntry(id)
    if (err) {
      setError('Gagal menghapus. Coba lagi.')
      return
    }
    setEntries(prev => prev.filter(e => e.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (moodFilter !== 'semua' && e.mood !== moodFilter) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        return (e.title || '').toLowerCase().includes(q) || e.body.toLowerCase().includes(q)
      }
      return true
    })
  }, [entries, query, moodFilter])

  const grouped = useMemo(() => {
    const map = new Map()
    for (const e of filtered) {
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date).push(e)
    }
    return Array.from(map.entries())
  }, [filtered])

  const selectedEntry = entries.find(e => e.id === selectedId)

  return (
    <div style={s.page}>
      <div style={s.lampGlow} aria-hidden="true" />

      {/* Header */}
      <header style={s.header}>
        <div>
          <div style={s.eyebrow}>Catatan Pribadi</div>
          <h1 style={s.h1}>Jurnal Malam</h1>
        </div>
        <div style={s.statusWrap}>
          {saving && <span style={s.statusText}>menyimpan…</span>}
          {!saving && !loading && <span style={s.statusText}>tersimpan otomatis</span>}
          {error && <span style={{ ...s.statusText, color: '#E0846B' }}>{error}</span>}
        </div>
      </header>

      <main style={s.main}>
        {/* Panel Tulis */}
        <section style={s.writePanel} className="jh-fade-in">
          <div style={s.writeCard}>
            <div style={s.dateRow}>{formatTanggal(todayISO())}</div>
            <input
              value={draftTitle}
              onChange={e => setDraftTitle(e.target.value)}
              placeholder="Judul (opsional)"
              style={s.titleInput}
            />
            <textarea
              ref={textareaRef}
              value={draftBody}
              onChange={e => setDraftBody(e.target.value)}
              placeholder="Apa yang terjadi hari ini? Tulis saja, sepanjang yang perlu…"
              style={s.bodyInput}
              rows={7}
            />
            <div style={s.moodRow}>
              <MoodSelector selected={draftMood} onSelect={setDraftMood} />
            </div>
            <div style={s.writeFooter}>
              {editingId && (
                <button onClick={resetDraft} style={s.ghostBtn} className="jh-icon-btn">
                  Batal edit
                </button>
              )}
              <button
                onClick={simpanEntri}
                disabled={!draftBody.trim()}
                className="jh-btn"
                style={{
                  ...s.primaryBtn,
                  opacity: draftBody.trim() ? 1 : 0.45,
                  cursor: draftBody.trim() ? 'pointer' : 'default',
                }}
              >
                {saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Catat'}
              </button>
            </div>
          </div>
        </section>

        {/* Panel Daftar */}
        <section style={s.listPanel}>
          <div style={s.filterRow}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari catatan…"
              style={s.searchInput}
            />
            <select
              value={moodFilter}
              onChange={e => setMoodFilter(e.target.value)}
              style={s.selectInput}
            >
              <option value="semua">Semua suasana</option>
              {MOODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>

          <div style={s.listScroll} className="jh-scroll">
            <EntryList
              grouped={grouped}
              loading={loading}
              entries={entries}
              filtered={filtered}
              onSelect={setSelectedId}
            />
          </div>
        </section>
      </main>

      {/* Modal Detail */}
      {selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          onClose={() => setSelectedId(null)}
          onEdit={mulaiEdit}
          onDelete={hapusEntri}
        />
      )}
    </div>
  )
}

const s = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    padding: '32px 24px 60px',
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
  header: {
    position: 'relative',
    maxWidth: 980,
    margin: '0 auto 28px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#E8A94C',
    marginBottom: 6,
    fontWeight: 600,
  },
  h1: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: 34,
    fontWeight: 600,
    margin: 0,
    color: '#F7F3E9',
  },
  statusWrap: { fontSize: 12, color: '#8B90A3' },
  statusText: { fontStyle: 'italic' },
  main: {
    position: 'relative',
    maxWidth: 980,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)',
    gap: 22,
  },
  writePanel: {},
  writeCard: {
    background: 'linear-gradient(180deg, #ffffff09, #ffffff03)',
    border: '1px solid #ffffff17',
    borderRadius: 14,
    padding: 22,
    boxShadow: '0 0 0 1px #00000020, 0 12px 30px -12px #00000060',
  },
  dateRow: {
    fontSize: 13,
    color: '#B7BAC7',
    marginBottom: 12,
    fontFamily: "'Source Serif 4', serif",
    fontStyle: 'italic',
  },
  titleInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid #ffffff1c',
    color: '#F7F3E9',
    fontSize: 19,
    fontFamily: "'Source Serif 4', serif",
    padding: '4px 2px 10px',
    marginBottom: 12,
  },
  bodyInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#EDEBE3',
    fontSize: 15.5,
    lineHeight: 1.7,
    fontFamily: "'Source Serif 4', serif",
    resize: 'vertical',
    padding: '2px',
  },
  moodRow: { marginTop: 14 },
  writeFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
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
  ghostBtn: {
    background: 'transparent',
    color: '#B7BAC7',
    border: '1px solid #ffffff1f',
    padding: '10px 16px',
    borderRadius: 9,
    fontSize: 14,
    cursor: 'pointer',
  },
  listPanel: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  filterRow: { display: 'flex', gap: 8, marginBottom: 14 },
  searchInput: {
    flex: 1,
    background: '#ffffff08',
    border: '1px solid #ffffff17',
    color: '#EDEBE3',
    padding: '9px 12px',
    borderRadius: 9,
    fontSize: 13.5,
    fontFamily: "'Inter', sans-serif",
  },
  selectInput: {
    background: '#ffffff08',
    border: '1px solid #ffffff17',
    color: '#EDEBE3',
    padding: '9px 10px',
    borderRadius: 9,
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
  },
  listScroll: {
    maxHeight: 560,
    overflowY: 'auto',
    paddingRight: 4,
  },
}
