const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Senang', color: 'bg-mood-happy/20 text-mood-happy' },
  { id: 'calm', emoji: '😌', label: 'Tenang', color: 'bg-mood-calm/20 text-mood-calm' },
  { id: 'neutral', emoji: '😐', label: 'Biasa aja', color: 'bg-mood-neutral/20 text-mood-neutral' },
  { id: 'sad', emoji: '😔', label: 'Sedih', color: 'bg-mood-sad/20 text-mood-sad' },
  { id: 'angry', emoji: '😠', label: 'Marah', color: 'bg-mood-angry/20 text-mood-angry' },
  { id: 'excited', emoji: '🤩', label: 'Bersemangat', color: 'bg-mood-excited/20 text-mood-excited' },
  { id: 'tired', emoji: '😴', label: 'Lelah', color: 'bg-mood-tired/20 text-mood-tired' },
  { id: 'grateful', emoji: '🥰', label: 'Bersyukur', color: 'bg-mood-grateful/20 text-mood-grateful' },
]

export { MOODS }

export default function MoodSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map(mood => (
        <button
          key={mood.id}
          type="button"
          onClick={() => onSelect(selected === mood.id ? null : mood.id)}
          className={`mood-chip ${mood.color} ${selected === mood.id ? 'selected' : ''}`}
          aria-pressed={selected === mood.id}
          aria-label={`Mood: ${mood.label}`}
        >
          <span className="text-lg">{mood.emoji}</span>
          <span className="hidden xs:inline">{mood.label}</span>
        </button>
      ))}
    </div>
  )
}
