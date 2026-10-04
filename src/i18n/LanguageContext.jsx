import { createContext, useContext, useEffect, useState } from 'react';
import { translate } from './translate.js';

const LANG_KEY = 'chain_privacy_survey_language';

const LanguageContext = createContext(null);

// Per tab, like the survey session: a new tab starts in English.
function getInitialLanguage() {
  try {
    return window.sessionStorage.getItem(LANG_KEY) === 'zh' ? 'zh' : 'en';
  } catch {
    return 'en';
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getInitialLanguage);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(LANG_KEY, lang);
    } catch {
      // storage unavailable; language still works for this page view
    }
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  const value = {
    lang,
    setLang,
    t: (text) => translate(text, lang),
  };

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
