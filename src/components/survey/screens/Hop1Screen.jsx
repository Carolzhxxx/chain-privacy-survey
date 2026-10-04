import {
  ANCHORS_STAGE_ACCEPTABILITY,
  STAGE_ACCEPTABILITY_QUESTIONS,
} from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import CompactLikert from '../CompactLikert.jsx';
import ScenarioCard from '../ScenarioCard.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

function Hop1Screen({ itemId, hop, onChangeHop, onBack, onNext, errors }) {
  const { t } = useLanguage();

  return (
    <section className="survey-card">
      <ScenarioCard chain={['A', 'B']} target="B" itemId={itemId} />
      <div className="survey-card-header">
        <p className="eyebrow">{t({ en: 'Stage 1 of 3', zh: '第 1 / 3 阶段' })}</p>
        <h1>{t({ en: 'YOU (A) → B', zh: '您 (A) → B' })}</h1>
      </div>

      <div className="survey-card-body">
        <CompactLikert
          question={STAGE_ACCEPTABILITY_QUESTIONS.ab}
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

export default Hop1Screen;
