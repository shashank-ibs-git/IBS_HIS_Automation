/** Utility helpers extracted from sanity.steps.js for cleanliness. */

/** Return the first non-empty value for any of the given keys from an object */
function pickFirstNonEmpty(obj, keys) {
  if (!obj || !keys) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (v != null && String(v).trim() !== '') return v;
  }
  return undefined;
}

/** Keep only digits from a localized date string; pad month/day to 2 digits. */
function normalizeDob(str) {
  return (String(str ?? '').match(/\d+/g) || [])
    .map((v, i) => (i ? v.padStart(2, '0') : v))
    .join('');
}

/** Format passenger DOB record into YYYYMMDD */
function formatDob({ y, m, d }) {
  return `${y}${String(m).padStart(2,'0')}${String(d).padStart(2,'0')}`;
}

/** Map input gender keyword to Japanese label used on page */
function toPageGender(g) {
  return g === 'male' ? '男性' : '女性';
}

module.exports = { pickFirstNonEmpty, normalizeDob, formatDob, toPageGender };