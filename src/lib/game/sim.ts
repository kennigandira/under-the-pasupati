// Pure fixed-step simulation. One call to step() is one tick (1/60 s).
// No DOM, no clock, no Math.random: only + - * / and Math.sqrt, plus a seeded
// RNG, so a (seed, input log) pair replays to the same state.

import {
  APEX,
  BAIL_WINDOW,
  BOWL_BOOST,
  BUFFER_TICKS,
  CAP_SPEED,
  COMBO_GAP,
  COYOTE_TICKS,
  DIST_POINTS_PER_PX,
  DROP_STICK,
  FIRST_CHUNK_X,
  FOOT_HALF,
  GRAVITY,
  GRIND_POINTS_PER_TICK,
  GRIND_STYLE_MUL,
  GROUND_Y,
  LEVEL_HIGH_TICKS,
  LEVEL_MID_TICKS,
  MAX_LAUNCH_VY,
  MULT_CAP,
  NOLLIE_APEX,
  NOLLIE_TRICK_MUL,
  PLAYER_X,
  PUDDLE_SLOW,
  REPEAT_TRICK_MUL,
  RIDE_POP_BONUS,
  SKETCHY_MUL,
  SNAP_BAND,
  SPAWN_MARGIN,
  SPEED_PER_PX,
  START_SPEED,
  TAP_MAX,
  WALL_RISE,
} from './consts.ts';
import {
  CHUNKS,
  GRINDABLE,
  clearPoints,
  createObstacle,
  minGap,
  tierFor,
  type Chunk,
  type Kind,
  type Ob,
} from './chunks.ts';
import { randomInt } from './rng.ts';
import { animTicks, recognise, type Trick } from './tricks.ts';

export type Btn = 'A' | 'B';

export interface InputEvent {
  btn: Btn;
  down: boolean;
}

export interface Player {
  y: number;
  vy: number;
  air: boolean;
  airTicks: number;
  rideVy: number;
  crouchBtn: Btn | null;
  crouchTicks: number;
  popped: boolean;
  nollie: boolean;
  held: [boolean, boolean];
  pressTick: [number, number];
  buffer: string;
  lastTapTick: number;
  trickSeq: string | null;
  trickStartTick: number;
  trickDoneTick: number;
  supportId: number;
  supportKind: Kind | 'ground';
  grinding: boolean;
  fromProfile: boolean;
  overIds: number[];
}

export interface TrickResult {
  name: string;
  seq: string;
  points: number;
  quality: 'clean' | 'sketchy';
  tick: number;
}

export interface GameState {
  tick: number;
  seed: number;
  rng: number;
  scroll: number;
  speed: number;
  speedOverride: number;
  autoSpawn: boolean;
  nextChunkX: number;
  lastChunkId: string;
  nextId: number;
  obs: Ob[];
  p: Player;
  score: number;
  mult: number;
  recent: string[];
  dead: boolean;
  deadReason: '' | 'crash' | 'bail';
  deadTick: number;
  lastTrick: TrickResult | null;
  fresh: string[];
  clears: number;
}

export interface CreateOptions {
  speedOverride?: number;
  autoSpawn?: boolean;
}

export function createState(seed: number, opts: CreateOptions = {}): GameState {
  return {
    tick: 0,
    seed,
    rng: seed | 0,
    scroll: 0,
    speed: START_SPEED,
    speedOverride: opts.speedOverride ?? 0,
    autoSpawn: opts.autoSpawn ?? true,
    nextChunkX: FIRST_CHUNK_X,
    lastChunkId: '',
    nextId: 1,
    obs: [],
    p: {
      y: GROUND_Y,
      vy: 0,
      air: false,
      airTicks: 0,
      rideVy: 0,
      crouchBtn: null,
      crouchTicks: 0,
      popped: false,
      nollie: false,
      held: [false, false],
      pressTick: [-9999, -9999],
      buffer: '',
      lastTapTick: -9999,
      trickSeq: null,
      trickStartTick: 0,
      trickDoneTick: 0,
      supportId: 0,
      supportKind: 'ground',
      grinding: false,
      fromProfile: false,
      overIds: [],
    },
    score: 0,
    mult: 1,
    recent: [],
    dead: false,
    deadReason: '',
    deadTick: 0,
    lastTrick: null,
    fresh: [],
    clears: 0,
  };
}

