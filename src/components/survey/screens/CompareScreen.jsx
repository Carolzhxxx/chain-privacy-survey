import {
  BC_DIFFERENCE_QUESTION,
  BC_DIFFERENCE_SUMMARY,
  CD_DIFFERENCE_QUESTION,
  CD_DIFFERENCE_SUMMARY,
  OPEN_REASON_PLACEHOLDER,
} from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import OpenTextField from '../OpenTextField.jsx';
import ScenarioCard from '../ScenarioCard.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

const PAIRS = {
  BC: {
    earlier: 'B',
    later: 'C',
    chain: ['A', 'B', 'C'],
    title: { en: 'B compared with C', zh: 'B 与 C 的比较' },
    question: BC_DIFFERENCE_QUESTION,
    summary: BC_DIFFERENCE_SUMMARY,
  },
  CD: {
    earlier: 'C',
    later: 'D',
    chain: ['A', 'B', 'C', 'D'],
    title: { en: 'C compared with D', zh: 'C 与 D 的比较' },
    question: CD_DIFFERENCE_QUESTION,
    summary: CD_DIFFERENCE_SUMMARY,
  },
};

function differenceKey(earlier, later) {
  if (!Number.isInteger(earlier) || !Number.isInteger(later)) return null;
  if (later > earlier) return 'higher';
  if (later < earlier) return 'lower';
  return 'same';
}

/** Open probe comparing the acceptability ratings of two consecutive recipients. */
function CompareScreen({
  pair,
  itemId,
  ratingEarlier,
  ratingLater,
  value,
  onChange,
  error,
  onBack,
  onNext,
}) {
  const { t } = useLanguage();
  const meta = PAIRS[pair];
  const key = differenceKey(ratingEarlier, ratingLater);

  return (
    <section className="survey-card">
      <ScenarioCard chain={meta.chain} target={pair} itemId={itemId} />
      <div className="survey-card-header">
        <p className="eyebrow">
          {t({ en: 'Your reasoning', zh: '您的理由' })}
        </p>
        <h1>{t(meta.title)}</h1>
        <div className="info-block">
          <p>
            {t({ en: `${meta.earlier} knows: `, zh: `${meta.earlier} 知情：` })}
            <strong>{ratingEarlier ?? '—'}</strong>
            {' · '}
            {t({ en: `${meta.later} knows: `, zh: `${meta.later} 知情：` })}
            <strong>{ratingLater ?? '—'}</strong>
          </p>
          {key ? <p>{t(meta.summary[key])}</p> : null}
        </div>
      </div>

      <div className="survey-card-body">
        <OpenTextField
          label={meta.question}
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

export default CompareScreen;
