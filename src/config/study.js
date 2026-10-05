/**
 * Study design config: scenario wording, scenario conditions, pilot probes.
 * B, C, D are hypothetical people in a scenario; the participant is A.
 * Display text is bilingual `{ en, zh }`; stored values are English codes.
 */

/**
 * "pilot": 1 scenario per participant.
 * "formal": 2 scenarios per participant, items from different categories,
 * presentation order randomized, same relationship structure.
 */
export const STUDY_MODE = 'pilot';
// "pilot" | "formal"

export const PILOT_MODE = STUDY_MODE === 'pilot';

export const SCENARIOS_PER_PARTICIPANT = STUDY_MODE === 'pilot' ? 1 : 2;

/**
 * Open probes after the C and D ratings, the C–D comparison, judgment factors
 * and primary judgment basis (once per scenario). Kept in both modes until the
 * pilot results decide; set to false to drop them without affecting the core
 * ratings.
 */
export const INCLUDE_REASONING_PROBES = true;

export const OPEN_TEXT_MIN_LENGTH = 5;
export const OPEN_TEXT_MAX_LENGTH = 500;
export const MAX_JUDGMENT_FACTORS = 3;

/**
 * Hypothetical information items: 6 categories × 3 items. `id` is stable and
 * shared by both languages; `category` is an INFO_TYPE_OPTIONS value and is
 * never shown to participants. No item is pre-labelled as more or less
 * sensitive; sensitivity comes only from the participant's 1–7 rating.
 */
export const INFORMATION_ITEM_POOL = [
  // 1. Health information
  {
    id: 'health_mental_health_counseling',
    category: 'health',
    zh: '您最近正在接受心理健康方面的咨询。',
    en: 'You have recently been receiving counseling for a mental health concern.',
  },
  {
    id: 'health_chronic_condition',
    category: 'health',
    zh: '您最近被诊断出一种需要长期管理的慢性健康问题。',
    en: 'You were recently diagnosed with a chronic health condition that requires ongoing management.',
  },
  {
    id: 'health_prescription_medication',
    category: 'health',
    zh: '您正在为一项持续的健康问题服用处方药。',
    en: 'You are taking prescription medication for an ongoing health condition.',
  },

  // 2. Financial information
  {
    id: 'financial_personal_debt',
    category: 'financial',
    zh: '您目前有一笔尚未偿还的个人债务。',
    en: 'You currently have an outstanding personal debt.',
  },
  {
    id: 'financial_account_balance',
    category: 'financial',
    zh: '您个人银行账户目前的余额。',
    en: 'The current balance of your personal bank account.',
  },
  {
    id: 'financial_payment_difficulty',
    category: 'financial',
    zh: '您最近难以按时支付一项日常账单。',
    en: 'You recently had difficulty paying one of your regular bills on time.',
  },

  // 3. Beliefs and preferences
  {
    id: 'beliefs_controversial_social_view',
    category: 'beliefs_preferences',
    zh: '您对一项具有争议的社会议题持有一个不愿公开表达的观点。',
    en: 'You hold a view on a controversial social issue that you do not wish to express publicly.',
  },
  {
    id: 'beliefs_political_preference',
    category: 'beliefs_preferences',
    zh: '您私下支持的政治候选人或政治立场。',
    en: 'The political candidate or political position that you privately support.',
  },
  {
    id: 'beliefs_religious_spiritual_view',
    category: 'beliefs_preferences',
    zh: '您不愿在公开场合讨论的宗教或精神信仰。',
    en: 'A religious or spiritual belief that you prefer not to discuss publicly.',
  },

  // 4. Location and activity
  {
    id: 'location_current_realtime',
    category: 'location_activity',
    zh: '您独自外出时的实时位置。',
    en: 'Your real-time location while you are out alone.',
  },
  {
    id: 'location_recent_history',
    category: 'location_activity',
    zh: '您过去一周去过哪些地点的详细记录。',
    en: 'A detailed record of the places you visited during the past week.',
  },
  {
    id: 'location_future_plan',
    category: 'location_activity',
    zh: '您明天计划独自前往的地点和具体时间。',
    en: 'The place and specific time of an outing that you plan to make alone tomorrow.',
  },

  // 5. Identity and contact information
  {
    id: 'identity_home_address_phone',
    category: 'identity_contact',
    zh: '您的家庭住址和私人电话号码。',
    en: 'Your home address and personal phone number.',
  },
  {
    id: 'identity_email_birthdate',
    category: 'identity_contact',
    zh: '您的个人电子邮箱地址和出生日期。',
    en: 'Your personal email address and date of birth.',
  },
  {
    id: 'identity_government_id',
    category: 'identity_contact',
    zh: '您的政府签发身份证件号码。',
    en: 'The number on your government-issued identification document.',
  },

  // 6. Relationships and intimate information
  {
    id: 'relationships_serious_conflict',
    category: 'relationships_intimate',
    zh: '您与一位亲近的人最近发生了一次严重矛盾。',
    en: 'You recently had a serious conflict with someone close to you.',
  },
  {
    id: 'relationships_possible_breakup',
    category: 'relationships_intimate',
    zh: '您正在考虑结束一段亲密关系，但尚未告诉对方。',
    en: 'You are considering ending an intimate relationship but have not yet told the other person.',
  },
  {
    id: 'relationships_private_family_disagreement',
    category: 'relationships_intimate',
    zh: '您家庭内部最近发生的一次不希望外人知道的分歧。',
    en: 'A recent disagreement within your family that you do not want outsiders to know about.',
  },
];

