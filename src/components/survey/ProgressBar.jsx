import { useLanguage } from '../../i18n/LanguageContext.jsx';

function ProgressBar({ progress, label }) {
  const { t } = useLanguage();
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div
      className="progress-shell"
      aria-label={t({ en: 'Survey progress', zh: '问卷进度' })}
    >
      <div className="progress-meta">
        <span>{t(label)}</span>
        <span>{Math.round(clamped)}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(clamped)}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
