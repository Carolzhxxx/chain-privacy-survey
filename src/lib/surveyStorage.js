import {
  ENABLE_SECONDARY_RANDOMIZATION,
  HOP_SECONDARY_QUESTION_IDS,
} from '../config/options.js';
import { SUBMIT_SCREEN_ID } from '../config/screens.js';
import {
  PILOT_MODE,
  SCENARIO_CONDITIONS,
  SCENARIOS_PER_PARTICIPANT,
  STUDY_MODE,
} from '../config/study.js';
import {
  buildScenarioAssignments,
  createEmptyAssignmentState,
  DEMO_ASSIGNMENT_SALT,
  drawItems,
  hashString,
} from './itemAssignment.js';
import {
  buildRelationshipAssignment,
  createEmptyRelationshipState,
  drawRelationshipStructure,
  isValidRelationshipAssignment,
} from './relationshipAssignment.js';

const SESSION_KEY = 'chain_privacy_survey_session_v6';

/**
 * Static demo build (e.g. GitHub Pages): no backend, assignment runs in the
 * browser and responses stay in localStorage.
 */
export const DEMO_MODE = import.meta.env?.VITE_DEMO_MODE === 'true';

const DEMO_RESPONSES_KEY = 'chain_privacy_demo_responses';

function nowIso() {
  return new Date().toISOString();
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestionOrder() {
  const make = (ids) =>
    ENABLE_SECONDARY_RANDOMIZATION ? shuffle(ids) : [...ids];

  return {
    hop1_secondary: make(HOP_SECONDARY_QUESTION_IDS.hop1),
    hop2_secondary: make(HOP_SECONDARY_QUESTION_IDS.hop2),
    hop3_secondary: make(HOP_SECONDARY_QUESTION_IDS.hop3),
  };
}

export function createEmptyHopRatings(includeShareProbability = false) {
  return {
    acceptability: null,
    violation: null,
    permission: null,
    realism: null,
    ...(includeShareProbability
      ? { perceived_share_probability: null }
      : {}),
  };
}

/**
 * One round = one scenario; `round_id` is its presentation position
 * (screens r1_*, r2_*). `info_type` is the item's category code.
 * Hop fields other than `acceptability` (violation, permission, realism,
 * perceived_share_probability) are no longer shown and stay null.
 */
export function createEmptyRound(roundId, roundOrder) {
  return {
    round_id: roundId,
    round_order: roundOrder,
    scenario_index: null,
    info_type: null,
    information_item_id: null,
    information_item_text: null,
    information_item_language: null,
    assignment_seed: null,
    assignment_block: null,
    assignment_method: null,
    sensitivity_raw: null,
    hop1: createEmptyHopRatings(false),
    hop2: createEmptyHopRatings(true),
    hop3: createEmptyHopRatings(true),
    reason_abc_open: null,
    reason_abcd_open: null,
    reason_c_d_difference_open: null,
    judgment_factors: [],
    judgment_factors_other: null,
    primary_judgment_basis: null,
    primary_judgment_basis_other: null,
    scenario_realism: null,
  };
}

export function createEmptyAnswers() {
  return {
    consent_age18: false,
    consent_agree: false,
    age: null,
    gender: null,
    gender_self_describe: null,
    privacy_control: null,
    permission_preference: null,
    sharing_comfort: null,
    attention_check: null,

    // knows_AB comes from the assigned A–B condition; R_AB_raw is only asked
    // when A knows B. B_relationship_type, realism_B / realism_BC /
    // realism_CD, D_already_knows and the overall_* items are no longer shown
    // and stay null.
    knows_AB: null,
    B_relationship_type: null,
    R_AB_raw: null,
    trust_B: null,
    realism_B: null,

    // knows_AC / knows_AD come from the assigned relation conditions (not
    // asked). R_AC_raw / R_AD_raw are only asked when A knows C / D and stay
    // null for strangers. B–C and C–D are assigned conditions, so R_BC_raw /
    // R_CD_raw are no longer asked and stay null, as do
    // C/D_relationship_type_owner.
    knows_AC: null,
    C_relationship_type_owner: null,
    R_AC_raw: null,
    R_BC_raw: null,
    R_BC_unsure: null,
    realism_BC: null,

    knows_AD: null,
    D_relationship_type_owner: null,
    R_AD_raw: null,
    R_CD_raw: null,
    R_CD_unsure: null,
    realism_CD: null,
    D_already_knows: null,

    overall_acceptability: null,
    overall_discomfort: null,
    perceived_control: null,
    cumulative_impact: null,
    overall_realism: null,
    optional_comment: null,
  };
}

export function createSession() {
  const created_at = nowIso();
  return {
    participant_id: crypto.randomUUID(),
    status: 'in_progress',
    created_at,
    completed_at: null,
    duration_seconds: null,
    currentScreen: 'consent',
    answers: createEmptyAnswers(),
    assignment: {
      scenarios: [],
      locked: false,
    },
    relationship_assignment: null,
    rounds: Array.from({ length: SCENARIOS_PER_PARTICIPANT }, (_, i) =>
      createEmptyRound(i + 1, i + 1),
    ),
    scenario_conditions: { ...SCENARIO_CONDITIONS },
    study_mode: STUDY_MODE,
    pilot_mode: PILOT_MODE,
    question_order: buildQuestionOrder(),
    screen_start_times: { consent: created_at },
    screen_end_times: {},
    submitted: false,
  };
}

/** Fill fields added after a session was first stored in this tab. */
function withDefaults(session) {
  return {
    ...session,
    answers: { ...createEmptyAnswers(), ...session.answers },
    rounds: session.rounds.map((round) => ({
      ...createEmptyRound(round.round_id, round.round_order),
      ...round,
    })),
    scenario_conditions: { ...SCENARIO_CONDITIONS, ...session.scenario_conditions },
    relationship_assignment: session.relationship_assignment ?? null,
    study_mode: session.study_mode ?? STUDY_MODE,
    pilot_mode: session.pilot_mode ?? PILOT_MODE,
  };
}

// sessionStorage is per tab: a refresh restores progress, a new tab starts a
// fresh participant.
export function loadSession() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.participant_id || !parsed?.answers) return null;
    if (!parsed.rounds || !parsed.assignment) return null;
    // A tab started under a different study mode starts over rather than mixing designs.
    if ((parsed.study_mode ?? STUDY_MODE) !== STUDY_MODE) return null;
    return withDefaults(parsed);
  } catch {
    return null;
  }
}

