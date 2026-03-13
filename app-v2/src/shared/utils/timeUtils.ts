/**
 * Time utility functions — shared across appointments store and booking logic.
 * Previously duplicated in appointment.store.ts AND AppointmentBooking.tsx.
 */

/**
 * Parses a 12-hour time string into total minutes since midnight.
 * Accepts: "9:00 AM", "09:00 AM", "01:30 PM"
 */
export function timeStringToMinutes(timeString: string): number {
    const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return -1;

    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    return hour * 60 + minute;
}

/**
 * Normalizes a time string to zero-padded format: "9:00 AM" → "09:00 AM"
 */
export function normalizeTimeFormat(timeString: string): string {
    const [time, period] = timeString.split(' ');
    const [hour, minute] = time.split(':');
    return `${hour.padStart(2, '0')}:${minute} ${period}`;
}

/**
 * Returns today's date in YYYY-MM-DD format using local timezone.
 */
export function getTodayDateString(): string {
    return new Date().toLocaleDateString('en-CA');
}

/**
 * Returns current time in minutes from midnight.
 */
export function getCurrentTimeInMinutes(): number {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
}

/**
 * Parses "YYYY-MM-DD" + "HH:MM AM/PM" into a Date object for comparison.
 */
export function parseAppointmentDateTime(date: string, time: string): Date {
    const minutesSinceMidnight = timeStringToMinutes(time);
    const [year, month, day] = date.split('-').map(Number);
    const result = new Date(year, month - 1, day);
    result.setHours(Math.floor(minutesSinceMidnight / 60));
    result.setMinutes(minutesSinceMidnight % 60);
    return result;
}
