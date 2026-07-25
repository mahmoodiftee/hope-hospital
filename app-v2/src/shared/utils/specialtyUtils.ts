import { TFunction } from 'i18next';

/**
 * Normalizes specialty names to a common key for icons and translation matching.
 */
export const getSpecialtyKey = (specialty: string): string => {
    if (!specialty) return 'medical';
    const s = specialty.toLowerCase();
    if (s.includes('heart') || s.includes('cardio')) return 'heart';
    if (s.includes('dental') || s.includes('dentist')) return 'dental';
    if (s.includes('lung') || s.includes('pulmo')) return 'lungs';
    if (s.includes('kidney') || s.includes('nephro')) return 'kidney';
    if (s.includes('liver') || s.includes('hepato')) return 'liver';
    return 'medical';
};

/**
 * Translates specialty name using i18n keys or falls back to the original string.
 */
export const translateSpecialty = (specialty: string, t: TFunction): string => {
    if (!specialty) return '';
    const key = getSpecialtyKey(specialty);
    const translated = t(`doctors.specialties.${key}`);
    return translated !== `doctors.specialties.${key}` ? translated : specialty;
};
