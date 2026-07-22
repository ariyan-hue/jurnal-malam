/**
 * Fetch mood statistics from Supabase
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export async function fetchMoodStats(userId) {
  if (!isSupabaseConfigured || !userId) {
    // Fallback: compute from localStorage entries
    return computeLocalMoodStats(userId)
  }

  try {
    const { data, error } = await supabase
      .from('entries')
      .select('mood, created_at')
      .eq('user_id', userId)
      .not('mood', 'is', null)
      .order('created_at', { ascending: true })

    if (error) throw error
    return aggregateMoodStats(data || [])
  } catch (err) {
    console.warn('Failed to fetch mood stats from Supabase, using local:', err)
    return computeLocalMoodStats(userId)
  }
}

function aggregateMoodStats(entries) {
  const stats = {}

  for (const e of entries) {
    const d = new Date(e.created_at)
    const bulan = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const mood = e.mood || 'tenang'

    if (!stats[bulan]) stats[bulan] = {}
    if (!stats[bulan][mood]) stats[bulan][mood] = 0
    stats[bulan][mood]++
  }

  // Convert to sorted array
  const result = Object.entries(stats)
    .map(([bulan, moods]) => ({ bulan, ...moods }))
    .sort((a, b) => a.bulan.localeCompare(b.bulan))

  return result
}

function computeLocalMoodStats(userId) {
  try {
    const key = userId ? `***:${userId}` : '***'
    const raw = localStorage.getItem(key)
    const entries = raw ? JSON.parse(raw) : []
    return aggregateMoodStats(entries.map(e => ({
      mood: e.mood,
      created_at: new Date(e.createdAt).toISOString(),
    })))
  } catch {
    return []
  }
}
