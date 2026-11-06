// Trick table and recogniser. A sequence is 1 to 4 air taps of A and B.
// spin: half-turns of the board flat (shove-it). flip: full turns around the
// long axis. dir -1 reverses the flip so the colour reveals the other way.
// loop: the board wraps end over end. body: the skater turns around mid-air.

export interface Trick {
  seq: string;
  name: string;
  base: number;
  spin: number;
  flip: number;
  dir: 1 | -1;
  loop: boolean;
  body: boolean;
}

const t = (
  seq: string,
  name: string,
  base: number,
  spin: number,
  flip: number,
  extra: Partial<Pick<Trick, 'dir' | 'loop' | 'body'>> = {},
): Trick => ({
  seq,
  name,
  base,
  spin,
  flip,
  dir: extra.dir ?? 1,
  loop: extra.loop ?? false,
  body: extra.body ?? false,
});

export const TRICKS: readonly Trick[] = [
  t('A', 'Pop shove-it', 100, 1, 0),
  t('B', 'Kickflip', 150, 0, 1),
  t('AA', '360 shove-it', 200, 2, 0),
  t('BB', 'Double kickflip', 300, 0, 2),
  t('AB', 'Varial kickflip', 250, 1, 1),
  t('BA', 'Hardflip', 250, 1, 1, { dir: -1 }),
  t('AAB', '360 flip', 400, 2, 1),
  t('ABA', 'Impossible', 350, 0, 0, { loop: true }),
  t('BAB', 'Bigspin flip', 400, 1, 1, { body: true }),
  t('BBB', 'Triple kickflip', 500, 0, 3),
  t('BBBA', 'Triple flip shove-it', 700, 1, 3),
  t('AAAB', '540 flip', 650, 3, 1),
];

const BY_SEQ = new Map<string, Trick>(TRICKS.map((tr) => [tr.seq, tr]));

export const MAX_SEQ = 4;

// Longest known prefix of the buffer; extra taps are dropped.
export function recognise(buffer: string): Trick | null {
  for (let n = Math.min(buffer.length, MAX_SEQ); n >= 1; n--) {
    const hit = BY_SEQ.get(buffer.slice(0, n));
    if (hit) return hit;
  }
  return null;
}

// Animation length for a trick of n taps. A floor for tuning: never shortened
// to make a trick fit the air time (docs/trd-kolong-run.md, OQ2).
export function animTicks(n: number): number {
  return 12 + 4 * n;
}
