import type { TimePeriod, DayOfWeek } from '../types';

/**
 * Parse a time string "HH:MM" to minutes since midnight
 */
export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get current time as minutes since midnight
 */
export function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Get current day of week (0 = Sunday)
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  return new Date().getDay() as DayOfWeek;
}

/**
 * Check if current time falls within a time period
 */
export function isWithinTimePeriod(period: TimePeriod): boolean {
  const currentMinutes = getCurrentTimeMinutes();
  const startMinutes = parseTimeToMinutes(period.startTime);
  const endMinutes = parseTimeToMinutes(period.endTime);

  // Handle periods that might cross midnight (though unlikely for this app)
  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Get the current active time period
 */
export function getCurrentTimePeriod(periods: TimePeriod[]): TimePeriod | null {
  return periods.find(isWithinTimePeriod) || null;
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
  return dateString.startsWith(getTodayDateString());
}

/**
 * Format time for display (e.g., "6:00 AM")
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get midnight timestamp for today (for daily resets)
 */
export function getMidnightToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

/**
 * Check if completions should be reset (it's a new day)
 */
export function shouldResetCompletions(lastResetDate: string | null): boolean {
  if (!lastResetDate) return true;
  return !isToday(lastResetDate);
}
