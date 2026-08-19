import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationTA from './locales/ta/translation.json';
import translationHI from './locales/hi/translation.json';

const savedLanguage = localStorage.getItem('civicpulse_language') || 'en';

const resources = {
  en: { translation: translationEN },
  ta: { translation: translationTA },
  hi: { translation: translationHI },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('civicpulse_language', lng);
});

export default i18n;
