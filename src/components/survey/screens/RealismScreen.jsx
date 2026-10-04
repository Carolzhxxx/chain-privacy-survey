import { ANCHORS_LIKELY } from '../../../config/options.js';
import { SCENARIO_REALISM_QUESTION } from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import CompactLikert from '../CompactLikert.jsx';
import ScenarioCard from '../ScenarioCard.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

const TEXT = {
  eyebrow: { en: 'Last question', zh: '最后一题' },
  eyebrowScenario: { en: 'End of this scenario', zh: '本情境最后一题' },
  title: { en: 'How realistic is this scenario?', zh: '情境的真实感' },
  submitting: { en: 'Submitting…', zh: '正在提交…' },
  submit: { en: 'Submit', zh: '提交' },
};

/** Asked once per scenario, at its end; on the last scenario its button submits. */
function RealismScreen({ itemId, value, onChange, error, onBack, onNext, submitting, isLast }) {
  const { t } = useLanguage();

  return (
    <section className="survey-card">
      <ScenarioCard target="overall" itemId={itemId} />
      <div className="survey-card-header">
        <p className="eyebrow">{t(isLast ? TEXT.eyebrow : TEXT.eyebrowScenario)}</p>
        <h1>{t(TEXT.title)}</h1>
      </div>

      <div className="survey-card-body">
        <CompactLikert
          question={SCENARIO_REALISM_QUESTION}
          anchors={ANCHORS_LIKELY}
          value={value}
          onChange={onChange}
          error={error}
        />
      </div>

      <SurveyNavigation
        onBack={onBack}
        onNext={onNext}
        nextLabel={isLast ? (submitting ? TEXT.submitting : TEXT.submit) : undefined}
        nextDisabled={isLast && submitting}
      />
    </section>
  );
}

export default RealismScreen;
