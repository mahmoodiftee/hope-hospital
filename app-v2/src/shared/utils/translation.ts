import i18n from 'i18next';

/**
 * translation.ts - Utility for handling dynamic content translations
 */

const SPECIALTY_MAPPING: { [key: string]: { [lang: string]: string } } = {
    'general medicine': { 'bn': 'সাধারণ চিকিৎসা' },
    'dental': { 'bn': 'দন্ত চিকিৎসা' },
    'dentist': { 'bn': 'দন্ত চিকিৎসক' },
    'dentistry': { 'bn': 'দন্ত চিকিৎসা' },
    'heart': { 'bn': 'হৃদরোগ' },
    'liver': { 'bn': 'লিভার' },
    'lungs': { 'bn': 'ফুসফুস' },
    'kidney': { 'bn': 'কিডনি' },
    'cardiology': { 'bn': 'হৃদরোগ' },
    'nephrology': { 'bn': 'কিডনি' },
    'pulmonology': { 'bn': 'ফুসফুস' },
    'hepatology': { 'bn': 'লিভার' },
    'orthopedics': { 'bn': 'অর্থোপেডিক্স' },
    'pediatrics': { 'bn': 'পেডিয়াট্রিক্স' },
    'dermatology': { 'bn': 'চর্মরোগ' },
};

/**
 * Returns the translated version of a field if available and the current language is Bengali.
 * Falling back to the base field if the translation is missing or the language is not 'bn'.
 * 
 * @param obj - The object containing the fields (e.g., Doctor, Appointment)
 * @param field - The name of the base field (e.g., 'name', 'specialty')
 * @param language - The current language code ('en', 'bn', etc.)
 * @returns The translated string or the base string
 */
export const getTranslatedField = <T extends object>(
    obj: T,
    field: keyof T,
    language: string
): any => {
    if (!obj) return '';

    const isBengali = language === 'bn' || language.startsWith('bn-');

    if (isBengali) {
        const bnField = `${String(field)}_bn` as keyof T;
        // Check for both existence and non-empty string
        if (obj[bnField] && String(obj[bnField]).trim() !== '') {
            return obj[bnField];
        }

        // Special fallback for specialty if _bn is missing
        if (field === 'specialty' && obj[field]) {
            const val = String(obj[field]).toLowerCase();
            if (SPECIALTY_MAPPING[val]) {
                return SPECIALTY_MAPPING[val]['bn'];
            }

            // Also try i18next as a secondary fallback
            const i18nKey = `doctors.specialties.${val.replace(/\s+/g, '')}`;
            const translated = i18n.t(i18nKey);
            if (translated && translated !== i18nKey) {
                return translated;
            }
        }

        // Last resort for common doctor names mapped in seed (Optional, but helps with UX)
        if (field === 'doctor_name' && obj[field]) {
            const nameVal = String(obj[field]);
            if (nameVal === 'Dr. Ayesha Sultana') return 'ডা. আয়েশা সুলতানা';
            if (nameVal === 'Dr. Farhan Rahman') return 'ডা. ফারহান রহমান';
            if (nameVal === 'Dr. Nusrat Jahan') return 'ডা. নুসরাত জাহান';
            if (nameVal === 'Dr. Tanvir Hasan') return 'ডা. তানভীর হাসান';
            if (nameVal === 'Dr. Shabnam Akhter') return 'ডা. শাবনাম আখতার';
            if (nameVal === 'Dr. Rafiq Islam') return 'ডা. রফিক ইসলাম';
            if (nameVal === 'Dr. Mehnaz Hossain') return 'ডা. মেহনাজ হোসেন';
            if (nameVal === 'Dr. Kamrul Ahsan') return 'ডা. কামরুল আহসান';
            if (nameVal === 'Dr. Lubna Chowdhury') return 'ডা. লুবনা চৌধুরী';
            if (nameVal === 'Dr. Shahidul Alam') return 'ডা. শহিদুল আলম';
            if (nameVal === 'Dr. Tasnim Haque') return 'ডা. তাসনিম হক';
            if (nameVal === 'Dr. Mahmudul Hasan') return 'ডা. মাহমুদুল হাসান';
        }
    }

    return obj[field] || '';
};

