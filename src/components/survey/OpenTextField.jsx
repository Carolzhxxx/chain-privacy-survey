import { useId } from 'react';
import { PRIVACY_WARNING } from '../../config/options.js';
import { OPEN_TEXT_MAX_LENGTH } from '../../config/study.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function OpenTextField({
  label,
  value,
  onChange,
  error,
  placeholder,
  maxLength = OPEN_TEXT_MAX_LENGTH,
  rows = 4,
}) {
  const { t } = useLanguage();
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const text = value ?? '';

  return (
    <div className="field-label">
      <label htmlFor={id} className="question-text">
        {t(label)}
      </label>
      <p id={hintId} className="field-hint">
        {t(PRIVACY_WARNING)}
      </p>
      <textarea
        id={id}
        className="textarea-input"
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder ? t(placeholder) : undefined}
        value={text}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="field-counter" aria-hidden="true">
        {text.length} / {maxLength}
      </p>
      {error ? (
        <p id={errorId} className="error-text" role="alert">
          {t(error)}
        </p>
      ) : null}
    </div>
  );
}

export default OpenTextField;
