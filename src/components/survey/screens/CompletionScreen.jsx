import { useEffect } from 'react';
import {
  PROLIFIC_COMPLETION_CODE,
  PROLIFIC_COMPLETION_URL,
} from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';

const PROLIFIC_REDIRECT_DELAY_MS = 5000;

const TEXT = {
  eyebrow: { en: 'Done', zh: '完成' },
  title: { en: 'Thank you for participating.', zh: '感谢您的参与！' },
  demo: {
    en: 'This is a demo version. Your answers were not sent to any server and stay only in this browser.',
    zh: '这是演示版。您的回答不会发送到任何服务器，只保留在当前浏览器中。',
  },
  failed: {
    en: 'Your answers were saved on this device, but the server upload did not succeed. Please contact the researcher if needed.',
    zh: '您的回答已保存在本设备上，但上传服务器未成功。如有需要，请联系研究人员。',
  },
  recorded: {
    en: 'Your response has been recorded. You may close this page.',
    zh: '您的回答已记录，现在可以关闭此页面。',
  },
  participantId: { en: 'Anonymous participant ID: ', zh: '匿名参与者编号：' },
  uploadStatus: { en: 'Upload status: ', zh: '上传状态：' },
  download: { en: 'Download this response (JSON)', zh: '下载本次回答（JSON）' },
  restart: { en: 'Start the demo again', zh: '重新开始演示' },
  completionCode: { en: 'Prolific completion code: ', zh: 'Prolific 完成码：' },
  redirecting: {
    en: 'You will be returned to Prolific automatically in a few seconds. If nothing happens, click the button below or enter the completion code on Prolific.',
    zh: '几秒后将自动返回 Prolific。如果没有跳转，请点击下面的按钮，或在 Prolific 中输入完成码。',
  },
  returnToProlific: { en: 'Return to Prolific', zh: '返回 Prolific' },
};

function downloadJson(filename, data) {
  const blob = new Blob([`${JSON.stringify(data, null, 2)}\n`], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function CompletionScreen({ participantId, submitResult, demoMode, session, onRestart }) {
  const { t } = useLanguage();
  const failed = submitResult?.ok === false;
  const fromProlific = !demoMode && Boolean(session?.prolific_pid);

  useEffect(() => {
    if (!fromProlific) return undefined;
    const timer = window.setTimeout(() => {
      window.location.assign(PROLIFIC_COMPLETION_URL);
    }, PROLIFIC_REDIRECT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [fromProlific]);

  return (
    <section className="survey-card completion-card">
      <p className="eyebrow">{t(TEXT.eyebrow)}</p>
      <h1>{t(TEXT.title)}</h1>
      <p className="lead">
        {demoMode ? t(TEXT.demo) : failed ? t(TEXT.failed) : t(TEXT.recorded)}
      </p>
      <p className="meta">
        {t(TEXT.participantId)}
        {participantId}
      </p>
      {fromProlific ? (
        <>
          <p className="meta">
            {t(TEXT.completionCode)}
            <strong>{PROLIFIC_COMPLETION_CODE}</strong>
          </p>
          <p className="lead">{t(TEXT.redirecting)}</p>
          <a className="primary-button" href={PROLIFIC_COMPLETION_URL}>
            {t(TEXT.returnToProlific)}
          </a>
        </>
      ) : null}
      {!demoMode && failed && submitResult?.status ? (
        <p className="meta">
          {t(TEXT.uploadStatus)}
          {submitResult.status}
        </p>
      ) : null}
      {demoMode ? (
        <>
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              downloadJson(`chain_privacy_demo_${participantId}.json`, session)
            }
          >
            {t(TEXT.download)}
          </button>
          <button
            type="button"
            className="secondary-button full-width-button"
            onClick={onRestart}
          >
            {t(TEXT.restart)}
          </button>
        </>
      ) : null}
    </section>
  );
}

export default CompletionScreen;
