// Canvas renderer. Reads game state, never changes it. All coordinates are
// whole logical pixels; the canvas is scaled up by CSS with pixelated sampling.
// The background is deliberately quiet greys so the rider and the trick
// animations carry the detail.

import { GROUND_Y, LOGICAL_W, PLAYER_X, PLAYFIELD_H } from './consts.ts';
import type { Ob } from './chunks.ts';
import { drawRider, type PoseName, type Rider } from './figure.ts';
import { drawShadowText, drawText, textWidth, wrap } from './font.ts';
import type { GameState } from './sim.ts';
import { animTicks, recognise, TRICKS } from './tricks.ts';

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
  sky: '#e6e4de',
  wall: '#d6d3ca',
  pillar: '#c4c1b6',
  pillarEdge: '#aeab9f',
  deck: '#232323',
  deckDash: '#8a877d',
  ground: '#8f8c82',
  groundDark: '#7a776d',
  ink: '#101010',
  paper: '#f4efe2',
  accent: '#ff4d00',
  pink: '#ff3ea5',
  blue: '#2b5cff',
  green: '#1f9d55',
  tape: '#ffd400',
  white: '#ffffff',
  concrete: '#bdb6a2',
  silver: '#c9ccd1',
  puddle: '#9db8d3',
  muted: '#6b6558',
  dust: '#f4efe2',
};

const KIND_COLOR: Partial<Record<Ob['kind'], string>> = {
  box: C.accent,
  crate: C.tape,
  block: C.pink,
  ledge: C.pink,
  kicker: '#3a3a3a',
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

function drawBackground(ctx: CanvasRenderingContext2D, scroll: number, h: number, yOff: number): void {
  rect(ctx, C.sky, 0, 0, LOGICAL_W, h);
  const gy = GROUND_Y + yOff;
  rect(ctx, C.wall, 0, gy - 22, LOGICAL_W, 22);

  const near = Math.floor(scroll * 0.5);
  const spacing = 112;
  for (let k = Math.floor(near / spacing) - 1; k < Math.floor((near + LOGICAL_W) / spacing) + 1; k++) {
    const sx = k * spacing - near + 40;
    rect(ctx, C.pillar, sx, DECK_H, 18, gy - DECK_H);
    rect(ctx, C.pillarEdge, sx + 15, DECK_H, 3, gy - DECK_H);
  }

  rect(ctx, C.deck, 0, 0, LOGICAL_W, DECK_H);
  const dash = Math.floor(scroll * 0.5) % 24;
  for (let x = -dash; x < LOGICAL_W; x += 24) rect(ctx, C.deckDash, x, DECK_H - 2, 10, 1);
}

function drawGround(ctx: CanvasRenderingContext2D, scroll: number, yOff: number): void {
  const gy = GROUND_Y + yOff;
  rect(ctx, C.ground, 0, gy, LOGICAL_W, PLAYFIELD_H - GROUND_Y);
  rect(ctx, C.ink, 0, gy, LOGICAL_W, 1);
  const seam = Math.floor(scroll) % 32;
  for (let x = -seam; x < LOGICAL_W; x += 32) rect(ctx, C.groundDark, x, gy + 4, 1, 14);
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
    if (h > 0) rect(ctx, color, sx, top, 1, h);
    rect(ctx, o.kind === 'kicker' ? C.white : C.ink, sx, top, 1, 1);
    // Risers and the launch lip get an ink edge so steps and lips read.
    const prev = i > 0 ? prof[i - 1] : h;
    if (prev - h > 1) rect(ctx, C.ink, sx, top, 1, prev - h);
  }
  const last = prof[prof.length - 1];
  if (last > 0) rect(ctx, C.ink, sx0 + prof.length - 1, gy - last, 1, last);
}

