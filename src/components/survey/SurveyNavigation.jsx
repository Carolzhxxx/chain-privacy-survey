import { useLanguage } from '../../i18n/LanguageContext.jsx';

const DEFAULT_NEXT = { en: 'Next', zh: '下一步' };
const BACK = { en: 'Back', zh: '返回' };

function SurveyNavigation({
  onBack,
  onNext,
  nextLabel = DEFAULT_NEXT,
  nextDisabled = false,
  showBack = true,
}) {
  const { t } = useLanguage();

  return (
    <div className="nav-row">
      {showBack ? (
        <button type="button" className="back-button" onClick={onBack}>
          {t(BACK)}
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        className="primary-button"
        onClick={onNext}
        disabled={nextDisabled}
      >
        {t(nextLabel)}
      </button>
    </div>
  );
}

export default SurveyNavigation;
