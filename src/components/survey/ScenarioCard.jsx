import {
  getInformationItem,
  getRelationLevel,
  relationText,
  ROLE_TEXT,
  SCENARIO_NARRATIVE,
} from '../../config/study.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import HopDiagram from './HopDiagram.jsx';
import RelationTerm from './RelationTerm.jsx';
import { useRelationshipAssignment } from './RelationshipContext.js';

const TEXT = {
  title: { en: 'Scenario', zh: '情境' },
  path: { en: 'Current path', zh: '当前传播路径' },
  info: { en: 'Information about you', zh: '关于您的信息' },
  infoLater: { en: 'Shown on the next pages', zh: '将在后面的页面中呈现' },
  target: { en: 'You are now rating', zh: '当前评分对象' },
  relations: { en: 'Relationships', zh: '关系摘要' },
  relationLoading: { en: 'Loading…', zh: '加载中……' },
  relationsHint: {
    en: 'Hover over (or tap) a relationship to see its description.',
    zh: '将鼠标移到（或点击）关系名称上可查看具体说明。',
  },
};

const RELATION_ROW_LABELS = {
  ab: { en: 'You and B', zh: '您与B' },
  ac: { en: 'You and C', zh: '您与C' },
  ad: { en: 'You and D', zh: '您与D' },
  bc: { en: 'B and C', zh: 'B与C' },
  cd: { en: 'C and D', zh: 'C与D' },
};

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

      <div className="scenario-relations-block">
        <dl className="scenario-relations" aria-label={t(TEXT.relations)}>
          {Object.entries(relations).map(([key, relation]) => (
            <div key={key} style={{ display: 'contents' }}>
              <dt>{t(RELATION_ROW_LABELS[key])}</dt>
              <dd>
                <RelationTerm label={relation.label} description={relation.description} />
              </dd>
            </div>
          ))}
        </dl>
        <p className="scenario-relations-hint">{t(TEXT.relationsHint)}</p>
      </div>

      <p className="scenario-narrative">{t(SCENARIO_NARRATIVE)}</p>

      <div className="scenario-meta">
        {showInfo ? (
          <p>
            <span className="scenario-meta-label">{t(TEXT.info)}</span>
            <strong>{item ? t(item) : t(TEXT.infoLater)}</strong>
          </p>
        ) : null}
        <div>
          <span className="scenario-meta-label">{t(TEXT.path)}</span>
          <HopDiagram
            chain={chain}
            highlight={highlight}
            compact
            edgeLabels={{ AB: relations.ab, BC: relations.bc, CD: relations.cd }}
            linkLabels={{ AC: relations.ac, AD: relations.ad }}
          />
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
