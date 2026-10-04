import { getRelationLevel, RELATION_LEVEL_IDS, RELATIONSHIP_FACTORS } from '../config/study.js';
import { seededShuffle } from './itemAssignment.js';

/**
 * Balanced assignment of the five relationship factors (A–B, A–C, A–D, B–C, C–D),
 * each with levels stranger / friend / family.
 *
 * Every factor has its own queue of randomized blocks (each block holds the 3
 * levels once, in a seeded random order); a participant takes the next level
 * from each queue. So each factor's levels are equally frequent, the factors
 * are independent of one another, and all of them are independent of the item
 * queue (data/relationship_assignment_state.json on the server).
 */

export function createEmptyRelationshipState() {
  return {
    factors: Object.fromEntries(
      RELATIONSHIP_FACTORS.map((f) => [f.key, { queue: [], blocks_created: 0 }]),
    ),
    structures_assigned: 0,
  };
}

function normalizeState(state) {
  const empty = createEmptyRelationshipState();
  const factors = {};
  for (const f of RELATIONSHIP_FACTORS) {
    const saved = state?.factors?.[f.key];
    factors[f.key] = {
      blocks_created: saved?.blocks_created ?? 0,
      queue: (saved?.queue ?? []).filter((entry) => RELATION_LEVEL_IDS.includes(entry.level)),
    };
  }
  return { ...empty, structures_assigned: state?.structures_assigned ?? 0, factors };
}

/**
 * Take the next level of every factor, appending a new shuffled block to a
 * factor's queue when it is empty.
 * @param {(factorKey: string, blockNumber: number) => number} nextBlockSeed
 */
export function drawRelationshipStructure(state, nextBlockSeed) {
  const working = normalizeState(state);
  const picks = {};
  for (const f of RELATIONSHIP_FACTORS) {
    let factor = working.factors[f.key];
    if (factor.queue.length === 0) {
      const block = factor.blocks_created + 1;
      const seed = nextBlockSeed(f.key, block);
      factor = {
        blocks_created: block,
        queue: seededShuffle(RELATION_LEVEL_IDS, seed).map((level) => ({ level, block, seed })),
      };
    }
    const [pick, ...rest] = factor.queue;
    picks[f.key] = pick;
    working.factors[f.key] = { ...factor, queue: rest };
  }
  working.structures_assigned += 1;
  return { picks, state: working };
}

/** The participant's relationship assignment, shared by all their scenarios. */
export function buildRelationshipAssignment(picks, method) {
  const levelOf = (key) => picks[key].level;
  const assignment = {
    relationship_structure_id: RELATIONSHIP_FACTORS.map(
      (f) => `${f.key}_${levelOf(f.key)}`,
    ).join('__'),
    relationship_assignment_method: method,
  };
  for (const f of RELATIONSHIP_FACTORS) {
    assignment[f.field] = levelOf(f.key);
    assignment[`${f.key}_relation_seed`] = picks[f.key].seed;
    assignment[`${f.key}_relation_block`] = picks[f.key].block;
  }
  assignment.knows_ab = getRelationLevel(assignment.owner_b_relation_condition).knows;
  assignment.knows_ac = getRelationLevel(assignment.owner_c_relation_condition).knows;
  assignment.knows_ad = getRelationLevel(assignment.owner_d_relation_condition).knows;
  assignment.knows_bc = getRelationLevel(assignment.bc_relation_condition).knows;
  assignment.knows_cd = getRelationLevel(assignment.cd_relation_condition).knows;
  return assignment;
}

export function isValidRelationshipAssignment(value) {
  return Boolean(
    value && RELATIONSHIP_FACTORS.every((f) => RELATION_LEVEL_IDS.includes(value[f.field])),
  );
}
