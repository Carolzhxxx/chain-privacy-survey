import { useLanguage } from '../../i18n/LanguageContext.jsx';

/**
 * Click-to-rank: each click appends the option to `value` (an ordered array of
 * option values, most important first); clicking a ranked option removes it.
 */
function RankingSelect({ label, hint, options, value = [], onChange, error }) {
  const { t } = useLanguage();
  const labelText = t(label);

  function toggle(optionValue) {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  }

  return (
    <div className="mc-block">
      <p className="question-text">{labelText}</p>
      {hint ? <p className="field-hint">{t(hint)}</p> : null}
      <div className="option-chips" role="group" aria-label={labelText}>
        {options.map((option) => {
          const rank = value.indexOf(option.value) + 1;
          return (
            <button
              key={option.value}
              type="button"
              className={`option-chip rank-chip ${rank ? 'selected' : ''}`}
              aria-pressed={rank > 0}
              onClick={() => toggle(option.value)}
            >
              <span className="rank-badge" aria-hidden={!rank}>
                {rank || ''}
              </span>
              {t(option.label)}
            </button>
          );
        })}
      </div>
      {error ? <p className="error-text">{t(error)}</p> : null}
    </div>
  );
}

export default RankingSelect;
