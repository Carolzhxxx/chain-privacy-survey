import { CONSENT_CONTENT } from '../../../config/surveyQuestions.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

function ConsentScreen({ answers, onChange, onNext, errors }) {
  const { t } = useLanguage();
  const {
    eyebrow,
    title,
    infoCards,
    sections,
    checkboxes,
    confirmationHeading,
    checkboxError,
    continueLabel,
  } = CONSENT_CONTENT;

  return (
    <section className="survey-card consent-card">
      <p className="eyebrow">{t(eyebrow)}</p>
      <h1>{t(title)}</h1>
      <div className="consent-content">
        <div className="consent-info-cards" aria-label={t(eyebrow)}>
          {infoCards.map((card) => (
            <div
              key={card.id}
              className={`consent-info-card consent-info-card--${card.variant}`}
            >
              <p className="consent-info-card-label">{t(card.label)}</p>
              <p className="consent-info-card-value">{t(card.value)}</p>
            </div>
          ))}
        </div>

        {sections.map((section) => (
          <div key={section.id} className="consent-section">
            <h2 className="consent-heading">{t(section.heading)}</h2>
            <p className="consent-text">{t(section.body)}</p>
          </div>
        ))}

        <div className="consent-section consent-confirmation">
          <h2 className="consent-heading">{t(confirmationHeading)}</h2>
          {checkboxes.map((item) => (
            <label key={item.id} className="checkbox-row">
              <input
                type="checkbox"
                checked={Boolean(answers[item.id])}
                onChange={(event) => onChange(item.id, event.target.checked)}
              />
              <span>{t(item.label)}</span>
            </label>
          ))}
          {(errors.consent_age18 || errors.consent_agree) && (
            <p className="error-text">{t(checkboxError)}</p>
          )}
        </div>
      </div>

      <SurveyNavigation
        showBack={false}
        onNext={onNext}
        nextLabel={continueLabel}
      />
    </section>
  );
}

export default ConsentScreen;
