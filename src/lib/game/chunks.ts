// Obstacles, authored chunks ("lines") and the spacing rule that keeps every
// chunk survivable with a plain ollie. Pure data and functions, no DOM.

import { REACT_TICKS, T_LOW, TIER_START } from './consts.ts';

export type Kind =
  | 'box'
  | 'crate'
  | 'block'
  | 'ledge'
  | 'rail'
  | 'stairs'
  | 'kicker'
  | 'bank'
  | 'pyramid'
  | 'quarter'
  | 'bowl'
  | 'puddle';

// Rect obstacles are solid with a standable top. Profile obstacles carry a
// height table (px above ground, negative = below) indexed by integer x.
export interface Ob {
  id: number;
  kind: Kind;
  x: number;
  w: number;
  h: number;
  prof: number[] | null;
  n: number;
  touched: boolean;
  done: boolean;
}

export const GRINDABLE: ReadonlySet<Kind> = new Set<Kind>(['ledge', 'rail']);
export const PROFILE_KINDS: ReadonlySet<Kind> = new Set<Kind>([
  'stairs',
  'kicker',
  'bank',
  'pyramid',
  'quarter',
  'bowl',
]);

const RECTS: Partial<Record<Kind, { w: number; h: number }>> = {
  box: { w: 10, h: 8 },
  crate: { w: 12, h: 14 },
  block: { w: 16, h: 18 },
  ledge: { w: 44, h: 10 },
  rail: { w: 44, h: 11 },
};

function linear(w: number, h: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < w; i++) out.push(Math.round((h * i) / (w - 1)));
  return out;
}

// Quarter-pipe transition: flat at the start, steep at the lip. Uses sqrt only.
function arc(radius: number, tMax: number, base: number): number[] {
  const w = Math.floor(radius * tMax);
  const out: number[] = [];
  for (let i = 0; i < w; i++) {
    const t = i / radius;
    out.push(base + Math.round(radius * (1 - Math.sqrt(1 - t * t))));
  }
  return out;
}

function fill(len: number, v: number): number[] {
  return new Array<number>(len).fill(v);
}

const profileCache = new Map<string, number[]>();

function buildProfile(kind: Kind, n: number): number[] {
  const key = `${kind}:${n}`;
  const hit = profileCache.get(key);
  if (hit) return hit;
  let p: number[];
  switch (kind) {
    case 'kicker':
      p = linear(20, 15);
      break;
    case 'bank':
      p = linear(26, 10);
      break;
    case 'pyramid':
      p = [...linear(20, 8), ...fill(24, 8), ...linear(20, 8).reverse()];
      break;
    case 'quarter':
      p = arc(48, 0.88, 0);
      break;
    case 'bowl': {
      // Ride up onto the deck, drop in, cross the floor, climb the far wall.
      const dropIn = arc(36, 0.9, 0).reverse();
      const deckH = dropIn[0];
      p = [
        ...linear(34, deckH),
        ...fill(18, deckH),
        ...dropIn,
        ...fill(14, 0),
        ...arc(48, 0.88, 0),
      ];
      break;
    }
    case 'stairs': {
      // Ride up a ramp onto a deck, then n steps of 6 px back down to the flat.
      const top = 6 * n;
      p = [...linear(Math.round(top / 0.6), top), ...fill(20, top)];
      for (let s = 1; s <= n; s++) for (let i = 0; i < 10; i++) p.push(6 * (n - s));
      break;
    }
    default:
      throw new Error(`no profile for ${kind}`);
  }
  profileCache.set(key, p);
  return p;
}

export function createObstacle(id: number, kind: Kind, x: number, n = 0): Ob {
  const rect = RECTS[kind];
  if (rect) return { id, kind, x, w: rect.w, h: rect.h, prof: null, n, touched: false, done: false };
  if (kind === 'puddle') return { id, kind, x, w: 18, h: 0, prof: null, n, touched: false, done: false };
  const prof = buildProfile(kind, n);
  return { id, kind, x, w: prof.length, h: 0, prof, n, touched: false, done: false };
}

export function obstacleWidth(kind: Kind, n = 0): number {
  return createObstacle(0, kind, 0, n).w;
}

// Points for passing an obstacle without ever touching it.
export function clearPoints(ob: Ob): number {
  switch (ob.kind) {
    case 'box': return 10;
    case 'crate': return 15;
    case 'block': return 25;
    case 'ledge': return 20;
    case 'rail': return 25;
    case 'puddle': return 5;
    default: return 0;
  }
}

export interface Piece {
  kind: Kind;
  x: number;
  n?: number;
}

export interface Chunk {
  id: string;
  tier: 0 | 1 | 2 | 3;
  width: number;
  // Worst-case airtime in ticks after the chunk's last piece. Verified in chunks.test.ts.
  airTicks: number;
  pieces: readonly Piece[];
}

function chunk(id: string, tier: Chunk['tier'], airTicks: number, pieces: Piece[]): Chunk {
  let width = 0;
  for (const p of pieces) width = Math.max(width, p.x + obstacleWidth(p.kind, p.n ?? 0));
  return { id, tier, width, airTicks, pieces };
}

// Gap between pieces of one line: long enough for the largest launch plus
// reaction time at the speed cap.
const LINE = 260;

export const CHUNKS: readonly Chunk[] = [
  chunk('box', 0, 34, [{ kind: 'box', x: 0 }]),
  chunk('puddle', 0, 34, [{ kind: 'puddle', x: 0 }]),
  chunk('ledge', 0, 34, [{ kind: 'ledge', x: 0 }]),

  chunk('crate', 1, 34, [{ kind: 'crate', x: 0 }]),
  chunk('rail', 1, 34, [{ kind: 'rail', x: 0 }]),
  chunk('bank', 1, 80, [{ kind: 'bank', x: 0 }]),
  chunk('kicker', 1, 80, [{ kind: 'kicker', x: 0 }]),
  chunk('stairs3', 1, 82, [{ kind: 'stairs', x: 0, n: 3 }]),

  chunk('block', 2, 34, [{ kind: 'block', x: 0 }]),
  chunk('stairs4', 2, 85, [{ kind: 'stairs', x: 0, n: 4 }]),
  chunk('stairs5', 2, 88, [{ kind: 'stairs', x: 0, n: 5 }]),
  chunk('pyramid', 2, 78, [{ kind: 'pyramid', x: 0 }]),
  chunk('quarter', 2, 85, [{ kind: 'quarter', x: 0 }]),

  chunk('bowl', 3, 85, [{ kind: 'bowl', x: 0 }]),
  chunk('line-ledge-rail', 3, 34, [
    { kind: 'ledge', x: 0 },
    { kind: 'rail', x: 44 + LINE },
  ]),
  chunk('line-kicker-box', 3, 34, [
    { kind: 'kicker', x: 0 },
    { kind: 'box', x: 20 + LINE },
  ]),
  chunk('line-stairs-rail', 3, 34, [
    { kind: 'stairs', x: 0, n: 3 },
    { kind: 'rail', x: 44 + LINE },
  ]),
];

export function tierFor(scroll: number): 0 | 1 | 2 | 3 {
  if (scroll >= TIER_START[3]) return 3;
  if (scroll >= TIER_START[2]) return 2;
  if (scroll >= TIER_START[1]) return 1;
  return 0;
}

// Smallest gap (px) after a chunk so the player can land and react.
export function minGap(speed: number, airTicks: number): number {
  return Math.ceil(speed * (Math.max(T_LOW, airTicks) + REACT_TICKS));
}
