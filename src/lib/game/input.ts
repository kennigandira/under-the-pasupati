// Turns keys and touches into timestamped A/B press events. Nothing else.
// Sources are reference counted per button so a key and a finger can overlap.

import type { Btn } from './sim.ts';

export interface RawEvent {
  t: number;
  btn: Btn;
  down: boolean;
}

export interface InputOptions {
  buttons: Record<Btn, HTMLElement | null>;
  onEscape: () => void;
  onPauseKey: () => void;
}

export interface Input {
  take(upTo: number, out: RawEvent[]): void;
  clear(): void;
  releaseAll(): void;
  dispose(): void;
}

// Left = A (crouch, ollie), Down = B and Right = C (tricks, rail manuals).
const KEYS: Record<string, Btn> = { ArrowLeft: 'A', ArrowDown: 'B', ArrowRight: 'C' };

export function createInput(opts: InputOptions): Input {
  const queue: RawEvent[] = [];
  const sources: Record<Btn, Set<string>> = { A: new Set(), B: new Set(), C: new Set() };
  const cleanups: Array<() => void> = [];

  const stamp = (e?: Event) => {
    const now = performance.now();
    return e ? Math.min(e.timeStamp, now) : now;
  };

  const mark = (btn: Btn, on: boolean) => {
    const el = opts.buttons[btn];
    if (!el) return;
    if (on) el.setAttribute('data-pressed', '');
    else el.removeAttribute('data-pressed');
  };

  const press = (btn: Btn, src: string, t: number) => {
    const set = sources[btn];
    const was = set.size > 0;
    set.add(src);
    if (!was) {
      queue.push({ t, btn, down: true });
      mark(btn, true);
    }
  };

  const release = (btn: Btn, src: string, t: number) => {
    const set = sources[btn];
    if (!set.delete(src)) return;
    if (set.size === 0) {
      queue.push({ t, btn, down: false });
      mark(btn, false);
    }
  };

  const releaseAll = () => {
    const t = stamp();
    for (const btn of ['A', 'B', 'C'] as const) {
      if (sources[btn].size > 0) {
        sources[btn].clear();
        queue.push({ t, btn, down: false });
        mark(btn, false);
      }
    }
  };

  const on = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void) => {
    window.addEventListener(type, fn);
    cleanups.push(() => window.removeEventListener(type, fn));
  };

  on('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const btn = KEYS[e.key];
    if (btn) {
      e.preventDefault();
      if (!e.repeat) press(btn, `key:${e.key}`, stamp(e));
      return;
    }
    if (e.key === 'Escape') {
      if (!e.repeat) opts.onEscape();
    } else if ((e.key === 'p' || e.key === 'P') && !e.repeat) {
      opts.onPauseKey();
    }
  });
  on('keyup', (e) => {
    const btn = KEYS[e.key];
    if (btn) {
      e.preventDefault();
      release(btn, `key:${e.key}`, stamp(e));
    }
  });
  on('blur', releaseAll);

  for (const btn of ['A', 'B', 'C'] as const) {
    const el = opts.buttons[btn];
    if (!el) continue;
    const down = (e: PointerEvent) => {
      e.preventDefault();
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        // capture is best effort
      }
      press(btn, `ptr:${e.pointerId}`, stamp(e));
    };
    const up = (e: PointerEvent) => release(btn, `ptr:${e.pointerId}`, stamp(e));
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (e.type === 'keydown') {
        if (!e.repeat) press(btn, 'btnkey', stamp(e));
      } else release(btn, 'btnkey', stamp(e));
    };
    const noMenu = (e: Event) => e.preventDefault();
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('lostpointercapture', up);
    el.addEventListener('keydown', key);
    el.addEventListener('keyup', key);
    el.addEventListener('contextmenu', noMenu);
    cleanups.push(() => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('lostpointercapture', up);
      el.removeEventListener('keydown', key);
      el.removeEventListener('keyup', key);
      el.removeEventListener('contextmenu', noMenu);
    });
  }

  return {
    take(upTo, out) {
      let i = 0;
      while (i < queue.length && queue[i].t <= upTo) out.push(queue[i++]);
      if (i > 0) queue.splice(0, i);
    },
    clear() {
      queue.length = 0;
    },
    releaseAll,
    dispose() {
      for (const fn of cleanups) fn();
    },
  };
}
