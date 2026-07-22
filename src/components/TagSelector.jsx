import { TAGS } from '../utils/helpers'

export default function TagSelector({ selected = [], onChange }) {
  function toggle(tagId) {
    const current = [...selected]
    const idx = current.indexOf(tagId)
    if (idx >= 0) {
      current.splice(idx, 1)
    } else {
      current.push(tagId)
    }
    onChange(current)
  }

  return (
    <div>
      <div style={{ fontSize: 12, color: '#8B90A3', marginBottom: 8, fontWeight: 500 }}>
        Tag
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {TAGS.map(t => {
          const isActive = selected.includes(t.id)
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggle(t.id)}
              style={{
                background: isActive ? `${t.color}33` : 'transparent',
                border: `1px solid ${isActive ? t.color : '#ffffff1a'}`,
                color: isActive ? t.color : '#8B90A3',
                padding: '4px 10px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              #{t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
