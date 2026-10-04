import { useLanguage } from '../../i18n/LanguageContext.jsx';

function CompactLikert({ question, anchors, value, onChange, error }) {
  const { t } = useLanguage();
  const questionText = t(question);

  return (
    <div className="compact-likert">
      <p className="question-text">{questionText}</p>
      <div className="compact-likert-row" role="radiogroup" aria-label={questionText}>
        {[1, 2, 3, 4, 5, 6, 7].map((score) => (
          <button
            key={score}
            type="button"
            className={`compact-likert-btn ${value === score ? 'selected' : ''}`}
            onClick={() => onChange(score)}
            aria-pressed={value === score}
          >
            {score}
          </button>
        ))}
      </div>
      <div className="compact-likert-anchors" aria-hidden="true">
        <span>
          <strong>1</strong>
          <br />
          {t(anchors[1])}
        </span>
        <span>
          <strong>4</strong>
          <br />
          {t(anchors[4])}
        </span>
        <span>
          <strong>7</strong>
          <br />
          {t(anchors[7])}
        </span>
      </div>
      {error ? <p className="error-text">{t(error)}</p> : null}
    </div>
  );
}

export default CompactLikert;
