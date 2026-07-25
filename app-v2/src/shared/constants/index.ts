// Shared constants
// Feature-specific constants live inside each feature.

export const DEFAULT_COUNTRY_CODE = '+88';

export const PUSH_NOTIFICATION_CHANNEL = 'default';

export const APPOINTMENT_BOOKING_BUFFER_MINUTES = 30; // min buffer before "time passed"

export const MASTER_TIME_SLOTS = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
    '07:00 PM',
    '08:00 PM',
] as const;

export const APPOINTMENT_BOOKING_DAYS_AHEAD = 30;

export const OTP_RESEND_COUNTDOWN_SECONDS = 60;
export const OTP_DEMO_CODE = '123456'; // demo mode only
