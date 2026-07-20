/**
 * Hybrid storage: Supabase (primary) + localStorage (fallback/offline)
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase'

const STORAGE_KEY = 'jurnal-malam-entries'
const DRAFT_KEY = 'jurnal-malam-draft'

// ─── Entries ───

export async function fetchEntries() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to localStorage:', err)
    }
  }

  // localStorage fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const data = raw ? JSON.parse(raw) : []
    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return { data, error: null }
  } catch (err) {
    return { data: [], error: err.message }
  }
}

export async function createEntry({ content, mood }) {
  const entry = {
    id: crypto.randomUUID(),
    content,
    mood: mood || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert({ content, mood: mood || null })
        .select()
        .single()
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.warn('Supabase insert failed, saving locally:', err)
    }
  }

  // localStorage fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const entries = raw ? JSON.parse(raw) : []
    entries.unshift(entry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    return { data: entry, error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

export async function updateEntry(id, { content, mood }) {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('entries')
        .update({ content, mood: mood || null, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      console.warn('Supabase update failed, updating locally:', err)
    }
  }

  // localStorage fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const entries = raw ? JSON.parse(raw) : []
    const idx = entries.findIndex(e => e.id === id)
    if (idx === -1) return { data: null, error: 'Entry not found' }
    entries[idx] = { ...entries[idx], content, mood: mood || null, updated_at: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    return { data: entries[idx], error: null }
  } catch (err) {
    return { data: null, error: err.message }
  }
}

export async function deleteEntry(id) {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
      if (error) throw error
      return { error: null }
    } catch (err) {
      console.warn('Supabase delete failed, deleting locally:', err)
    }
  }

  // localStorage fallback
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const entries = raw ? JSON.parse(raw) : []
    const filtered = entries.filter(e => e.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return { error: null }
  } catch (err) {
    return { error: err.message }
  }
}

// ─── Draft (localStorage only — no need for Supabase) ───

export function saveDraft(draft) {
  try {
    const data = { ...draft, updated_at: new Date().toISOString() }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
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
