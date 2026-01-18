/**
 * Timezone Utility Functions
 *
 * Provides timezone-aware date handling for quest generation and daily log evaluation.
 * Uses native JavaScript Intl.DateTimeFormat for IANA timezone support.
 */

/**
 * Valid IANA timezone identifier
 */
export type Timezone = string

/**
 * Default timezone when none is specified
 */
export const DEFAULT_TIMEZONE = 'UTC'

/**
 * Get today's date in YYYY-MM-DD format for a specific timezone
 *
 * @param timezone - IANA timezone identifier (e.g., 'America/Los_Angeles', 'Europe/London')
 * @returns Date string in YYYY-MM-DD format
 *
 * @example
 * // If it's Jan 18, 2026 at 11pm UTC:
 * getTodayDateForTimezone('UTC')              // '2026-01-18'
 * getTodayDateForTimezone('America/New_York') // '2026-01-18' (6pm EST)
 * getTodayDateForTimezone('Asia/Tokyo')       // '2026-01-19' (8am JST next day)
 */
export function getTodayDateForTimezone(timezone: Timezone = DEFAULT_TIMEZONE): string {
  const now = new Date()
  return formatDateForTimezone(now, timezone)
}

/**
 * Format a Date object as YYYY-MM-DD in a specific timezone
 *
 * @param date - The Date object to format
 * @param timezone - IANA timezone identifier
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForTimezone(date: Date, timezone: Timezone = DEFAULT_TIMEZONE): string {
  try {
    // Use Intl.DateTimeFormat to get the date parts in the target timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

    // en-CA locale formats as YYYY-MM-DD
    return formatter.format(date)
  } catch {
    // If timezone is invalid, fall back to UTC
    console.warn(`Invalid timezone "${timezone}", falling back to UTC`)
    return formatDateForTimezone(date, DEFAULT_TIMEZONE)
  }
}

/**
 * Get the current time components in a specific timezone
 *
 * @param timezone - IANA timezone identifier
 * @returns Object with year, month, day, hour, minute, second
 */
export function getCurrentTimeInTimezone(timezone: Timezone = DEFAULT_TIMEZONE): {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
} {
  const now = new Date()
  return getTimeInTimezone(now, timezone)
}

/**
 * Get time components for a Date object in a specific timezone
 *
 * @param date - The Date object
 * @param timezone - IANA timezone identifier
 * @returns Object with year, month, day, hour, minute, second
 */
export function getTimeInTimezone(
  date: Date,
  timezone: Timezone = DEFAULT_TIMEZONE
): {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    })

    const parts = formatter.formatToParts(date)
    const getValue = (type: string): number => {
      const part = parts.find((p) => p.type === type)
      return part ? parseInt(part.value, 10) : 0
    }

    return {
      year: getValue('year'),
      month: getValue('month'),
      day: getValue('day'),
      hour: getValue('hour'),
      minute: getValue('minute'),
      second: getValue('second'),
    }
  } catch {
    // If timezone is invalid, fall back to UTC
    console.warn(`Invalid timezone "${timezone}", falling back to UTC`)
    return getTimeInTimezone(date, DEFAULT_TIMEZONE)
  }
}

/**
 * Check if two dates are the same day in a specific timezone
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @param timezone - IANA timezone identifier
 * @returns True if both dates fall on the same calendar day in the given timezone
 */
export function isSameDayInTimezone(
  date1: Date,
  date2: Date,
  timezone: Timezone = DEFAULT_TIMEZONE
): boolean {
  const dateStr1 = formatDateForTimezone(date1, timezone)
  const dateStr2 = formatDateForTimezone(date2, timezone)
  return dateStr1 === dateStr2
}

/**
 * Check if a date string (YYYY-MM-DD) represents today in a specific timezone
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timezone - IANA timezone identifier
 * @returns True if the date string matches today's date in the timezone
 */
export function isDateTodayInTimezone(
  dateStr: string,
  timezone: Timezone = DEFAULT_TIMEZONE
): boolean {
  return dateStr === getTodayDateForTimezone(timezone)
}

/**
 * Get the start of day (midnight) in a specific timezone as a UTC Date
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timezone - IANA timezone identifier
 * @returns Date object representing midnight of that day in the timezone
 */
