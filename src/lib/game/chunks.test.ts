import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CAP_SPEED, TIER_START } from './consts.ts';
import { CHUNKS, type Chunk } from './chunks.ts';
import {
  baseSpeed,
  createState,
  placeChunk,
  playerWorldX,
  step,
  type Btn,
  type GameState,
  type InputEvent,
} from './sim.ts';

type Plan = InputEvent[][];

function chunkEnd(c: Chunk, x: number): number {
  return x + c.width;
}

// Ticks until the first not-yet-passed obstacle is behind the player, plus
// landing slack.
function horizon(s: GameState, speed: number, airTicks: number): number {
  const wx = playerWorldX(s);
  let end = wx;
  let nearest = Infinity;
  for (const o of s.obs) if (o.x + o.w > wx - 8) nearest = Math.min(nearest, o.x + o.w);
  if (nearest !== Infinity) end = nearest;
  return Math.ceil((end + 10 - wx) / speed) + airTicks + 20;
}

function survives(s: GameState, plan: Plan, h: number): boolean {
  const c = structuredClone(s);
  for (let t = 0; t < h; t++) {
    step(c, plan[t] ?? []);
    if (c.dead) return false;
  }
  return true;
}

// The bot only ever pops with A and never taps in the air: a plain ollie.
function search(s: GameState, h: number): Plan | null {
  const holds = [2, 10, 18];
  for (let d = 0; d <= h; d++) {
    for (const hold of holds) {
      const plan: Plan = [];
      for (let t = 0; t <= d + hold; t++) plan.push([]);
      plan[d].push({ btn: 'A' as Btn, down: true });
      plan[d + hold].push({ btn: 'A' as Btn, down: false });
      if (survives(s, plan, h)) return plan;
    }
  }
  return null;
}

function botSurvives(c: Chunk, speed: number): boolean {
  const s = createState(3, { speedOverride: speed, autoSpawn: false });
  const x = 220;
  placeChunk(s, c, x);
  const endScroll = chunkEnd(c, x) + c.airTicks * speed + 60;
  let plan: Plan = [];
  while (!s.dead && s.scroll < endScroll) {
    if (plan.length === 0 && !s.p.air && s.p.crouchBtn === null && s.tick % 5 === 0) {
      const h = horizon(s, speed, c.airTicks);
      if (!survives(s, [], h)) {
        const found = search(s, h);
        if (!found) return false;
        plan = found;
      }
    }
    step(s, plan.shift() ?? []);
  }
  return !s.dead;
}

function speedsFor(c: Chunk): number[] {
  const lo = baseSpeed(TIER_START[c.tier]);
  const out: number[] = [];
  for (let v = lo; v < CAP_SPEED; v += 0.15) out.push(v);
  out.push(CAP_SPEED);
  return out;
}

test('a plain-ollie bot survives every chunk at every speed its tier can reach', () => {
  for (const c of CHUNKS) {
    for (const v of speedsFor(c)) {
      assert.ok(botSurvives(c, v), `${c.id} at ${v.toFixed(2)} px/tick`);
    }
  }
});

// airTicks feeds minGap(): it must be at least the longest airtime a player
// can get off the chunk, or the next hazard could arrive mid-air.
function longestAir(c: Chunk, speed: number): number {
  const startTick = Math.floor((220 - 40) / speed);
  let longest = 0;
  for (let rel = -1; rel < 130; rel++) {
    const s = createState(5, { speedOverride: speed, autoSpawn: false });
    placeChunk(s, c, 220);
    let air = 0;
    let max = 0;
    for (let t = 0; t < 700 && !s.dead; t++) {
      const ev: InputEvent[] = [];
      if (rel >= 0 && t === startTick + rel - 18) ev.push({ btn: 'A', down: true });
      if (rel >= 0 && t === startTick + rel) ev.push({ btn: 'A', down: false });
      step(s, ev);
      if (s.p.air) air++;
      else {
        max = Math.max(max, air);
        air = 0;
      }
    }
    if (!s.dead) longest = Math.max(longest, max);
  }
  return longest;
}

test('declared airTicks covers the longest airtime of each ramp chunk', () => {
  const ramps = CHUNKS.filter((c) => ['bank', 'kicker', 'pyramid', 'quarter', 'bowl'].includes(c.id));
  for (const c of ramps) {
    for (const v of [1.2, 1.7, CAP_SPEED]) {
      const air = longestAir(c, v);
      assert.ok(air <= c.airTicks, `${c.id} at ${v.toFixed(2)}: measured ${air}, declared ${c.airTicks}`);
    }
  }
});
