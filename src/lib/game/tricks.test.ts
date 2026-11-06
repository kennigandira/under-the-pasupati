import assert from 'node:assert/strict';
import { test } from 'node:test';
import { animTicks, recognise, TRICKS } from './tricks.ts';

test('the two combos from the brief resolve', () => {
  assert.equal(recognise('AAB')?.name, '360 flip');
  assert.equal(recognise('BBBA')?.name, 'Triple flip shove-it');
});

test('single taps resolve to the base tricks', () => {
  assert.equal(recognise('A')?.name, 'Pop shove-it');
  assert.equal(recognise('B')?.name, 'Kickflip');
});

test('order matters', () => {
  assert.equal(recognise('AB')?.name, 'Varial kickflip');
  assert.equal(recognise('BA')?.name, 'Hardflip');
});

test('unknown sequences fall back to the longest known prefix', () => {
  assert.equal(recognise('AAA')?.seq, 'AA');
  assert.equal(recognise('BBBB')?.seq, 'BBB');
  assert.equal(recognise('ABB')?.seq, 'AB');
});

test('empty buffer resolves to nothing', () => {
  assert.equal(recognise(''), null);
});

test('every sequence is unique and 1 to 4 taps', () => {
  const seen = new Set<string>();
  for (const t of TRICKS) {
    assert.match(t.seq, /^[AB]{1,4}$/);
    assert.ok(!seen.has(t.seq), `duplicate ${t.seq}`);
    seen.add(t.seq);
  }
});

test('animation length grows with taps and never shrinks below the floor', () => {
  assert.equal(animTicks(1), 16);
  assert.equal(animTicks(4), 28);
});
