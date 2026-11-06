// Code-defined pixel maps, compiled once into small canvases.
// Legend: k ink, s skin, h cap, r shirt, b pants, w shoes, . transparent.

const PALETTE: Record<string, string> = {
  k: '#101010',
  s: '#f2c29b',
  h: '#ff3ea5',
  r: '#ff4d00',
  b: '#2b5cff',
  w: '#ffffff',
};

const RIDE = [
  '..hhhh..',
  '..hsss..',
  '..sssk..',
  '...ss...',
  '..rrrr..',
  '.rrrrrr.',
  '.rrrrrr.',
  '..rrrr..',
  '..bbbb..',
  '..bbbb..',
  '..b..b..',
  '..b..b..',
  '.ww..ww.',
  '.ww..ww.',
];

const CROUCH = [
  '........',
  '........',
  '........',
  '........',
  '..hhhh..',
  '..hsss..',
  '..sssk..',
  '.rrrrr..',
  'rrrrrrr.',
  '.rrrrr..',
  '..bbbb..',
  '.bb..bb.',
  '.ww..ww.',
  '.ww..ww.',
];

const AIR = [
  '..hhhh..',
  '..hsss..',
  '..sssk..',
  'rr.ss.rr',
  '.rrrrrr.',
  '..rrrr..',
  '..bbbb..',
  '.bbbbbb.',
  '.bb..bb.',
  '.bb..bb.',
  '.b....b.',
  '.b....b.',
  '.ww..ww.',
  '.ww..ww.',
];

const DEAD = [
  '..............',
  'hhssrrrrbbbbww',
  'hsskrrrrbbbbww',
  '.ss.rrrr.bb.ww',
  '..............',
];

export type Pose = 'ride' | 'crouch' | 'air' | 'dead';

function compile(rows: string[]): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = rows[0].length;
  c.height = rows.length;
  const g = c.getContext('2d')!;
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const col = PALETTE[rows[y][x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

let sprites: Record<Pose, HTMLCanvasElement> | null = null;

export function getSprite(pose: Pose): HTMLCanvasElement {
  sprites ??= {
    ride: compile(RIDE),
    crouch: compile(CROUCH),
    air: compile(AIR),
    dead: compile(DEAD),
  };
  return sprites[pose];
}