export function baseSpeed(scroll: number): number {
  return Math.min(CAP_SPEED, START_SPEED + SPEED_PER_PX * scroll);
}

export function playerWorldX(s: GameState): number {
  return s.scroll + PLAYER_X;
}

// Places a chunk's pieces with the chunk's left edge at world x.
export function placeChunk(s: GameState, c: Chunk, x: number): void {
  for (const piece of c.pieces) {
    s.obs.push(createObstacle(s.nextId++, piece.kind, x + piece.x, piece.n ?? 0));
  }
}

function spawn(s: GameState): void {
  const tier = tierFor(s.scroll);
  let count = 0;
  for (const c of CHUNKS) if (c.tier <= tier && c.id !== s.lastChunkId) count++;
  let pick = randomInt(s, count);
  let chosen = CHUNKS[0];
  for (const c of CHUNKS) {
    if (c.tier > tier || c.id === s.lastChunkId) continue;
    if (pick === 0) {
      chosen = c;
      break;
    }
    pick--;
  }
  const start = s.nextChunkX;
  placeChunk(s, chosen, start);
  s.lastChunkId = chosen.id;
  const gap = minGap(baseSpeed(s.scroll) * 1.05, chosen.airTicks) + randomInt(s, 25);
  s.nextChunkX = start + chosen.width + gap;
}

interface Surf {
  y: number;
  tol: number;
  ob: Ob | null;
}
const SURF: Surf = { y: GROUND_Y, tol: SNAP_BAND, ob: null };

// Highest standable surface under the player at world x. Returns a shared
// object: read it before calling again.
function surfaceAt(obs: Ob[], wx: number): Surf {
  let y = GROUND_Y;
  let tol = SNAP_BAND;
  let hit: Ob | null = null;
  for (let i = 0; i < obs.length; i++) {
    const o = obs[i];
    if (o.prof && wx >= o.x && wx < o.x + o.prof.length) {
      y = GROUND_Y - o.prof[Math.floor(wx - o.x)];
      tol = WALL_RISE;
      hit = o;
      break;
    }
  }
  for (let i = 0; i < obs.length; i++) {
    const o = obs[i];
    if (o.prof || o.h <= 0) continue;
    if (wx + FOOT_HALF > o.x && wx - FOOT_HALF < o.x + o.w) {
      const top = GROUND_Y - o.h;
      if (top < y) {
        y = top;
        tol = SNAP_BAND;
        hit = o;
      }
    }
  }
  SURF.y = y;
  SURF.tol = tol;
  SURF.ob = hit;
  return SURF;
}

function die(s: GameState, reason: 'crash' | 'bail'): void {
  s.dead = true;
  s.deadReason = reason;
  s.deadTick = s.tick;
  s.p.crouchBtn = null;
}

function resetAir(p: Player): void {
  p.buffer = '';
  p.trickSeq = null;
  p.overIds.length = 0;
  p.nollie = false;
  p.popped = false;
  p.fromProfile = false;
  p.lastTapTick = -9999;
}

function popLevel(ticks: number): number {
  if (ticks >= LEVEL_HIGH_TICKS) return 2;
  if (ticks >= LEVEL_MID_TICKS) return 1;
  return 0;
}

function pop(s: GameState, btn: Btn): void {
  const p = s.p;
  let apex = APEX[popLevel(p.crouchTicks)];
  if (btn === 'B') apex *= NOLLIE_APEX;
  let vy = -Math.sqrt(2 * GRAVITY * apex);
  const wasAir = p.air;
  if (!wasAir && p.rideVy < 0) vy = Math.max(MAX_LAUNCH_VY, vy + p.rideVy * RIDE_POP_BONUS);
  const fromProfile = !wasAir && p.supportKind !== 'ground' && !GRINDABLE.has(p.supportKind as Kind);
  p.air = true;
  p.airTicks = 0;
  p.vy = vy;
  p.crouchBtn = null;
  p.crouchTicks = 0;
  p.grinding = false;
  if (!wasAir) {
    resetAir(p);
    p.fromProfile = fromProfile;
  }
  p.popped = true;
  p.nollie = btn === 'B';
}

