// config/hospitalConfig.ts
export const hospitalConfig = {
    hospital: {
        name: process.env.EXPO_PUBLIC_HOSPITAL_NAME || 'Hope Hospital',
        address: process.env.EXPO_PUBLIC_HOSPITAL_ADDRESS || 'Coxs Bazar - Teknaf highway, Ramu',
        coordinates: {
            lat: parseFloat(process.env.EXPO_PUBLIC_HOSPITAL_LAT || '23.7808875'),
            lng: parseFloat(process.env.EXPO_PUBLIC_HOSPITAL_LNG || '90.4184278'),
        },
    },
    contact: {
        emergency24x7: process.env.EXPO_PUBLIC_EMERGENCY_24_7 || '+8801818928493',
        emergencyLine: process.env.EXPO_PUBLIC_EMERGENCY_LINE || '+8801818928493',
        appointments: process.env.EXPO_PUBLIC_APPOINTMENTS || '+8801818928493',
    },
    email: {
        info: process.env.EXPO_PUBLIC_INFO_EMAIL || 'info.hopehospital@gmail.com',
        support: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || 'info.hopehospital@gmail.com',
    },
    hours: {
        opd: process.env.EXPO_PUBLIC_OPD_HOURS || 'Monday - Sunday 9:00 AM - 8:00 PM',
        emergency: process.env.EXPO_PUBLIC_EMERGENCY_HOURS || 'Always available',
    },
    map: {
        title: process.env.EXPO_PUBLIC_HOSPITAL_NAME || 'Hope Hospital',
        description: process.env.EXPO_PUBLIC_MAP_MARKER_DESCRIPTION || 'Main Branch',
        deltaLat: parseFloat(process.env.EXPO_PUBLIC_MAP_DELTA_LAT || '0.005'),
        deltaLng: parseFloat(process.env.EXPO_PUBLIC_MAP_DELTA_LNG || '0.005'),
    },
    ui: {
        colors: {
            primary: '#007AFF',
            emergency: '#EF4444',
            success: '#10B981',
            warning: '#F59E0B',
            gray: '#6B7280',
            white: '#FFFFFF',
            black: '#000000',
        },
        shadows: {
            default: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
        },
    },
};