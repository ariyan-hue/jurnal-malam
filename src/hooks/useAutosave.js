import { useEffect, useRef } from 'react'
import { saveDraft, clearDraft } from '../utils/storage'

/**
 * Autosave draft every N seconds while content is non-empty.
 * Returns a function to manually save.
 */
export function useAutosave(content, mood, enabled = true) {
  const timerRef = useRef(null)
  const lastSavedRef = useRef(null)

  useEffect(() => {
    if (!enabled) return

    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Only autosave if there's content
    if (!content || content.trim().length === 0) {
      return
    }

    timerRef.current = setInterval(() => {
      const draft = { content, mood }
      const serialized = JSON.stringify(draft)

      // Only save if content changed since last save
      if (serialized !== lastSavedRef.current) {
        saveDraft(draft)
        lastSavedRef.current = serialized
      }
    }, 5000) // Every 5 seconds

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [content, mood, enabled])

  const forceSave = () => {
    if (content && content.trim().length > 0) {
      saveDraft({ content, mood })
      lastSavedRef.current = JSON.stringify({ content, mood })
    }
  }

  const clearSavedDraft = () => {
    clearDraft()
    lastSavedRef.current = null
  }

  return { forceSave, clearSavedDraft }
}