/** @returns {typeof INFORMATION_ITEM_POOL[number] | null} */
export function getInformationItem(itemId) {
  return INFORMATION_ITEM_POOL.find((item) => item.id === itemId) ?? null;
}

/** Same intro for every item; the category name is never shown. */
export const INFORMATION_ITEM_INTRO = {
  en: 'Please imagine that the following information describes you. This is a hypothetical scenario, and you do not need to provide any real personal information.',
  zh: '请想象以下信息描述的是您本人。这只是一个假想情境，您不需要提供任何真实的个人信息。',
};

/**
 * All relationships (A–B, A–C, A–D, B–C, C–D) come from the participant's
 * relationship assignment (RELATIONSHIP_FACTORS). Closeness numbers come from
 * the participant's own 1–7 ratings, never from the text.
 */
export const SCENARIO_VIGNETTE = {
  id: 'v3_randomized_relationships',
};

/**
 * Fixed for the pilot (not randomized): B had no explicit permission to pass
 * the information on, and neither C nor D knew it beforehand. Must stay in
 * sync with SCENARIO_NARRATIVE. The relation conditions are filled in from the
 * participant's relationship assignment.
 */
export const SCENARIO_CONDITIONS = {
  vignette_id: SCENARIO_VIGNETTE.id,
  permission_condition: 'not_authorized',
  c_prior_knowledge: false,
  d_prior_knowledge: false,
  owner_b_relation_condition: null,
  owner_c_relation_condition: null,
  owner_d_relation_condition: null,
  bc_relation_condition: null,
  cd_relation_condition: null,
};

export const SCENARIO_NARRATIVE = {
  en: 'You told B this information, but did not explicitly allow B to share it further. Later, B told C, who did not know about it before; the information then kept spreading and eventually became known to D, who also did not know about it before.',
  zh: '您将这条信息告诉了B，但没有明确允许B继续分享。之后，B将该信息告诉了原本不知道此事的C；该信息随后继续传播，并最终被原本不知道此事的D知道。',
};

export const SCENARIO_REALISM_QUESTION = {
  en: 'How likely do you think it is that the scenario above would happen in real life?',
  zh: '您认为上述情境在现实生活中发生的可能性有多大？',
};

export const ROLE_TEXT = {
  A: { en: 'You — the owner of the information', zh: '您本人——信息的所有者' },
  B: {
    en: 'The first person who learns the information about you',
    zh: '第一位知道您这条信息的人',
  },
  C: { en: 'Learns the information through B', zh: '通过 B 知道这条信息的人' },
  D: {
    en: 'Learns the information through further sharing',
    zh: '通过后续传播知道这条信息的人',
  },
};

/** Same 1–7 scale and endpoints for the AB, ABC and ABCD stages. */
export const ANCHORS_STAGE_ACCEPTABILITY = {
  1: { en: 'Completely unacceptable', zh: '完全不可接受' },
  4: { en: 'Neutral or unsure', zh: '中立或不确定' },
  7: { en: 'Completely acceptable', zh: '完全可以接受' },
};

