/**
 * Academic semesters.
 *   Semester 1 — February to July (same calendar year)
 *   Semester 2 — August to January (crosses into the next calendar year)
 *
 * Ranges are inclusive 'YYYY-MM-DD' strings, matching the API's date filters.
 */

const pad = n => String(n).padStart(2, '0');
const key = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

/** Last day of a month, honouring leap years. */
const lastDay = (y, m) => new Date(y, m, 0).getDate();

export function semester1(year) {
  return {
    id: `s1-${year}`,
    kind: 1,
    year,
    name: `Semester 1 ${year}`,
    short: `S1 ${year}`,
    hint: 'Feb – Jul',
    from: key(year, 2, 1),
    to: key(year, 7, 31),
  };
}

export function semester2(year) {
  return {
    id: `s2-${year}`,
    kind: 2,
    year,
    name: `Semester 2 ${year}`,
    short: `S2 ${year}`,
    hint: 'Aug – Jan',
    from: key(year, 8, 1),
    to: key(year + 1, 1, lastDay(year + 1, 1)),
  };
}

/** Which semester a given 'YYYY-MM-DD' falls into. */
export function semesterOf(dateKey) {
  if (!dateKey) return null;
  const [y, m] = dateKey.split('-').map(Number);
  if (m >= 2 && m <= 7) return semester1(y);
  if (m >= 8) return semester2(y);
  return semester2(y - 1); // January belongs to the previous year's S2
}

/**
 * Every semester that overlaps the data range, newest first.
 * Falls back to the current semester when there is no data yet.
 */
export function semestersInRange(minKey, maxKey) {
  if (!minKey || !maxKey) {
    const now = new Date();
    return [semesterOf(key(now.getFullYear(), now.getMonth() + 1, now.getDate()))];
  }

  const out = [];
  const seen = new Set();
  let cursor = semesterOf(minKey);
  const guard = 40;

  for (let i = 0; i < guard; i++) {
    if (!cursor || seen.has(cursor.id)) break;
    seen.add(cursor.id);
    out.push(cursor);
    if (cursor.from > maxKey) break;
    cursor = cursor.kind === 1 ? semester2(cursor.year) : semester1(cursor.year + 1);
  }

  /* Keep semesters the data meaningfully covers.
   *
   * Overlap is measured in days rather than asking the semester to start
   * inside the window: data beginning mid-February still belongs to that
   * semester. A tail-end sliver — e.g. the previous year's S2 when the data
   * starts in late January — is only a handful of days and makes a
   * misleading shortcut, so it is dropped. */
  const MIN_OVERLAP_DAYS = 30;
  const days = (a, b) => {
    const [ay, am, ad] = a.split('-').map(Number);
    const [by, bm, bd] = b.split('-').map(Number);
    return Math.round((new Date(by, bm - 1, bd) - new Date(ay, am - 1, ad)) / 86400000) + 1;
  };

  const overlapping = out.filter(s => s.from <= maxKey && s.to >= minKey);
  const covered = overlapping.filter(s => {
    const lo = s.from > minKey ? s.from : minKey;
    const hi = s.to < maxKey ? s.to : maxKey;
    return days(lo, hi) >= MIN_OVERLAP_DAYS;
  });

  // Never show an empty set.
  return (covered.length ? covered : overlapping).reverse();
}

/** The semester matching an exact from/to pair, if any. */
export function matchSemester(from, to, list) {
  return list.find(s => s.from === from && s.to === to) || null;
}
