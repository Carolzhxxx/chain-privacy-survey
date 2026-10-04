import {
  CD_DIFFERENCE_QUESTION,
  CD_DIFFERENCE_SUMMARY,
  OPEN_REASON_PLACEHOLDER,
} from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import OpenTextField from '../OpenTextField.jsx';
import ScenarioCard from '../ScenarioCard.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

function differenceKey(ratingC, ratingD) {
  if (!Number.isInteger(ratingC) || !Number.isInteger(ratingD)) return null;
  if (ratingD > ratingC) return 'higher';
  if (ratingD < ratingC) return 'lower';
  return 'same';
}

function CompareCDScreen({
  itemId,
  ratingC,
  ratingD,
  value,
  onChange,
  error,
  onBack,
  onNext,
}) {
  const { t } = useLanguage();
  const key = differenceKey(ratingC, ratingD);

  return (
    <section className="survey-card">
      <ScenarioCard target="CD" itemId={itemId} />
      <div className="survey-card-header">
        <p className="eyebrow">
          {t({ en: 'Your reasoning', zh: '您的理由' })}
        </p>
        <h1>{t({ en: 'C compared with D', zh: 'C 与 D 的比较' })}</h1>
        <div className="info-block">
          <p>
            {t({ en: 'C knows: ', zh: 'C 知情：' })}
            <strong>{ratingC ?? '—'}</strong>
            {' · '}
            {t({ en: 'D knows: ', zh: 'D 知情：' })}
            <strong>{ratingD ?? '—'}</strong>
          </p>
          {key ? <p>{t(CD_DIFFERENCE_SUMMARY[key])}</p> : null}
        </div>
      </div>

      <div className="survey-card-body">
        <OpenTextField
          label={CD_DIFFERENCE_QUESTION}
          placeholder={OPEN_REASON_PLACEHOLDER}
          value={value}
          onChange={onChange}
          error={error}
        />
      </div>

      <SurveyNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
}

export default CompareCDScreen;