export function saveSession(session) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function markScreenTransition(session, fromScreen, toScreen) {
  const stamp = nowIso();
  return {
    ...session,
    currentScreen: toScreen,
    screen_end_times: {
      ...session.screen_end_times,
      [fromScreen]: stamp,
    },
    screen_start_times: {
      ...session.screen_start_times,
      [toScreen]: session.screen_start_times[toScreen] ?? stamp,
    },
  };
}

export function getRound(session, roundNumber) {
  return session.rounds.find((r) => r.round_id === roundNumber) ?? null;
}

export function updateRound(session, roundNumber, updater) {
  return {
    ...session,
    rounds: session.rounds.map((round) => {
      if (round.round_id !== roundNumber) return round;
      return typeof updater === 'function' ? updater(round) : { ...round, ...updater };
    }),
  };
}

/**
 * Lock the assigned items into the rounds (by presentation position) and the
 * relationship structure into the session; all scenarios share the structure.
 * @param {object} session
 * @param {{ scenarios: ReturnType<typeof buildScenarioAssignments>, relationship: ReturnType<typeof buildRelationshipAssignment> }} assignment
 */
export function applyAssignment(session, { scenarios, relationship }) {
  const knowsB = relationship.knows_ab;
  const knowsC = relationship.knows_ac;
  const knowsD = relationship.knows_ad;
  return {
    ...session,
    assignment: {
      scenarios,
      locked: true,
    },
    relationship_assignment: relationship,
    scenario_conditions: {
      ...session.scenario_conditions,
      owner_b_relation_condition: relationship.owner_b_relation_condition,
      owner_c_relation_condition: relationship.owner_c_relation_condition,
      owner_d_relation_condition: relationship.owner_d_relation_condition,
      bc_relation_condition: relationship.bc_relation_condition,
      cd_relation_condition: relationship.cd_relation_condition,
    },
    answers: {
      ...session.answers,
      knows_AB: knowsB,
      knows_AC: knowsC,
      knows_AD: knowsD,
      R_AB_raw: knowsB ? session.answers.R_AB_raw : null,
      R_AC_raw: knowsC ? session.answers.R_AC_raw : null,
      R_AD_raw: knowsD ? session.answers.R_AD_raw : null,
    },
    rounds: session.rounds.map((round) => {
      const s = scenarios.find((x) => x.scenario_order === round.round_id);
      if (!s) return round;
      return {
        ...round,
        scenario_index: s.scenario_index,
        info_type: s.information_category,
        information_item_id: s.information_item_id,
        assignment_seed: s.assignment_seed,
        assignment_block: s.assignment_block,
        assignment_method: s.assignment_method,
      };
    }),
  };
}

