import { INFORMATION_ITEM_POOL, RELATION_LEVEL_IDS, RELATIONSHIP_FACTORS } from '../config/study.js';

/**
 * Completion-balanced assignment (server). A new participant gets, for every
 * relationship factor, the level held by the fewest counted participants, and
 * for every information category, the item held by the fewest; ties are broken
 * at random.
 *
 * Counted: completed sessions, plus unfinished ones active within
 * ACTIVE_WINDOW_MS (last page visit, or the assignment time before any draft
 * is saved), so that participants answering at the same time are spread out.
 * Unfinished sessions inactive for longer are treated as dropouts and no
 * longer counted.
 */
export const ACTIVE_WINDOW_MS = 20 * 60 * 1000;

function lastActivity(assignment, session) {
  const times = [
    assignment?.assigned_at,
    ...Object.values(session?.screen_start_times ?? {}),
    ...Object.values(session?.screen_end_times ?? {}),
  ]
    .map((value) => Date.parse(value ?? ''))
    .filter(Number.isFinite);
  return times.length ? Math.max(...times) : NaN;
}

/**
 * @param {{ assignment: object, session: object | null }[]} entries
 * @param {number} now ms since epoch
 */
export function countAssignments(entries, now) {
  const relationship = Object.fromEntries(
    RELATIONSHIP_FACTORS.map((f) => [f.key, Object.fromEntries(RELATION_LEVEL_IDS.map((l) => [l, 0]))]),
  );
  const items = Object.fromEntries(INFORMATION_ITEM_POOL.map((item) => [item.id, 0]));

  for (const { assignment, session } of entries) {
    const completed = session?.status === 'completed';
    const active = now - lastActivity(assignment, session) < ACTIVE_WINDOW_MS;
    if (!completed && !active) continue;

    for (const f of RELATIONSHIP_FACTORS) {
      const level = assignment?.relationship?.[f.field];
      if (level in relationship[f.key]) relationship[f.key][level] += 1;
    }
    for (const scenario of assignment?.scenarios ?? []) {
      if (scenario.information_item_id in items) items[scenario.information_item_id] += 1;
    }
  }
  return { relationship, items };
}

/** @param {(max: number) => number} randomInt uniform integer in [0, max) */
function pickLeast(options, countOf, randomInt) {
  const min = Math.min(...options.map(countOf));
  const tied = options.filter((option) => countOf(option) === min);
  return tied[randomInt(tied.length)];
}

/** Picks in the shape buildRelationshipAssignment expects. */
export function pickBalancedRelationship(counts, randomInt) {
  return Object.fromEntries(
    RELATIONSHIP_FACTORS.map((f) => [
      f.key,
      {
        level: pickLeast(RELATION_LEVEL_IDS, (l) => counts.relationship[f.key][l], randomInt),
        block: null,
        seed: null,
      },
    ]),
  );
}

/** One item per category, in the shape buildScenarioAssignments expects. */
export function pickBalancedItems(counts, randomInt) {
  const categories = [...new Set(INFORMATION_ITEM_POOL.map((item) => item.category))];
  return categories.map((category) => {
    const ids = INFORMATION_ITEM_POOL.filter((item) => item.category === category).map((item) => item.id);
    return { id: pickLeast(ids, (id) => counts.items[id], randomInt), block: null, seed: null };
  });
}
