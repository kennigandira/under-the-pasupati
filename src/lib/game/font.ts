// 3x5 bitmap font, upper-case ASCII only. Each glyph is 5 rows of 3 cells
// separated by '/'. Advance is 4 px (3 wide plus 1 gap).

const G: Record<string, string> = {
  A: '.#./#.#/###/#.#/#.#',
  B: '##./#.#/##./#.#/##.',
  C: '.##/#../#../#../.##',
  D: '##./#.#/#.#/#.#/##.',
  E: '###/#../##./#../###',
  F: '###/#../##./#../#..',
  G: '.##/#../#.#/#.#/.##',
  H: '#.#/#.#/###/#.#/#.#',
  I: '###/.#./.#./.#./###',
  J: '..#/..#/..#/#.#/.#.',
  K: '#.#/#.#/##./#.#/#.#',
  L: '#../#../#../#../###',
  M: '#.#/###/###/#.#/#.#',
  N: '##./#.#/#.#/#.#/#.#',
  O: '.#./#.#/#.#/#.#/.#.',
  P: '##./#.#/##./#../#..',
  Q: '.#./#.#/#.#/##./.##',
  R: '##./#.#/##./#.#/#.#',
  S: '.##/#../.#./..#/##.',
  T: '###/.#./.#./.#./.#.',
  U: '#.#/#.#/#.#/#.#/###',
  V: '#.#/#.#/#.#/#.#/.#.',
  W: '#.#/#.#/###/###/#.#',
  X: '#.#/#.#/.#./#.#/#.#',
  Y: '#.#/#.#/.#./.#./.#.',
  Z: '###/..#/.#./#../###',
  '0': '###/#.#/#.#/#.#/###',
  '1': '.#./##./.#./.#./###',
  '2': '##./..#/.#./#../###',
  '3': '##./..#/.#./..#/##.',
  '4': '#.#/#.#/###/..#/..#',
  '5': '###/#../##./..#/##.',
  '6': '.##/#../###/#.#/###',
  '7': '###/..#/.#./.#./.#.',
  '8': '###/#.#/###/#.#/###',
  '9': '###/#.#/###/..#/##.',
  '.': '.../.../.../.../.#.',
  ',': '.../.../.../.#./#..',
  '!': '.#./.#./.#./.../.#.',
  '?': '##./..#/.#./.../.#.',
  ':': '.../.#./.../.#./...',
  '-': '.../.../###/.../...',
  "'": '.#./.#./.../.../...',
  '/': '..#/..#/.#./#../#..',
  '+': '.../.#./###/.#./...',
  '<': '..#/.#./#../.#./..#',
  '>': '#../.#./..#/.#./#..',
  ' ': '.../.../.../.../...',
};

const CACHE = new Map<string, boolean[]>();

function glyph(ch: string): boolean[] {
  const hit = CACHE.get(ch);
  if (hit) return hit;
  const src = (G[ch] ?? G['?']).replaceAll('/', '');
  const bits: boolean[] = [];
  for (let i = 0; i < 15; i++) bits.push(src[i] === '#');
  CACHE.set(ch, bits);
  return bits;
}

export const ADVANCE = 4;
export const GLYPH_H = 5;

export function textWidth(text: string, scale = 1): number {
  return Math.max(0, text.length * ADVANCE - 1) * scale;
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  scale = 1,
): void {
  ctx.fillStyle = color;
  const up = text.toUpperCase();
  for (let n = 0; n < up.length; n++) {
    const bits = glyph(up[n]);
    const gx = x + n * ADVANCE * scale;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 3; c++) {
        if (bits[r * 3 + c]) ctx.fillRect(gx + c * scale, y + r * scale, scale, scale);
      }
    }
  }
}

// Text with a drop shadow, for legibility over busy backgrounds.
export function drawShadowText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  shadow: string,
  scale = 1,
): void {
  drawText(ctx, text, x + scale, y + scale, shadow, scale);
  drawText(ctx, text, x, y, color, scale);
}

// Word-wrap by glyph count to a pixel width.
export function wrap(text: string, maxWidth: number, scale = 1): string[] {
  const perLine = Math.max(1, Math.floor((maxWidth / scale + 1) / ADVANCE));
  const lines: string[] = [];
  let cur = '';
  for (const w of text.split(' ')) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > perLine && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
