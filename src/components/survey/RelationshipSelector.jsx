import { useLanguage } from '../../i18n/LanguageContext.jsx';

function RelationshipSelector({
  label,
  options,
  value,
  onChange,
  error,
  allowUnsure = false,
  unsureChecked = false,
  onUnsureChange,
}) {
  const { t } = useLanguage();
  const labelText = t(label);

  return (
    <div className="field-stack">
      <div className="mc-block">
        <p className="question-text">{labelText}</p>
        <div className="option-chips" role="listbox" aria-label={labelText}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`option-chip ${value === option.value && !unsureChecked ? 'selected' : ''}`}
              onClick={() => {
                onChange(option.value);
                if (onUnsureChange) onUnsureChange(false);
              }}
            >
              {t(option.label)}
            </button>
          ))}
          {allowUnsure ? (
            <button
              type="button"
              className={`option-chip ${unsureChecked ? 'selected' : ''}`}
              onClick={() => {
                onUnsureChange?.(true);
                onChange(null);
              }}
            >
              {t({ en: 'Not sure', zh: '不确定' })}
            </button>
          ) : null}
        </div>
        {error ? <p className="error-text">{t(error)}</p> : null}
      </div>
    </div>
  );
}

export default RelationshipSelector;
