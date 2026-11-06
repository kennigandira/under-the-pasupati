// Canvas renderer. Reads game state, never changes it. All coordinates are
// whole logical pixels; the canvas is scaled up by CSS with pixelated sampling.

import {
  GROUND_Y,
  LOGICAL_W,
  PLAYER_X,
  PLAYFIELD_H,
} from './consts.ts';
import type { Ob } from './chunks.ts';
import { drawShadowText, drawText, textWidth, wrap } from './font.ts';
import type { GameState } from './sim.ts';
import { getSprite, type Pose } from './sprites.ts';
import { recognise, TRICKS, animTicks } from './tricks.ts';

export type Screen = 'title' | 'playing' | 'paused' | 'gameover' | 'book';

export interface UiState {
  screen: Screen;
  strings: Record<string, string>;
  best: number;
  newBest: boolean;
  discovered: ReadonlySet<string>;
  embed: boolean;
  debug: boolean;
  fps: number;
  now: number;
  reducedMotion: boolean;
  firstRun: boolean;
  canvasH: number;
  screenAge: number;
}

const C = {
  sky: '#d9d2bf',
  far: '#c8c0aa',
  pillar: '#aaa28d',
  pillarDark: '#8f8873',
  deck: '#101010',
  ground: '#6b6558',
  seam: '#575145',
  ink: '#101010',
  paper: '#f4efe2',
  accent: '#ff4d00',
  pink: '#ff3ea5',
  blue: '#2b5cff',
  green: '#1f9d55',
  tape: '#ffd400',
  white: '#ffffff',
  concrete: '#bdb6a2',
  pit: '#24231f',
  silver: '#c9ccd1',
  puddle: '#6fa8dc',
  muted: '#6b6558',
};

const KIND_COLOR: Partial<Record<Ob['kind'], string>> = {
  box: C.accent,
  crate: C.tape,
  block: C.pink,
  ledge: C.pink,
  kicker: '#2a2a2a',
  bank: C.blue,
  pyramid: C.blue,
  quarter: C.silver,
  bowl: C.blue,
  stairs: C.concrete,
};

const DECK_H = 10;

