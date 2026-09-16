import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: {
        translation: {
          welcome: 'Welcome to CityCare Hospital',
          dashboard: 'Dashboard',
          navigate: 'Navigate',
          emergency: 'Emergency',
        }
      },
      hi: {
        translation: {
          welcome: 'सिटीकेयर अस्पताल में आपका स्वागत है',
          dashboard: 'डैशबोर्ड',
          navigate: 'नेविगेट',
          emergency: 'आपातकालीन',
        }
      },
      gu: {
        translation: {
          welcome: 'સિટીકેર હોસ્પિટલમાં તમારું સ્વાગત છે',
          dashboard: 'ડેશબોર્ડ',
          navigate: 'નેવિગેટ',
          emergency: 'ઇમરજન્સી',
        }
      }
    },
    interpolation: {
      escapeValue: false, // react already safes from xss
    }
  });

export default i18n;
