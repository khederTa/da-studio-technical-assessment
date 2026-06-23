import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '@/locales/en.json';
import ar from '@/locales/ar.json';

// Get initial language from localStorage or default to 'en'
const getInitialLanguage = (): 'en' | 'ar' => {
  const stored = localStorage.getItem('i18nextLng') || localStorage.getItem('language');
  if (stored === 'ar' || stored === 'en') {
    return stored;
  }
  return 'en';
};

const initialLanguage = getInitialLanguage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Helper to change language and sync with localStorage
export const changeLanguage = async (lng: 'en' | 'ar') => {
  await i18n.changeLanguage(lng);
  localStorage.setItem('language', lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
};

export default i18n;

