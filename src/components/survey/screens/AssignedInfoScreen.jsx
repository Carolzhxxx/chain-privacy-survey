import { getInformationItem, INFORMATION_ITEM_INTRO } from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

const TEXT = {
  eyebrow: { en: 'The information', zh: '信息内容' },
  title: { en: 'The information in this scenario', zh: '本情境中的信息' },
  assigned: { en: 'Information about you (hypothetical)', zh: '关于您的信息（假想）' },
  loading: { en: 'Loading the information…', zh: '正在加载信息…' },
  retry: { en: 'Try again', zh: '重试' },
};

/** Shows the assigned item only; the category name is never displayed. */
function AssignedInfoScreen({
  itemId,
  scenarioLabel,
  onBack,
  onNext,
  loading,
  assignError,
  onRetryAssign,
  errors,
}) {
  const { t } = useLanguage();
  const item = getInformationItem(itemId);

  return (
    <section className="survey-card">
      <div className="survey-card-header">
        <p className="eyebrow">
          {scenarioLabel ? `${t(scenarioLabel)} · ` : ''}
          {t(TEXT.eyebrow)}
        </p>
        <h1>{t(TEXT.title)}</h1>
        <p className="lead">{t(INFORMATION_ITEM_INTRO)}</p>
      </div>

      <div className="survey-card-body">
        <div className="assigned-type-panel">
          <p className="assigned-type-label">{t(TEXT.assigned)}</p>
          <p className="assigned-item-text">
            {item ? t(item) : loading ? t(TEXT.loading) : '—'}
          </p>
        </div>

        {errors.info_type ? (
          <p className="error-text">{t(errors.info_type)}</p>
        ) : null}
        {assignError ? (
          <>
            <p className="error-text">{t(assignError)}</p>
            <button
              type="button"
              className="secondary-button full-width-button"
              onClick={onRetryAssign}
              disabled={loading}
            >
              {t(TEXT.retry)}
            </button>
          </>
        ) : null}
      </div>

      <SurveyNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
}

export default AssignedInfoScreen;
