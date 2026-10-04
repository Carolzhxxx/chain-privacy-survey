import { ANCHORS_CLOSENESS, ANCHORS_TRUST } from '../../../config/options.js';
import { getRelationLevel, relationText } from '../../../config/study.js';
import { useLanguage } from '../../../i18n/LanguageContext.jsx';
import CompactLikert from '../CompactLikert.jsx';
import ScenarioCard from '../ScenarioCard.jsx';
import SurveyNavigation from '../SurveyNavigation.jsx';

const PERSON = {
  B: {
    sender: 'A',
    chain: ['A', 'B'],
    ownerField: 'owner_b_relation_condition',
    pathField: null,
    ratingKey: 'R_AB_raw',
  },
  C: {
    sender: 'B',
    chain: ['A', 'B', 'C'],
    ownerField: 'owner_c_relation_condition',
    pathField: 'bc_relation_condition',
    ratingKey: 'R_AC_raw',
  },
  D: {
    sender: 'C',
    chain: ['A', 'B', 'C', 'D'],
    ownerField: 'owner_d_relation_condition',
    pathField: 'cd_relation_condition',
    ratingKey: 'R_AD_raw',
  },
};

/**
 * B / C / D page. The relationships with the person (A–person, and for C / D
 * also sender–person) are assigned conditions and only displayed; closeness
 * to the person is asked only when A knows them. B's page also asks trust.
 * @param {{ person: 'B' | 'C' | 'D', relationship: object | null }} props
 */
function PersonRelationScreen({
  person,
  relationship,
  answers,
  onChange,
  onBack,
  onNext,
  errors,
  itemId,
}) {
  const { t } = useLanguage();
  const spec = PERSON[person];
  const ownerLevel = getRelationLevel(relationship?.[spec.ownerField]);
  const ownerText = relationText(relationship?.[spec.ownerField], 'A', person);
  const pathText = spec.pathField
    ? relationText(relationship?.[spec.pathField], spec.sender, person)
    : null;
  const asksTrust = person === 'B';

  const text = {
    eyebrow: { en: `Person ${person}`, zh: `人物 ${person}` },
    title: { en: `About ${person}`, zh: `关于 ${person}` },
    lead: ownerLevel?.knows || asksTrust
      ? {
          en: `Please read the relationships below, then answer the questions about ${person}.`,
          zh: `请阅读以下关系说明，然后回答关于 ${person} 的问题。`,
        }
      : {
          en: 'Please read the relationships below, then continue.',
          zh: '请阅读以下关系说明，然后继续。',
        },
    panel: { en: `${person}'s relationships in this scenario`, zh: `本情境中与 ${person} 有关的关系` },
    owner: { en: `You and ${person}`, zh: `您与${person}` },
    path: { en: `${spec.sender} and ${person}`, zh: `${spec.sender}与${person}` },
    closeness: {
      en: `Based on the scenario above, how close do you think you are to ${person}?`,
      zh: `根据上述情境，您认为自己与${person}的关系有多亲近？`,
    },
    trust: { en: 'How much do you trust B?', zh: '您对 B 的信任程度如何？' },
  };

  return (
    <section className="survey-card">
      <ScenarioCard chain={spec.chain} target={person} itemId={itemId} />
      <div className="survey-card-header">
        <p className="eyebrow">{t(text.eyebrow)}</p>
        <h1>{t(text.title)}</h1>
        <p className="lead">{t(text.lead)}</p>
      </div>

      <div className="survey-card-body">
        <div className="assigned-type-panel">
          <p className="assigned-type-label">{t(text.panel)}</p>
          <dl className="person-relations">
            <dt>{t(text.owner)}</dt>
            <dd>{ownerText ? t(ownerText) : '—'}</dd>
            {spec.pathField ? (
              <>
                <dt>{t(text.path)}</dt>
                <dd>{pathText ? t(pathText) : '—'}</dd>
              </>
            ) : null}
          </dl>
        </div>
        {errors.relationship_assignment ? (
          <p className="error-text">{t(errors.relationship_assignment)}</p>
        ) : null}

        {ownerLevel?.knows ? (
          <CompactLikert
            question={text.closeness}
            anchors={ANCHORS_CLOSENESS}
            value={answers[spec.ratingKey]}
            onChange={(value) => onChange(spec.ratingKey, value)}
            error={errors[spec.ratingKey]}
          />
        ) : null}

        {asksTrust ? (
          <CompactLikert
            question={text.trust}
            anchors={ANCHORS_TRUST}
            value={answers.trust_B}
            onChange={(value) => onChange('trust_B', value)}
            error={errors.trust_B}
          />
        ) : null}
      </div>

      <SurveyNavigation onBack={onBack} onNext={onNext} />
    </section>
  );
}

export default PersonRelationScreen;
