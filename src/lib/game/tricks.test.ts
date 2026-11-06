import assert from 'node:assert/strict';
import { test } from 'node:test';
import { animTicks, recognise, TRICKS } from './tricks.ts';

test('the two combos from the brief resolve (B scoops, C flicks)', () => {
  assert.equal(recognise('BBC')?.name, '360 flip');
  assert.equal(recognise('CCCB')?.name, 'Triple flip shove-it');
});

test('single taps resolve to the base tricks', () => {
  assert.equal(recognise('B')?.name, 'Pop shove-it');
  assert.equal(recognise('C')?.name, 'Kickflip');
});

test('order matters', () => {
  assert.equal(recognise('BC')?.name, 'Varial kickflip');
  assert.equal(recognise('CB')?.name, 'Hardflip');
});

test('unknown sequences fall back to the longest known prefix', () => {
  assert.equal(recognise('BBB')?.seq, 'BB');
  assert.equal(recognise('CCCC')?.seq, 'CCC');
  assert.equal(recognise('BCC')?.seq, 'BC');
});

test('empty buffer resolves to nothing', () => {
  assert.equal(recognise(''), null);
});

test('A is the ollie button and never part of a trick', () => {
  assert.equal(recognise('A'), null);
  for (const t of TRICKS) assert.doesNotMatch(t.seq, /A/);
});

test('every sequence is unique and 1 to 4 taps of B and C', () => {
  const seen = new Set<string>();
  for (const t of TRICKS) {
    assert.match(t.seq, /^[BC]{1,4}$/);
    assert.ok(!seen.has(t.seq), `duplicate ${t.seq}`);
    seen.add(t.seq);
  }
});

test('animation length grows with taps and never shrinks below the floor', () => {
  assert.equal(animTicks(1), 16);
  assert.equal(animTicks(4), 28);
});
