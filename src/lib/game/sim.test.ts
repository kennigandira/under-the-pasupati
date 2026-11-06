import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BAIL_WINDOW, GROUND_Y, RAIL_EARLY_TICKS, RAIL_LATE_TICKS, TAP_MAX } from './consts.ts';
import { CHUNKS } from './chunks.ts';
import { createState, placeChunk, step, type Btn, type GameState, type InputEvent } from './sim.ts';

type Scheduled = { tick: number; btn: Btn; down: boolean };

// Runs `ticks` steps, delivering scheduled events on their tick.
function run(s: GameState, schedule: Scheduled[], ticks: number): void {
  for (let i = 0; i < ticks; i++) {
    const ev: InputEvent[] = schedule
      .filter((e) => e.tick === s.tick + 1)
      .map((e) => ({ btn: e.btn, down: e.down }));
    step(s, ev);
  }
}

const bare = () => createState(1, { speedOverride: 1.2, autoSpawn: false });

function apexAfterHold(hold: number, btn: Btn = 'A'): number {
  const s = bare();
  let best = 0;
  const schedule: Scheduled[] = [
    { tick: 1, btn, down: true },
    { tick: 1 + hold, btn, down: false },
  ];
  for (let i = 0; i < 120; i++) {
    run(s, schedule, 1);
    best = Math.max(best, GROUND_Y - s.p.y);
  }
  return best;
}

test('pop height follows the crouch level', () => {
  assert.ok(Math.abs(apexAfterHold(2) - 12) < 2, 'low');
  assert.ok(Math.abs(apexAfterHold(10) - 20) < 2, 'mid');
  assert.ok(Math.abs(apexAfterHold(18) - 28) < 2, 'high');
});

test('nollie (B) pops lower than ollie (A) at the same hold', () => {
  assert.ok(apexAfterHold(18, 'B') < apexAfterHold(18, 'A') - 2);
});

test('rolling into a ledge at ground level crashes', () => {
  const s = bare();
  placeChunk(s, CHUNKS.find((c) => c.id === 'ledge')!, 200);
  run(s, [], 400);
  assert.equal(s.dead, true);
  assert.equal(s.deadReason, 'crash');
});

test('a low pop can land on the ledge and ride it', () => {
  let rode = false;
  for (let rel = 100; rel < 150 && !rode; rel++) {
    const s = bare();
    placeChunk(s, CHUNKS.find((c) => c.id === 'ledge')!, 200);
    const schedule: Scheduled[] = [
      { tick: rel - 2, btn: 'A', down: true },
      { tick: rel, btn: 'A', down: false },
    ];
    for (let t = 0; t < 200 && !s.dead; t++) {
      run(s, schedule, 1);
      if (!s.p.air && s.p.supportKind === 'ledge') rode = true;
    }
  }
  assert.ok(rode, 'no release tick landed on the ledge');
});

// Puts the player one tick from touchdown with a trick finishing `delta`
// ticks after that touchdown.
function landingWith(delta: number): GameState {
  const s = bare();
  s.p.air = true;
  s.p.popped = true;
  s.p.y = GROUND_Y - 0.5;
  s.p.vy = 1;
  s.p.trickSeq = 'A';
  s.p.trickDoneTick = s.tick + 1 + delta;
  step(s);
  return s;
}

test('landing: trick finished at touchdown is clean', () => {
  const s = landingWith(0);
  assert.equal(s.dead, false);
  assert.equal(s.lastTrick?.quality, 'clean');
  assert.equal(s.mult, 2);
});

test('landing: finishing within the bail window is sketchy and keeps the multiplier', () => {
  const s = landingWith(BAIL_WINDOW);
  assert.equal(s.dead, false);
  assert.equal(s.lastTrick?.quality, 'sketchy');
  assert.equal(s.mult, 1);
});

test('landing: one tick past the bail window ends the run', () => {
  const s = landingWith(BAIL_WINDOW + 1);
  assert.equal(s.dead, true);
  assert.equal(s.deadReason, 'bail');
});

