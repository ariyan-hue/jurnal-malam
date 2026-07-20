import { useEffect, useRef } from 'react'
import { saveDraft, clearDraft } from '../utils/storage'

/**
 * Autosave draft every N seconds while content is non-empty.
 */
export function useAutosave(content, mood, enabled = true) {
  const timerRef = useRef(null)
  const lastSavedRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (!content || content.trim().length === 0) {
      return
    }

    timerRef.current = setInterval(() => {
      const draft = { body: content, mood }
      const serialized = JSON.stringify(draft)

      if (serialized !== lastSavedRef.current) {
        saveDraft(draft)
        lastSavedRef.current = serialized
      }
    }, 5000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [content, mood, enabled])

  const forceSave = () => {
    if (content && content.trim().length > 0) {
      saveDraft({ body: content, mood })
      lastSavedRef.current = JSON.stringify({ body: content, mood })
    }
  }

  const clearSavedDraft = () => {
    clearDraft()
    lastSavedRef.current = null
  }

  return { forceSave, clearSavedDraft }
}
