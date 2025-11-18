import { useState, useEffect } from 'react';
import i18n from '../utils/i18n';

export const useI18n = () => {
  const [locale, setLocale] = useState(i18n.getCurrentLocale());

  useEffect(() => {
    // Cargar idioma guardado al iniciar
    i18n.loadSavedLocale();
    setLocale(i18n.getCurrentLocale());

    // Escuchar cambios de idioma
    const handleLanguageChange = (event) => {
      setLocale(event.detail.locale);
    };

    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, []);

  const t = (key) => i18n.t(key);
  
  const changeLanguage = (newLocale) => {
    i18n.setLocale(newLocale);
  };

  return {
    t,
    locale,
    changeLanguage
  };
};