function drawRect(ctx: CanvasRenderingContext2D, o: Ob, sx: number, yOff: number): void {
  const top = GROUND_Y + yOff - o.h;
  if (o.kind === 'rail') {
    rect(ctx, C.ink, sx, top, o.w, 3);
    rect(ctx, C.silver, sx + 1, top + 1, o.w - 2, 1);
    for (const px of [1, Math.floor(o.w / 2) - 1, o.w - 4]) {
      rect(ctx, C.ink, sx + px, top + 3, 3, o.h - 3);
    }
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

function riderFor(s: GameState, yOff: number): Rider {
  const p = s.p;
  const speed = Math.max(0.6, s.speed);
  let poseA: PoseName = 'ride';
  let poseB: PoseName = 'ride';
  let blend = 0;
  let boardTilt = 0;
  let bodyTilt = 0;
  let pivotX = 0;
  let spin = 0;
  let flip = 0;
  let loop: number | null = null;
  let kx = 1;
  let ghosts: Array<{ spin: number; flip: number }> = [];
  let x = PLAYER_X;
  let boardDx = 0;
  let boardDy = 0;

  if (s.dead) {
    const age = s.tick - s.deadTick;
    poseA = 'air';
    poseB = 'air';
    bodyTilt = -Math.min(1.5, age * 0.1);
    pivotX = 0;
    x = PLAYER_X - Math.min(10, age);
    boardDx = 12 + Math.min(26, age * 2);
    boardDy = -Math.max(0, 8 - age * 0.5);
    loop = age * 0.4;
  } else if (!p.air) {
    const slope = Math.atan2(-p.rideVy, speed);
    boardTilt = slope;
    bodyTilt = slope * 0.7;
    const g = p.groundTicks;
    if (p.manual !== null) {
      const e = Math.min(1, g / 4);
      const ang = (p.manual === 'A' ? 0.5 : -0.5) * e;
      boardTilt = ang;
      bodyTilt = ang;
      pivotX = p.manual === 'A' ? -6 : 6;
      poseA = 'ride';
      poseB = 'crouch';
      blend = 0.35;
    } else if (p.crouchBtn !== null) {
      poseA = 'ride';
      poseB = 'crouch';
      blend = Math.min(1, p.crouchTicks / 6);
    } else if (g < 8) {
      const k = 1 - g / 8;
      const landTilt = Math.atan2(-p.landVy, speed) * 0.5 * k;
      boardTilt += landTilt;
      bodyTilt += landTilt * 0.5;
      poseA = 'crouch';
      poseB = 'ride';
      blend = g / 8;
    }
  } else {
    // The board follows the flight path; an ollie also snaps the tail (nose
    // for a nollie) down first, then levels out.
    const path = Math.atan2(-p.vy, speed);
    const decay = p.popped ? Math.max(0, 1 - p.airTicks / 12) : 0;
    const popTilt = (p.nollie ? -1 : 1) * 0.6 * decay;
    boardTilt = path * 0.8 + popTilt;
    bodyTilt = path * 0.6;
    if (p.airTicks < 8 && p.popped) {
      poseA = 'pop';
      poseB = 'air';
      blend = p.airTicks / 8;
    } else if (p.vy > 0.3) {
      poseA = 'air';
      poseB = 'pop';
      blend = Math.min(1, (p.vy - 0.3) / 1.0) * 0.7;
    } else {
      poseA = 'air';
      poseB = 'air';
    }
    if (p.trickSeq !== null) {
      const trick = recognise(p.trickSeq);
      if (trick) {
        const dur = animTicks(trick.seq.length);
        const prog = Math.max(0, Math.min(1, (s.tick - p.trickStartTick) / dur));
        spin = Math.PI * trick.spin * prog;
        flip = 2 * Math.PI * trick.flip * prog * trick.dir;
        if (trick.loop) loop = 2 * Math.PI * prog;
        if (trick.body) kx = Math.cos(2 * Math.PI * prog);
        ghosts = [];
        for (const back of [0.07, 0.14]) {
          const gp = prog - back;
          if (gp > 0) {
            ghosts.push({ spin: Math.PI * trick.spin * gp, flip: 2 * Math.PI * trick.flip * gp * trick.dir });
          }
        }
        poseA = 'air';
        poseB = 'air';
        blend = 0;
        // Reach for the board as the trick ends.
        if (prog > 0.8) {
          poseA = 'air';
          poseB = 'pop';
          blend = (prog - 0.8) / 0.2;
        }
      }
    } else if (p.buffer.length > 0) {
      // First tap: a quick flick of the board before the trick commits.
      boardTilt += 0.35;
      poseA = 'air';
      poseB = 'air';
    }
  }

  return {
    x,
    y: Math.round(p.y) + yOff,
    poseA,
    poseB,
    blend,
    boardTilt,
    bodyTilt,
    pivotX,
    kx,
    spin,
    flip,
    loop,
    ghosts,
    boardDx,
    boardDy,
  };
}

function drawEffects(ctx: CanvasRenderingContext2D, s: GameState, yOff: number): void {
  const p = s.p;
  const gy = GROUND_Y + yOff;
  const y = Math.round(p.y) + yOff;
  if (s.dead) return;
  // Dust when landing hard and when popping.
  if (!p.air && p.groundTicks < 9 && p.landVy > 0.8) {
    for (let i = 0; i < 4; i++) {
      rect(ctx, C.dust, PLAYER_X - 12 - i * 3 - p.groundTicks, y - 1 - (i % 2) * 2 - Math.floor(p.groundTicks / 3), 2, 2);
    }
  }
  if (p.air && p.popped && p.airTicks < 7) {
    for (let i = 0; i < 3; i++) {
      rect(ctx, C.dust, PLAYER_X - 10 - i * 3 - p.airTicks, gy - 2 - i, 2, 2);
    }
  }
  // Sparks off the wheels on a rail manual.
  if (p.manual !== null && s.tick % 3 !== 0) {
    const wheel = PLAYER_X + (p.manual === 'A' ? -9 : 9);
    rect(ctx, C.tape, wheel + (s.tick % 4) - 2, y - 1 - (s.tick % 3), 2, 2);
    rect(ctx, C.white, wheel - (s.tick % 5), y, 1, 1);
  }
}

function drawHud(ctx: CanvasRenderingContext2D, s: GameState, ui: UiState, yOff: number): void {
  const str = (k: string) => ui.strings[k] ?? k;
  const p = s.p;
  drawText(ctx, String(Math.floor(s.score)), 3, 3, C.white);
  if (s.mult > 1) drawText(ctx, `X${s.mult}`, 3, 15, C.accent);
  const best = `${str('best')} ${Math.max(ui.best, Math.floor(s.score))}`;
  drawText(ctx, best, LOGICAL_W - 3 - textWidth(best), 3, C.tape);

  if (s.lastTrick && s.tick - s.lastTrick.tick < 90 && !s.dead) {
    const q = s.lastTrick.quality === 'clean' ? str('clean') : str('sketchy');
    const col = s.lastTrick.quality === 'clean' ? C.green : C.accent;
    const name = s.lastTrick.name;
    drawShadowText(ctx, name, Math.round((LOGICAL_W - textWidth(name)) / 2), 16, C.ink, C.paper);
    const sub = `${q} +${s.lastTrick.points}`;
    drawShadowText(ctx, sub, Math.round((LOGICAL_W - textWidth(sub)) / 2), 23, col, C.paper);
  }

  if (ui.screen !== 'playing' || s.dead) return;

  // Rail cue: A / B must be pressed as the board touches down.
  if (p.railDeadline > 0 && p.manual === null) {
    const t = `A / B ${str('now')}`;
    drawShadowText(ctx, t, PLAYER_X - Math.round(textWidth(t) / 2), Math.round(p.y) + yOff - 52, C.accent, C.paper);
  } else if (p.manual !== null) {
    const t = p.manual === 'A' ? str('manual') : str('noseManual');
    drawShadowText(ctx, t, PLAYER_X - Math.round(textWidth(t) / 2), Math.round(p.y) + yOff - 52, C.green, C.paper);
  }

  const wx = s.scroll + PLAYER_X;
  let railAhead = false;
  for (const o of s.obs) {
    if (o.kind === 'rail' && o.x - wx > -8 && o.x - wx < 90) railAhead = true;
  }
  if (railAhead && s.manuals === 0 && ui.best < 400) {
    drawHint(ctx, str('hintRail'), 30);
  } else if (ui.firstRun && s.clears === 0 && !p.air) {
    drawHint(ctx, str('hintHold'), 30);
  } else if (ui.discovered.size === 0 && p.air && p.trickSeq === null && p.buffer === '') {
    drawHint(ctx, str('hintTap'), 30);
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
  const why = s.deadReason === 'bail' ? 'bail' : s.deadReason === 'miss' ? 'miss' : 'crash';
  center(ctx, str(why), y + 6, C.accent, 2);
  center(ctx, str('gameover'), y + 18, C.ink);
  center(ctx, `${str('score')} ${Math.floor(s.score)}`, y + 26, C.ink, 2);
  center(ctx, ui.newBest ? str('newBest') : `${str('best')} ${ui.best}`, y + 39, ui.newBest ? C.green : C.muted);
  const col = ui.screenAge > 24 ? C.ink : C.muted;
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
  if (ui.screen !== 'title' && ui.screen !== 'book') {
    drawEffects(ctx, s, yOff);
    drawRider(ctx, riderFor(s, yOff));
  }
  ctx.restore();

  if (ui.screen === 'playing' || ui.screen === 'paused' || ui.screen === 'gameover') drawHud(ctx, s, ui, yOff);

  if (ui.screen === 'title') drawTitle(ctx, ui, yOff);
  else if (ui.screen === 'paused') drawPaused(ctx, ui, yOff);
  else if (ui.screen === 'gameover') drawGameOver(ctx, s, ui, yOff);
  else if (ui.screen === 'book') drawBook(ctx, ui, yOff);

  if (ui.debug) drawDebug(ctx, s, ui, yOff);
}
