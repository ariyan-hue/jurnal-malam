import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { MOODS } from './MoodSelector'
import SearchBar from './SearchBar'

export default function EntryList({ entries, loading, error, onSelect, onRefresh }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMood, setFilterMood] = useState(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const filteredEntries = useMemo(() => {
    let result = [...entries]

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(e =>
        e.content.toLowerCase().includes(q) ||
        (e.mood && e.mood.toLowerCase().includes(q))
      )
    }

    // Mood filter
    if (filterMood) {
      result = result.filter(e => e.mood === filterMood)
    }

    // Date range
    if (dateFrom) {
      const from = new Date(dateFrom)
      result = result.filter(e => new Date(e.created_at) >= from)
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      result = result.filter(e => new Date(e.created_at) <= to)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      return 0
    })

    return result
  }, [entries, searchQuery, filterMood, dateFrom, dateTo, sortBy])

  const getMoodInfo = (moodId) => MOODS.find(m => m.id === moodId)

  const highlightText = (text, query) => {
    if (!query.trim()) return text
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="search-highlight">{part}</mark>
        : part
    )
  }

  return (
    <div className="card p-4 sm:p-6">
      {/* Search & Filters */}
      <SearchBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        filterMood={filterMood}
        onFilterMoodChange={setFilterMood}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Loading */}
      {loading && (
        <div className="py-12 text-center">
          <span className="animate-spin text-2xl inline-block">⏳</span>
          <p className="text-night-400 mt-2">Memuat catatan...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="py-12 text-center">
          <p className="text-red-400 mb-3">⚠️ {error}</p>
          <button onClick={onRefresh} className="btn-primary text-sm">
            Coba muat ulang
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && entries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-night-300 font-medium">Belum ada catatan</p>
          <p className="text-night-500 text-sm mt-1">
            Tulis catatan pertamamu di kolom sebelah kiri.
          </p>
        </div>
      )}

      {/* No results */}
      {!loading && !error && entries.length > 0 && filteredEntries.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-night-300 font-medium">Tidak ada yang cocok</p>
          <p className="text-night-500 text-sm mt-1">
            Coba ubah kata kunci atau filter pencarianmu.
          </p>
        </div>
      )}

      {/* Entry list */}
      {!loading && !error && filteredEntries.length > 0 && (
        <div className="space-y-3 mt-4">
          <p className="text-xs text-night-500">
            {filteredEntries.length} dari {entries.length} catatan
          </p>

          {filteredEntries.map(entry => {
            const moodInfo = getMoodInfo(entry.mood)
            const preview = entry.content.length > 150
              ? entry.content.substring(0, 150) + '...'
              : entry.content

            return (
              <button
                key={entry.id}
                onClick={() => onSelect(entry)}
                className="w-full text-left p-4 rounded-xl bg-night-800/40 hover:bg-night-800/70 border border-night-700/30 hover:border-night-600/50 transition-all duration-150 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Date & Mood */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-night-400">
                        {format(new Date(entry.created_at), "d MMM, HH:mm", { locale: idLocale })}
                      </span>
                      {moodInfo && (
                        <span className="text-sm" title={moodInfo.label}>
                          {moodInfo.emoji}
                        </span>
                      )}
                    </div>

                    {/* Content preview */}
                    <p className="text-sm text-night-200 leading-relaxed line-clamp-3">
                      {highlightText(preview, searchQuery)}
                    </p>
                  </div>

                  {/* Arrow */}
                  <span className="text-night-600 group-hover:text-night-400 transition-colors mt-1 shrink-0">
                    →
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