test('landing with taps still uncommitted is a bail', () => {
  const s = bare();
  s.p.air = true;
  s.p.popped = true;
  s.p.y = GROUND_Y - 0.5;
  s.p.vy = 1;
  s.p.buffer = 'A';
  step(s);
  assert.equal(s.dead, true);
  assert.equal(s.deadReason, 'bail');
});

test('A A B in the air commits 360 flip and scores when it lands clean', () => {
  const s = bare();
  const t = 1;
  const ev: Scheduled[] = [
    { tick: t, btn: 'A', down: true },
    { tick: t + 18, btn: 'A', down: false },
  ];
  // Taps: 4-tick presses every 6 ticks after the pop.
  const popTick = t + 18;
  for (const [i, btn] of (['A', 'A', 'B'] as Btn[]).entries()) {
    ev.push({ tick: popTick + 2 + i * 6, btn, down: true });
    ev.push({ tick: popTick + 2 + i * 6 + 4, btn, down: false });
  }
  run(s, ev, popTick + 40);
  assert.equal(s.p.trickSeq, 'AAB');
  run(s, ev, 40);
  assert.equal(s.dead, false);
  assert.equal(s.lastTrick?.seq, 'AAB');
  assert.ok(s.score > 0);
});

test('a press longer than TAP_MAX in the air is not a trick tap', () => {
  const s = bare();
  const ev: Scheduled[] = [
    { tick: 1, btn: 'A', down: true },
    { tick: 19, btn: 'A', down: false },
    { tick: 22, btn: 'B', down: true },
    { tick: 22 + TAP_MAX + 2, btn: 'B', down: false },
  ];
  run(s, ev, 40);
  assert.equal(s.p.buffer, '');
});

// Rail rule: the player is one tick from touchdown on a rail. `pressedAgo` is
// how many ticks before touchdown the button went down (null: not held).
function onRail(btn: Btn | null, pressedAgo: number | null): GameState {
  const s = bare();
  placeChunk(s, CHUNKS.find((c) => c.id === 'rail')!, 30);
  s.p.air = true;
  s.p.popped = true;
  s.p.y = GROUND_Y - 11 - 0.5;
  s.p.vy = 1;
  if (btn !== null && pressedAgo !== null) {
    const i = btn === 'A' ? 0 : 1;
    s.p.held[i] = true;
    s.p.pressTick[i] = s.tick + 1 - pressedAgo;
  }
  step(s);
  return s;
}

test('rail: no press at touchdown starts the countdown, still alive', () => {
  const s = onRail(null, null);
  assert.equal(s.dead, false);
  assert.equal(s.p.manual, null);
  assert.ok(s.p.railDeadline > 0);
});

test('rail: A held at touchdown is a manual', () => {
  const s = onRail('A', 3);
  assert.equal(s.p.manual, 'A');
  run(s, [], 10);
  assert.equal(s.dead, false);
  assert.equal(s.p.grinding, true);
});

test('rail: B held at touchdown is a nose manual', () => {
  const s = onRail('B', 3);
  assert.equal(s.p.manual, 'B');
});

test('rail: a press just after touchdown still counts', () => {
  const s = onRail(null, null);
  run(s, [{ tick: s.tick + RAIL_LATE_TICKS, btn: 'A', down: true }], RAIL_LATE_TICKS);
  assert.equal(s.p.manual, 'A');
  assert.equal(s.dead, false);
});

test('rail: no press within the window loses the run', () => {
  const s = onRail(null, null);
  run(s, [], RAIL_LATE_TICKS + 2);
  assert.equal(s.dead, true);
  assert.equal(s.deadReason, 'miss');
});

test('rail: a press that started long before touchdown does not count', () => {
  const s = onRail('A', RAIL_EARLY_TICKS + 5);
  assert.equal(s.p.manual, null);
  run(s, [], RAIL_LATE_TICKS + 2);
  assert.equal(s.deadReason, 'miss');
});

test('rail: releasing the held button pops off the rail', () => {
  const s = onRail('A', 3);
  run(s, [{ tick: s.tick + 3, btn: 'A', down: false }], 4);
  assert.equal(s.p.air, true);
  assert.equal(s.p.manual, null);
  assert.equal(s.dead, false);
});
