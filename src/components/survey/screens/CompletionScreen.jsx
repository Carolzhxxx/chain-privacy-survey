import { useLanguage } from '../../../i18n/LanguageContext.jsx';

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
