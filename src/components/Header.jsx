import { useState, useEffect } from 'react'
import { calculateStreak } from '../utils/streak'
import { fetchEntries } from '../utils/storage'
import { exportToMarkdown, downloadFile } from '../utils/export'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

export default function Header({ entryCount, onToggleStats, showStats }) {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    async function load() {
      const { data } = await fetchEntries()
      setStreak(calculateStreak(data))
    }
    load()
  }, [entryCount])

  const handleExport = async () => {
    const { data } = await fetchEntries()
    if (!data || data.length === 0) return
    const md = exportToMarkdown(data)
    const filename = `jurnal-malam-${format(new Date(), 'yyyy-MM-dd')}.md`
    downloadFile(md, filename)
  }

  return (
    <header className="sticky top-0 z-30 bg-night-950/80 backdrop-blur-md border-b border-night-800/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: Logo + Title */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌙</span>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Jurnal Malam</h1>
            {streak > 0 && (
              <p className="text-xs text-night-400">
                🔥 {streak} hari berturut-turut
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Stats Toggle */}
          <button
            onClick={onToggleStats}
            className="btn-ghost text-sm"
            aria-label={showStats ? 'Sembunyikan statistik' : 'Tampilkan statistik'}
          >
            📊
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="btn-ghost text-sm"
            aria-label="Unduh semua catatan"
            title="Unduh semua catatan"
          >
            📥
          </button>

          {/* Entry Count */}
          <span className="text-xs text-night-500 hidden sm:inline">
            {entryCount} catatan
          </span>
        </div>
      </div>
    </header>
  )
}
