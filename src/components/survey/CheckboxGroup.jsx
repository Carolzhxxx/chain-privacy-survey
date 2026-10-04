import { useId } from 'react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

const TEXT = {
  selected: (n, max) => ({ en: `Selected ${n} of ${max}`, zh: `已选择 ${n} / ${max} 项` }),
  limitReached: (max) => ({
    en: `You can select up to ${max}. To choose another, first unselect one.`,
    zh: `最多只能选择 ${max} 项。如需更换，请先取消一项。`,
  }),
};

/**
 * Multi-select with a hard maximum: once `max` items are selected, the
 * remaining options are disabled.
 */
function CheckboxGroup({ legend, options, value = [], onChange, max, error }) {
  const { t } = useLanguage();
  const id = useId();
  const statusId = `${id}-status`;
  const errorId = `${id}-error`;
  const atLimit = max ? value.length >= max : false;

  function toggle(optionValue, checked) {
    if (checked) {
      if (atLimit || value.includes(optionValue)) return;
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  }

  return (
    <fieldset
      className="mc-block checkbox-group"
      aria-describedby={error ? `${statusId} ${errorId}` : statusId}
    >
      <legend className="question-text">{t(legend)}</legend>
      <p id={statusId} className="field-hint" aria-live="polite">
        {max ? t(TEXT.selected(value.length, max)) : null}
        {atLimit ? ` · ${t(TEXT.limitReached(max))}` : null}
      </p>
      <div className="checkbox-options">
        {options.map((option) => {
          const checked = value.includes(option.value);
          const disabled = !checked && atLimit;
          return (
            <label
              key={option.value}
              className={`checkbox-option ${checked ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(event) => toggle(option.value, event.target.checked)}
              />
              <span>{t(option.label)}</span>
            </label>
          );
        })}
      </div>
      {error ? (
        <p id={errorId} className="error-text" role="alert">
          {t(error)}
        </p>
      ) : null}
    </fieldset>
  );
}

export default CheckboxGroup;
