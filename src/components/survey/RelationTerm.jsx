import { useLanguage } from '../../i18n/LanguageContext.jsx';

/**
 * Relationship word with its full description shown on hover (or keyboard
 * focus / tap, for touch screens).
 * @param {{ label: string, description?: { en: string, zh: string } | null, align?: 'start' | 'center' }} props
 */
function RelationTerm({ label, description = null, align = 'start' }) {
  const { t } = useLanguage();
  if (!description) return <span>{label}</span>;
  return (
    <span className={`relation-term relation-term--${align}`} tabIndex={0}>
      {label}
      <span className="relation-term-tip" role="tooltip">
        {t(description)}
      </span>
    </span>
  );
}

export default RelationTerm;
