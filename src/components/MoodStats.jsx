import { useState, useEffect, useMemo } from 'react'
import { MOODS } from '../utils/helpers'

export default function MoodStats({ userId, onClose }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    import('../utils/stats').then(({ fetchMoodStats }) => {
      fetchMoodStats(userId).then(data => {
        if (!cancelled) {
          setStats(data)
          setLoading(false)
        }
      })
    })

    return () => { cancelled = true }
  }, [userId])

  // Hitung total per mood — all time
  const totals = useMemo(() => {
    if (!stats) return {}
    const acc = {}
    for (const row of stats) {
      for (const mood of MOODS) {
        const v = row[mood.id] || 0
        acc[mood.id] = (acc[mood.id] || 0) + v
      }
    }
    return acc
  }, [stats])

  // Mood paling dominan
  const topMood = useMemo(() => {
    if (!totals) return null
    let max = 0
    let top = null
    for (const mood of MOODS) {
      if ((totals[mood.id] || 0) > max) {
        max = totals[mood.id]
        top = mood
      }
    }
    return top
  }, [totals])

  const totalEntries = stats?.reduce((sum, r) => {
    return sum + MOODS.reduce((s, m) => s + (r[m.id] || 0), 0)
  }, 0) || 0

  // Max value for bar scaling
  const maxVal = useMemo(() => {
    if (!stats || stats.length === 0) return 1
    let m = 0
    for (const row of stats) {
      for (const mood of MOODS) {
        if ((row[mood.id] || 0) > m) m = row[mood.id]
      }
    }
    return m || 1
  }, [stats])

  const colorMap = Object.fromEntries(MOODS.map(m => [m.id, m.color]))
  const glyphMap = Object.fromEntries(MOODS.map(m => [m.id, m.glyph]))
  const labelMap = Object.fromEntries(MOODS.map(m => [m.id, m.label]))

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.card} onClick={e => e.stopPropagation()} className="jh-fade-in">
        <div style={s.header}>
          <h2 style={s.title}>📊 Statistik Mood</h2>
          <button onClick={onClose} style={s.closeBtn} className="jh-icon-btn">✕</button>
        </div>

        {loading ? (
          <div style={s.loading}>Memuat statistik…</div>
        ) : stats && stats.length > 0 ? (
          <>
            {/* Ringkasan */}
            <div style={s.summaryGrid}>
              <div style={s.summaryCard}>
                <div style={s.summaryNumber}>{totalEntries}</div>
                <div style={s.summaryLabel}>Total Catatan</div>
              </div>
              {topMood && (
                <div style={s.summaryCard}>
                  <div style={{ ...s.summaryNumber, color: topMood.color }}>
                    {topMood.glyph} {totals[topMood.id]}
                  </div>
                  <div style={s.summaryLabel}>Mood Terbanyak: {topMood.label}</div>
                </div>
              )}
            </div>

            {/* Grafik batang per bulan */}
            <div style={s.chartContainer}>
              <div style={s.chartLabel}>Per Bulan</div>
              {stats.map(row => {
                const bulanLabel = formatBulan(row.bulan)
                return (
                  <div key={row.bulan} style={s.monthRow}>
                    <div style={s.monthLabel}>{bulanLabel}</div>
                    <div style={s.barsWrap}>
                      {MOODS.map(mood => {
                        const val = row[mood.id] || 0
                        if (val === 0) return null
                        return (
                          <div key={mood.id} style={s.barRow}>
                            <div
                              style={{
                                ...s.bar,
                                width: `${Math.max(4, (val / maxVal) * 100)}%`,
                                background: mood.color,
                                opacity: 0.85,
                              }}
                              title={`${mood.label}: ${val}`}
                            />
                            <span style={s.barValue}>{val}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Total per mood */}
            <div style={s.legendSection}>
              <div style={s.chartLabel}>Total Keseluruhan</div>
              {MOODS.map(mood => {
                const val = totals[mood.id] || 0
                const pct = totalEntries > 0 ? Math.round((val / totalEntries) * 100) : 0
                if (val === 0) return null
                return (
                  <div key={mood.id} style={s.legendRow}>
                    <span style={{ color: mood.color, fontSize: 16 }}>{mood.glyph}</span>
                    <span style={s.legendLabel}>{mood.label}</span>
                    <div style={s.legendBarBg}>
                      <div style={{
                        ...s.legendBar,
                        width: `${pct}%`,
                        background: mood.color,
                      }} />
                    </div>
                    <span style={s.legendVal}>{val} ({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div style={s.empty}>
            <p style={{ fontSize: 15, color: '#B7BAC7', marginBottom: 8 }}>Belum ada data mood.</p>
            <p style={{ fontSize: 13, color: '#8B90A3' }}>Tulis catatan dengan mood untuk melihat statistik.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function formatBulan(bulanISO) {
  const [y, m] = bulanISO.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return `${months[parseInt(m) - 1]} ${y}`
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
    maxWidth: 500,
    width: '100%',
    maxHeight: '85vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px -15px #00000090',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: 22,
    color: '#F7F3E9',
    margin: 0,
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
  loading: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#8B90A3',
    fontStyle: 'italic',
    fontSize: 14,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 24,
  },
  summaryCard: {
    background: '#ffffff06',
    border: '1px solid #ffffff12',
    borderRadius: 12,
    padding: '16px 14px',
    textAlign: 'center',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 700,
    color: '#F7F3E9',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#8B90A3',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartLabel: {
    fontSize: 12,
    color: '#8B90A3',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: 12,
  },
  monthRow: {
    marginBottom: 14,
  },
  monthLabel: {
    fontSize: 12.5,
    color: '#B7BAC7',
    fontWeight: 500,
    marginBottom: 6,
  },
  barsWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 20,
  },
  bar: {
    height: 16,
    borderRadius: 4,
    minWidth: 4,
    transition: 'width .3s ease',
  },
  barValue: {
    fontSize: 11.5,
    color: '#8B90A3',
    flexShrink: 0,
    minWidth: 20,
  },
  legendSection: {},
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  legendLabel: {
    fontSize: 13,
    color: '#EDEBE3',
    width: 70,
    flexShrink: 0,
  },
  legendBarBg: {
    flex: 1,
    height: 8,
    background: '#ffffff0a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  legendBar: {
    height: '100%',
    borderRadius: 4,
    transition: 'width .4s ease',
  },
  legendVal: {
    fontSize: 12,
    color: '#8B90A3',
    width: 70,
    textAlign: 'right',
    flexShrink: 0,
  },
  empty: {
    textAlign: 'center',
    padding: '40px 20px',
    border: '1px dashed #ffffff1a',
    borderRadius: 12,
  },
}
