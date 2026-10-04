/**
 * Demographic and categorical options.
 * Easy to remove or edit without touching screen components.
 * Display text is bilingual `{ en, zh }`; stored values stay in English codes.
 */

export const DEMOGRAPHICS_ENABLED = {
  age: true,
  gender: true,
};

export const GENDER_OPTIONS = [
  { value: 'prefer_not', label: { en: 'Prefer not to answer', zh: '不愿回答' } },
  { value: 'woman', label: { en: 'Woman', zh: '女性' } },
  { value: 'man', label: { en: 'Man', zh: '男性' } },
  { value: 'non_binary', label: { en: 'Non-binary', zh: '非二元性别' } },
  { value: 'self_describe', label: { en: 'Other (please describe)', zh: '其他（请说明）' } },
];

/** Balanced-assignment pool (6 types). No participant self-selection. */
export const INFO_TYPE_OPTIONS = [
  {
    value: 'identity_contact',
    label: { en: 'Identity & Contact', zh: '身份与联系方式' },
    examples: {
      en: 'age, name, email, phone, address, basic identity',
      zh: '年龄、姓名、电子邮箱、电话、住址、基本身份信息',
    },
  },
  {
    value: 'financial',
    label: { en: 'Financial', zh: '财务' },
    examples: {
      en: 'income, assets, spending, bank-related information',
      zh: '收入、资产、消费、银行相关信息',
    },
  },
  {
    value: 'health',
    label: { en: 'Health', zh: '健康' },
    examples: {
      en: 'physical health, mental health, diagnosis, treatment',
      zh: '身体健康、心理健康、诊断、治疗',
    },
  },
  {
    value: 'location_activity',
    label: { en: 'Location & Activity', zh: '位置与活动' },
    examples: {
      en: 'location, plans, routines, behavioral traces',
      zh: '所在位置、计划安排、日常作息、行为轨迹',
    },
  },
  {
    value: 'relationships_intimate',
    label: { en: 'Relationships & Intimate Life', zh: '人际关系与亲密生活' },
    examples: {
      en: 'family, friendship, romantic relationship, private moments',
      zh: '家庭、友谊、恋爱关系、私密时刻',
    },
  },
  {
    value: 'beliefs_preferences',
    label: { en: 'Beliefs & Preferences', zh: '观点与偏好' },
    examples: {
      en: 'opinions, beliefs, interests, personal preferences',
      zh: '看法、信念、兴趣、个人偏好',
    },
  },
];

export const INFO_TYPE_VALUES = INFO_TYPE_OPTIONS.map((o) => o.value);

/** @returns bilingual label, or the raw value if unknown */
export function getInfoTypeLabel(value) {
  return INFO_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/** @returns bilingual examples, or '' if unknown */
export function getInfoTypeExamples(value) {
  return INFO_TYPE_OPTIONS.find((o) => o.value === value)?.examples ?? '';
}

/** Nominal relationship category only; closeness is a separate 1–7 scale. */
export const RELATIONSHIP_TYPE_OPTIONS = [
  { value: 'romantic_partner', label: { en: 'Romantic partner', zh: '恋人 / 伴侣' } },
  { value: 'friend', label: { en: 'Friend', zh: '朋友' } },
  { value: 'family', label: { en: 'Family', zh: '家人' } },
  {
    value: 'school_work',
    label: { en: 'School / work connection', zh: '同学 / 同事（学校或工作关系）' },
  },
  { value: 'other', label: { en: 'Other', zh: '其他' } },
];

export const YES_NO_UNSURE_OPTIONS = [
  { value: 'yes', label: { en: 'Yes', zh: '是' } },
  { value: 'no', label: { en: 'No', zh: '否' } },
  { value: 'not_sure', label: { en: 'Not sure', zh: '不确定' } },
];

/** Set true later to shuffle secondary question order per hop. */
export const ENABLE_SECONDARY_RANDOMIZATION = false;

export const HOP_SECONDARY_QUESTION_IDS = {
  hop1: ['violation', 'permission', 'realism'],
  hop2: ['violation', 'permission', 'perceived_share_probability', 'realism'],
  hop3: ['violation', 'permission', 'perceived_share_probability', 'realism'],
};

export const PRIVACY_WARNING = {
  en: 'Please do not include names or identifying details.',
  zh: '请不要填写姓名或任何可识别身份的信息。',
};

/** Compact Likert anchor sets (1 / 4 / 7 labeled; 2–3 / 5–6 numbers only). */
export const ANCHORS_SENSITIVITY = {
  1: { en: 'Not sensitive at all', zh: '完全不敏感' },
  4: { en: 'Moderately sensitive', zh: '中等敏感' },
  7: { en: 'Extremely sensitive', zh: '极其敏感' },
};

export const ANCHORS_CLOSENESS = {
  1: { en: 'Not close at all', zh: '完全不亲近' },
  4: { en: 'Moderately', zh: '一般' },
  7: { en: 'Very close', zh: '非常亲近' },
};

export const ANCHORS_TRUST = {
  1: { en: 'Do not trust at all', zh: '完全不信任' },
  4: { en: 'Moderate or unsure', zh: '一般或不确定' },
  7: { en: 'Trust completely', zh: '完全信任' },
};

export const ANCHORS_ACCEPTABILITY = {
  1: { en: 'Completely unacceptable', zh: '完全不可接受' },
  4: { en: 'Neutral', zh: '中立' },
  7: { en: 'Completely acceptable', zh: '完全可以接受' },
};

export const ANCHORS_VIOLATION = {
  1: { en: 'Not at all', zh: '完全没有' },
  4: { en: 'Moderately', zh: '中等程度' },
  7: { en: 'Very much', zh: '非常严重' },
};

export const ANCHORS_PERMISSION = {
  1: { en: 'No permission needed', zh: '不需要征得同意' },
  4: { en: 'Moderately needed', zh: '一般需要' },
  7: { en: 'Permission definitely needed', zh: '一定需要征得同意' },
};

export const ANCHORS_LIKELY = {
  1: { en: 'Not at all likely', zh: '完全不可能' },
  4: { en: 'Moderately likely', zh: '有一定可能' },
  7: { en: 'Very likely', zh: '非常可能' },
};

export const ANCHORS_REALISM = {
  1: { en: 'Not at all realistic', zh: '完全不真实' },
  4: { en: 'Moderately realistic', zh: '一般真实' },
  7: { en: 'Extremely realistic', zh: '非常真实' },
};

export const ANCHORS_AGREE = {
  1: { en: 'Strongly disagree', zh: '非常不同意' },
  4: { en: 'Neutral', zh: '中立' },
  7: { en: 'Strongly agree', zh: '非常同意' },
};

export const ANCHORS_CONTROL = {
  1: { en: 'No control at all', zh: '完全无法控制' },
  4: { en: 'Moderate control', zh: '一定程度可控' },
  7: { en: 'Complete control', zh: '完全可控' },
};

export const ANCHORS_DISCOMFORT = {
  1: { en: 'Not at all uncomfortable', zh: '完全不会不舒服' },
  4: { en: 'Moderately uncomfortable', zh: '中等程度不舒服' },
  7: { en: 'Extremely uncomfortable', zh: '极其不舒服' },
};

export const ANCHORS_IMPACT = {
  1: { en: 'Not worse at all', zh: '完全不会更糟' },
  4: { en: 'Moderately worse', zh: '中等程度更糟' },
  7: { en: 'Extremely worse', zh: '糟糕得多' },
};
