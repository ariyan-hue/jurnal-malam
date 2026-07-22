import { useEffect, useRef, useCallback } from 'react'
import { saveDraft, clearDraft } from '../utils/storage'

/**
 * Autosave draft every N seconds while content is non-empty.
 * Returns last saved timestamp for status indicators.
 */
export function useAutosave(content, mood, enabled = true) {
  const timerRef = useRef(null)
  const lastSavedRef = useRef(null)
  const lastSavedTime = useRef(null)

  const forceSave = useCallback(() => {
    if (content && content.trim().length > 0) {
      saveDraft({ body: content, mood })
      lastSavedRef.current = JSON.stringify({ body: content, mood })
      lastSavedTime.current = Date.now()
    }
  }, [content, mood])

  const clearSavedDraft = useCallback(() => {
    clearDraft()
    lastSavedRef.current = null
    lastSavedTime.current = null
  }, [])

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
        lastSavedTime.current = Date.now()
      }
    }, 5000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [content, mood, enabled])

  return { forceSave, clearSavedDraft, lastSavedTime }
}
