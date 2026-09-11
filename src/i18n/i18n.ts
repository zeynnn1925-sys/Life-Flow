import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import JSON namespaces
import enCommon from './locales/en/common.json';
import enTargets from './locales/en/targets.json';
import enHabits from './locales/en/habits.json';
import enFinance from './locales/en/finance.json';
import enAdvisor from './locales/en/advisor.json';

import idCommon from './locales/id/common.json';
import idTargets from './locales/id/targets.json';
import idHabits from './locales/id/habits.json';
import idFinance from './locales/id/finance.json';
import idAdvisor from './locales/id/advisor.json';

import arCommon from './locales/ar/common.json';
import arTargets from './locales/ar/targets.json';
import arHabits from './locales/ar/habits.json';
import arFinance from './locales/ar/finance.json';
import arAdvisor from './locales/ar/advisor.json';

import esCommon from './locales/es/common.json';
import esTargets from './locales/es/targets.json';
import esHabits from './locales/es/habits.json';
import esFinance from './locales/es/finance.json';
import esAdvisor from './locales/es/advisor.json';

export const defaultNS = 'common';
export const resources = {
  en: {
    common: enCommon,
    targets: enTargets,
    habits: enHabits,
    finance: enFinance,
    advisor: enAdvisor
  },
  id: {
    common: idCommon,
    targets: idTargets,
    habits: idHabits,
    finance: idFinance,
    advisor: idAdvisor
  },
  ar: {
    common: arCommon,
    targets: arTargets,
    habits: arHabits,
    finance: arFinance,
    advisor: arAdvisor
  },
  es: {
    common: esCommon,
    targets: esTargets,
    habits: esHabits,
    finance: esFinance,
    advisor: esAdvisor
  }
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'targets', 'habits', 'finance', 'advisor'],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'lifeflow_language',
      caches: ['localStorage']
    }
  });

// Handle RTL direction dynamically
const updateHtmlDirection = (lang: string) => {
  if (typeof document !== 'undefined') {
    const isRtl = lang === 'ar';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    if (isRtl) {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }
};

updateHtmlDirection(i18n.language || 'en');

i18n.on('languageChanged', (lng) => {
  updateHtmlDirection(lng);
  try {
    localStorage.setItem('lifeflow_language', lng);
  } catch (e) {
    // ignore
  }
});

export default i18n;
