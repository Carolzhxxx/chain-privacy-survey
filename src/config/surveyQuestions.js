import { ANCHORS_AGREE } from './options.js';

export const LIKERT_AGREE = {
  1: { en: 'Strongly disagree', zh: '非常不同意' },
  2: { en: 'Disagree', zh: '不同意' },
  3: { en: 'Somewhat disagree', zh: '有点不同意' },
  4: { en: 'Neutral', zh: '中立' },
  5: { en: 'Somewhat agree', zh: '有点同意' },
  6: { en: 'Agree', zh: '同意' },
  7: { en: 'Strongly agree', zh: '非常同意' },
};

export const BASELINE_QUESTIONS = [
  {
    id: 'privacy_control',
    text: {
      en: 'Generally, I prefer to have control over who receives information about me.',
      zh: '总体来说，我希望能掌控谁可以获得关于我的信息。',
    },
    labels: LIKERT_AGREE,
  },
  {
    id: 'permission_preference',
    text: {
      en: 'Generally, I expect people to ask before sharing information about me with others.',
      zh: '总体来说，我希望别人在把关于我的信息告诉他人之前，先征求我的同意。',
    },
    labels: LIKERT_AGREE,
  },
  {
    id: 'sharing_comfort',
    text: {
      en: 'Generally, I am comfortable with information about me spreading beyond the person I originally told.',
      zh: '总体来说，关于我的信息从我最初告诉的那个人那里继续传开，我能够接受。',
    },
    labels: LIKERT_AGREE,
    reverse: true,
  },
];

export const ATTENTION_CHECK = {
  id: 'attention_check',
  text: {
    en: 'To show that you are paying attention, please select 4.',
    zh: '为确认您在认真作答，请选择 4。',
  },
  labels: LIKERT_AGREE,
  expected: 4,
};

/**
 * Comprehension checks on the fixed scenario facts, asked after chain_intro.
 * Wrong answers show `explanation` and must be corrected before continuing;
 * the first attempt is kept for analysis.
 */
export const COMPREHENSION_QUESTIONS = [
  {
    id: 'permission',
    text: {
      en: 'In this scenario, did you allow B to tell this information to others?',
      zh: '在这个情境中，您是否允许 B 把这条信息告诉别人？',
    },
    options: [
      { value: 'allowed', label: { en: 'I allowed it', zh: '允许' } },
      { value: 'not_allowed', label: { en: 'I did not allow it', zh: '不允许' } },
      { value: 'not_explicit', label: { en: 'I did not say either way', zh: '没有明确说' } },
    ],
    correct: 'not_explicit',
    explanation: {
      en: 'You told B the information but did not explicitly say whether B could share it further.',
      zh: '情境中，您告诉了 B 这条信息，但没有明确说是否允许 B 继续分享。',
    },
  },
  {
    id: 'path',
    text: {
      en: 'From whom did C learn this information?',
      zh: 'C 是从谁那里知道这条信息的？',
    },
    options: [
      { value: 'from_a', label: { en: 'Directly from me', zh: '直接从我这里' } },
      { value: 'from_b', label: { en: 'From B', zh: '从 B 那里' } },
      { value: 'from_d', label: { en: 'From D', zh: '从 D 那里' } },
    ],
    correct: 'from_b',
    explanation: {
      en: 'C learned the information from B.',
      zh: 'C 是从 B 那里知道这条信息的。',
    },
  },
  {
    id: 'prior',
    text: {
      en: 'Before B told C, did C already know this information?',
      zh: '在 B 告诉 C 之前，C 是否已经知道这条信息？',
    },
    options: [
      { value: 'knew', label: { en: 'Yes, C already knew', zh: '已经知道' } },
      { value: 'did_not_know', label: { en: 'No, C did not know', zh: '不知道' } },
      { value: 'not_mentioned', label: { en: 'The scenario does not say', zh: '情境中没有提到' } },
    ],
    correct: 'did_not_know',
    explanation: {
      en: 'C did not know about it before; C only learned it when B told them.',
      zh: 'C 原本不知道这件事，是 B 告诉 C 之后才知道的。',
    },
  },
];

