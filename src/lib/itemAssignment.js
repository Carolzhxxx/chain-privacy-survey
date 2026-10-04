import { INFORMATION_ITEM_POOL } from '../config/study.js';

/**
 * Balanced item assignment by randomized blocks.
 *
 * A block holds each of the 18 items once, in a seeded random order. Blocks are
 * appended to a queue; each participant takes the next queued item(s). With
 * n > 1 the participant takes, in queue order, the first item whose category
 * they have not drawn yet, so their items come from different categories (and
 * are never repeated). Skipped items stay queued for the next participant, so
 * every block is fully used and category / item counts stay balanced.
 *
 * Shared by the server (central queue in data/item_assignment_state.json) and
 * the static demo build (per-participant seeded queue, no shared state).
 */

/** FNV-1a 32-bit string hash. */
export function hashString(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Seeded PRNG returning floats in [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle(items, seed) {
  const random = mulberry32(seed);
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createEmptyAssignmentState() {
  return { queue: [], blocks_created: 0, items_assigned: 0 };
}

function appendBlock(state, seed) {
  const block = state.blocks_created + 1;
  const ids = seededShuffle(
    INFORMATION_ITEM_POOL.map((item) => item.id),
    seed,
  );
  return {
    ...state,
    blocks_created: block,
    queue: [...state.queue, ...ids.map((id) => ({ id, block, seed }))],
  };
}

const CATEGORY_BY_ID = Object.fromEntries(
  INFORMATION_ITEM_POOL.map((item) => [item.id, item.category]),
);

const CATEGORY_COUNT = new Set(Object.values(CATEGORY_BY_ID)).size;

/**
 * Take `n` items with distinct categories from the queue.
 * @param {{ queue: {id: string, block: number, seed: number}[], blocks_created: number, items_assigned: number }} state
 * @param {number} n
 * @param {(blockNumber: number) => number} nextBlockSeed seed for a newly created block
 * @returns {{ picks: {id: string, block: number, seed: number}[], state: object }}
 */
export function drawItems(state, n, nextBlockSeed) {
  if (!Number.isInteger(n) || n < 1 || n > CATEGORY_COUNT) {
    throw new RangeError(`drawItems: n must be between 1 and ${CATEGORY_COUNT}`);
  }
  let working = {
    ...createEmptyAssignmentState(),
    ...state,
    queue: [...(state?.queue ?? [])].filter((entry) => CATEGORY_BY_ID[entry.id]),
  };
  const picks = [];

  while (picks.length < n) {
    const usedCategories = new Set(picks.map((p) => CATEGORY_BY_ID[p.id]));
    const index = working.queue.findIndex(
      (entry) => !usedCategories.has(CATEGORY_BY_ID[entry.id]),
    );
    if (index === -1) {
      working = appendBlock(working, nextBlockSeed(working.blocks_created + 1));
      continue;
    }
    picks.push(working.queue[index]);
    working.queue = working.queue.filter((_, i) => i !== index);
  }

  working.items_assigned += picks.length;
  return { picks, state: working };
}

/**
 * Turn queue picks into the participant's scenarios. `scenario_index` is the
 * draw slot; `scenario_order` is the presentation position, randomized with a
 * seed derived from the participant ID (reproducible).
 */
export function buildScenarioAssignments(picks, participantId, method) {
  const orderSeed = hashString(`order:${participantId}`);
  const presented = picks.length > 1 ? seededShuffle(picks, orderSeed) : picks;
  return picks.map((pick, i) => ({
    scenario_index: i + 1,
    scenario_order: presented.indexOf(pick) + 1,
    information_item_id: pick.id,
    information_category: CATEGORY_BY_ID[pick.id],
    assignment_seed: pick.seed,
    assignment_block: pick.block,
    assignment_method: method,
    order_seed: picks.length > 1 ? orderSeed : null,
  }));
}

/** Fixed salt for seeds derived from participant IDs (demo build only). */
export const DEMO_ASSIGNMENT_SALT = 'chain-privacy-items-v1';
