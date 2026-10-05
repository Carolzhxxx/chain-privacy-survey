import {
  ANCHORS_STAGE_ACCEPTABILITY,
  OPEN_REASON_PLACEHOLDER,
} from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import OpenTextField from '../OpenTextField.jsx';
import ScenarioCard from '../ScenarioCard.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

const TARGETS = {
  C: {
    chain: ['A', 'B', 'C'],
    title: { en: 'Why this rating for C?', zh: '关于 C 的评分理由' },
    stage: {
      en: 'B told C this information about you.',
      zh: 'B 将关于您的信息告诉了 C。',
    },
  },
  D: {
    chain: ['A', 'B', 'C', 'D'],
    title: { en: 'Why this rating for D?', zh: '关于 D 的评分理由' },
    stage: {
      en: 'The information about you was passed on by B and C and eventually became known to D.',
      zh: '关于您的信息经过 B 和 C 的转述，最终被 D 知道。',
    },
  },
};

/** Open probe shown on its own page, after the rating it refers to was submitted. */
function OpenReasonScreen({
  itemId,
  target,
  rating,
  value,
  onChange,
  error,
  onBack,
  onNext,
}) {
  const { t } = useLanguage();
  const meta = TARGETS[target];

  return (
    <section className="survey-card">
      <ScenarioCard chain={meta.chain} target={target} itemId={itemId} />
      <div className="survey-card-header">
        <p className="eyebrow">
          {t({ en: 'Your reasoning', zh: '您的理由' })}
        </p>
        <h1>{t(meta.title)}</h1>
        <div className="info-block">
          <p>{t(meta.stage)}</p>
          <p>
            {t({ en: 'Your rating: ', zh: '您刚才的评分：' })}
            <strong>{rating ?? '—'}</strong>
            {' '}
            {t({
              en: `(1 = ${ANCHORS_STAGE_ACCEPTABILITY[1].en}, 7 = ${ANCHORS_STAGE_ACCEPTABILITY[7].en})`,
              zh: `（1 = ${ANCHORS_STAGE_ACCEPTABILITY[1].zh}，7 = ${ANCHORS_STAGE_ACCEPTABILITY[7].zh}）`,
            })}
          </p>
        </div>
      </div>

      <div className="survey-card-body">
        <OpenTextField
          ariaLabel={meta.title}
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

export default OpenReasonScreen;
