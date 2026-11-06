import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextRandom } from './rng.ts';
import { createState, step, type InputEvent } from './sim.ts';

// A scripted pseudo-player driven by its own seeded stream.
function play(seed: number, inputSeed: number, ticks: number) {
  const s = createState(seed);
  const driver = { rng: inputSeed };
  const held = { A: false, B: false };
  for (let i = 0; i < ticks; i++) {
    const ev: InputEvent[] = [];
    for (const btn of ['A', 'B'] as const) {
      if (nextRandom(driver) < 0.07) {
        held[btn] = !held[btn];
        ev.push({ btn, down: held[btn] });
      }
    }
    step(s, ev);
  }
  return s;
}

test('same seed and inputs give the same final state', () => {
  const a = play(42, 7, 3000);
  const b = play(42, 7, 3000);
  assert.deepEqual(a, b);
});

test('different seeds produce different layouts', () => {
  const a = createState(1);
  const b = createState(2);
  for (let i = 0; i < 400; i++) {
    step(a);
    step(b);
  }
  assert.notDeepEqual(
    a.obs.map((o) => [o.kind, o.x]),
    b.obs.map((o) => [o.kind, o.x]),
  );
});
