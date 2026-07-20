import { useState, useEffect, useCallback } from 'react'
import JournalEditor from './components/JournalEditor'
import EntryList from './components/EntryList'
import EntryDetail from './components/EntryDetail'
import Header from './components/Header'
import StatsPanel from './components/StatsPanel'
import { fetchEntries, loadDraft } from './utils/storage'

export default function App() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showStats, setShowStats] = useState(false)
  const [draft, setDraft] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Load entries
  const loadEntries = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await fetchEntries()
    if (err) {
      setError('Gagal memuat catatan. Coba muat ulang.')
    } else {
      setEntries(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadEntries()
  }, [loadEntries, refreshKey])

  // Load draft on mount
  useEffect(() => {
    const savedDraft = loadDraft()
    if (savedDraft && savedDraft.content) {
      setDraft(savedDraft)
    }
  }, [])

  const handleEntrySaved = () => {
    setDraft(null)
    setRefreshKey(k => k + 1)
  }

  const handleDraftLoaded = () => {
    setDraft(null)
  }

  return (
    <div className="min-h-dvh bg-night-950">
      {/* Header */}
      <Header
        entryCount={entries.length}
        onToggleStats={() => setShowStats(!showStats)}
        showStats={showStats}
      />

      {/* Stats Panel (collapsible) */}
      {showStats && (
        <StatsPanel entries={entries} onClose={() => setShowStats(false)} />
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Left / Top: Editor */}
          <div className="order-1">
            <JournalEditor
              onSaved={handleEntrySaved}
              draft={draft}
              onDraftLoaded={handleDraftLoaded}
            />
          </div>

          {/* Right / Bottom: Entry List */}
          <div className="order-2">
            <EntryList
              entries={entries}
              loading={loading}
              error={error}
              onSelect={setSelectedEntry}
              onRefresh={() => setRefreshKey(k => k + 1)}
            />
          </div>
        </div>
      </main>

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <EntryDetail
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onDeleted={() => {
            setSelectedEntry(null)
            setRefreshKey(k => k + 1)
          }}
          onUpdated={() => {
            setSelectedEntry(null)
            setRefreshKey(k => k + 1)
          }}
        />
      )}
    </div>
  )
}
