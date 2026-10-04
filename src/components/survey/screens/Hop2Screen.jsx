import {
  ANCHORS_STAGE_ACCEPTABILITY,
  STAGE_ACCEPTABILITY_QUESTIONS,
} from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import CompactLikert from '../CompactLikert.jsx';
import ScenarioCard from '../ScenarioCard.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

function Hop2Screen({ itemId, hop, onChangeHop, onBack, onNext, errors }) {
  const { t } = useLanguage();

  return (
    <section className="survey-card">
      <ScenarioCard chain={['A', 'B', 'C']} target="C" itemId={itemId} />
      <div className="survey-card-header">
        <p className="eyebrow">{t({ en: 'Stage 2 of 3', zh: '第 2 / 3 阶段' })}</p>
        <h1>{t({ en: 'YOU (A) → B → C', zh: '您 (A) → B → C' })}</h1>
      </div>

      <div className="survey-card-body">
        <CompactLikert
          question={STAGE_ACCEPTABILITY_QUESTIONS.abc}
          anchors={ANCHORS_STAGE_ACCEPTABILITY}
          value={hop.acceptability}
          onChange={(value) => onChangeHop('acceptability', value)}
          error={errors.acceptability}
        />
      </div>

      <SurveyNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
}

export default Hop2Screen;
