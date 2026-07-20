import { format, differenceInCalendarDays, parseISO } from 'date-fns'

/**
 * Calculate current writing streak from entries.
 * A streak counts consecutive days (today going backwards) that have at least one entry.
 */
export function calculateStreak(entries) {
  if (!entries || entries.length === 0) return 0

  // Get unique dates (just the date part)
  const dates = new Set(
    entries.map(e => format(new Date(e.created_at), 'yyyy-MM-dd'))
  )

  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')

  // Streak only counts if there's an entry today or yesterday
  if (!dates.has(today) && !dates.has(yesterday)) return 0

  let streak = 0
  let checkDate = dates.has(today) ? new Date() : new Date(Date.now() - 86400000)

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd')
    if (dates.has(dateStr)) {
      streak++
      checkDate = new Date(checkDate.getTime() - 86400000)
    } else {
      break
    }
  }

  return streak
}