export function isAssignmentComplete(session) {
  return (
    Boolean(session.assignment?.locked) &&
    isValidRelationshipAssignment(session.relationship_assignment) &&
    session.rounds.every((round) => Boolean(round.information_item_id))
  );
}

export function buildSubmissionPayload(session) {
  const completed_at = nowIso();
  const duration_seconds = Math.max(
    0,
    Math.round(
      (Date.parse(completed_at) - Date.parse(session.created_at)) / 1000,
    ),
  );

  return {
    participant_id: session.participant_id,
    status: 'completed',
    created_at: session.created_at,
    completed_at,
    duration_seconds,
    ...session.answers,
    assignment: session.assignment,
    relationship_assignment: session.relationship_assignment,
    rounds: session.rounds,
    scenario_conditions: session.scenario_conditions,
    study_mode: session.study_mode,
    pilot_mode: session.pilot_mode,
    question_order: session.question_order,
    screen_start_times: session.screen_start_times,
    screen_end_times: {
      ...session.screen_end_times,
      [SUBMIT_SCREEN_ID]: completed_at,
    },
    submitted: true,
  };
}

export async function submitSession(payload) {
  if (DEMO_MODE) {
    let saved = [];
    try {
      saved = JSON.parse(window.localStorage.getItem(DEMO_RESPONSES_KEY) ?? '[]');
    } catch {
      saved = [];
    }
    if (saved.some((r) => r.participant_id === payload.participant_id)) {
      return { ok: false, status: 409, body: { error: 'Duplicate submission' } };
    }
    saved.push(payload);
    window.localStorage.setItem(DEMO_RESPONSES_KEY, JSON.stringify(saved));
    return { ok: true, status: 200, body: { demo: true } };
  }

  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  return { ok: response.ok, status: response.status, body };
}

export async function saveDraft(session) {
  if (DEMO_MODE) return;
  try {
    await fetch('/api/sessions/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant_id: session.participant_id,
        status: 'in_progress',
        created_at: session.created_at,
        completed_at: null,
        duration_seconds: null,
        currentScreen: session.currentScreen,
        ...session.answers,
        assignment: session.assignment,
        relationship_assignment: session.relationship_assignment,
        rounds: session.rounds,
        scenario_conditions: session.scenario_conditions,
        study_mode: session.study_mode,
        pilot_mode: session.pilot_mode,
        question_order: session.question_order,
        screen_start_times: session.screen_start_times,
        screen_end_times: session.screen_end_times,
        submitted: false,
      }),
    });
  } catch {
    // best-effort
  }
}

/**
 * Get this participant's items (SCENARIOS_PER_PARTICIPANT, distinct categories)
 * and relationship structure. Server: two separate central randomized-block
 * queues; repeat calls return the stored assignment. Demo build (no backend):
 * queues seeded from the participant ID, so the result is reproducible for
 * that ID.
 * @returns {Promise<{ scenarios: object[], relationship: object }>}
 */
export async function requestItemAssignment(participantId) {
  const n = SCENARIOS_PER_PARTICIPANT;
  if (DEMO_MODE) {
    const { picks } = drawItems(createEmptyAssignmentState(), n, (block) =>
      hashString(`${DEMO_ASSIGNMENT_SALT}:${participantId}:${block}`),
    );
    const relationship = drawRelationshipStructure(
      createEmptyRelationshipState(),
      (factor, block) =>
        hashString(`${DEMO_ASSIGNMENT_SALT}:relationship:${factor}:${participantId}:${block}`),
    );
    return {
      scenarios: buildScenarioAssignments(picks, participantId, 'seeded_participant'),
      relationship: buildRelationshipAssignment(relationship.picks, 'seeded_participant'),
    };
  }

  const response = await fetch('/api/assign-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      participant_id: participantId,
      n,
      study_mode: STUDY_MODE,
    }),
  });
  if (!response.ok) {
    throw new Error(`assign failed: ${response.status}`);
  }
  const body = await response.json();
  if (!Array.isArray(body.scenarios) || !isValidRelationshipAssignment(body.relationship)) {
    throw new Error('assign failed: incomplete assignment');
  }
  return { scenarios: body.scenarios, relationship: body.relationship };
}

export { normalizeLikert } from './likertScale.js';