function handleInput(s: GameState, events: readonly InputEvent[]): void {
  const p = s.p;
  for (let k = 0; k < events.length; k++) {
    const e = events[k];
    const i = e.btn === 'A' ? 0 : 1;
    if (e.down) {
      p.held[i] = true;
      p.pressTick[i] = s.tick;
      if (!p.air && p.crouchBtn === null) {
        p.crouchBtn = e.btn;
        p.crouchTicks = 0;
      }
      continue;
    }
    const wasHeld = p.held[i];
    p.held[i] = false;
    if (!p.air) {
      if (p.crouchBtn === e.btn) pop(s, e.btn);
    } else if (p.crouchBtn === e.btn && !p.popped && p.airTicks <= COYOTE_TICKS) {
      pop(s, e.btn);
    } else if (
      wasHeld &&
      s.tick - p.pressTick[i] <= TAP_MAX &&
      p.trickSeq === null &&
      p.buffer.length < 4
    ) {
      p.buffer += e.btn;
      p.lastTapTick = s.tick;
    }
  }
}

function score(s: GameState, trick: Trick, quality: 'clean' | 'sketchy', onGrind: boolean): void {
  const p = s.p;
  let bonus = 1 + 0.25 * Math.min(4, p.overIds.length);
  if (p.fromProfile) bonus += 0.25;
  if (onGrind) bonus += 0.5;
  let pts = trick.base * bonus * s.mult;
  if (s.recent.includes(trick.seq)) pts *= REPEAT_TRICK_MUL;
  if (p.nollie) pts *= NOLLIE_TRICK_MUL;
  if (quality === 'sketchy') pts *= SKETCHY_MUL;
  pts = Math.round(pts);
  s.score += pts;
  if (quality === 'clean') s.mult = Math.min(MULT_CAP, s.mult + 1);
  s.recent.push(trick.seq);
  if (s.recent.length > 3) s.recent.shift();
  s.lastTrick = { name: trick.name, seq: trick.seq, points: pts, quality, tick: s.tick };
  if (!s.fresh.includes(trick.seq)) s.fresh.push(trick.seq);
}

function land(s: GameState, surf: Surf): void {
  const p = s.p;
  const ob = surf.ob;
  let quality: 'clean' | 'sketchy' | 'bail' | null = null;
  if (p.trickSeq !== null) {
    if (p.trickDoneTick <= s.tick) quality = 'clean';
    else if (p.trickDoneTick <= s.tick + BAIL_WINDOW) quality = 'sketchy';
    else quality = 'bail';
  } else if (p.buffer.length > 0) {
    quality = 'bail';
  }
  p.air = false;
  p.vy = 0;
  p.y = surf.y;
  p.rideVy = 0;
  p.airTicks = 0;
  p.supportId = ob ? ob.id : 0;
  p.supportKind = ob ? ob.kind : 'ground';
  if (ob) ob.touched = true;
  if (quality === 'bail') {
    die(s, 'bail');
    return;
  }
  if (quality !== null && p.trickSeq !== null) {
    const trick = recognise(p.trickSeq);
    if (trick) score(s, trick, quality, ob !== null && GRINDABLE.has(ob.kind));
  }
  resetAir(p);
  for (let i = 0; i < 2; i++) {
    if (p.held[i] && p.crouchBtn === null && s.tick - p.pressTick[i] <= BUFFER_TICKS) {
      p.crouchBtn = i === 0 ? 'A' : 'B';
      p.crouchTicks = s.tick - p.pressTick[i];
    }
  }
}

function leaveSurface(s: GameState): void {
  const p = s.p;
  const fromProfile = p.supportKind !== 'ground' && !GRINDABLE.has(p.supportKind as Kind);
  p.air = true;
  p.airTicks = 0;
  p.vy = Math.max(MAX_LAUNCH_VY, Math.min(3, p.rideVy));
  p.grinding = false;
  resetAir(p);
  p.fromProfile = fromProfile && p.rideVy < 0;
}

