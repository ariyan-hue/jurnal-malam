import { MOODS } from '../utils/helpers'

export default function MoodSelector({ selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {MOODS.map(m => (
        <button
          key={m.id}
          onClick={() => onSelect(m.id)}
          className="jh-icon-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            padding: '6px 12px',
            borderRadius: 999,
            border: `1px solid ${selected === m.id ? m.color : '#ffffff1f'}`,
            color: selected === m.id ? m.color : '#B7BAC7',
            background: selected === m.id ? `${m.color}1a` : 'transparent',
            cursor: 'pointer',
            transition: 'all .15s ease',
            fontFamily: "'Inter', sans-serif",
          }}
          title={m.label}
        >
          <span style={{ fontSize: 14 }}>{m.glyph}</span> {m.label}
        </button>
      ))}
    </div>
  )
}
