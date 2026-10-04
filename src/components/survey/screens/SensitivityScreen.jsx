import { ANCHORS_SENSITIVITY } from '../../../config/options.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import CompactLikert from '../CompactLikert.jsx';
import ScenarioCard from '../ScenarioCard.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

const TEXT = {
  eyebrow: { en: 'Sensitivity', zh: '信息敏感度' },
  title: { en: 'How sensitive is this information?', zh: '这条信息有多敏感？' },
  question: {
    en: 'If this information were about you, how sensitive would it be to you?',
    zh: '如果这条信息是关于您的，您认为它有多敏感？',
  },
};

function SensitivityScreen({
  itemId,
  sensitivityRaw,
  onChangeSensitivity,
  onBack,
  onNext,
  errors,
}) {
  const { t } = useLanguage();

  return (
    <section className="survey-card">
      <ScenarioCard target="info" itemId={itemId} />
      <div className="survey-card-header">
        <p className="eyebrow">{t(TEXT.eyebrow)}</p>
        <h1>{t(TEXT.title)}</h1>
      </div>

      <div className="survey-card-body">
        <CompactLikert
          question={TEXT.question}
          anchors={ANCHORS_SENSITIVITY}
          value={sensitivityRaw}
          onChange={onChangeSensitivity}
          error={errors.sensitivity_raw}
        />
      </div>

      <SurveyNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
}

export default SensitivityScreen;
