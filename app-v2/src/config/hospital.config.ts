// Hospital configuration — app-level config used across multiple features.
// Lives in src/config/, NOT inside any feature folder, because home screen,
// appointment notifications, and contact screen all reference this data.

export const hospitalConfig = {
    name: 'Hope Hospital',
    tagline: "Quality care you can trust",

    contact: {
        emergency24x7: '999',
        emergencyLine: '+880-000-0000',
        appointments: '+880-000-0001',
    },

    email: {
        info: 'info@hopehospital.com',
        support: 'support@hopehospital.com',
    },

    address: {
        line1: '123 Hospital Road',
        city: 'Dhaka',
        country: 'Bangladesh',
    },

    hours: {
        emergency: '24/7',
        outpatient: 'Sun–Thu: 8 AM – 8 PM',
        pharmacy: 'Sun–Thu: 8 AM – 10 PM, Fri–Sat: 10 AM – 6 PM',
    },

    ui: {
        colors: {
            primary: '#007AFF',
            white: '#FFFFFF',
        },
    },
} as const;
