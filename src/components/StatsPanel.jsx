import { useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { calculateStreak } from '../utils/streak'

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Senang', color: '#fbbf24' },
  { id: 'calm', emoji: '😌', label: 'Tenang', color: '#60a5fa' },
  { id: 'neutral', emoji: '😐', label: 'Biasa aja', color: '#9ca3af' },
  { id: 'sad', emoji: '😔', label: 'Sedih', color: '#818cf8' },
  { id: 'angry', emoji: '😠', label: 'Marah', color: '#f87171' },
  { id: 'excited', emoji: '🤩', label: 'Bersemangat', color: '#fb923c' },
  { id: 'tired', emoji: '😴', label: 'Lelah', color: '#a78bfa' },
  { id: 'grateful', emoji: '🥰', label: 'Bersyukur', color: '#34d399' },
]

export default function StatsPanel({ entries, onClose }) {
  const stats = useMemo(() => {
    if (!entries || entries.length === 0) {
      return {
        totalEntries: 0,
        avgWords: 0,
        streak: 0,
        moodDistribution: [],
        last30Days: [],
      }
    }

    // Total entries
    const totalEntries = entries.length

    // Average words per entry
    const totalWords = entries.reduce((sum, e) => {
      const words = e.content.trim().split(/\s+/).length
      return sum + words
    }, 0)
    const avgWords = Math.round(totalWords / totalEntries)

    // Current streak
    const streak = calculateStreak(entries)

    // Mood distribution (all time)
    const moodCounts = {}
    entries.forEach(e => {
      if (e.mood) {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
      }
    })
    const moodDistribution = MOODS
      .map(m => ({ ...m, count: moodCounts[m.id] || 0 }))
      .filter(m => m.count > 0)
      .sort((a, b) => b.count - a.count)

    // Last 30 days activity
    const last30 = []
    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayEntries = entries.filter(e =>
        format(new Date(e.created_at), 'yyyy-MM-dd') === dateStr
      )
      last30.push({
        date: dateStr,
        label: format(date, 'd', { locale: idLocale }),
        count: dayEntries.length,
      })
    }

    return { totalEntries, avgWords, streak, moodDistribution, last30Days: last30 }
  }, [entries])

  const maxMoodCount = Math.max(...stats.moodDistribution.map(m => m.count), 1)
  const maxDayCount = Math.max(...stats.last30Days.map(d => d.count), 1)

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-4">
      <div className="card p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-night-200">📊 Statistik Ringan</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-night-800 text-night-400"
            aria-label="Sembunyikan statistik"
          >
            ✕
          </button>
        </div>

        {stats.totalEntries === 0 ? (
          <p className="text-night-500 text-sm text-center py-4">
            Belum ada data untuk ditampilkan.
          </p>
        ) : (
          <div className="space-y-5">
            {/* Quick numbers */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-night-800/40">
                <p className="text-2xl font-bold text-white">{stats.totalEntries}</p>
                <p className="text-xs text-night-400">Total entri</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-night-800/40">
                <p className="text-2xl font-bold text-white">{stats.avgWords}</p>
                <p className="text-xs text-night-400">Kata rata-rata</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-night-800/40">
                <p className="text-2xl font-bold text-white">
                  {stats.streak > 0 ? `🔥${stats.streak}` : '—'}
                </p>
                <p className="text-xs text-night-400">Streak</p>
              </div>
            </div>

            {/* Mood distribution */}
            {stats.moodDistribution.length > 0 && (
              <div>
                <p className="text-xs text-night-400 mb-2">Distribusi Mood</p>
                <div className="space-y-1.5">
                  {stats.moodDistribution.map(mood => (
                    <div key={mood.id} className="flex items-center gap-2">
                      <span className="text-sm w-6">{mood.emoji}</span>
                      <div className="flex-1 h-5 bg-night-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(mood.count / maxMoodCount) * 100}%`,
                            backgroundColor: mood.color,
                          }}
                        />
                      </div>
                      <span className="text-xs text-night-400 w-8 text-right">{mood.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Last 30 days mini chart */}
            <div>
              <p className="text-xs text-night-400 mb-2">30 Hari Terakhir</p>
              <div className="flex items-end gap-[3px] h-12">
                {stats.last30Days.map((day, i) => (
                  <div
                    key={day.date}
                    className="flex-1 bg-night-600 rounded-t transition-all duration-300 hover:bg-night-400"
                    style={{
                      height: day.count > 0 ? `${Math.max((day.count / maxDayCount) * 100, 15)}%` : '4px',
                      opacity: day.count > 0 ? 1 : 0.3,
                    }}
                    title={`${day.label}: ${day.count} entri`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-night-600">30 hari lalu</span>
                <span className="text-[10px] text-night-600">Hari ini</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
