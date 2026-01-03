import React, { createContext, useState, useContext, useEffect } from 'react';
import enTranslations from '../language/en.json';
import arTranslations from '../language/ar.json';

const LanguageContext = createContext();

const translations = {
  en: enTranslations,
  ar: arTranslations,
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
    if (language === 'ar') {
      document.body.classList.add('arabic');
      document.body.setAttribute('dir', 'rtl'); // Optional: Right-to-left direction for Arabic
    } else {
      document.body.classList.remove('arabic');
      document.body.setAttribute('dir', 'ltr'); // Optional: Left-to-right direction for English
    }
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      value = value[k];
      if (!value) {
        console.warn(`Translation key "${key}" not found for language "${language}"`);
        return key; // Fallback to the key if translation is not found
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);