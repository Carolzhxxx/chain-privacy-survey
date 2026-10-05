import { useId } from 'react';
import { PRIVACY_WARNING } from '../../../config/options.js';
import {
  JUDGMENT_FACTOR_OPTIONS,
  JUDGMENT_FACTORS_QUESTION,
  MAX_JUDGMENT_FACTORS,
  PRIMARY_BASIS_OPTIONS,
  PRIMARY_BASIS_OTHER_QUESTION,
  PRIMARY_BASIS_QUESTION,
  PRIMARY_BASIS_RANK_HINT,
} from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import CheckboxGroup from '../CheckboxGroup.jsx';
import RankingSelect from '../RankingSelect.jsx';
import ScenarioCard from '../ScenarioCard.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

const OTHER_LABEL = { en: 'Please specify “Other”', zh: '请说明“其他”' };

function OtherInput({ label = OTHER_LABEL, value, onChange, error }) {
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
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <p className="error-text" role="alert">
          {t(error)}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Closed-ended items, asked once per scenario after all open probes.
 * part="factors": judgment_factors; part="basis": judgment_basis_ranking
 * (primary_judgment_basis = the item ranked first).
 */
function JudgmentScreen({ part, itemId, round, onChangeRound, errors, onBack, onNext }) {
  const { t } = useLanguage();
  const factors = round.judgment_factors ?? [];

  return (
    <section className="survey-card">
      <ScenarioCard target="overall" itemId={itemId} />
      <div className="survey-card-header">
        <p className="eyebrow">{t({ en: 'Your judgments', zh: '您的判断' })}</p>
        <h1>
          {part === 'factors'
            ? t({ en: 'What shaped your judgments', zh: '影响判断的因素' })
            : t({ en: 'Your main consideration', zh: '主要判断依据' })}
        </h1>
      </div>

      <div className="survey-card-body">
        {part === 'factors' ? (
          <>
            <CheckboxGroup
              legend={JUDGMENT_FACTORS_QUESTION}
              options={JUDGMENT_FACTOR_OPTIONS}
              value={factors}
              max={MAX_JUDGMENT_FACTORS}
              error={errors.judgment_factors}
              onChange={(next) => {
                onChangeRound('judgment_factors', next);
                if (!next.includes('other')) onChangeRound('judgment_factors_other', null);
              }}
            />
            {factors.includes('other') ? (
              <OtherInput
                value={round.judgment_factors_other}
                onChange={(value) => onChangeRound('judgment_factors_other', value)}
                error={errors.judgment_factors_other}
              />
            ) : null}
          </>
        ) : (
          <>
            <RankingSelect
              label={PRIMARY_BASIS_QUESTION}
              hint={PRIMARY_BASIS_RANK_HINT}
              options={PRIMARY_BASIS_OPTIONS}
              value={round.judgment_basis_ranking ?? []}
              error={errors.judgment_basis_ranking}
              onChange={(next) => {
                onChangeRound('judgment_basis_ranking', next);
                onChangeRound('primary_judgment_basis', next[0] ?? null);
              }}
            />
            <OtherInput
              label={PRIMARY_BASIS_OTHER_QUESTION}
              value={round.primary_judgment_basis_other}
              onChange={(value) => onChangeRound('primary_judgment_basis_other', value || null)}
            />
          </>
        )}
      </div>

      <SurveyNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
}

export default JudgmentScreen;