function rect(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number): void {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function hash(n: number): number {
  let x = Math.imul(n | 0, 2654435761) >>> 0;
  x ^= x >>> 13;
  return x % 1000;
}

function drawBackground(ctx: CanvasRenderingContext2D, scroll: number, h: number, yOff: number): void {
  rect(ctx, C.sky, 0, 0, LOGICAL_W, h);

  // Far silhouettes: warung roofs and walls.
  const far = Math.floor(scroll * 0.2);
  const tile = 44;
  for (let k = Math.floor(far / tile) - 1; k < Math.floor((far + LOGICAL_W) / tile) + 1; k++) {
    const sx = k * tile - far;
    const hh = 16 + (hash(k) % 22);
    rect(ctx, C.far, sx, GROUND_Y + yOff - hh, tile - 6, hh);
    rect(ctx, C.pillarDark, sx + 4, GROUND_Y + yOff - hh + 4, 3, 3);
  }

  // Flyover pillars.
  const near = Math.floor(scroll * 0.55);
  const spacing = 96;
  for (let k = Math.floor(near / spacing) - 1; k < Math.floor((near + LOGICAL_W) / spacing) + 1; k++) {
    const sx = k * spacing - near + 30;
    rect(ctx, C.pillar, sx, DECK_H, 16, GROUND_Y + yOff - DECK_H);
    rect(ctx, C.pillarDark, sx + 13, DECK_H, 3, GROUND_Y + yOff - DECK_H);
    rect(ctx, C.pillarDark, sx - 2, DECK_H, 20, 3);
  }

  // Deck with hazard dashes.
  rect(ctx, C.deck, 0, 0, LOGICAL_W, DECK_H);
  const dash = Math.floor(scroll * 0.55) % 16;
  for (let x = -dash; x < LOGICAL_W; x += 16) rect(ctx, C.tape, x, DECK_H - 2, 8, 1);
}

function drawGround(ctx: CanvasRenderingContext2D, scroll: number, yOff: number): void {
  const gy = GROUND_Y + yOff;
  rect(ctx, C.ground, 0, gy, LOGICAL_W, PLAYFIELD_H - GROUND_Y);
  rect(ctx, C.ink, 0, gy, LOGICAL_W, 1);
  const seam = Math.floor(scroll) % 24;
  for (let x = -seam; x < LOGICAL_W; x += 24) rect(ctx, C.seam, x, gy + 5, 1, 12);
  rect(ctx, C.seam, 0, gy + 10, LOGICAL_W, 1);
}

function drawProfile(ctx: CanvasRenderingContext2D, o: Ob, sx0: number, yOff: number): void {
  const prof = o.prof!;
  const color = KIND_COLOR[o.kind] ?? C.concrete;
  const gy = GROUND_Y + yOff;
  for (let i = 0; i < prof.length; i++) {
    const sx = sx0 + i;
    if (sx < 0 || sx >= LOGICAL_W) continue;
    const h = prof[i];
    const top = gy - h;
    if (h >= 0) {
      rect(ctx, color, sx, top, 1, h);
      rect(ctx, o.kind === 'kicker' ? C.white : C.ink, sx, top, 1, 1);
    } else {
      rect(ctx, C.pit, sx, gy, 1, PLAYFIELD_H - GROUND_Y);
      rect(ctx, color, sx, top, 1, PLAYFIELD_H + yOff - top);
      rect(ctx, C.ink, sx, top, 1, 1);
    }
  }
  // Bowl and quarter get an ink lip so the launch edge reads clearly.
  if (o.kind === 'quarter' || o.kind === 'bowl' || o.kind === 'kicker' || o.kind === 'bank') {
    const last = prof[prof.length - 1];
    rect(ctx, C.ink, sx0 + prof.length - 1, gy - last, 1, Math.max(1, last));
  }
}

function drawRect(ctx: CanvasRenderingContext2D, o: Ob, sx: number, yOff: number): void {
  const top = GROUND_Y + yOff - o.h;
  if (o.kind === 'rail') {
    rect(ctx, C.ink, sx, top, o.w, 2);
    rect(ctx, C.white, sx + 1, top, o.w - 2, 1);
    for (const px of [1, Math.floor(o.w / 2) - 1, o.w - 3]) rect(ctx, C.muted, sx + px, top + 2, 2, o.h - 2);
    return;
  }
  const color = KIND_COLOR[o.kind] ?? C.concrete;
  rect(ctx, C.ink, sx, top, o.w, o.h);
  rect(ctx, color, sx + 1, top + 1, o.w - 2, o.h - 2);
  rect(ctx, C.white, sx + 1, top + 1, o.w - 2, 1);
}

function drawObstacles(ctx: CanvasRenderingContext2D, s: GameState, yOff: number): void {
  for (const o of s.obs) {
    const sx = Math.round(o.x - s.scroll);
    if (sx > LOGICAL_W || sx + o.w < 0) continue;
    if (o.prof) drawProfile(ctx, o, sx, yOff);
    else if (o.kind === 'puddle') {
      rect(ctx, C.puddle, sx, GROUND_Y + yOff, o.w, 2);
      rect(ctx, C.white, sx + 3, GROUND_Y + yOff, 4, 1);
    } else drawRect(ctx, o, sx, yOff);
  }
}

// Board seen from the side. spin rotates it flat (length shrinks), flip turns
// it over its long axis (thickness grows, colour swaps).
function drawBoard(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  spin: number,
  flip: number,
  raised: boolean,
): void {
  const cs = Math.cos(spin);
  const cf = Math.cos(flip);
  const len = Math.max(2, Math.round(16 * Math.abs(cs)));
  const thick = 2 + Math.round(3 * Math.abs(Math.sin(flip)));
  const x0 = Math.round(cx - len / 2);
  const y0 = Math.round(topY + 1 - Math.floor(thick / 2)) - (raised ? 1 : 0);
  const upColor = cf >= 0 ? C.ink : C.accent;
  const downColor = cf >= 0 ? C.accent : C.ink;
  const half = Math.ceil(thick / 2);
  rect(ctx, upColor, x0, y0, len, half);
  rect(ctx, downColor, x0, y0 + half, len, thick - half);
  const tipX = cs >= 0 ? x0 + len - 3 : x0;
  rect(ctx, C.tape, tipX, y0, Math.min(3, len), thick);
  if (Math.abs(cf) > 0.5 && Math.abs(cs) > 0.7) {
    const wy = cf >= 0 ? y0 + thick : y0 - 2;
    rect(ctx, C.ink, x0 + 2, wy, 2, 2);
    rect(ctx, C.ink, x0 + len - 4, wy, 2, 2);
  }
}

function drawLoopBoard(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number): void {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  for (let i = -7; i <= 7; i++) {
    const x = Math.round(cx + i * ca);
    const y = Math.round(cy + i * sa);
    rect(ctx, i > 3 ? C.tape : i < 0 ? C.accent : C.ink, x, y, 1, 2);
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, s: GameState, ui: UiState, yOff: number): void {
  const p = s.p;
  const y = Math.round(p.y) + yOff;
  const topY = y - 4;

  if (s.dead) {
    const age = s.tick - s.deadTick;
    const slide = Math.min(10, age);
    const sprite = getSprite('dead');
    ctx.drawImage(sprite, PLAYER_X - 6 - slide, y - sprite.height);
    const bx = PLAYER_X + 14 + Math.min(18, age * 2);
    drawLoopBoard(ctx, bx, y - 3 - Math.max(0, 10 - age) * 0, age * 0.3);
    return;
  }

  let spin = 0;
  let flip = 0;
  let body = false;
  let loop = -1;
  let raised = false;
  if (p.air) {
    if (p.trickSeq !== null) {
      const trick = recognise(p.trickSeq);
      if (trick) {
        const dur = animTicks(trick.seq.length);
        const prog = Math.max(0, Math.min(1, (s.tick - p.trickStartTick) / dur));
        spin = Math.PI * trick.spin * prog;
        flip = 2 * Math.PI * trick.flip * prog * trick.dir;
        if (trick.loop) loop = 2 * Math.PI * prog;
        body = trick.body && prog > 0.25 && prog < 0.75;
      }
    } else if (p.buffer.length > 0) {
      raised = true;
    }
  }

  let pose: Pose = 'ride';
  if (p.air) pose = 'air';
  else if (p.crouchBtn !== null) pose = 'crouch';
  const sprite = getSprite(pose);
  const sx = PLAYER_X - 4;
  const sy = topY - sprite.height;
  if (body) {
    ctx.save();
    ctx.translate(PLAYER_X, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(sprite, -4, sy);
    ctx.restore();
  } else {
    ctx.drawImage(sprite, sx, sy);
  }

  if (loop >= 0) drawLoopBoard(ctx, PLAYER_X, topY + 2, loop);
  else drawBoard(ctx, PLAYER_X, topY, spin, flip, raised);

  if (p.grinding && s.tick % 4 < 2) {
    rect(ctx, C.tape, PLAYER_X - 7 + (s.tick % 3), topY + 4, 1, 1);
    rect(ctx, C.white, PLAYER_X + 5 - (s.tick % 3), topY + 3, 1, 1);
  }
}

function drawHud(ctx: CanvasRenderingContext2D, s: GameState, ui: UiState, yOff: number): void {
  const str = (k: string) => ui.strings[k] ?? k;
  drawText(ctx, String(Math.floor(s.score)), 3, 3, C.white);
  if (s.mult > 1) drawText(ctx, `X${s.mult}`, 3, 15 + 0, C.tape);
  const best = `${str('best')} ${Math.max(ui.best, Math.floor(s.score))}`;
  drawText(ctx, best, LOGICAL_W - 3 - textWidth(best), 3, C.tape);

  if (s.lastTrick && s.tick - s.lastTrick.tick < 90 && !s.dead) {
    const q = s.lastTrick.quality === 'clean' ? str('clean') : str('sketchy');
    const col = s.lastTrick.quality === 'clean' ? C.green : C.accent;
    const name = s.lastTrick.name;
    drawShadowText(ctx, name, Math.round((LOGICAL_W - textWidth(name)) / 2), yOff + 22, C.ink, C.paper);
    const sub = `${q} +${s.lastTrick.points}`;
    drawShadowText(ctx, sub, Math.round((LOGICAL_W - textWidth(sub)) / 2), yOff + 29, col, C.paper);
  }

  if (ui.screen === 'playing' && !s.dead) {
    if (ui.firstRun && s.clears === 0 && !s.p.air) {
      drawHint(ctx, str('hintHold'), yOff + 17);
    } else if (ui.discovered.size === 0 && s.p.air && s.p.trickSeq === null && s.p.buffer === '') {
      drawHint(ctx, str('hintTap'), yOff + 17);
    }
  }
}

function drawHint(ctx: CanvasRenderingContext2D, text: string, y: number): void {
  const lines = wrap(text, 160);
  lines.forEach((ln, i) => {
    drawShadowText(ctx, ln, Math.round((LOGICAL_W - textWidth(ln)) / 2), y + i * 7, C.ink, C.paper);
  });
}

function panel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  rect(ctx, C.ink, x, y, w, h);
  rect(ctx, C.paper, x + 1, y + 1, w - 2, h - 2);
  rect(ctx, C.accent, x + 1, y + 1, w - 2, 1);
}

function center(ctx: CanvasRenderingContext2D, text: string, y: number, color: string, scale = 1): void {
  drawText(ctx, text, Math.round((LOGICAL_W - textWidth(text, scale)) / 2), y, color, scale);
}

function drawTitle(ctx: CanvasRenderingContext2D, ui: UiState, yOff: number): void {
  const str = (k: string) => ui.strings[k] ?? k;
  const y = yOff + 14;
  panel(ctx, 12, y, LOGICAL_W - 24, 66);
  center(ctx, str('title'), y + 8, C.ink, 3);
  center(ctx, str('tagline'), y + 27, C.muted);
  center(ctx, `A  ${str('start')}`, y + 38, C.ink);
  center(ctx, `B  ${str('book')}`, y + 46, C.ink);
  if (ui.best > 0) center(ctx, `${str('best')} ${ui.best}`, y + 56, C.accent);
}

function drawPaused(ctx: CanvasRenderingContext2D, ui: UiState, yOff: number): void {
  const str = (k: string) => ui.strings[k] ?? k;
  const y = yOff + 24;
  panel(ctx, 24, y, LOGICAL_W - 48, 40);
  center(ctx, str('paused'), y + 7, C.ink, 2);
  center(ctx, `A  ${str('resume')}`, y + 22, C.ink);
  center(ctx, `B  ${str('quit')}`, y + 30, C.ink);
}

function drawGameOver(ctx: CanvasRenderingContext2D, s: GameState, ui: UiState, yOff: number): void {
  const str = (k: string) => ui.strings[k] ?? k;
  const y = yOff + 10;
  panel(ctx, 6, y, LOGICAL_W - 12, 76);
  center(ctx, s.deadReason === 'bail' ? str('bail') : str('crash'), y + 6, C.accent, 2);
  center(ctx, str('gameover'), y + 18, C.ink);
  center(ctx, `${str('score')} ${Math.floor(s.score)}`, y + 26, C.ink, 2);
  center(ctx, ui.newBest ? str('newBest') : `${str('best')} ${ui.best}`, y + 39, ui.newBest ? C.green : C.muted);
  const ready = ui.screenAge > 24;
  const col = ready ? C.ink : C.muted;
  const retry = `A  ${str('retry')}`;
  const leave = wrap(`B  ${ui.embed ? str('closeGame') : str('toTitle')}`, LOGICAL_W - 24);
  center(ctx, retry, y + 50, col);
  leave.forEach((ln, i) => center(ctx, ln, y + 58 + i * 7, col));
}

function drawBook(ctx: CanvasRenderingContext2D, ui: UiState, yOff: number): void {
  const str = (k: string) => ui.strings[k] ?? k;
  const y = yOff + 2;
  panel(ctx, 4, y, LOGICAL_W - 8, 92);
  center(ctx, str('bookTitle'), y + 5, C.ink, 1);
  TRICKS.forEach((t, i) => {
    const ry = y + 14 + i * 6;
    const known = ui.discovered.has(t.seq);
    const seq = known ? t.seq.split('').join(' ') : t.seq.split('').map(() => '?').join(' ');
    drawText(ctx, seq, 9, ry, known ? C.ink : C.muted);
    drawText(ctx, known ? t.name : '???', 40, ry, known ? C.ink : C.muted);
  });
  center(ctx, str('back'), y + 86, C.accent);
}

function drawDebug(ctx: CanvasRenderingContext2D, s: GameState, ui: UiState, yOff: number): void {
  const p = s.p;
  const lines = [
    `FPS ${ui.fps}`,
    `TICK ${s.tick}`,
    `SPD ${s.speed.toFixed(2)}`,
    `CROUCH ${p.crouchTicks}`,
    `BUF ${p.buffer || '-'} ${p.trickSeq ?? ''}`,
  ];
  lines.forEach((ln, i) => drawShadowText(ctx, ln, 3, yOff + 34 + i * 6, C.ink, C.paper));
}

export function drawFrame(ctx: CanvasRenderingContext2D, s: GameState, ui: UiState, scrollOverride?: number): void {
  const yOff = ui.canvasH - PLAYFIELD_H;
  ctx.imageSmoothingEnabled = false;
  const bgScroll = scrollOverride ?? s.scroll;
  ctx.save();
  if (s.dead && !ui.reducedMotion) {
    const age = s.tick - s.deadTick;
    if (age < 8) ctx.translate(age % 2 === 0 ? 1 : -1, 0);
  }
  drawBackground(ctx, bgScroll, ui.canvasH, yOff);
  drawGround(ctx, bgScroll, yOff);
  drawObstacles(ctx, s, yOff);
  if (ui.screen !== 'title' && ui.screen !== 'book') drawPlayer(ctx, s, ui, yOff);
  ctx.restore();

  if (ui.screen === 'playing' || ui.screen === 'paused') drawHud(ctx, s, ui, yOff);
  if (ui.screen === 'gameover') drawHud(ctx, s, ui, yOff);

  if (ui.screen === 'title') drawTitle(ctx, ui, yOff);
  else if (ui.screen === 'paused') drawPaused(ctx, ui, yOff);
  else if (ui.screen === 'gameover') drawGameOver(ctx, s, ui, yOff);
  else if (ui.screen === 'book') drawBook(ctx, ui, yOff);

  if (ui.debug) drawDebug(ctx, s, ui, yOff);
}