export const CONSENT_CONTENT = {
  eyebrow: { en: 'Study Information', zh: '研究说明' },
  title: { en: 'Consent and Study Information', zh: '知情同意与研究说明' },
  infoCards: [
    {
      id: 'topic',
      label: { en: 'Research title', zh: '研究题目' },
      value: {
        en: 'Multi-hop Interpersonal Privacy Propagation Study',
        zh: '人际隐私的多跳传播研究',
      },
      variant: 'topic',
    },
    {
      id: 'institution',
      label: { en: 'Research institution', zh: '研究机构' },
      value: { en: 'Research Team', zh: '研究团队' },
      variant: 'institution',
    },
    {
      id: 'type',
      label: { en: 'Study type', zh: '研究形式' },
      value: { en: 'Anonymous online questionnaire', zh: '匿名在线问卷' },
      variant: 'investigator',
    },
  ],
  sections: [
    {
      id: 'content',
      heading: { en: 'Study content', zh: '研究内容' },
      body: {
        en: 'This study examines how people evaluate the sharing of personal information across social relationships.',
        zh: '本研究旨在了解人们如何看待个人信息在社会关系中的分享。',
      },
    },
    {
      id: 'procedure',
      heading: { en: 'What you will do', zh: '您需要做什么' },
      body: {
        en: 'You will read hypothetical scenarios about information spreading. In these scenarios, you are A, the owner of the information, and B, C, and D are people in the scenario. Based on the given relationships and information, you will rate how acceptable it is to you when the information about you becomes known to different people. You do not need to give your real name or disclose any specific private information from your real life.',
        zh: '您将阅读若干假想的信息传播情境。在这些情境中，您是信息所有者A，B、C和D是情境中的人物。您需要根据给定的人物关系和信息内容，评价当关于您的信息被不同人物知道时，您对此的可接受程度。您不需要填写真实姓名，也不需要披露自己现实生活中的具体隐私信息。',
      },
    },
    {
      id: 'privacy',
      heading: { en: 'Important privacy protection', zh: '重要的隐私保护' },
      body: {
        en: 'You should NOT enter names, phone numbers, email addresses, usernames, addresses, or other identifying information about yourself or others. All information in the scenarios is hypothetical.',
        zh: '请不要填写您本人或他人的姓名、电话号码、电子邮箱、用户名、住址或其他可识别身份的信息。情境中的信息均为假想内容。',
      },
    },
    {
      id: 'voluntary',
      heading: { en: 'Voluntary participation', zh: '自愿参与' },
      body: {
        en: 'Your participation is completely voluntary. You may stop at any time without giving a reason.',
        zh: '您的参与完全出于自愿。您可以随时停止，无需说明理由。',
      },
    },
    {
      id: 'data',
      heading: { en: 'Data use', zh: '数据使用' },
      body: {
        en: 'Your anonymous ratings will be stored for research analysis. We do not ask for your name. An anonymous participant ID is generated automatically.',
        zh: '您的匿名评分将被保存用于研究分析。我们不会询问您的姓名，系统会自动生成一个匿名参与者编号。',
      },
    },
  ],
  confirmationHeading: { en: 'Consent confirmation', zh: '同意确认' },
  checkboxes: [
    {
      id: 'consent_age18',
      label: { en: 'I am at least 18 years old.', zh: '我已年满 18 周岁。' },
    },
    {
      id: 'consent_agree',
      label: {
        en: 'I understand the instructions and agree to participate.',
        zh: '我已理解上述说明，并同意参与本研究。',
      },
    },
  ],
  checkboxError: {
    en: 'Please check both boxes to continue.',
    zh: '请勾选以上两项后继续。',
  },
  continueLabel: { en: 'I agree and continue', zh: '我同意并继续' },
};

export { ANCHORS_AGREE };
