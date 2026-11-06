// Boots every [data-kolong] root: loop, screens, scaling, embed messaging.

import { DEAD_SHOW_TICKS, LOGICAL_W, MAX_CANVAS_H, MIN_CANVAS_H, STEP_MS } from './consts.ts';
import { createInput, type RawEvent } from './input.ts';
import { drawFrame, type Screen, type UiState } from './render.ts';
import { createState, step, type Btn, type GameState } from './sim.ts';
import { loadBest, loadDiscovered, saveBest, saveDiscovered } from './storage.ts';

const GAME_OVER_LOCK_TICKS = 24;

export function boot(): void {
  document.querySelectorAll<HTMLElement>('[data-kolong]').forEach(init);
}

function newSeed(): number {
  return (Math.random() * 4294967296) >>> 0;
}

function init(root: HTMLElement): void {
  if (root.dataset.ready) return;
  root.dataset.ready = '1';

  const embed = root.dataset.embed === '1';
  const strings = JSON.parse(root.dataset.strings ?? '{}') as Record<string, string>;
  const home = root.dataset.home ?? '/';
  const canvas = root.querySelector<HTMLCanvasElement>('canvas')!;
  const stage = root.querySelector<HTMLElement>('[data-stage]')!;
  const controls = root.querySelector<HTMLElement>('[data-controls]');
  const btnA = root.querySelector<HTMLElement>('[data-btn="A"]');
  const btnB = root.querySelector<HTMLElement>('[data-btn="B"]');
  const pauseBtn = root.querySelector<HTMLElement>('[data-pause]');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    stage.textContent = strings.noCanvas ?? 'Canvas unavailable';
    return;
  }

  const params = new URLSearchParams(location.search);
  const best0 = loadBest();
  const discovered = loadDiscovered();

  const ui: UiState = {
    screen: 'title',
    strings,
    best: best0,
    newBest: false,
    discovered,
    embed,
    debug: params.get('debug') === '1',
    fps: 0,
    now: 0,
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    firstRun: best0 === 0,
    canvasH: MIN_CANVAS_H,
    screenAge: 0,
  };

  let state: GameState = createState(newSeed(), { autoSpawn: false });
  let screenSince = performance.now();
  let simTime = 0;
  let acc = 0;
  let last = performance.now();
  let frames = 0;
  let fpsAt = last;
  const raw: RawEvent[] = [];

  const closeGame = () => {
    if (window.parent !== window) window.parent.postMessage({ type: 'kolong:close' }, location.origin);
    else location.href = home;
  };

  const labels = (): [string, string] => {
    const s = (k: string) => strings[k] ?? k;
    switch (ui.screen) {
      case 'title': return [s('start'), s('book')];
      case 'book': return [s('back'), s('back')];
      case 'paused': return [s('resume'), s('quit')];
      case 'gameover': return [s('retry'), embed ? s('closeGame') : s('toTitle')];
      default: return [s('btnA'), s('btnB')];
    }
  };

  const setScreen = (next: Screen) => {
    ui.screen = next;
    screenSince = performance.now();
    const [a, b] = labels();
    btnA?.setAttribute('aria-label', `A: ${a}`);
    btnB?.setAttribute('aria-label', `B: ${b}`);
    if (pauseBtn) pauseBtn.hidden = next !== 'playing' && next !== 'paused';
    if (next !== 'playing') input.releaseAll();
    input.clear();
  };

  const startRun = () => {
    state = createState(newSeed());
    ui.newBest = false;
    simTime = performance.now();
    acc = 0;
    setScreen('playing');
  };

  const endRun = () => {
    const score = Math.floor(state.score);
    if (score > ui.best) {
      ui.best = score;
      ui.newBest = true;
      saveBest(score);
    }
    ui.firstRun = false;
    setScreen('gameover');
  };

  const pause = () => {
    if (ui.screen === 'playing') setScreen('paused');
  };
  const resume = () => {
    simTime = performance.now();
    acc = 0;
    setScreen('playing');
  };
  const togglePause = () => {
    if (ui.screen === 'playing') pause();
    else if (ui.screen === 'paused') resume();
  };

  const uiPress = (btn: Btn) => {
    switch (ui.screen) {
      case 'title':
        if (btn === 'A') startRun();
        else setScreen('book');
        break;
      case 'book':
        setScreen('title');
        break;
      case 'paused':
        if (btn === 'A') resume();
        else {
          state = createState(newSeed(), { autoSpawn: false });
          setScreen('title');
        }
        break;
      case 'gameover':
        if (ui.screenAge < GAME_OVER_LOCK_TICKS) break;
        if (btn === 'A') startRun();
        else if (embed) closeGame();
        else {
          state = createState(newSeed(), { autoSpawn: false });
          setScreen('title');
        }
        break;
      default:
        break;
    }
  };

  const input = createInput({
    buttons: { A: btnA, B: btnB },
    onEscape: () => (embed ? closeGame() : togglePause()),
    onPauseKey: togglePause,
  });

  pauseBtn?.addEventListener('click', togglePause);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });
  window.addEventListener('blur', pause);
  window.addEventListener(
    'touchstart',
    () => {
      root.classList.add('has-touch');
      fit();
    },
    { once: true, passive: true },
  );

  function fit(): void {
    const w = root.clientWidth || window.innerWidth;
    let ctrlH = 0;
    if (controls) {
      const cs = getComputedStyle(controls);
      if (cs.display !== 'none' && cs.position !== 'absolute') ctrlH = controls.offsetHeight;
    }
    const availH = embed
      ? root.clientHeight - ctrlH
      : window.innerHeight - stage.getBoundingClientRect().top - ctrlH - 24;
    const scale = Math.max(
      1,
      Math.min(8, Math.floor(Math.min(w / LOGICAL_W, Math.max(MIN_CANVAS_H, availH) / MIN_CANVAS_H))),
    );
    const h = Math.max(MIN_CANVAS_H, Math.min(MAX_CANVAS_H, Math.floor(availH / scale)));
    if (canvas.width !== LOGICAL_W) canvas.width = LOGICAL_W;
    if (canvas.height !== h) canvas.height = h;
    canvas.style.width = `${LOGICAL_W * scale}px`;
    canvas.style.height = `${h * scale}px`;
    ui.canvasH = h;
  }

  new ResizeObserver(fit).observe(root);
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  fit();

  if (embed) {
    window.focus();
    stage.focus({ preventScroll: true });
  }
  setScreen('title');

  const frame = (now: number) => {
    requestAnimationFrame(frame);
    const dt = Math.min(100, now - last);
    last = now;
    ui.now = now;
    frames++;
    if (now - fpsAt >= 500) {
      ui.fps = Math.round((frames * 1000) / (now - fpsAt));
      frames = 0;
      fpsAt = now;
    }
    ui.screenAge = (now - screenSince) / STEP_MS;

    if (ui.screen === 'playing') {
      acc += dt;
      let n = 0;
      while (acc >= STEP_MS && n < 6) {
        simTime += STEP_MS;
        raw.length = 0;
        input.take(simTime, raw);
        step(state, raw);
        acc -= STEP_MS;
        n++;
        if (state.fresh.length > 0) {
          for (const seq of state.fresh) discovered.add(seq);
          state.fresh.length = 0;
          saveDiscovered(discovered);
        }
        if (state.dead && state.tick - state.deadTick >= DEAD_SHOW_TICKS) {
          endRun();
          break;
        }
      }
      if (n === 6) acc = 0;
    } else {
      raw.length = 0;
      input.take(Infinity, raw);
      for (const e of raw) if (e.down) uiPress(e.btn);
    }

    const drift = ui.screen === 'title' || ui.screen === 'book' ? now * 0.03 : undefined;
    drawFrame(ctx, state, ui, drift);
  };
  requestAnimationFrame(frame);
}
