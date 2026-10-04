import { useLanguage } from '../../i18n/LanguageContext.jsx';

function LikertScale({ question, labels, value, onChange, error }) {
  const { t } = useLanguage();
  const questionText = t(question);

  return (
    <div className="likert-block">
      <p className="question-text">{questionText}</p>
      <div className="likert-options" role="radiogroup" aria-label={questionText}>
        {[1, 2, 3, 4, 5, 6, 7].map((score) => (
          <button
            key={score}
            type="button"
            className={`likert-option ${value === score ? 'selected' : ''}`}
            onClick={() => onChange(score)}
            aria-pressed={value === score}
          >
            <span className="likert-score">{score}</span>
            <span className="likert-label">{t(labels[score])}</span>
          </button>
        ))}
      </div>
      {error ? <p className="error-text">{t(error)}</p> : null}
    </div>
  );
}

export default LikertScale;
