/**
 * Hybrid storage: Supabase (primary) + localStorage (fallback/offline)
 * Multi-user support via user_id
 * With debounce-friendly search via Supabase full-text (.ilike) pushdown
 * and pagination.
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

const PAGE_SIZE = 30

export async function fetchEntries(userId, { query, moodFilter, tagFilter, page = 1, pageSize = PAGE_SIZE } = {}) {
  if (isSupabaseConfigured && userId) {
    try {
      let q = supabase
        .from('entries')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Pushdown filters to database
      if (query && query.trim()) {
        q = q.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      }
      if (moodFilter && moodFilter !== 'semua') {
        q = q.eq('mood', moodFilter)
      }
      if (tagFilter && tagFilter !== 'semua') {
        q = q.contains('tags', [tagFilter])
      }

      // Pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      q = q.range(from, to)

      const { data, error, count } = await q
      if (error) throw error

      const mapped = (data || []).map(e => ({
        id: e.id,
        title: e.title || '',
        body: e.content,
        mood: e.mood || 'tenang',
        tags: e.tags || [],
        date: e.created_at?.slice(0, 10) || todayISO(),
        createdAt: new Date(e.created_at).getTime(),
      }))

      return { data: mapped, total: count ?? mapped.length, error: null }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to localStorage:', err)
    }
  }

  // localStorage fallback (filtering + pagination client-side)
  try {
    const key = userId ? `${STORAGE_KEY}:${userId}` : STORAGE_KEY
    const raw = localStorage.getItem(key)
    let entries = raw ? JSON.parse(raw) : []

    // Filter
    if (query && query.trim()) {
      const q = query.toLowerCase()
      entries = entries.filter(e =>
        (e.title || '').toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q)
      )
    }
    if (moodFilter && moodFilter !== 'semua') {
      entries = entries.filter(e => e.mood === moodFilter)
    }
    if (tagFilter && tagFilter !== 'semua') {
      entries = entries.filter(e => (e.tags || []).includes(tagFilter))
    }

    const total = entries.length

    // Sort descending
    entries.sort((a, b) => b.createdAt - a.createdAt)

    // Paginate
    const from = (page - 1) * pageSize
    const paged = entries.slice(from, from + pageSize)

    return { data: paged, total, error: null }
  } catch (err) {
    return { data: [], total: 0, error: err.message }
  }
}

export async function createEntry({ content, title, mood, tags, userId }) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title || '',
    body: content,
    mood: mood || 'tenang',
    tags: tags || [],
    date: todayISO(),
    createdAt: Date.now(),
  }

  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert({ content, title: title || null, mood: mood || null, tags: (tags && tags.length > 0) ? tags : null, user_id: userId })
        .select()
        .single()
      if (error) throw error
      return {
        data: {
          id: data.id,
          title: data.title || '',
          body: data.content,
          mood: data.mood || 'tenang',
          tags: data.tags || [],
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

export async function updateEntry(id, { content, title, mood, tags, userId }) {
  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('entries')
        .update({ content, title: title || null, mood: mood || null, tags: (tags && tags.length > 0) ? tags : null, updated_at: new Date().toISOString() })
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
          tags: data.tags || [],
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
    entries[idx] = { ...entries[idx], title: title || '', body: content, mood: mood || 'tenang', tags: tags || [] }
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