export function getStartOfDayInTimezone(
  dateStr: string,
  timezone: Timezone = DEFAULT_TIMEZONE
): Date {
  // Parse the date string
  const [year, month, day] = dateStr.split('-').map(Number)

  try {
    // Create a reference date at UTC midnight
    const targetMidnight = new Date(Date.UTC(year!, month! - 1, day!, 0, 0, 0))

    // Get the UTC offset for this timezone at this time
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset',
    })

    const parts = formatter.formatToParts(targetMidnight)
    const offsetPart = parts.find((p) => p.type === 'timeZoneName')

    if (offsetPart?.value) {
      // Parse offset like "GMT-08:00" or "GMT+05:30"
      const match = offsetPart.value.match(/GMT([+-])(\d{2}):(\d{2})/)
      if (match) {
        const sign = match[1] === '+' ? 1 : -1
        const hours = parseInt(match[2]!, 10)
        const minutes = parseInt(match[3]!, 10)
        const offsetMs = sign * (hours * 60 + minutes) * 60 * 1000

        // Adjust UTC time to get the correct midnight in the timezone
        return new Date(targetMidnight.getTime() - offsetMs)
      }
    }

    // Fallback: return UTC midnight
    return targetMidnight
  } catch {
    return new Date(`${dateStr}T00:00:00Z`)
  }
}

/**
 * Get the end of day (23:59:59.999) in a specific timezone as a UTC Date
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timezone - IANA timezone identifier
 * @returns Date object representing end of day in the timezone
 */
export function getEndOfDayInTimezone(
  dateStr: string,
  timezone: Timezone = DEFAULT_TIMEZONE
): Date {
  const startOfDay = getStartOfDayInTimezone(dateStr, timezone)
  // Add 23:59:59.999 to get end of day
  return new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
}

/**
 * Check if the current time has passed the end of day for a specific date in a timezone
 *
 * @param dateStr - Date string in YYYY-MM-DD format
 * @param timezone - IANA timezone identifier
 * @returns True if the current time is past midnight of the next day in the timezone
 */
export function hasEndOfDayPassedInTimezone(
  dateStr: string,
  timezone: Timezone = DEFAULT_TIMEZONE
): boolean {
  const endOfDay = getEndOfDayInTimezone(dateStr, timezone)
  return new Date() > endOfDay
}

/**
 * Validate if a string is a valid IANA timezone identifier
 *
 * @param timezone - String to validate
 * @returns True if the timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone })
    return true
  } catch {
    return false
  }
}

/**
 * Get a safe timezone, returning DEFAULT_TIMEZONE if the input is invalid
 *
 * @param timezone - Timezone to validate
 * @returns The input timezone if valid, DEFAULT_TIMEZONE otherwise
 */
export function getSafeTimezone(timezone: string | undefined | null): Timezone {
  if (!timezone) return DEFAULT_TIMEZONE
  return isValidTimezone(timezone) ? timezone : DEFAULT_TIMEZONE
}

/**
 * Check if the current day is a weekend (Saturday or Sunday) in a specific timezone
 *
 * @param timezone - IANA timezone identifier
 * @returns True if current day is Saturday (6) or Sunday (0)
 */
export function isWeekend(timezone: Timezone = DEFAULT_TIMEZONE): boolean {
  const now = new Date()
  return isWeekendForDate(now, timezone)
}

/**
 * Check if a specific date is a weekend (Saturday or Sunday) in a specific timezone
 *
 * @param date - The Date object to check
 * @param timezone - IANA timezone identifier
 * @returns True if the date is Saturday (6) or Sunday (0)
 */
export function isWeekendForDate(date: Date, timezone: Timezone = DEFAULT_TIMEZONE): boolean {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
    })

    const weekday = formatter.format(date)
    // 'Sat' or 'Sun' indicates weekend
    return weekday === 'Sat' || weekday === 'Sun'
  } catch {
    // If timezone is invalid, fall back to UTC
    console.warn(`Invalid timezone "${timezone}", falling back to UTC`)
    return isWeekendForDate(date, DEFAULT_TIMEZONE)
  }
}

/**
 * Get the day of week (0-6, Sunday=0) for current time in a specific timezone
 *
 * @param timezone - IANA timezone identifier
 * @returns Day of week number (0=Sunday, 6=Saturday)
 */
export function getDayOfWeek(timezone: Timezone = DEFAULT_TIMEZONE): number {
  const now = new Date()
  return getDayOfWeekForDate(now, timezone)
}

/**
 * Get the day of week (0-6, Sunday=0) for a date in a specific timezone
 *
 * @param date - The Date object
 * @param timezone - IANA timezone identifier
 * @returns Day of week number (0=Sunday, 6=Saturday)
 */
export function getDayOfWeekForDate(date: Date, timezone: Timezone = DEFAULT_TIMEZONE): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
    })

    const weekday = formatter.format(date)
    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    }
    return dayMap[weekday] ?? 0
  } catch {
    console.warn(`Invalid timezone "${timezone}", falling back to UTC`)
    return getDayOfWeekForDate(date, DEFAULT_TIMEZONE)
  }
}
