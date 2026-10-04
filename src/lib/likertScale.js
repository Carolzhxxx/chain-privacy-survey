/** Normalize 1–7 Likert to [0, 1]. */
export function normalizeLikert(raw) {
  if (!Number.isInteger(raw) || raw < 1 || raw > 7) return null;
  return (raw - 1) / 6;
}
