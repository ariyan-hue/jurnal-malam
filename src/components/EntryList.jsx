import { formatTanggal, formatWaktu, moodOf } from '../utils/helpers'
import TagBadge from './TagBadge'

export default function EntryList({ grouped, loading, entries, filtered, onSelect }) {
  if (loading) {
    return <div style={s.emptyState}>Memuat catatan…</div>
  }

  if (entries.length === 0) {
    return (
      <div style={s.emptyState}>
        Belum ada catatan. Halaman pertama menunggu di atas.
      </div>
    )
  }

  if (filtered.length === 0) {
    return <div style={s.emptyState}>Tidak ada catatan yang cocok.</div>
  }

  return (
    <>
      {grouped.map(([date, items]) => (
        <div key={date} style={{ marginBottom: 20 }}>
          <div style={s.dateHeading}>{formatTanggal(date)}</div>
          {items.map(entry => {
            const mood = moodOf(entry.mood)
            return (
              <div
                key={entry.id}
                className="jh-card jh-fade-in"
                style={s.entryCard}
                onClick={() => onSelect(entry.id)}
              >
                <div style={{ ...s.entryMoodBar, background: mood.color }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={s.entryTopRow}>
                    <span style={s.entryTitle}>
                      {entry.title || '(tanpa judul)'}
                    </span>
                    <span style={s.entryTime}>{formatWaktu(entry.createdAt)}</span>
                  </div>
                  <div style={s.entryPreview}>{entry.body}</div>
                  {(entry.tags || []).length > 0 && (
                    <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                      {(entry.tags || []).map(t => <TagBadge key={t} tagId={t} />)}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </>
  )
}

const s = {
  emptyState: {
    color: '#8B90A3',
    fontSize: 14,
    fontStyle: 'italic',
    fontFamily: "'Source Serif 4', serif",
    padding: '30px 10px',
    textAlign: 'center',
    border: '1px dashed #ffffff1a',
    borderRadius: 12,
  },
  dateHeading: {
    fontSize: 11.5,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#8B90A3',
    marginBottom: 8,
    fontWeight: 600,
  },
  entryCard: {
    display: 'flex',
    gap: 12,
    background: '#ffffff07',
    border: '1px solid #ffffff14',
    borderRadius: 11,
    padding: '12px 14px',
    marginBottom: 9,
    cursor: 'pointer',
  },
  entryMoodBar: { width: 3, borderRadius: 3, flexShrink: 0 },
  entryTopRow: { display: 'flex', justifyContent: 'space-between', gap: 10 },
  entryTitle: {
    fontFamily: "'Source Serif 4', serif",
    fontSize: 15,
    color: '#F0EEE6',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  entryTime: { fontSize: 11.5, color: '#7C8093', flexShrink: 0 },
  entryPreview: {
    fontSize: 13,
    color: '#B7BAC7',
    marginTop: 4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: 1.5,
  },
}
