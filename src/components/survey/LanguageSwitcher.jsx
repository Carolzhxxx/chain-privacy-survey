import { useLanguage } from '../../i18n/LanguageContext.jsx';

function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      type="button"
      className="language-switcher"
      onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
      aria-label={lang === 'en' ? '切换到中文' : 'Switch to English'}
    >
      {lang === 'en' ? '中文' : 'English'}
    </button>
  );
}

export default LanguageSwitcher;
