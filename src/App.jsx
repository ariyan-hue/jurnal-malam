import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useAuth } from './lib/auth'
import { ADMIN_EMAIL } from './lib/auth'
import { MOODS, TAGS, todayISO, formatTanggal, formatWaktu, moodOf } from './utils/helpers'
import { fetchEntries, createEntry, updateEntry, deleteEntry, loadDraft, clearDraft } from './utils/storage'
import { useDebounce } from './hooks/useDebounce'
import { useMediaQuery } from './hooks/useMediaQuery'
import MoodSelector from './components/MoodSelector'
import TagSelector from './components/TagSelector'
import EntryList from './components/EntryList'
import EntryDetail from './components/EntryDetail'
import LoginPage from './components/LoginPage'
import AdminPanel from './components/AdminPanel'
import PasswordReset from './components/PasswordReset'
import MoodStats from './components/MoodStats'
import { useAutosave } from './hooks/useAutosave'
import { useTheme } from './hooks/useTheme'

function JurnalApp() {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isMobile = useMediaQuery('(max-width: 767px)')

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')

  const [draftTitle, setDraftTitle] = useState('')
  const [draftBody, setDraftBody] = useState('')
  const [draftMood, setDraftMood] = useState('tenang')
  const [draftTags, setDraftTags] = useState([])
  const [editingId, setEditingId] = useState(null)

  const [query, setQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState('semua')
  const [tagFilter, setTagFilter] = useState('semua')
  const [selectedId, setSelectedId] = useState(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showStats, setShowStats] = useState(false)

  // Mobile tab: 'tulis' | 'catatan'
  const [mobileTab, setMobileTab] = useState('tulis')

  const textareaRef = useRef(null)
  const saveTimerRef = useRef(null)
  const listContainerRef = useRef(null)

  // Debounce search query
  const debouncedQuery = useDebounce(query, 300)
  const { clearSavedDraft } = useAutosave(draftBody, draftMood)

  const loadEntries = useCallback(async (pageNum = 1, append = false) => {
    if (!user) return
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    const { data, total: totalCount, error: err } = await fetchEntries(user.id, {
      query: debouncedQuery,
      moodFilter,
      tagFilter,
      page: pageNum,
      pageSize: 30,
    })

    if (!err) {
      if (append) {
        setEntries(prev => [...prev, ...data])
      } else {
        setEntries(data || [])
      }
      setTotal(totalCount ?? data?.length ?? 0)
      setPage(pageNum)
    } else {
      setError('Gagal memuat catatan.')
    }

    setLoading(false)
    setLoadingMore(false)
  }, [user, debouncedQuery, moodFilter, tagFilter])

  useEffect(() => { loadEntries(1, false) }, [loadEntries])

  useEffect(() => {
    const saved = loadDraft()
    if (saved && saved.body) {
      setDraftTitle(saved.title || '')
      setDraftBody(saved.body || '')
      setDraftMood(saved.mood || 'tenang')
      setDraftTags(saved.tags || [])
    }
  }, [])

  useEffect(() => {
    if (saveStatus && saveStatus !== 'saving') {
      saveTimerRef.current = setTimeout(() => setSaveStatus(''), 3000)
      return () => clearTimeout(saveTimerRef.current)
    }
  }, [saveStatus])

  function muatLebihBanyak() { loadEntries(page + 1, true) }

  function resetDraft() {
    setDraftTitle('')
    setDraftBody('')
    setDraftMood('tenang')
    setDraftTags([])
    setEditingId(null)
    clearSavedDraft()
  }

  async function simpanEntri() {
    const body = draftBody.trim()
    if (!body) return
    setSaving(true)
    setSaveStatus('saving')
    setError(null)

    if (editingId) {
      const { data, error: err } = await updateEntry(editingId, { content: body, title: draftTitle.trim(), mood: draftMood, tags: draftTags, userId: user.id })
      if (err) { setError('Gagal memperbarui.'); setSaveStatus('error'); setSaving(false); return }
      setEntries(prev => prev.map(e => e.id === editingId ? { ...e, ...data } : e))
      setSaveStatus('saved')
    } else {
      const { data, error: err } = await createEntry({ content: body, title: draftTitle.trim(), mood: draftMood, tags: draftTags, userId: user.id })
      if (err) { setError('Gagal menyimpan.'); setSaveStatus('error'); setSaving(false); return }
      setEntries(prev => [data, ...prev])
      setTotal(prev => prev + 1)
      setSaveStatus('saved')
    }
    setSaving(false)
    resetDraft()
  }

  function mulaiEdit(entry) {
    setEditingId(entry.id)
    setDraftTitle(entry.title || '')
    setDraftBody(entry.body)
    setDraftMood(entry.mood)
    setDraftTags(entry.tags || [])
    setSelectedId(null)
    if (isMobile) setMobileTab('tulis')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => textareaRef.current?.focus(), 300)
  }

  async function hapusEntri(id) {
    const { error: err } = await deleteEntry(id, user.id)
    if (err) { setError('Gagal menghapus.'); return }
    setEntries(prev => prev.filter(e => e.id !== id))
    setTotal(prev => Math.max(0, prev - 1))
    if (selectedId === id) setSelectedId(null)
  }

  const filtered = entries
  const grouped = useMemo(() => {
    const map = new Map()
    for (const e of filtered) {
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date).push(e)
    }
    return Array.from(map.entries())
  }, [filtered])

  const hasMore = entries.length < total
  const selectedEntry = entries.find(e => e.id === selectedId)
  const isDark = theme === 'dark'

  return (
    <div style={s.page(isDark)}>
      <div style={s.lampGlow(isDark)} aria-hidden="true" />

      {/* ═══ HEADER ═══ */}
      <header style={{...s.header, flexWrap: isMobile ? 'wrap' : 'wrap'}}>
        <div style={isMobile ? s.mobileHeaderTop : {}}>
          <div style={s.eyebrow}>Catatan Pribadi</div>
          <h1 style={s.h1}>Jurnal Malam</h1>
        </div>
        <div style={s.headerRight}>
          <div style={s.statusWrap}>
            {saveStatus === 'saving' && <span style={{ ...s.statusText, color: isDark ? '#E8A94C' : '#B8860B' }}>⏳</span>}
            {saveStatus === 'saved' && <span style={{ ...s.statusText, color: isDark ? '#7FA6A0' : '#2E7D6F' }}>✓</span>}
            {saveStatus === 'error' && <span style={{ ...s.statusText, color: '#E0846B' }}>✗</span>}
          </div>
          <button onClick={toggleTheme} style={s.iconBtn} className="jh-icon-btn">{isDark ? '☀' : '☾'}</button>
          <button onClick={() => setShowStats(true)} style={s.iconBtn} className="jh-icon-btn">📊</button>
          {(user.email === ADMIN_EMAIL) && (
            <button onClick={() => setShowAdmin(true)} style={s.adminBtn} className="jh-icon-btn">🔑</button>
          )}
          <button onClick={signOut} style={s.logoutBtn} className="jh-icon-btn">↗</button>
        </div>
      </header>

      {/* ═══ MOBILE TAB BAR ═══ */}
      {isMobile && (
        <div style={s.tabBar}>
          <button
            onClick={() => setMobileTab('tulis')}
            style={mobileTab === 'tulis' ? s.tabActive : s.tabInactive}
          >
            ✏️ Tulis
          </button>
          <button
            onClick={() => setMobileTab('catatan')}
            style={mobileTab === 'catatan' ? s.tabActive : s.tabInactive}
          >
            📖 Catatan{total > 0 ? ` (${total})` : ''}
          </button>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <main style={{
        ...s.main(isDark),
        ...(isMobile ? { display: 'block' } : {}),
      }}>
        {/* WRITE PANEL — always visible on desktop, tab-based on mobile */}
        {(!isMobile || mobileTab === 'tulis') && (
          <section style={{
            ...s.writePanel,
            ...(isMobile ? { display: 'block' } : {}),
          }}>
            <div style={s.writeCard(isDark)}>
              <div style={s.dateRow(isDark)}>{formatTanggal(todayISO())}</div>
              <input
                value={draftTitle}
                onChange={e => setDraftTitle(e.target.value)}
                placeholder="Judul (opsional)"
                style={s.titleInput(isDark)}
              />
              <textarea
                ref={textareaRef}
                value={draftBody}
                onChange={e => setDraftBody(e.target.value)}
                placeholder="Apa yang terjadi hari ini? Tulis saja, sepanjang yang perlu…"
                style={s.bodyInput(isDark)}
                rows={isMobile ? 10 : 7}
              />
              <div style={s.moodRow}>
                <MoodSelector selected={draftMood} onSelect={setDraftMood} />
              </div>
              <div style={{ marginTop: 12 }}>
                <TagSelector selected={draftTags} onChange={setDraftTags} />
              </div>
              <div style={s.writeFooter}>
                {editingId && <button onClick={resetDraft} style={s.ghostBtn(isDark)} className="jh-icon-btn">Batal edit</button>}
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
        )}

        {/* LIST PANEL — always visible on desktop, tab-based on mobile */}
        {(!isMobile || mobileTab === 'catatan') && (
          <section style={{
            ...s.listPanel,
            ...(isMobile ? { display: 'block' } : {}),
          }}>
            <div style={s.filterRow}>
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Cari catatan…"
                style={s.searchInput(isDark, isMobile)}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              <select value={moodFilter} onChange={e => { setMoodFilter(e.target.value); setPage(1) }} style={s.selectInput(isDark, isMobile)}>
                <option value="semua">😶 Semua</option>
                {MOODS.map(m => <option key={m.id} value={m.id}>{m.glyph} {m.label}</option>)}
              </select>
              <select value={tagFilter} onChange={e => { setTagFilter(e.target.value); setPage(1) }} style={s.selectInput(isDark, isMobile)}>
                <option value="semua">🏷️ Semua tag</option>
                {TAGS.map(t => <option key={t.id} value={t.id}>#{t.label}</option>)}
              </select>
              {total > 0 && (
                <span style={{
                  fontSize: 12,
                  color: '#8B90A3',
                  fontStyle: 'italic',
                  alignSelf: 'center',
                  marginLeft: 'auto',
                }}>
                  {total} catatan
                </span>
              )}
            </div>

            <div style={s.listScroll(isDark, isMobile)} className="jh-scroll" ref={listContainerRef}>
              <EntryList
                grouped={grouped}
                loading={loading}
                entries={entries}
                filtered={filtered}
                onSelect={(id) => {
                  setSelectedId(id)
                  if (isMobile) setMobileTab('catatan')
                }}
              />

              {hasMore && !loading && (
                <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
                  <button
                    onClick={muatLebihBanyak}
                    disabled={loadingMore}
                    style={s.loadMoreBtn}
                    className="jh-icon-btn"
                  >
                    {loadingMore ? 'Memuat…' : `Muat ${Math.min(30, total - entries.length)} lagi`}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {error && (
        <div style={s.errorBar}>
          <span>{error}</span>
          <button onClick={() => setError(null)} style={s.errorDismiss}>✕</button>
        </div>
      )}

      {selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          onClose={() => setSelectedId(null)}
          onEdit={mulaiEdit}
          onDelete={hapusEntri}
        />
      )}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
      {showStats && <MoodStats userId={user.id} onClose={() => setShowStats(false)} />}
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#8B90A3', fontStyle: 'italic', fontFamily: "'Source Serif 4', serif" }}>Memuat…</span>
      </div>
    )
  }

  if (!user) return <LoginPage />

  return <JurnalApp />
}

const s = {
  page: dark => ({
    position: 'relative',
    minHeight: '100vh',
    padding: '20px 16px 60px',
    overflow: 'hidden',
    background: dark ? '#1B2438' : '#F5F0E8',
    color: dark ? '#F7F3E9' : '#2C2416',
    transition: 'background .3s, color .3s',
  }),
  lampGlow: dark => ({
    position: 'absolute',
    top: -120,
    left: '18%',
    width: 420,
    height: 420,
    background: dark
      ? 'radial-gradient(circle, #E8A94C22 0%, transparent 70%)'
      : 'radial-gradient(circle, #E8A94C11 0%, transparent 70%)',
    pointerEvents: 'none',
  }),
  header: {
    position: 'relative',
    maxWidth: 980,
    margin: '0 auto 16px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  mobileHeaderTop: { width: '100%' },
  eyebrow: {
    fontSize: 12,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#E8A94C',
    marginBottom: 4,
    fontWeight: 600,
  },
  h1: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: 28,
    fontWeight: 600,
    margin: 0,
    color: '#F7F3E9',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  statusWrap: { fontSize: 14, color: '#8B90A3', minWidth: 24, textAlign: 'right' },
  statusText: { fontStyle: 'italic' },
  iconBtn: {
    background: 'transparent',
    border: '1px solid #ffffff1f',
    color: '#B7BAC7',
    padding: '5px 9px',
    borderRadius: 8,
    fontSize: 15,
    cursor: 'pointer',
    lineHeight: 1,
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #ffffff1f',
    color: '#B7BAC7',
    padding: '5px 9px',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    lineHeight: 1,
  },
  adminBtn: {
    background: '#E8A94C22',
    border: '1px solid #E8A94C44',
    color: '#E8A94C',
    padding: '5px 9px',
    borderRadius: 8,
    fontSize: 14,
    cursor: 'pointer',
    lineHeight: 1,
    fontWeight: 600,
  },

  // ─── TAB BAR (mobile only) ───
  tabBar: {
    display: 'flex',
    gap: 0,
    margin: '0 auto 16px',
    maxWidth: 980,
    background: '#ffffff08',
    borderRadius: 11,
    border: '1px solid #ffffff14',
    overflow: 'hidden',
  },
  tabActive: {
    flex: 1,
    padding: '10px 12px',
    textAlign: 'center',
    background: '#E8A94C20',
    color: '#E8A94C',
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  tabInactive: {
    flex: 1,
    padding: '10px 12px',
    textAlign: 'center',
    background: 'transparent',
    color: '#8B90A3',
    border: 'none',
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },

  // ─── MAIN ───
  main: dark => ({
    position: 'relative',
    maxWidth: 980,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)',
    gap: 22,
  }),

  // ─── WRITE PANEL ───
  writePanel: {},
  writeCard: dark => ({
    background: dark
      ? 'linear-gradient(180deg, #ffffff09, #ffffff03)'
      : 'linear-gradient(180deg, #ffffff, #faf7f0)',
    border: `1px solid ${dark ? '#ffffff17' : '#e0d8c8'}`,
    borderRadius: 14,
    padding: 22,
    boxShadow: dark
      ? '0 0 0 1px #00000020, 0 12px 30px -12px #00000060'
      : '0 1px 3px rgba(0,0,0,0.06), 0 6px 16px rgba(0,0,0,0.04)',
  }),
  dateRow: dark => ({
    fontSize: 13,
    color: dark ? '#B7BAC7' : '#6B6250',
    marginBottom: 12,
    fontFamily: "'Source Serif 4', serif",
    fontStyle: 'italic',
  }),
  titleInput: dark => ({
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: `1px solid ${dark ? '#ffffff1c' : '#d0c8b8'}`,
    color: dark ? '#F7F3E9' : '#2C2416',
    fontSize: 19,
    fontFamily: "'Source Serif 4', serif",
    padding: '4px 2px 10px',
    marginBottom: 12,
    outline: 'none',
    boxSizing: 'border-box',
  }),
  bodyInput: dark => ({
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: dark ? '#EDEBE3' : '#3C3426',
    fontSize: 15.5,
    lineHeight: 1.7,
    fontFamily: "'Source Serif 4', serif",
    resize: 'vertical',
    padding: '2px',
    outline: 'none',
    boxSizing: 'border-box',
  }),
  moodRow: { marginTop: 14 },
  writeFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
    flexWrap: 'wrap',
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
  },
  ghostBtn: dark => ({
    background: 'transparent',
    color: dark ? '#B7BAC7' : '#6B6250',
    border: `1px solid ${dark ? '#ffffff1f' : '#d0c8b8'}`,
    padding: '10px 16px',
    borderRadius: 9,
    fontSize: 14,
    cursor: 'pointer',
  }),

  // ─── LIST PANEL ───
  listPanel: { display: 'flex', flexDirection: 'column', minHeight: 0 },
  filterRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 14,
  },
  searchInput: (dark, mobile) => ({
    flex: 1,
    background: dark ? '#ffffff08' : '#ffffff',
    border: `1px solid ${dark ? '#ffffff17' : '#d0c8b8'}`,
    color: dark ? '#EDEBE3' : '#3C3426',
    padding: mobile ? '12px 14px' : '9px 12px',
    borderRadius: 9,
    fontSize: mobile ? 16 : 13.5,
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
  }),
  selectInput: (dark, mobile) => ({
    flex: 1,
    minWidth: 0,
    background: dark ? '#ffffff08' : '#ffffff',
    border: `1px solid ${dark ? '#ffffff17' : '#d0c8b8'}`,
    color: dark ? '#EDEBE3' : '#3C3426',
    padding: mobile ? '10px 10px' : '9px 10px',
    borderRadius: 9,
    fontSize: mobile ? 15 : 13,
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    cursor: 'pointer',
  }),
  listScroll: (dark, mobile) => ({
    maxHeight: mobile ? 'none' : 560,
    overflowY: mobile ? 'visible' : 'auto',
    paddingRight: 4,
  }),
  loadMoreBtn: {
    background: 'transparent',
    border: '1px solid #ffffff1f',
    color: '#B7BAC7',
    padding: '12px 32px',
    borderRadius: 9,
    fontSize: 14,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },

  // ─── ERROR BAR ───
  errorBar: {
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#E0846B',
    color: '#1B2438',
    padding: '10px 20px',
    borderRadius: 10,
    fontSize: 14,
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    zIndex: 100,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    fontWeight: 500,
  },
  errorDismiss: {
    background: 'transparent',
    border: 'none',
    color: '#1B2438',
    fontSize: 16,
    cursor: 'pointer',
    fontWeight: 700,
    padding: 0,
  },
}
