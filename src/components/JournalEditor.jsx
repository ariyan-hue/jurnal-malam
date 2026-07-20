import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import MoodSelector from './MoodSelector'
import { createEntry } from '../utils/storage'
import { useAutosave } from '../hooks/useAutosave'

export default function JournalEditor({ onSaved, draft, onDraftLoaded }) {
  const [content, setContent] = useState('')
  const [mood, setMood] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [draftRestored, setDraftRestored] = useState(false)
  const textareaRef = useRef(null)

  // Autosave draft
  const { forceSave, clearSavedDraft } = useAutosave(content, mood)

  // Restore draft if available
  useEffect(() => {
    if (draft && draft.content) {
      setContent(draft.content)
      setMood(draft.mood || null)
      setDraftRestored(true)
      // Auto-dismiss the notice after 5 seconds
      const timer = setTimeout(() => setDraftRestored(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [draft])

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleSubmit = async () => {
    if (!content.trim()) return

    setSaving(true)
    setError(null)

    const { data, error: err } = await createEntry({ content: content.trim(), mood })

    if (err) {
      setError('Gagal menyimpan. Coba lagi.')
      setSaving(false)
      return
    }

    // Clear form
    setContent('')
    setMood(null)
    clearSavedDraft()
    setSaving(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
    onSaved()
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    // Cmd/Ctrl + Enter to submit
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleDiscardDraft = () => {
    setContent('')
    setMood(null)
    setDraftRestored(false)
    clearSavedDraft()
    onDraftLoaded()
    textareaRef.current?.focus()
  }

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="card p-4 sm:p-6">
      {/* Draft restored notice */}
      {draftRestored && (
        <div className="mb-4 p-3 rounded-xl bg-mood-calm/10 border border-mood-calm/30 flex items-center justify-between gap-2">
          <p className="text-sm text-mood-calm">
            ✨ Draft sebelumnya dipulihkan
          </p>
          <button
            onClick={handleDiscardDraft}
            className="text-xs text-night-400 hover:text-night-200 underline shrink-0"
          >
            Buang draft
          </button>
        </div>
      )}

      {/* Date */}
      <p className="text-sm text-night-400 mb-3">
        {format(new Date(), "EEEE, d MMMM yyyy", { locale: idLocale })}
      </p>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tulis catatan malam ini..."
        className="w-full min-h-[200px] sm:min-h-[280px] bg-night-800/50 border border-night-700/50 rounded-xl p-4 text-night-100 placeholder:text-night-500 resize-y focus:outline-none focus:ring-2 focus:ring-night-400 focus:border-transparent transition-all text-base leading-relaxed"
        aria-label="Tulis catatan jurnal"
      />

      {/* Mood Selector */}
      <div className="mt-4">
        <p className="text-sm text-night-400 mb-2">Mood hari ini</p>
        <MoodSelector selected={mood} onSelect={setMood} />
      </div>

      {/* Bottom bar */}
      <div className="mt-4 flex items-center justify-between">
        {/* Word count */}
        <span className="text-xs text-night-500">
          {wordCount > 0 ? `${wordCount} kata` : ''}
        </span>

        <div className="flex items-center gap-3">
          {/* Error */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {/* Success */}
          {showSuccess && (
            <p className="text-sm text-mood-grateful">Tersimpan! ✓</p>
          )}

          {/* Save button */}
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || saving}
            className="btn-primary"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Menyimpan...
              </span>
            ) : (
              '📝 Catat'
            )}
          </button>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <p className="text-xs text-night-600 mt-2 text-right">
        Ctrl+Enter untuk simpan cepat
      </p>
    </div>
  )
}
