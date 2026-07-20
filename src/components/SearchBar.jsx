import { useState } from 'react'
import { MOODS } from './MoodSelector'

export default function SearchBar({
  query, onQueryChange,
  filterMood, onFilterMoodChange,
  dateFrom, dateTo, onDateFromChange, onDateToChange,
  sortBy, onSortChange
}) {
  const [showFilters, setShowFilters] = useState(false)

  const hasActiveFilters = filterMood || dateFrom || dateTo

  return (
    <div>
      {/* Search input */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-night-500">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Cari catatan..."
          className="w-full pl-10 pr-20 py-2.5 bg-night-800/50 border border-night-700/50 rounded-xl text-night-100 placeholder:text-night-500 focus:outline-none focus:ring-2 focus:ring-night-400 text-sm"
          aria-label="Cari catatan"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={() => onQueryChange('')}
              className="p-1.5 rounded-lg hover:bg-night-700 text-night-400"
              aria-label="Hapus pencarian"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-night-600 text-white'
                : 'hover:bg-night-700 text-night-400'
            }`}
            aria-label="Filter pencarian"
            aria-expanded={showFilters}
          >
            ⚙
          </button>
        </div>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mt-3 p-3 rounded-xl bg-night-800/30 border border-night-700/30 space-y-3">
          {/* Mood filter */}
          <div>
            <label className="text-xs text-night-400 mb-1.5 block">Filter mood</label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => onFilterMoodChange(null)}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                  !filterMood ? 'bg-night-600 text-white' : 'bg-night-800 text-night-300 hover:bg-night-700'
                }`}
              >
                Semua
              </button>
              {MOODS.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => onFilterMoodChange(filterMood === mood.id ? null : mood.id)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 ${
                    filterMood === mood.id ? 'bg-night-600 text-white' : 'bg-night-800 text-night-300 hover:bg-night-700'
                  }`}
                >
                  <span>{mood.emoji}</span>
                  <span className="hidden xs:inline">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-night-400 mb-1 block">Dari tanggal</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className="w-full px-3 py-1.5 bg-night-800 border border-night-700/50 rounded-lg text-night-200 text-sm focus:outline-none focus:ring-1 focus:ring-night-400"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-night-400 mb-1 block">Sampai tanggal</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className="w-full px-3 py-1.5 bg-night-800 border border-night-700/50 rounded-lg text-night-200 text-sm focus:outline-none focus:ring-1 focus:ring-night-400"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="text-xs text-night-400 mb-1 block">Urutkan</label>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-3 py-1.5 bg-night-800 border border-night-700/50 rounded-lg text-night-200 text-sm focus:outline-none focus:ring-1 focus:ring-night-400"
            >
              <option value="newest">Terbaru dulu</option>
              <option value="oldest">Terlama dulu</option>
            </select>
          </div>

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                onFilterMoodChange(null)
                onDateFromChange('')
                onDateToChange('')
              }}
              className="text-xs text-night-400 hover:text-night-200 underline"
            >
              Hapus semua filter
            </button>
          )}
        </div>
      )}
    </div>
  )
}
