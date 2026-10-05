import { INCLUDE_REASONING_PROBES, SCENARIOS_PER_PARTICIPANT } from './study.js';

/**
 * One block of screens per scenario (r1_*, r2_*, … in presentation order).
 * The B / C / D relationship pages come once, after the first scenario's
 * sensitivity rating; every scenario uses the same relationship structure.
 */

/** Scenario steps in display order. `probe` steps are hidden when INCLUDE_REASONING_PROBES is off. */
export const ROUND_STEPS = [
  { step: 'info', label: { en: 'The information', zh: '信息内容' } },
  { step: 'sensitivity', label: { en: 'Sensitivity', zh: '信息敏感度' } },
  { step: 'hop1', label: { en: 'B knows', zh: 'B 知情' } },
  { step: 'hop2', label: { en: 'C knows', zh: 'C 知情' } },
  { step: 'hop2_reason', label: { en: 'Your reason (C)', zh: '评分理由（C）' }, probe: true },
  { step: 'bc_compare', label: { en: 'B vs. C', zh: 'B 与 C 比较' }, probe: true },
  { step: 'hop3', label: { en: 'D knows', zh: 'D 知情' } },
  { step: 'hop3_reason', label: { en: 'Your reason (D)', zh: '评分理由（D）' }, probe: true },
  { step: 'cd_compare', label: { en: 'C vs. D', zh: 'C 与 D 比较' }, probe: true },
  { step: 'judgment_factors', label: { en: 'Factors', zh: '判断因素' }, probe: true },
  { step: 'judgment_basis', label: { en: 'Main basis', zh: '主要判断依据' }, probe: true },
  { step: 'realism', label: { en: 'Realism', zh: '情境真实感' } },
];

const PERSON_SCREENS = [
  { id: 'person_b', label: { en: 'Person B', zh: '人物 B' } },
  { id: 'person_c', label: { en: 'Person C', zh: '人物 C' } },
  { id: 'person_d', label: { en: 'Person D', zh: '人物 D' } },
];

function scenarioScreens(n) {
  const prefix =
    SCENARIOS_PER_PARTICIPANT > 1
      ? { en: `Scenario ${n} of ${SCENARIOS_PER_PARTICIPANT} · `, zh: `情境 ${n} / ${SCENARIOS_PER_PARTICIPANT} · ` }
      : { en: '', zh: '' };
  const screens = [];
  for (const s of ROUND_STEPS) {
    if (s.probe && !INCLUDE_REASONING_PROBES) continue;
    screens.push({
      id: `r${n}_${s.step}`,
      label: { en: prefix.en + s.label.en, zh: prefix.zh + s.label.zh },
    });
    if (n === 1 && s.step === 'sensitivity') screens.push(...PERSON_SCREENS);
  }
  return screens;
}

/** @type {{ id: string, label: { en: string, zh: string }, index: number }[]} */
export const SCREENS = [
  { id: 'consent', label: { en: 'Consent', zh: '知情同意' } },
  { id: 'baseline', label: { en: 'Privacy attitudes', zh: '一般隐私倾向' } },
  { id: 'chain_intro', label: { en: 'Background and roles', zh: '实验背景与角色' } },
  { id: 'comprehension', label: { en: 'Comprehension check', zh: '理解检查' } },
  ...Array.from({ length: SCENARIOS_PER_PARTICIPANT }, (_, i) => scenarioScreens(i + 1)).flat(),
  { id: 'completion', label: { en: 'Done', zh: '完成' } },
].map((screen, index) => ({ ...screen, index }));

export const SCREEN_IDS = SCREENS.map((s) => s.id);

/** The last question screen; its Next button submits. */
export const SUBMIT_SCREEN_ID = `r${SCENARIOS_PER_PARTICIPANT}_realism`;

export function getScreenMeta(screenId) {
  return SCREENS.find((s) => s.id === screenId) ?? SCREENS[0];
}

export function getProgress(screenId) {
  const meta = getScreenMeta(screenId);
  return ((meta.index + 1) / SCREENS.length) * 100;
}

/** @returns {number|null} scenario presentation position */
export function getRoundNumber(screenId) {
  const match = String(screenId).match(/^r(\d+)_/);
  return match ? Number(match[1]) : null;
}

/** @returns {string|null} e.g. 'info', 'hop2', 'hop2_reason' */
export function getRoundStep(screenId) {
  const match = String(screenId).match(/^r\d+_(.+)$/);
  return match ? match[1] : null;
}
