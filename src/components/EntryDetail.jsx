import { useState, useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import MoodSelector from './MoodSelector'
import { updateEntry, deleteEntry } from '../utils/storage'
import { MOODS } from './MoodSelector'

export default function EntryDetail({ entry, onClose, onDeleted, onUpdated }) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(entry.content)
  const [mood, setMood] = useState(entry.mood)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState(null)
  const modalRef = useRef(null)
  const deleteTimerRef = useRef(null)

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (editing) {
          setEditing(false)
          setContent(entry.content)
          setMood(entry.mood)
        } else {
          onClose()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editing, entry, onClose])

  // Focus trap
  useEffect(() => {
    modalRef.current?.focus()
  }, [])

  // Cleanup delete timer
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    }
  }, [])

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    setError(null)

    const { error: err } = await updateEntry(entry.id, { content: content.trim(), mood })
    if (err) {
      setError('Gagal memperbarui.')
      setSaving(false)
      return
    }

    setSaving(false)
    setEditing(false)
    onUpdated()
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      // Auto-reset after 5 seconds
      deleteTimerRef.current = setTimeout(() => setConfirmDelete(false), 5000)
      return
    }

    // Actually delete
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    setDeleting(true)
    deleteEntry(entry.id).then(() => {
      onDeleted()
    })
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  const moodInfo = MOODS.find(m => m.id === entry.mood)
  const wordCount = entry.content.trim().split(/\s+/).length

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Detail catatan"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full sm:max-w-lg bg-night-900 border border-night-700/50 rounded-t-2xl sm:rounded-2xl max-h-[90dvh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-night-900/95 backdrop-blur-sm px-4 sm:px-6 py-4 border-b border-night-700/50 flex items-center justify-between">
          <div>
            <p className="text-sm text-night-300 font-medium">
              {format(new Date(entry.created_at), "EEEE, d MMMM yyyy", { locale: idLocale })}
            </p>
            <p className="text-xs text-night-500">
              {format(new Date(entry.created_at), "HH:mm")} · {wordCount} kata
              {moodInfo && ` · ${moodInfo.emoji} ${moodInfo.label}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-night-800 text-night-400 transition-colors"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4">
          {editing ? (
            <div className="space-y-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[200px] bg-night-800/50 border border-night-700/50 rounded-xl p-4 text-night-100 resize-y focus:outline-none focus:ring-2 focus:ring-night-400 text-base leading-relaxed"
                aria-label="Edit catatan"
              />
              <MoodSelector selected={mood} onSelect={setMood} />
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-night-200 leading-relaxed text-base">
              {entry.content}
            </div>
          )}

          {error && (
            <p className="mt-3 text-sm text-red-400">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-night-900/95 backdrop-blur-sm px-4 sm:px-6 py-4 border-t border-night-700/50 flex items-center justify-between">
          {editing ? (
            <>
              <button
                onClick={() => {
                  setEditing(false)
                  setContent(entry.content)
                  setMood(entry.mood)
                }}
                className="btn-ghost text-sm"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={!content.trim() || saving}
                className="btn-primary text-sm"
              >
                {saving ? 'Menyimpan...' : '💾 Simpan'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className={`text-sm transition-all ${
                  confirmDelete
                    ? 'btn-danger text-sm animate-pulse'
                    : 'text-night-500 hover:text-red-400'
                }`}
              >
                {confirmDelete ? '🗑️ Yakin hapus?' : '🗑️ Hapus'}
              </button>
              <button
                onClick={() => setEditing(true)}
                className="btn-primary text-sm"
              >
                ✏️ Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
