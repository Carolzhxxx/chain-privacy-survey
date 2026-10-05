import { COMPREHENSION_QUESTIONS } from '../../../config/surveyQuestions.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import { comprehensionField } from '../../../lib/comprehension.js';
import OptionSelect from '../OptionSelect.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

const TEXT = {
  eyebrow: { en: 'Comprehension check', zh: '理解检查' },
  title: { en: 'Check your understanding', zh: '确认您理解了情境' },
  lead: {
    en: 'Please answer the following questions based on the scenario you just read. To read it again, click “Back”.',
    zh: '请根据刚才读到的情境回答以下问题。如需重新阅读，可以点击“返回”。',
  },
};

function ComprehensionScreen({ answers, onChange, errors, onBack, onNext }) {
  const { t } = useLanguage();

  return (
    <section className="survey-card">
      <div className="survey-card-header">
        <p className="eyebrow">{t(TEXT.eyebrow)}</p>
        <h1>{t(TEXT.title)}</h1>
        <p className="lead">{t(TEXT.lead)}</p>
      </div>

      <div className="survey-card-body">
        {COMPREHENSION_QUESTIONS.map((q) => {
          const field = comprehensionField(q.id);
          return (
            <OptionSelect
              key={q.id}
              label={q.text}
              options={q.options}
              value={answers[field]}
              error={errors[field]}
              onChange={(value) => onChange(field, value)}
            />
          );
        })}
      </div>

      <SurveyNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
}

export default ComprehensionScreen;