export const STAGE_ACCEPTABILITY_QUESTIONS = {
  ab: {
    en: 'In the scenario above, B learned this information about you. To what extent do you find this acceptable?',
    zh: '在上述情境中，B 知道了关于您的这条信息。您认为这件事在多大程度上可以接受？',
  },
  abc: {
    en: 'In the scenario above, B told C this information about you. To what extent do you find this acceptable?',
    zh: '在上述情境中，B 将关于您的信息告诉了 C。您认为这件事在多大程度上可以接受？',
  },
  abcd: {
    en: 'In the scenario above, the information about you was passed on by B and C and eventually became known to D. To what extent do you find this acceptable?',
    zh: '在上述情境中，关于您的信息经过 B 和 C 的转述，最终被 D 知道。您认为这件事在多大程度上可以接受？',
  },
};

export const OPEN_REASON_PLACEHOLDER = {
  en: 'Please describe what you mainly considered when making this judgment…',
  zh: '请说明您作出这一判断时主要考虑了什么……',
};

export const BC_DIFFERENCE_QUESTION = {
  en: 'Compared with B knowing this information, why was your acceptability rating for C knowing it higher, lower, or the same?',
  zh: '与 B 知道这条信息相比，您对 C 知道这条信息的可接受度评分为什么更高、更低或保持不变？',
};

/** States the score difference only; never explains it. */
export const BC_DIFFERENCE_SUMMARY = {
  higher: { en: 'Your rating for C was higher than for B.', zh: '您对 C 的评分高于 B。' },
  lower: { en: 'Your rating for C was lower than for B.', zh: '您对 C 的评分低于 B。' },
  same: { en: 'You gave B and C the same rating.', zh: '您对 B 和 C 给出了相同的评分。' },
};

export const CD_DIFFERENCE_QUESTION = {
  en: 'Compared with C knowing this information, why was your acceptability rating for D knowing it higher, lower, or the same?',
  zh: '与 C 知道这条信息相比，您对 D 知道这条信息的可接受度评分为什么更高、更低或保持不变？',
};

/** States the score difference only; never explains it. */
export const CD_DIFFERENCE_SUMMARY = {
  higher: { en: 'Your rating for D was higher than for C.', zh: '您对 D 的评分高于 C。' },
  lower: { en: 'Your rating for D was lower than for C.', zh: '您对 D 的评分低于 C。' },
  same: { en: 'You gave C and D the same rating.', zh: '您对 C 和 D 给出了相同的评分。' },
};

export const JUDGMENT_FACTORS_QUESTION = {
  en: 'Which of the following factors influenced the judgments you just made? Please select up to three.',
  zh: '以下哪些因素影响了您刚才的判断？请选择最多三项。',
};

export const JUDGMENT_FACTOR_OPTIONS = [
  {
    value: 'information_sensitivity',
    label: { en: 'How sensitive the information itself is', zh: '这条信息本身的敏感程度' },
  },
  {
    value: 'relationship_with_recipient',
    label: {
      en: 'My relationship with the final recipient (C or D)',
      zh: '我与最终知情者 C 或 D 的关系',
    },
  },
  {
    value: 'shared_without_permission',
    label: {
      en: 'B or C passed the information on without my permission',
      zh: 'B或C在没有获得我许可的情况下继续分享了信息',
    },
  },
  {
    value: 'path_relationships',
    label: {
      en: 'The relationship between B and C, or between C and D',
      zh: 'B 与 C 或 C 与 D 之间的关系',
    },
  },
  {
    value: 'number_of_retellings',
    label: { en: 'How many times the information was passed on', zh: '信息经过了多少次转述' },
  },
  {
    value: 'number_of_people_knowing',
    label: { en: 'How many people already know the information', zh: '已经有多少人知道这条信息' },
  },
  {
    value: 'appropriateness_of_sharing',
    label: { en: 'Whether the act of sharing itself was appropriate', zh: '分享行为本身是否合适' },
  },
  { value: 'other', label: { en: 'Other', zh: '其他' } },
];

export const JUDGMENT_FACTOR_VALUES = JUDGMENT_FACTOR_OPTIONS.map((o) => o.value);

