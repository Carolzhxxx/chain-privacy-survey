import { DEMOGRAPHICS_ENABLED } from '../config/options.js';
import { getRoundNumber, getRoundStep } from '../config/screens.js';
import {
  MAX_JUDGMENT_FACTORS,
  OPEN_TEXT_MAX_LENGTH,
  OPEN_TEXT_MIN_LENGTH,
} from '../config/study.js';
import { isValidRelationshipAssignment } from './relationshipAssignment.js';

function isLikert(value) {
  return Number.isInteger(value) && value >= 1 && value <= 7;
}

function isFilled(value) {
  return value !== null && value !== undefined && value !== '';
}

const MSG = {
  required: { en: 'Please answer this question.', zh: '请回答此题。' },
  age: { en: 'Please enter a valid age (18–120).', zh: '请输入有效年龄（18–120）。' },
  selfDescribe: { en: 'Please provide a short description.', zh: '请简要填写。' },
  roundMissing: { en: 'Round data missing.', zh: '缺少本轮数据。' },
  infoTypeMissing: {
    en: 'The information has not loaded yet. Please wait or try again.',
    zh: '信息尚未加载，请稍候或重试。',
  },
  openTooShort: {
    en: `Please write a short answer (at least ${OPEN_TEXT_MIN_LENGTH} characters; one or two sentences is enough).`,
    zh: `请简要作答（至少 ${OPEN_TEXT_MIN_LENGTH} 个字，一到两句话即可）。`,
  },
  openTooLong: {
    en: `Please keep your answer under ${OPEN_TEXT_MAX_LENGTH} characters.`,
    zh: `请将回答控制在 ${OPEN_TEXT_MAX_LENGTH} 字以内。`,
  },
  factorsCount: {
    en: `Please select between 1 and ${MAX_JUDGMENT_FACTORS} factors.`,
    zh: `请选择 1 至 ${MAX_JUDGMENT_FACTORS} 项。`,
  },
  otherMissing: {
    en: 'Please briefly describe “Other”.',
    zh: '请简要填写“其他”的内容。',
  },
};

function relationshipAssigned(session) {
  return isValidRelationshipAssignment(session.relationship_assignment);
}

function openTextError(value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (text.length < OPEN_TEXT_MIN_LENGTH) return MSG.openTooShort;
  if (text.length > OPEN_TEXT_MAX_LENGTH) return MSG.openTooLong;
  return null;
}

/**
 * @param {object} session
 * @param {string} screenId
 */
export function validateScreen(session, screenId) {
  const answers = session.answers;
  /** @type {Record<string, { en: string, zh: string }>} */
  const errors = {};

  const requireLikert = (value, key) => {
    if (!isLikert(value)) errors[key] = MSG.required;
  };

  const requireValue = (value, key) => {
    if (!isFilled(value)) errors[key] = MSG.required;
  };

  switch (screenId) {
    case 'consent':
      if (!answers.consent_age18) errors.consent_age18 = MSG.required;
      if (!answers.consent_agree) errors.consent_agree = MSG.required;
      break;

    case 'baseline':
      if (DEMOGRAPHICS_ENABLED.age) {
        const age = Number(answers.age);
        if (!Number.isFinite(age) || age < 18 || age > 120) {
          errors.age = MSG.age;
        }
      }
      if (DEMOGRAPHICS_ENABLED.gender) {
        requireValue(answers.gender, 'gender');
        if (
          answers.gender === 'self_describe' &&
          !isFilled(answers.gender_self_describe)
        ) {
          errors.gender_self_describe = MSG.selfDescribe;
        }
      }
      requireLikert(answers.privacy_control, 'privacy_control');
      requireLikert(answers.permission_preference, 'permission_preference');
      requireLikert(answers.sharing_comfort, 'sharing_comfort');
      requireLikert(answers.attention_check, 'attention_check');
      break;

    case 'chain_intro':
      break;

    case 'person_b':
      if (!relationshipAssigned(session)) {
        errors.relationship_assignment = MSG.infoTypeMissing;
      } else if (answers.knows_AB === true) {
        requireLikert(answers.R_AB_raw, 'R_AB_raw');
      }
      requireLikert(answers.trust_B, 'trust_B');
      break;

    case 'person_c':
      if (!relationshipAssigned(session)) {
        errors.relationship_assignment = MSG.infoTypeMissing;
      } else if (answers.knows_AC === true) {
        requireLikert(answers.R_AC_raw, 'R_AC_raw');
      }
      break;

    case 'person_d':
      if (!relationshipAssigned(session)) {
        errors.relationship_assignment = MSG.infoTypeMissing;
      } else if (answers.knows_AD === true) {
        requireLikert(answers.R_AD_raw, 'R_AD_raw');
      }
      break;

    default: {
      const roundNumber = getRoundNumber(screenId);
      const step = getRoundStep(screenId);
      if (!roundNumber || !step) break;

      const round = session.rounds.find((r) => r.round_id === roundNumber);
      if (!round) {
        errors.round = MSG.roundMissing;
        break;
      }

      if (step === 'info') {
        if (!round.information_item_id || !relationshipAssigned(session)) {
          errors.info_type = MSG.infoTypeMissing;
        }
      } else if (step === 'sensitivity') {
        requireLikert(round.sensitivity_raw, 'sensitivity_raw');
      } else if (step === 'hop1' || step === 'hop2' || step === 'hop3') {
        requireLikert(round[step]?.acceptability, 'acceptability');
      } else if (step === 'hop2_reason' || step === 'hop3_reason' || step === 'cd_compare') {
        const field = {
          hop2_reason: 'reason_abc_open',
          hop3_reason: 'reason_abcd_open',
          cd_compare: 'reason_c_d_difference_open',
        }[step];
        const error = openTextError(round[field]);
        if (error) errors[field] = error;
      } else if (step === 'judgment_factors') {
        const factors = Array.isArray(round.judgment_factors)
          ? round.judgment_factors
          : [];
        if (factors.length < 1 || factors.length > MAX_JUDGMENT_FACTORS) {
          errors.judgment_factors = MSG.factorsCount;
        }
        if (factors.includes('other') && !isFilled(round.judgment_factors_other?.trim())) {
          errors.judgment_factors_other = MSG.otherMissing;
        }
      } else if (step === 'realism') {
        requireLikert(round.scenario_realism, 'scenario_realism');
      } else if (step === 'judgment_basis') {
        requireValue(round.primary_judgment_basis, 'primary_judgment_basis');
        if (
          round.primary_judgment_basis === 'other' &&
          !isFilled(round.primary_judgment_basis_other?.trim())
        ) {
          errors.primary_judgment_basis_other = MSG.otherMissing;
        }
      }
      break;
    }
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export function canAdvance(session, screenId) {
  return validateScreen(session, screenId).ok;
}
