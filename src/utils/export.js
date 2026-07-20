import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

const MOOD_LABELS = {
  happy: '😊 Senang',
  calm: '😌 Tenang',
  neutral: '😐 Biasa saja',
  sad: '😔 Sedih',
  angry: '😠 Marah',
  excited: '🤩 Bersemangat',
  tired: '😴 Lelah',
  grateful: '🥰 Bersyukur',
}

export function exportToMarkdown(entries) {
  const sorted = [...entries].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

  let md = '# Jurnal Malam 🌙\n\n'
  md += `_Diekspor pada ${format(new Date(), "d MMMM yyyy, HH:mm", { locale: idLocale })}_\n\n`
  md += `Total: ${entries.length} catatan\n\n---\n\n`

  for (const entry of sorted) {
    const date = format(new Date(entry.created_at), "EEEE, d MMMM yyyy", { locale: idLocale })
    const time = format(new Date(entry.created_at), "HH:mm")
    const mood = entry.mood ? MOOD_LABELS[entry.mood] || entry.mood : ''

    md += `## ${date} — ${time}\n`
    if (mood) md += `**Mood:** ${mood}\n\n`
    md += `${entry.content}\n\n---\n\n`
  }

  return md
}

export function downloadFile(content, filename, type = 'text/markdown') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
