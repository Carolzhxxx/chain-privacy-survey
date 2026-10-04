import { SCENARIOS_PER_PARTICIPANT } from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import ScenarioCard from '../ScenarioCard.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

const TEXT = {
  eyebrow: { en: 'Background', zh: '实验背景' },
  title: { en: 'The scenario and its people', zh: '情境与人物说明' },
  lead: {
    en: 'In this study you will read a hypothetical scenario about information spreading. You are A, the owner of the information. B, C, and D are hypothetical people in the scenario; they do not correspond to anyone in your real life.',
    zh: '在本研究中，您将阅读一个假想的信息传播情境。您是信息所有者 A；B、C、D 是情境中的假想人物，不对应您现实生活中的任何人。',
  },
  plan: {
    en: 'Next, you will see one specific hypothetical piece of information about you, and rate how acceptable it is to you when B, C, and D each come to know it.',
    zh: '接下来，您会看到一条具体的、关于您的假想信息，并评价 B、C、D 分别知道这条信息时，您在多大程度上可以接受。',
  },
  planMulti: {
    en: 'Next, you will see two different hypothetical pieces of information about you, one at a time. For each, you will rate how acceptable it is to you when B, C, and D each come to know it. The people and their relationships stay the same.',
    zh: '接下来，您会依次看到两条不同的、关于您的假想信息。针对每一条，您将评价 B、C、D 分别知道这条信息时，您在多大程度上可以接受。两次情境中的人物和关系保持不变。',
  },
  card: {
    en: 'This summary stays at the top of each rating page.',
    zh: '这段情境摘要会显示在之后每个评分页面的顶部。',
  },
  continue: { en: 'Continue', zh: '继续' },
};

function ChainIntroScreen({ onBack, onNext }) {
  const { t } = useLanguage();

  return (
    <section className="survey-card">
      <div className="survey-card-header">
        <p className="eyebrow">{t(TEXT.eyebrow)}</p>
        <h1>{t(TEXT.title)}</h1>
        <p className="lead">{t(TEXT.lead)}</p>
      </div>

      <div className="survey-card-body">
        <ScenarioCard showInfo={false} />
        <div className="info-block">
          <p>{t(SCENARIOS_PER_PARTICIPANT > 1 ? TEXT.planMulti : TEXT.plan)}</p>
          <p>{t(TEXT.card)}</p>
        </div>
      </div>

      <SurveyNavigation onBack={onBack} onNext={onNext} nextLabel={TEXT.continue} />
    </section>
  );
}

export default ChainIntroScreen;
