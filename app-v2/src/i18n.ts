import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import * as SecureStore from 'expo-secure-store';

import en from './locales/en.json';
import bn from './locales/bn.json';

const STORE_LANGUAGE_KEY = 'settings.lang';

const languageDetectorPlugin = {
    type: 'languageDetector' as const,
    async: true,
    init: () => { },
    detect: async function (callback: (lang: string) => void) {
        try {
            const language = await SecureStore.getItemAsync(STORE_LANGUAGE_KEY);
            if (language) {
                return callback(language);
            }

            const bestLanguage = Localization.getLocales()[0]?.languageCode || 'bn';
            callback(bestLanguage === 'en' ? 'en' : 'bn');
        } catch (error) {
            console.log('Error reading language', error);
            callback('bn');
        }
    },
    cacheUserLanguage: async function (language: string) {
        try {
            await SecureStore.setItemAsync(STORE_LANGUAGE_KEY, language);
        } catch (error) {
            console.log('Error caching language', error);
        }
    },
};

const resources = {
    en: { translation: en },
    bn: { translation: bn },
};

i18n
    .use(initReactI18next)
    .use(languageDetectorPlugin)
    .init({
        resources,
        compatibilityJSON: 'v4',
        fallbackLng: 'bn',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false,
        },
    });

export default i18n;
