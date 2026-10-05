import { COMPREHENSION_QUESTIONS } from '../config/surveyQuestions.js';

/** Current answer field for a comprehension question. */
export const comprehensionField = (id) => `comprehension_${id}`;
/** First-attempt answer field (never overwritten once set). */
export const comprehensionFirstField = (id) => `comprehension_first_${id}`;

export function createEmptyComprehensionAnswers() {
  const fields = { comprehension_attempts: 0, comprehension_passed_first_try: null };
  for (const q of COMPREHENSION_QUESTIONS) {
    fields[comprehensionField(q.id)] = null;
    fields[comprehensionFirstField(q.id)] = null;
  }
  return fields;
}

export function allComprehensionAnswered(answers) {
  return COMPREHENSION_QUESTIONS.every((q) => answers[comprehensionField(q.id)] != null);
}

/** @returns ids of questions whose current answer is wrong */
export function wrongComprehensionIds(answers) {
  return COMPREHENSION_QUESTIONS.filter(
    (q) => answers[comprehensionField(q.id)] !== q.correct,
  ).map((q) => q.id);
}

/**
 * Counts a submitted attempt (all questions answered) and, on the first one,
 * stores the answers and whether they were all correct.
 */
export function recordComprehensionAttempt(session) {
  const answers = session.answers;
  if (!allComprehensionAnswered(answers)) return session;
  const attempts = answers.comprehension_attempts ?? 0;
  const next = { ...answers, comprehension_attempts: attempts + 1 };
  if (attempts === 0) {
    for (const q of COMPREHENSION_QUESTIONS) {
      next[comprehensionFirstField(q.id)] = answers[comprehensionField(q.id)];
    }
    next.comprehension_passed_first_try = wrongComprehensionIds(answers).length === 0;
  }
  return { ...session, answers: next };
}

/** Export columns: first-attempt answer and correctness per question, plus summary. */
export const COMPREHENSION_COLUMNS = [
  ...COMPREHENSION_QUESTIONS.flatMap((q) => [
    comprehensionFirstField(q.id),
    `${comprehensionFirstField(q.id)}_correct`,
  ]),
  'comprehension_attempts',
  'comprehension_passed_first_try',
];

export function comprehensionExportFields(flat) {
  const fields = {
    comprehension_attempts: flat.comprehension_attempts ?? null,
    comprehension_passed_first_try: flat.comprehension_passed_first_try ?? null,
  };
  for (const q of COMPREHENSION_QUESTIONS) {
    const first = flat[comprehensionFirstField(q.id)] ?? null;
    fields[comprehensionFirstField(q.id)] = first;
    fields[`${comprehensionFirstField(q.id)}_correct`] = first === null ? null : first === q.correct;
  }
  return fields;
}
