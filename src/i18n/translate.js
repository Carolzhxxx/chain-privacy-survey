/**
 * Bilingual text is stored as `{ en, zh }`. Plain strings pass through.
 * @param {unknown} value
 * @param {'en'|'zh'} lang
 */
export function translate(value, lang) {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    'en' in value
  ) {
    return value[lang] ?? value.en;
  }
  return value;
}
