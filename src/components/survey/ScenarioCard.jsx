import {
  getInformationItem,
  getRelationLevel,
  relationText,
  ROLE_TEXT,
  SCENARIO_NARRATIVE,
} from '../../config/study.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import HopDiagram from './HopDiagram.jsx';
import { useRelationshipAssignment } from './RelationshipContext.js';

const TEXT = {
  title: { en: 'Scenario', zh: '情境' },
  path: { en: 'Current path', zh: '当前传播路径' },
  info: { en: 'The information about you in this scenario', zh: '本情境中关于您的信息' },
  infoLater: { en: 'Shown on the next pages', zh: '将在后面的页面中呈现' },
  target: { en: 'You are now rating', zh: '当前评分对象' },
  relationLoading: { en: 'Loading…', zh: '加载中……' },
  relationsHint: {
    en: 'Hover over (or tap) a relationship to see its description.',
    zh: '将鼠标移到（或点击）关系名称上可查看具体说明。',
  },
};

const FULL_CHAIN = ['A', 'B', 'C', 'D'];

const TARGET_TEXT = {
  B: { en: 'B', zh: 'B' },
  C: { en: 'C', zh: 'C' },
  D: { en: 'D', zh: 'D' },
  BC: { en: 'B compared with C', zh: 'B 与 C 的比较' },
  CD: { en: 'C compared with D', zh: 'C 与 D 的比较' },
  info: { en: 'The information itself', zh: '这条信息本身' },
  overall: { en: 'The whole scenario', zh: '整个情境' },
};

/**
 * Always-visible scenario summary for rating pages. All relationships come
 * from the participant's assigned relationship structure.
 * @param {{
 *   chain?: Array<'A'|'B'|'C'|'D'>,
 *   target?: keyof typeof TARGET_TEXT | null,
 *   itemId?: string | null,
 *   showInfo?: boolean,
 * }} props
 */
function ScenarioCard({ chain = ['A', 'B', 'C', 'D'], target = null, itemId = null, showInfo = true }) {
  const { t } = useLanguage();
  const relationship = useRelationshipAssignment();
  const highlight = target && ['B', 'C', 'D'].includes(target) ? target : undefined;
  const item = getInformationItem(itemId);

  function assignedRelation(field, sender, recipient) {
    const level = getRelationLevel(relationship?.[field]);
    return level
      ? { label: t(level.label), description: relationText(level.id, sender, recipient) }
      : { label: t(TEXT.relationLoading), description: null };
  }

  /** Short relationship word + full description (shown on hover). */
  const relations = {
    ab: assignedRelation('owner_b_relation_condition', 'A', 'B'),
    ac: assignedRelation('owner_c_relation_condition', 'A', 'C'),
    ad: assignedRelation('owner_d_relation_condition', 'A', 'D'),
    bc: assignedRelation('bc_relation_condition', 'B', 'C'),
    cd: assignedRelation('cd_relation_condition', 'C', 'D'),
  };

  return (
    <section className="scenario-card" aria-label={t(TEXT.title)}>
      {showInfo ? (
        <div className="scenario-info-highlight">
          <span className="scenario-info-label">{t(TEXT.info)}</span>
          <strong className="scenario-info-text">
            {item ? t(item) : t(TEXT.infoLater)}
          </strong>
        </div>
      ) : null}

      <dl className="scenario-roles">
        {['A', 'B', 'C', 'D'].map((id) => (
          <div
            key={id}
            className={`scenario-role ${highlight === id ? 'active' : ''}`}
          >
            <dt>{id}</dt>
            <dd>
              <span className="scenario-role-name">{t(ROLE_TEXT[id])}</span>
            </dd>
          </div>
        ))}
      </dl>

      <p className="scenario-narrative">{t(SCENARIO_NARRATIVE)}</p>

      <div className="scenario-meta">
        <div>
          <span className="scenario-meta-label">{t(TEXT.path)}</span>
          <HopDiagram
            chain={FULL_CHAIN}
            reached={chain.length}
            highlight={highlight}
            compact
            edgeLabels={{ AB: relations.ab, BC: relations.bc, CD: relations.cd }}
            linkLabels={{ AC: relations.ac, AD: relations.ad }}
          />
          <p className="scenario-relations-hint">{t(TEXT.relationsHint)}</p>
        </div>
        {target ? (
          <p>
            <span className="scenario-meta-label">{t(TEXT.target)}</span>
            <strong>{t(TARGET_TEXT[target])}</strong>
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default ScenarioCard;
