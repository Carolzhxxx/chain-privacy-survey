/**
 * CSV exports. Wide: one row per participant. Long: one row per hop
 * (3 per scenario). Scenario: one row per participant × scenario.
 */

import {
  JUDGMENT_FACTOR_RANK_VALUES,
  JUDGMENT_FACTOR_VALUES,
  PRIMARY_BASIS_VALUES,
  RELATIONSHIP_FACTORS,
} from '../config/study.js';
import { ATTENTION_CHECK, BASELINE_QUESTIONS } from '../config/surveyQuestions.js';
import { COMPREHENSION_COLUMNS, comprehensionExportFields } from './comprehension.js';
import { normalizeLikert } from './likertScale.js';

/**
 * Mean of the 3 general privacy items (1–7), reverse-coded items as 8 − x.
 * The attention check is excluded. Null if any item is missing.
 */
export function generalPrivacyConcern(session) {
  const scores = BASELINE_QUESTIONS.map((q) => {
    const v = session[q.id];
    if (!Number.isInteger(v)) return null;
    return q.reverse ? 8 - v : v;
  });
  if (scores.some((s) => s === null)) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

export function attentionCheckPassed(session) {
  const v = session[ATTENTION_CHECK.id];
  if (!Number.isInteger(v)) return null;
  return v === ATTENTION_CHECK.expected;
}

/** System-assigned relationship structure (the manipulation). */
const RELATIONSHIP_ASSIGNMENT_COLUMNS = [
  ...RELATIONSHIP_FACTORS.map((f) => f.field),
  'knows_bc',
  'knows_cd',
  'relationship_structure_id',
  ...RELATIONSHIP_FACTORS.map((f) => `${f.key}_relation_seed`),
  'relationship_assignment_method',
];

const WIDE_COLUMNS = [
  'participant_id',
  'status',
  'created_at',
  'completed_at',
  'duration_seconds',
  'survey_language',
  'consent_age18',
  'consent_agree',
  'age',
  'gender',
  'gender_self_describe',
  'privacy_control',
  'permission_preference',
  'sharing_comfort',
  'general_privacy_concern',
  'attention_check',
  'attention_check_passed',
  ...COMPREHENSION_COLUMNS,
  'scenario_vignette_id',
  'permission_condition',
  'c_prior_knowledge',
  'd_prior_knowledge',
  ...RELATIONSHIP_ASSIGNMENT_COLUMNS,
  'pilot_mode',
  'knows_AB',
  'knows_AC',
  'knows_AD',
  'B_relationship_type',
  'R_AB_raw',
  'R_AB_norm',
  'trust_B',
  'realism_B',
  'C_relationship_type_owner',
  'R_AC_raw',
  'R_AC_norm',
  'R_BC_raw',
  'R_BC_norm',
  'R_BC_unsure',
  'realism_BC',
  'D_relationship_type_owner',
  'R_AD_raw',
  'R_AD_norm',
  'R_CD_raw',
  'R_CD_norm',
  'R_CD_unsure',
  'realism_CD',
  'D_already_knows',
  'study_mode',
  'assigned_item_ids',
  'assigned_info_types',
  'skipped_info_types',
  'info_type_skip_log',
  'round_1_info_type',
  'round_2_info_type',
  'round_order',
  'rounds',
  'overall_acceptability',
  'overall_discomfort',
  'perceived_control',
  'cumulative_impact',
  'overall_realism',
  'optional_comment',
  'question_order',
  'screen_start_times',
  'screen_end_times',
  'submitted',
];

const LONG_COLUMNS = [
  'participant_id',
  'round',
  'round_order',
  'scenario_index',
  'info_type',
  'information_item_id',
  'information_item_text',
  'sensitivity_raw',
  'sensitivity_norm',
  'hop',
  'recipient',
  'owner_recipient_relation_condition',
  'sender_recipient_relation_condition',
  'owner_knows_recipient',
  'relationship_owner_recipient_raw',
  'relationship_owner_recipient_norm',
  'relationship_sender_recipient_raw',
  'relationship_sender_recipient_norm',
  'relationship_sender_recipient_unsure',
  'acceptability',
  'violation',
  'permission',
  'perceived_share_probability',
  'realism',
  'B_relationship_type',
  'C_relationship_type_owner',
  'D_relationship_type_owner',
  'D_already_knows',
  'privacy_control',
  'permission_preference',
  'sharing_comfort',
  'general_privacy_concern',
  'attention_check',
  'attention_check_passed',
  ...COMPREHENSION_COLUMNS,
  'permission_condition',
  'c_prior_knowledge',
  'd_prior_knowledge',
  ...RELATIONSHIP_ASSIGNMENT_COLUMNS,
  'scenario_realism',
  'overall_realism',
  'study_mode',
  'duration_seconds',
  'completed_at',
  'survey_language',
];

function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const text =
    typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

export function recordsToCsv(rows, columns) {
  const header = columns.join(',');
  const body = rows
    .map((row) => columns.map((col) => csvEscape(row[col])).join(','))
    .join('\n');
  return `${header}\n${body}\n`;
}

/** Per-round screens whose start/end times go into the scenario export. */
const ROUND_TIMING_STEPS = [
  'info',
  'sensitivity',
  'hop1',
  'hop2',
  'hop2_reason',
  'bc_compare',
  'hop3',
  'hop3_reason',
  'cd_compare',
  'judgment_factors',
  'judgment_basis',
  'realism',
];

/**
 * One row per participant × scenario. Snake_case, one variable per column.
 * scenario_index = assignment slot (draw order); scenario_order = presentation position.
 */
const SCENARIO_COLUMNS = [
  'participant_id',
  'scenario_id',
  'scenario_index',
  'scenario_order',
  'scenario_vignette_id',
  'information_category',
  'information_item_id',
  'information_item_text',
  'information_item_language',
  'information_sensitivity',
  'information_sensitivity_norm',
  ...RELATIONSHIP_ASSIGNMENT_COLUMNS,
  'knows_ab',
  'knows_ac',
  'knows_ad',
  'r_ab',
  'r_ac',
  'r_ad',
  'r_bc',
  'r_bc_unsure',
  'r_cd',
  'r_cd_unsure',
  'permission_condition',
  'c_prior_knowledge',
  'd_prior_knowledge',
  'acceptability_ab',
  'acceptability_abc',
  'acceptability_abcd',
  'reason_abc_open',
  'reason_abcd_open',
  'reason_b_c_difference_open',
  'reason_c_d_difference_open',
  'judgment_factors',
  'judgment_factors_count',
  ...JUDGMENT_FACTOR_VALUES.map((v) => `factor_${v}`),
  ...JUDGMENT_FACTOR_RANK_VALUES.map((v) => `factor_rank_${v}`),
  'judgment_factors_other',
  'judgment_basis_ranking',
  ...PRIMARY_BASIS_VALUES.map((v) => `basis_rank_${v}`),
  'primary_judgment_basis',
  'primary_judgment_basis_other',
  'scenario_realism',
  'age',
  'gender',
  'gender_self_describe',
  'general_privacy_concern',
  'attention_check_passed',
  ...COMPREHENSION_COLUMNS,
  'assignment_seed',
  'assignment_block',
  'assignment_method',
  'study_mode',
  'pilot_mode',
  'survey_language',
  'scenario_started_at',
  'scenario_completed_at',
  ...ROUND_TIMING_STEPS.flatMap((s) => [`${s}_started_at`, `${s}_ended_at`]),
];

function flattenSession(session) {
  const assignment = session.assignment ?? {};
  const conditions = session.scenario_conditions ?? {};
  const relationship = session.relationship_assignment ?? {};
  const relationFields = {};
  for (const f of RELATIONSHIP_FACTORS) {
    relationFields[f.field] = relationship[f.field] ?? conditions[f.field] ?? null;
    relationFields[`${f.key}_relation_seed`] = relationship[`${f.key}_relation_seed`] ?? null;
  }
  const knowsFrom = (level, fallback) => (level ? level !== 'stranger' : fallback);
  const ownerC = relationFields.owner_c_relation_condition;
  const ownerD = relationFields.owner_d_relation_condition;
  const R_AB_raw = session.R_AB_raw ?? null;
  const R_AC_raw = session.R_AC_raw ?? null;
  const R_AD_raw = session.R_AD_raw ?? null;
  const R_BC_raw = session.R_BC_unsure ? null : (session.R_BC_raw ?? null);
  const R_CD_raw = session.R_CD_unsure ? null : (session.R_CD_raw ?? null);
  const rounds = Array.isArray(session.rounds)
    ? [...session.rounds].sort((a, b) => a.round_id - b.round_id)
    : [];

  return {
    ...session,
    general_privacy_concern: generalPrivacyConcern(session),
    attention_check_passed: attentionCheckPassed(session),
    ...comprehensionExportFields(session),
    study_mode: session.study_mode ?? null,
    // In presentation order.
    assigned_item_ids: rounds.map((r) => r.information_item_id ?? null),
    assigned_info_types: rounds.map((r) => r.info_type ?? null),
    skipped_info_types: assignment.skipped_info_types ?? [],
    info_type_skip_log: assignment.info_type_skip_log ?? [],
    round_1_info_type: rounds[0]?.info_type ?? null,
    round_2_info_type: rounds[1]?.info_type ?? null,
    round_order: rounds.map((r) => r.scenario_index ?? r.round_order),
    scenario_vignette_id: conditions.vignette_id ?? null,
    permission_condition: conditions.permission_condition ?? null,
    c_prior_knowledge: conditions.c_prior_knowledge ?? null,
    d_prior_knowledge: conditions.d_prior_knowledge ?? null,
    ...relationFields,
    relationship_structure_id: relationship.relationship_structure_id ?? null,
    relationship_assignment_method: relationship.relationship_assignment_method ?? null,
    knows_AB: knowsFrom(relationFields.owner_b_relation_condition, session.knows_AB ?? null),
    knows_AC: knowsFrom(ownerC, session.knows_AC ?? null),
    knows_AD: knowsFrom(ownerD, session.knows_AD ?? null),
    knows_bc: knowsFrom(relationFields.bc_relation_condition, null),
    knows_cd: knowsFrom(relationFields.cd_relation_condition, null),
    pilot_mode: session.pilot_mode ?? null,
    R_AB_norm: normalizeLikert(R_AB_raw),
    R_AC_norm: normalizeLikert(R_AC_raw),
    R_AD_norm: normalizeLikert(R_AD_raw),
    R_BC_norm: normalizeLikert(R_BC_raw),
    R_CD_norm: normalizeLikert(R_CD_raw),
  };
}

/** @param {object} session */
export function toWideRow(session) {
  const flat = flattenSession(session);
  /** @type {Record<string, any>} */
  const row = {};
  for (const col of WIDE_COLUMNS) {
    row[col] = flat[col] ?? null;
  }
  return row;
}

/** @param {object} session */
export function toLongRows(session) {
  const flat = flattenSession(session);
  const rounds = Array.isArray(session.rounds) ? session.rounds : [];

  const shared = {
    participant_id: flat.participant_id,
    B_relationship_type: flat.B_relationship_type,
    C_relationship_type_owner: flat.C_relationship_type_owner,
    D_relationship_type_owner: flat.D_relationship_type_owner,
    D_already_knows: flat.D_already_knows,
    privacy_control: flat.privacy_control,
    permission_preference: flat.permission_preference,
    sharing_comfort: flat.sharing_comfort,
    general_privacy_concern: flat.general_privacy_concern,
    attention_check: flat.attention_check,
    attention_check_passed: flat.attention_check_passed,
    ...Object.fromEntries(COMPREHENSION_COLUMNS.map((c) => [c, flat[c]])),
    permission_condition: flat.permission_condition,
    c_prior_knowledge: flat.c_prior_knowledge,
    d_prior_knowledge: flat.d_prior_knowledge,
    ...Object.fromEntries(RELATIONSHIP_ASSIGNMENT_COLUMNS.map((c) => [c, flat[c]])),
    overall_realism: flat.overall_realism,
    study_mode: flat.study_mode,
    duration_seconds: flat.duration_seconds,
    completed_at: flat.completed_at,
    survey_language: flat.survey_language ?? 'en',
  };

  const hopSpecs = [
    {
      hop: 1,
      key: 'hop1',
      recipient: 'B',
      // A–B is fixed by the vignette (close friend), not randomized.
      ownerCondition: flat.owner_b_relation_condition,
      senderCondition: flat.owner_b_relation_condition,
      ownerKnows: flat.knows_AB ?? null,
      ownerRaw: flat.R_AB_raw,
      ownerNorm: flat.R_AB_norm,
      senderRaw: null,
      senderNorm: null,
      senderUnsure: null,
    },
    {
      hop: 2,
      key: 'hop2',
      recipient: 'C',
      ownerCondition: flat.owner_c_relation_condition,
      senderCondition: flat.bc_relation_condition,
      ownerKnows: flat.knows_AC ?? null,
      ownerRaw: flat.R_AC_raw,
      ownerNorm: flat.R_AC_norm,
      senderRaw: flat.R_BC_unsure ? null : flat.R_BC_raw,
      senderNorm: flat.R_BC_norm,
      senderUnsure: flat.R_BC_unsure ?? null,
    },
    {
      hop: 3,
      key: 'hop3',
      recipient: 'D',
      ownerCondition: flat.owner_d_relation_condition,
      senderCondition: flat.cd_relation_condition,
      ownerKnows: flat.knows_AD ?? null,
      ownerRaw: flat.R_AD_raw,
      ownerNorm: flat.R_AD_norm,
      senderRaw: flat.R_CD_unsure ? null : flat.R_CD_raw,
      senderNorm: flat.R_CD_norm,
      senderUnsure: flat.R_CD_unsure ?? null,
    },
  ];

  /** @type {object[]} */
  const rows = [];
  for (const round of rounds) {
    const sensitivity_raw = round.sensitivity_raw ?? null;
    const sensitivity_norm = normalizeLikert(sensitivity_raw);

    for (const spec of hopSpecs) {
      const hopData = round[spec.key] ?? {};
      rows.push({
        ...shared,
        round: round.round_id,
        round_order: round.round_order,
        scenario_index: round.scenario_index ?? null,
        info_type: round.info_type,
        information_item_id: round.information_item_id ?? null,
        information_item_text: round.information_item_text ?? null,
        scenario_realism: round.scenario_realism ?? null,
        sensitivity_raw,
        sensitivity_norm,
        hop: spec.hop,
        recipient: spec.recipient,
        owner_recipient_relation_condition: spec.ownerCondition,
        sender_recipient_relation_condition: spec.senderCondition,
        owner_knows_recipient: spec.ownerKnows,
        relationship_owner_recipient_raw: spec.ownerRaw,
        relationship_owner_recipient_norm: spec.ownerNorm,
        relationship_sender_recipient_raw: spec.senderRaw,
        relationship_sender_recipient_norm: spec.senderNorm,
        relationship_sender_recipient_unsure: spec.senderUnsure,
        acceptability: hopData.acceptability ?? null,
        violation: hopData.violation ?? null,
        permission: hopData.permission ?? null,
        perceived_share_probability:
          hopData.perceived_share_probability ?? null,
        realism: hopData.realism ?? null,
      });
    }
  }

  return rows;
}

/** @param {object} session */
export function toScenarioRows(session) {
  const flat = flattenSession(session);
  const rounds = Array.isArray(session.rounds)
    ? [...session.rounds].sort((a, b) => a.round_id - b.round_id)
    : [];
  const starts = session.screen_start_times ?? {};
  const ends = session.screen_end_times ?? {};

  return rounds.map((round) => {
    const prefix = `r${round.round_id}_`;
    const factors = Array.isArray(round.judgment_factors) ? round.judgment_factors : [];
    const basisRanking = Array.isArray(round.judgment_basis_ranking)
      ? round.judgment_basis_ranking
      : [];
    const timing = {};
    const visitedEnds = [];
    for (const step of ROUND_TIMING_STEPS) {
      timing[`${step}_started_at`] = starts[prefix + step] ?? null;
      timing[`${step}_ended_at`] = ends[prefix + step] ?? null;
      if (ends[prefix + step]) visitedEnds.push(ends[prefix + step]);
    }

    return {
      participant_id: flat.participant_id,
      scenario_id: `${flat.scenario_vignette_id ?? 'scenario'}-${round.information_item_id ?? `r${round.round_id}`}`,
      scenario_index: round.scenario_index ?? round.round_id,
      scenario_order: round.round_id,
      scenario_vignette_id: flat.scenario_vignette_id,
      information_category: round.info_type ?? null,
      information_item_id: round.information_item_id ?? null,
      information_item_text: round.information_item_text ?? null,
      information_item_language: round.information_item_language ?? null,
      information_sensitivity: round.sensitivity_raw ?? null,
      information_sensitivity_norm: normalizeLikert(round.sensitivity_raw ?? null),
      ...Object.fromEntries(RELATIONSHIP_ASSIGNMENT_COLUMNS.map((c) => [c, flat[c]])),
      knows_ab: flat.knows_AB ?? null,
      knows_ac: flat.knows_AC ?? null,
      knows_ad: flat.knows_AD ?? null,
      r_ab: flat.R_AB_raw ?? null,
      r_ac: flat.R_AC_raw ?? null,
      r_ad: flat.R_AD_raw ?? null,
      r_bc: flat.R_BC_unsure ? null : (flat.R_BC_raw ?? null),
      r_bc_unsure: flat.R_BC_unsure ?? null,
      r_cd: flat.R_CD_unsure ? null : (flat.R_CD_raw ?? null),
      r_cd_unsure: flat.R_CD_unsure ?? null,
      permission_condition: flat.permission_condition,
      c_prior_knowledge: flat.c_prior_knowledge,
      d_prior_knowledge: flat.d_prior_knowledge,
      acceptability_ab: round.hop1?.acceptability ?? null,
      acceptability_abc: round.hop2?.acceptability ?? null,
      acceptability_abcd: round.hop3?.acceptability ?? null,
      reason_abc_open: round.reason_abc_open ?? null,
      reason_abcd_open: round.reason_abcd_open ?? null,
      reason_b_c_difference_open: round.reason_b_c_difference_open ?? null,
      reason_c_d_difference_open: round.reason_c_d_difference_open ?? null,
      judgment_factors: factors,
      judgment_factors_count: factors.length,
      ...Object.fromEntries(
        JUDGMENT_FACTOR_VALUES.map((v) => [
          `factor_${v}`,
          (v === 'other' ? Boolean(round.judgment_factors_other?.trim()) : factors.includes(v))
            ? 1
            : 0,
        ]),
      ),
      ...Object.fromEntries(
        JUDGMENT_FACTOR_RANK_VALUES.map((v) => [
          `factor_rank_${v}`,
          factors.includes(v) ? factors.indexOf(v) + 1 : null,
        ]),
      ),
      judgment_factors_other: round.judgment_factors_other ?? null,
      judgment_basis_ranking: basisRanking,
      ...Object.fromEntries(
        PRIMARY_BASIS_VALUES.map((v) => [
          `basis_rank_${v}`,
          basisRanking.includes(v) ? basisRanking.indexOf(v) + 1 : null,
        ]),
      ),
      primary_judgment_basis: round.primary_judgment_basis ?? null,
      primary_judgment_basis_other: round.primary_judgment_basis_other ?? null,
      scenario_realism: round.scenario_realism ?? null,
      age: flat.age ?? null,
      gender: flat.gender ?? null,
      gender_self_describe: flat.gender_self_describe ?? null,
      general_privacy_concern: flat.general_privacy_concern,
      attention_check_passed: flat.attention_check_passed,
      ...Object.fromEntries(COMPREHENSION_COLUMNS.map((c) => [c, flat[c]])),
      assignment_seed: round.assignment_seed ?? null,
      assignment_block: round.assignment_block ?? null,
      assignment_method: round.assignment_method ?? null,
      study_mode: flat.study_mode,
      pilot_mode: flat.pilot_mode,
      survey_language: flat.survey_language ?? 'en',
      scenario_started_at: timing.info_started_at,
      scenario_completed_at: visitedEnds.sort().at(-1) ?? null,
      ...timing,
    };
  });
}

export function exportScenarioCsv(sessions) {
  return recordsToCsv(sessions.flatMap(toScenarioRows), SCENARIO_COLUMNS);
}

export function exportWideCsv(sessions) {
  return recordsToCsv(sessions.map(toWideRow), WIDE_COLUMNS);
}

export function exportLongCsv(sessions) {
  const rows = sessions.flatMap(toLongRows);
  return recordsToCsv(rows, LONG_COLUMNS);
}

export { WIDE_COLUMNS, LONG_COLUMNS, SCENARIO_COLUMNS };
export { normalizeLikert } from './likertScale.js';
