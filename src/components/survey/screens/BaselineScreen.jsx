import {
  DEMOGRAPHICS_ENABLED,
  GENDER_OPTIONS,
  PRIVACY_WARNING,
} from '../../../config/options.js';
import {
  ATTENTION_CHECK,
  DTVP_QUESTIONS,
} from '../../../config/surveyQuestions.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import LikertScale from '../LikertScale.jsx';
import OptionSelect from '../OptionSelect.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

const TEXT = {
  eyebrow: { en: 'Privacy attitudes', zh: '一般隐私倾向' },
  title: { en: 'About you', zh: '关于您' },
  lead: {
    en: 'A few brief general questions before the scenario. An anonymous participant ID has already been created for you.',
    zh: '在阅读情境之前，请先回答几个简短的一般性问题。系统已为您生成一个匿名参与者编号。',
  },
  age: { en: 'Age', zh: '年龄' },
  gender: { en: 'Gender', zh: '性别' },
  selfDescribe: { en: 'Self-describe', zh: '自行描述' },
};

function BaselineScreen({ answers, onChange, onBack, onNext, errors }) {
  const { t } = useLanguage();

  return (
    <section className="survey-card">
      <div className="survey-card-header">
        <p className="eyebrow">{t(TEXT.eyebrow)}</p>
        <h1>{t(TEXT.title)}</h1>
        <p className="lead">{t(TEXT.lead)}</p>
      </div>

      <div className="survey-card-body">
        {DEMOGRAPHICS_ENABLED.age ? (
          <label className="field-label">
            <span>{t(TEXT.age)}</span>
            <input
              className="text-input"
              type="number"
              min={18}
              max={120}
              inputMode="numeric"
              value={answers.age ?? ''}
              onChange={(event) =>
                onChange(
                  'age',
                  event.target.value === ''
                    ? null
                    : Number(event.target.value),
                )
              }
            />
            {errors.age ? <p className="error-text">{t(errors.age)}</p> : null}
          </label>
        ) : null}

        {DEMOGRAPHICS_ENABLED.gender ? (
          <>
            <OptionSelect
              label={TEXT.gender}
              options={GENDER_OPTIONS}
              value={answers.gender}
              onChange={(value) => onChange('gender', value)}
              error={errors.gender}
            />
            {answers.gender === 'self_describe' ? (
              <label className="field-label">
                <span>{t(TEXT.selfDescribe)}</span>
                <p className="field-hint">{t(PRIVACY_WARNING)}</p>
                <input
                  className="text-input"
                  type="text"
                  value={answers.gender_self_describe ?? ''}
                  onChange={(event) =>
                    onChange('gender_self_describe', event.target.value)
                  }
                />
                {errors.gender_self_describe ? (
                  <p className="error-text">{t(errors.gender_self_describe)}</p>
                ) : null}
              </label>
            ) : null}
          </>
        ) : null}

        {DTVP_QUESTIONS.map((q) => (
          <LikertScale
            key={q.id}
            question={q.text}
            labels={q.labels}
            value={answers[q.id]}
            onChange={(value) => onChange(q.id, value)}
            error={errors[q.id]}
          />
        ))}

        <LikertScale
          question={ATTENTION_CHECK.text}
          labels={ATTENTION_CHECK.labels}
          value={answers.attention_check}
          onChange={(value) => onChange('attention_check', value)}
          error={errors.attention_check}
        />
      </div>

      <SurveyNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
}

export default BaselineScreen;
