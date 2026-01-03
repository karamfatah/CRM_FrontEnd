import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const LanguageToggle = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
      title={t('common.switch_language')} // Use a common translation key
    >
      <GlobeAltIcon className="w-6 h-6" />
    </button>
  );
};

export default LanguageToggle;