import { useLanguage } from '../../i18n/LanguageContext.jsx';

function OptionSelect({ label, options, value, onChange, error, hint }) {
  const { t } = useLanguage();
  const labelText = t(label);

  return (
    <div className="mc-block">
      <p className="question-text">{labelText}</p>
      {hint ? <p className="field-hint">{t(hint)}</p> : null}
      <div className="option-chips" role="listbox" aria-label={labelText}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`option-chip ${value === option.value ? 'selected' : ''}`}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {t(option.label)}
          </button>
        ))}
      </div>
      {error ? <p className="error-text">{t(error)}</p> : null}
    </div>
  );
}

export default OptionSelect;