/**
 * Helper to convert any string containing English numerals to Bengali numerals.
 */
export const toBengaliNumerals = (str: string): string => {
    const numeralMap: { [key: string]: string } = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
    };
    return str.split('').map(char => numeralMap[char] || char).join('');
};

/**
 * Specifically handles the array of specialties for doctors.
 */
export const getTranslatedSpecialties = (
    doctor: any,
    language: string
): string[] => {
    if (!doctor) return [];

    if (language === 'bn' && doctor.specialties_bn && doctor.specialties_bn.length > 0) {
        return doctor.specialties_bn;
    }

    return doctor.specialties || [];
};

/**
 * Localizes numbers using Intl.NumberFormat.
 * Supports Bengali numerals when language is 'bn'.
 */
export const formatLocalizedNumber = (
    num: number | string,
    language: string,
    options?: Intl.NumberFormatOptions
): string => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(value)) return String(num);

    const isBengali = language === 'bn' || language.startsWith('bn-');

    if (isBengali) {
        // Try Intl first for formatting rules (grouping, decimals), then map numerals
        try {
            const formatted = new Intl.NumberFormat('en-US', options).format(value);
            return toBengaliNumerals(formatted);
        } catch {
            return toBengaliNumerals(String(value));
        }
    }

    try {
        return new Intl.NumberFormat(language, options).format(value);
    } catch {
        return String(num);
    }
};

/**
 * Localizes time strings and general strings containing numbers.
 */
export const formatLocalizedTime = (
    timeStr: string,
    language: string
): string => {
    if (!timeStr) return '';
    const isBengali = language === 'bn' || language.startsWith('bn-');
    if (!isBengali) return timeStr;

    let localized = toBengaliNumerals(timeStr);

    // Translate AM/PM and common date components if they leak through
    localized = localized
        .replace(/AM/gi, 'পূর্বাহ্ণ')
        .replace(/PM/gi, 'অপরাহ্ণ')
        .replace(/Monday/gi, 'সোমবার')
        .replace(/Tuesday/gi, 'মঙ্গলবার')
        .replace(/Wednesday/gi, 'বুধবার')
        .replace(/Thursday/gi, 'বৃহস্পতিবার')
        .replace(/Friday/gi, 'শুক্রবার')
        .replace(/Saturday/gi, 'শনিবার')
        .replace(/Sunday/gi, 'রবিবার')
        .replace(/Mon/gi, 'সোম')
        .replace(/Tue/gi, 'মঙ্গল')
        .replace(/Wed/gi, 'বুধ')
        .replace(/Thu/gi, 'বৃহস্পতি')
        .replace(/Fri/gi, 'শুক্র')
        .replace(/Sat/gi, 'শনি')
        .replace(/Sun/gi, 'রবি');

    return localized;
};

/**
 * Translates general app-wide strings that might not be in the dynamic object fields.
 */
export const translateGeneralStore = (
    key: string,
    language: string
): string => {
    const stores: { [key: string]: { [lang: string]: string } } = {
        'Hope Hospital': {
            'bn': 'হোপ হাসপাতাল',
            'en': 'Hope Hospital'
        },
        'hope hospital': {
            'bn': 'হোপ হাসপাতাল',
            'en': 'Hope Hospital'
        },
        'Dhaka, Bangladesh': {
            'bn': 'ঢাকা, বাংলাদেশ',
            'en': 'Dhaka, Bangladesh'
        }
    };

    const isBengali = language === 'bn' || language.startsWith('bn-');
    const langKey = isBengali ? 'bn' : 'en';

    return stores[key]?.[langKey] || stores[key.toLowerCase()]?.[langKey] || key;
};
