import { TAGS, moodOf } from '../utils/helpers'

const tagColors = {
  kerja: '#7FA6A0',
  pribadi: '#E8A94C',
  mimpi: '#8B7FA8',
  sekolah: '#B08D57',
  olahraga: '#7FA6A0',
  makanan: '#C4664F',
  liburan: '#E8A94C',
  ide: '#8B7FA8',
}

export default function TagBadge({ tagId }) {
  const tag = TAGS.find(t => t.id === tagId)
  if (!tag) return null
  return (
    <span style={{
      display: 'inline-block',
      background: `${tag.color}22`,
      color: tag.color,
      fontSize: 11,
      fontWeight: 600,
      padding: '2px 8px',
      borderRadius: 5,
      marginRight: 4,
      whiteSpace: 'nowrap',
    }}>
      #{tag.label}
    </span>
  )
}