function commitTrick(s: GameState): void {
  const p = s.p;
  const trick = recognise(p.buffer);
  if (!trick) return;
  p.trickSeq = trick.seq;
  p.trickStartTick = s.tick;
  p.trickDoneTick = s.tick + animTicks(trick.seq.length);
}

function speedFor(s: GameState, wx: number): number {
  if (s.speedOverride > 0) return s.speedOverride;
  let sp = baseSpeed(s.scroll);
  for (let i = 0; i < s.obs.length; i++) {
    const o = s.obs[i];
    if (o.kind === 'puddle' && wx > o.x && wx < o.x + o.w && !s.p.air) sp *= PUDDLE_SLOW;
  }
  if (s.p.supportKind === 'bowl' && s.p.y > GROUND_Y) {
    sp *= 1 + BOWL_BOOST * Math.min(1, (s.p.y - GROUND_Y) / 14);
  }
  return sp;
}

const NO_EVENTS: readonly InputEvent[] = [];

export function step(s: GameState, events: readonly InputEvent[] = NO_EVENTS): void {
  s.tick++;
  if (s.dead) return;
  const p = s.p;

  handleInput(s, events);
  if (p.crouchBtn !== null && !p.air) p.crouchTicks++;

  while (s.autoSpawn && s.nextChunkX < s.scroll + 176 + SPAWN_MARGIN) spawn(s);

  const wx0 = s.scroll + PLAYER_X;
  s.speed = speedFor(s, wx0);
  s.scroll += s.speed;
  s.score += s.speed * DIST_POINTS_PER_PX;
  const wx = s.scroll + PLAYER_X;

  if (!p.air) {
    const surf = surfaceAt(s.obs, wx);
    const rise = p.y - surf.y;
    if (rise > surf.tol) {
      die(s, 'crash');
      return;
    }
    if (-rise > DROP_STICK) {
      leaveSurface(s);
    } else {
      p.rideVy = surf.y - p.y;
      p.y = surf.y;
      p.supportId = surf.ob ? surf.ob.id : 0;
      p.supportKind = surf.ob ? surf.ob.kind : 'ground';
      if (surf.ob) surf.ob.touched = true;
      p.grinding = surf.ob !== null && GRINDABLE.has(surf.ob.kind);
      if (p.grinding) {
        s.score += GRIND_POINTS_PER_TICK * (p.crouchBtn !== null ? GRIND_STYLE_MUL : 1);
      }
    }
  }

  if (p.air) {
    p.airTicks++;
    if (p.crouchBtn !== null && !p.popped && p.airTicks > COYOTE_TICKS) p.crouchBtn = null;
    p.vy += GRAVITY;
    const ny = p.y + p.vy;
    const surf = surfaceAt(s.obs, wx);
    if (ny >= surf.y && p.vy >= 0) {
      if (p.y <= surf.y + surf.tol) land(s, surf);
      else die(s, 'crash');
    } else {
      p.y = ny;
    }
    if (!s.dead && p.air) {
      for (let i = 0; i < s.obs.length; i++) {
        const o = s.obs[i];
        if (wx > o.x && wx < o.x + o.w && o.kind !== 'puddle' && !p.overIds.includes(o.id)) {
          p.overIds.push(o.id);
        }
      }
      if (p.trickSeq === null && p.buffer.length > 0) {
        const pressing =
          (p.held[0] && s.tick - p.pressTick[0] <= TAP_MAX) ||
          (p.held[1] && s.tick - p.pressTick[1] <= TAP_MAX);
        if (!pressing && (s.tick - p.lastTapTick >= COMBO_GAP || p.buffer.length >= 4)) {
          commitTrick(s);
        }
      }
    }
  }
  if (s.dead) return;

  let w = 0;
  for (let i = 0; i < s.obs.length; i++) {
    const o = s.obs[i];
    if (!o.done && o.x + o.w < wx - 8) {
      o.done = true;
      s.clears++;
      if (!o.touched) s.score += clearPoints(o);
    }
    if (o.x + o.w >= s.scroll - 20) s.obs[w++] = o;
  }
  s.obs.length = w;
}
