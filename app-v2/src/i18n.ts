import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import bn from './locales/bn.json';

const STORE_LANGUAGE_KEY = 'settings.lang';

const languageDetectorPlugin = {
    type: 'languageDetector' as const,
    async: true,
    init: () => { },
    detect: async function (callback: (lang: string) => void) {
        try {
            const language = await AsyncStorage.getItem(STORE_LANGUAGE_KEY);
            if (language) {
                return callback(language);
            }

            const bestLanguage = Localization.getLocales()[0]?.languageCode || 'en';
            callback(bestLanguage === 'bn' ? 'bn' : 'en');
        } catch (error) {
            console.log('Error reading language', error);
            callback('en'); // Fallback to 'en' on error
        }
    },
    cacheUserLanguage: async function (language: string) {
        try {
            // Save a user's language choice
            await AsyncStorage.setItem(STORE_LANGUAGE_KEY, language);
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
        compatibilityJSON: 'v4', // Required for React Native
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // React already safe from xss
        },
        react: {
            useSuspense: false, // Prevents warning
        },
    });

export default i18n;
