import { useId } from 'react';
import { PRIVACY_WARNING } from '../../../config/options.js';
import {
  JUDGMENT_FACTOR_OPTIONS,
  JUDGMENT_FACTORS_OTHER_QUESTION,
  JUDGMENT_FACTORS_QUESTION,
  RANK_HINT,
} from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import RankingSelect from '../RankingSelect.jsx';
import ScenarioCard from '../ScenarioCard.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

function OtherInput({ label, value, onChange }) {
  const { t } = useLanguage();
  const id = useId();
  return (
    <div className="field-label other-input">
      <label htmlFor={id}>{t(label)}</label>
      <p className="field-hint">{t(PRIVACY_WARNING)}</p>
      <input
        id={id}
        className="text-input"
        type="text"
        maxLength={300}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

/**
 * Asked once per scenario after all open probes: rank every judgment factor
 * (judgment_factors, most influential first), plus an optional free-text
 * "anything else" (judgment_factors_other).
 */
function JudgmentScreen({ itemId, round, onChangeRound, errors, onBack, onNext }) {
  const { t } = useLanguage();

  return (
    <section className="survey-card">
      <ScenarioCard target="overall" itemId={itemId} />
      <div className="survey-card-header">
        <p className="eyebrow">{t({ en: 'Your judgments', zh: '您的判断' })}</p>
        <h1>{t({ en: 'What shaped your judgments', zh: '影响判断的因素' })}</h1>
      </div>

      <div className="survey-card-body">
        <RankingSelect
          label={JUDGMENT_FACTORS_QUESTION}
          hint={RANK_HINT}
          options={JUDGMENT_FACTOR_OPTIONS}
          value={round.judgment_factors ?? []}
          error={errors.judgment_factors}
          onChange={(next) => onChangeRound('judgment_factors', next)}
        />
        <OtherInput
          label={JUDGMENT_FACTORS_OTHER_QUESTION}
          value={round.judgment_factors_other}
          onChange={(value) => onChangeRound('judgment_factors_other', value || null)}
        />
      </div>

      <SurveyNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
}

export default JudgmentScreen;
