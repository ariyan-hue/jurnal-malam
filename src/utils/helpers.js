export const MOODS = [
  { id: 'cerah', label: 'Cerah', color: '#E8A94C', glyph: '☀' },
  { id: 'tenang', label: 'Tenang', color: '#7FA6A0', glyph: '〜' },
  { id: 'berat', label: 'Berat', color: '#8B7FA8', glyph: '☁' },
  { id: 'gelisah', label: 'Gelisah', color: '#C4664F', glyph: '⚡' },
  { id: 'syukur', label: 'Syukur', color: '#B08D57', glyph: '✦' },
]

export const TAGS = [
  { id: 'kerja', label: 'Kerja', color: '#7FA6A0' },
  { id: 'pribadi', label: 'Pribadi', color: '#E8A94C' },
  { id: 'mimpi', label: 'Mimpi', color: '#8B7FA8' },
  { id: 'sekolah', label: 'Sekolah', color: '#B08D57' },
  { id: 'olahraga', label: 'Olahraga', color: '#7FA6A0' },
  { id: 'makanan', label: 'Makanan', color: '#C4664F' },
  { id: 'liburan', label: 'Liburan', color: '#E8A94C' },
  { id: 'ide', label: 'Ide', color: '#8B7FA8' },
]

export function todayISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export function formatTanggal(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTanggalSingkat(iso) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export function formatWaktu(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export function moodOf(id) {
  return MOODS.find(m => m.id === id) || MOODS[1]
}
