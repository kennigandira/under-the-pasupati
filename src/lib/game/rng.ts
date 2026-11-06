// mulberry32 over a plain number held on the caller's state, so state stays
// cloneable. Integer maths only: identical in every JavaScript engine.
export function nextRandom(holder: { rng: number }): number {
  holder.rng = (holder.rng + 0x6d2b79f5) | 0;
  let t = holder.rng;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function randomInt(holder: { rng: number }, n: number): number {
  return Math.floor(nextRandom(holder) * n);
}
