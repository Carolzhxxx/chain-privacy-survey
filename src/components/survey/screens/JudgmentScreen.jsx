import { useId } from 'react';
import { PRIVACY_WARNING } from '../../../config/options.js';
import {
  JUDGMENT_FACTOR_OPTIONS,
  JUDGMENT_FACTORS_QUESTION,
  MAX_JUDGMENT_FACTORS,
  PRIMARY_BASIS_OPTIONS,
  PRIMARY_BASIS_QUESTION,
} from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import CheckboxGroup from '../CheckboxGroup.jsx';
import OptionSelect from '../OptionSelect.jsx';
import ScenarioCard from '../ScenarioCard.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

const OTHER_LABEL = { en: 'Please specify “Other”', zh: '请说明“其他”' };

function OtherInput({ value, onChange, error }) {
  const { t } = useLanguage();
  const id = useId();
  return (
    <div className="field-label other-input">
      <label htmlFor={id}>{t(OTHER_LABEL)}</label>
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
 * part="factors": judgment_factors; part="basis": primary_judgment_basis.
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
            <OptionSelect
              label={PRIMARY_BASIS_QUESTION}
              options={PRIMARY_BASIS_OPTIONS}
              value={round.primary_judgment_basis}
              error={errors.primary_judgment_basis}
              onChange={(value) => {
                onChangeRound('primary_judgment_basis', value);
                if (value !== 'other') onChangeRound('primary_judgment_basis_other', null);
              }}
            />
            {round.primary_judgment_basis === 'other' ? (
              <OtherInput
                value={round.primary_judgment_basis_other}
                onChange={(value) => onChangeRound('primary_judgment_basis_other', value)}
                error={errors.primary_judgment_basis_other}
              />
            ) : null}
          </>
        )}
      </div>

      <SurveyNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
}

export default JudgmentScreen;
