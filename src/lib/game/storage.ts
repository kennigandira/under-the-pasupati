// localStorage wrapper. Every call tolerates blocked or full storage.

const BEST = 'kolong:best';
const TRICKS = 'kolong:tricks';

export function loadBest(): number {
  try {
    const v = Number(localStorage.getItem(BEST));
    return Number.isFinite(v) && v > 0 ? Math.min(Math.floor(v), Number.MAX_SAFE_INTEGER) : 0;
  } catch {
    return 0;
  }
}

export function saveBest(score: number): void {
  try {
    localStorage.setItem(BEST, String(Math.floor(score)));
  } catch {
    // session-only best
  }
}

export function loadDiscovered(): Set<string> {
  const out = new Set<string>();
  try {
    const raw = localStorage.getItem(TRICKS);
    const list: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(list)) {
      for (const v of list) if (typeof v === 'string' && /^[AB]{1,4}$/.test(v)) out.add(v);
    }
  } catch {
    // corrupt or blocked: start empty
  }
  return out;
}

export function saveDiscovered(seqs: ReadonlySet<string>): void {
  try {
    localStorage.setItem(TRICKS, JSON.stringify([...seqs]));
  } catch {
    // session-only trick book
  }
}