export const PRIMARY_BASIS_QUESTION = {
  en: 'How important was each of the following for your judgments? Please rank them by clicking them in order, starting with the most important.',
  zh: '以下几方面对您作出判断的重要程度如何？请从最重要的开始，依次点击进行排序。',
};

export const PRIMARY_BASIS_RANK_HINT = {
  en: 'Click a ranked item again to remove it from the ranking.',
  zh: '再次点击已排序的选项可以取消该项的排序。',
};

export const PRIMARY_BASIS_OTHER_QUESTION = {
  en: 'Anything else you considered? (optional)',
  zh: '您是否还考虑了其他方面？（选填）',
};

/** Ranked in full; `primary_judgment_basis` stores the item ranked first. */
export const PRIMARY_BASIS_OPTIONS = [
  {
    value: 'recipient_outcome',
    label: {
      en: 'Who ended up knowing my information',
      zh: '最终是谁知道了我的信息',
    },
  },
  {
    value: 'sharing_process',
    label: {
      en: 'Who passed the information on, and through what process',
      zh: '信息是由谁、通过什么过程传播的',
    },
  },
  {
    value: 'information_sensitivity',
    label: {
      en: 'Whether the information itself is sensitive',
      zh: '信息本身是否敏感',
    },
  },
];

export const PRIMARY_BASIS_VALUES = PRIMARY_BASIS_OPTIONS.map((o) => o.value);

/**
 * Relationship levels used for every system-assigned relationship (A–C, A–D,
 * B–C, C–D). Participants never choose them. `owner` text describes A's own
 * relationship (`{person}` = C or D); `path` text describes the relationship
 * between the sender and the recipient (`{sender}`, `{recipient}`).
 */
export const RELATION_LEVELS = [
  {
    id: 'stranger',
    knows: false,
    label: { en: 'Stranger', zh: '陌生人' },
    owner: {
      zh: '您此前不认识{person}，也从未与{person}有过直接接触。',
      en: 'You did not know {person} before and have never interacted with {person} directly.',
    },
    path: {
      zh: '{sender}与{recipient}此前互不认识，也从未有过直接接触。',
      en: '{sender} and {recipient} did not know each other before and had never interacted directly.',
    },
  },
  {
    id: 'friend',
    knows: true,
    label: { en: 'Friend', zh: '朋友' },
    owner: {
      zh: '{person}是您的一位朋友。',
      en: '{person} is a friend of yours.',
    },
    path: {
      zh: '{recipient}是{sender}的一位朋友。',
      en: '{recipient} is a friend of {sender}.',
    },
  },
  {
    id: 'family',
    knows: true,
    label: { en: 'Family member', zh: '家人' },
    owner: {
      zh: '{person}是您的一位家人。',
      en: '{person} is a member of your family.',
    },
    path: {
      zh: '{recipient}是{sender}的一位家人。',
      en: "{recipient} is a member of {sender}'s family.",
    },
  },
];

export const RELATION_LEVEL_IDS = RELATION_LEVELS.map((level) => level.id);

/**
 * The five randomized relationships. Each is balanced in its own block queue,
 * independently of the others and of the information item.
 */
export const RELATIONSHIP_FACTORS = [
  { key: 'owner_b', field: 'owner_b_relation_condition', sender: 'A', recipient: 'B' },
  { key: 'owner_c', field: 'owner_c_relation_condition', sender: 'A', recipient: 'C' },
  { key: 'owner_d', field: 'owner_d_relation_condition', sender: 'A', recipient: 'D' },
  { key: 'bc', field: 'bc_relation_condition', sender: 'B', recipient: 'C' },
  { key: 'cd', field: 'cd_relation_condition', sender: 'C', recipient: 'D' },
];

export function getRelationLevel(id) {
  return RELATION_LEVELS.find((level) => level.id === id) ?? null;
}

/** Description of a relationship between `sender` and `recipient`, as `{ en, zh }`. */
export function relationText(levelId, sender, recipient) {
  const level = getRelationLevel(levelId);
  if (!level) return null;
  const fill = (text) =>
    text
      .replaceAll('{person}', recipient)
      .replaceAll('{sender}', sender)
      .replaceAll('{recipient}', recipient);
  const template = sender === 'A' ? level.owner : level.path;
  return { en: fill(template.en), zh: fill(template.zh) };
}
