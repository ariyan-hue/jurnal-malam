/**
 * Hybrid storage: Supabase (primary) + localStorage (fallback/offline)
 * With multi-user support via user_id
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase'

const STORAGE_KEY = '***'
const DRAFT_KEY = '***'

function todayISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

// ─── Entries ───

export async function fetchEntries(userId) {
  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      const mapped = (data || []).map(e => ({
        id: e.id,
        title: e.title || '',
        body: e.content,
        mood: e.mood || 'tenang',
        date: e.created_at?.slice(0, 10) || todayISO(),
        createdAt: new Date(e.created_at).getTime(),
      }))
      return { data: mapped, error: null }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to localStorage:', err)
    }
  }

  // localStorage fallback (per-user)
  try {
    const key = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY
    const raw = localStorage.getItem(key)
    const data = raw ? JSON.parse(raw) : []
    data.sort((a, b) => b.createdAt - a.createdAt)
    return { data, error: null }
  } catch (err) {
    return { data: [], error: err.message }
  }
}

export async function createEntry({ content, title, mood, userId }) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title || '',
    body: content,
    mood: mood || 'tenang',
    date: todayISO(),
    createdAt: Date.now(),
  }

  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert({ content, title: title || null, mood: mood || null, user_id: userId })
        .select()
        .single()
      if (error) throw error
      return {
        data: {
          id: data.id,
          title: data.title || '',
          body: data.content,
          mood: data.mood || 'tenang',
          date: data.created_at?.slice(0, 10) || todayISO(),
          createdAt: new Date(data.created_at).getTime(),
        },
        error: null,
      }
    } catch (err) {
      console.warn('Supabase insert failed, saving locally:', err)
    }
  }

  // localStorage fallback
  try {
    const key = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY
    const raw = localStorage.getItem(key)
    const entries = raw ? JSON.parse(raw) : []
    entries.unshift(entry)
    localStorage.setItem(key, JSON.stringify(entries))
    return { data: entry, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

export async function updateEntry(id, { content, title, mood, userId }) {
  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('entries')
        .update({ content, title: title || null, mood: mood || null, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
      if (error) throw error
      return {
        data: {
          id: data.id,
          title: data.title || '',
          body: data.content,
          mood: data.mood || 'tenang',
          date: data.created_at?.slice(0, 10) || todayISO(),
          createdAt: new Date(data.created_at).getTime(),
        },
        error: null,
      }
    } catch (err) {
      console.warn('Supabase update failed, updating locally:', err)
    }
  }

  // localStorage fallback
  try {
    const key = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY
    const raw = localStorage.getItem(key)
    const entries = raw ? JSON.parse(raw) : []
    const idx = entries.findIndex(e => e.id === id)
    if (idx === -1) return { data: null, error: 'Entry not found' }
    entries[idx] = { ...entries[idx], title: title || '', body: content, mood: mood || 'tenang' }
    localStorage.setItem(key, JSON.stringify(entries))
    return { data: entries[idx], error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

export async function deleteEntry(id, userId) {
  if (isSupabaseConfigured && userId) {
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      if (error) throw error
      return { error: null }
    } catch (err) {
      console.warn('Supabase delete failed, deleting locally:', err)
    }
  }

  // localStorage fallback
  try {
    const key = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY
    const raw = localStorage.getItem(key)
    const entries = raw ? JSON.parse(raw) : []
    const filtered = entries.filter(e => e.id !== id)
    localStorage.setItem(key, JSON.stringify(filtered))
    return { error: null }
  } catch (err) {
    return { error: err.message }
  }
}

// ─── Draft (localStorage only) ───

export function saveDraft(draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}
