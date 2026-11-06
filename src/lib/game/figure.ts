// Procedural pixel rider: a jointed figure and a board drawn with thick pixel
// lines, so both can tilt to any angle without jagged sprite rotation.
// Local space: origin at the board's top centre, x forward, y down (up is
// negative). The renderer places it with the wheels' bottom at y.

export type PoseName = 'ride' | 'crouch' | 'pop' | 'air';
type J = [number, number];

interface Pose {
  bf: J; bk: J; ff: J; fk: J; hip: J; sh: J; head: J; bh: J; fh: J;
}

const POSES: Record<PoseName, Pose> = {
  ride: { bf: [-6, -1], bk: [-6, -9], ff: [6, -1], fk: [6, -9], hip: [0, -17], sh: [0, -27], head: [1, -32], bh: [-4, -19], fh: [5, -21] },
  crouch: { bf: [-7, -1], bk: [-10, -7], ff: [7, -1], fk: [10, -7], hip: [-1, -12], sh: [2, -21], head: [4, -26], bh: [-6, -14], fh: [9, -16] },
  pop: { bf: [-7, -1], bk: [-6, -10], ff: [6, -4], fk: [6, -11], hip: [0, -19], sh: [1, -29], head: [2, -34], bh: [-8, -25], fh: [9, -27] },
  air: { bf: [-6, -1], bk: [-4, -7], ff: [7, -2], fk: [8, -8], hip: [0, -14], sh: [1, -24], head: [2, -29], bh: [-8, -21], fh: [9, -23] },
};

const INK = '#101010';
const COL = {
  skin: '#f2c29b',
  skinBack: '#d9a37d',
  shirt: '#ff4d00',
  shirtBack: '#c93c00',
  pants: '#2b5cff',
  pantsBack: '#1c3fb3',
  shoe: '#ffffff',
  cap: '#ff3ea5',
  deckTop: '#101010',
  deckBottom: '#ff3ea5',
  nose: '#ffd400',
  wheel: '#101010',
  hub: '#bdb6a2',
  ghost: '#b3ab96',
};

export interface Rider {
  x: number;
  y: number;
  poseA: PoseName;
  poseB: PoseName;
  blend: number;
  // Radians, positive = nose up.
  boardTilt: number;
  bodyTilt: number;
  pivotX: number;
  // Horizontal squash of the body for a body turn (1 = facing forward).
  kx: number;
  // Board trick state.
  spin: number;
  flip: number;
  loop: number | null;
  ghosts: ReadonlyArray<{ spin: number; flip: number }>;
  boardDx: number;
  boardDy: number;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function blendPose(a: Pose, b: Pose, t: number): Pose {
  const out = {} as Pose;
  for (const k of Object.keys(a) as Array<keyof Pose>) {
    out[k] = [lerp(a[k][0], b[k][0], t), lerp(a[k][1], b[k][1], t)];
  }
  return out;
}

function rot(px: number, py: number, cx: number, cy: number, a: number): J {
  const dx = px - cx;
  const dy = py - cy;
  const s = Math.sin(a);
  const c = Math.cos(a);
  return [cx + dx * c + dy * s, cy - dx * s + dy * c];
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
}

function line(ctx: CanvasRenderingContext2D, a: J, b: J, thick: number, color: string): void {
  ctx.fillStyle = color;
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    dot(ctx, lerp(a[0], b[0], t), lerp(a[1], b[1], t), thick);
  }
}

function limb(ctx: CanvasRenderingContext2D, a: J, b: J, thick: number, color: string): void {
  line(ctx, a, b, thick + 2, INK);
  line(ctx, a, b, thick, color);
}

// Board in local space. Foreshortened by spin (shove-it) and thickened by flip.
function drawBoard(
  ctx: CanvasRenderingContext2D,
  r: Rider,
  spin: number,
  flip: number,
  ghost: boolean,
  origin: J,
): void {
  const kxs = Math.max(0.3, Math.abs(Math.cos(spin)));
  const noseFwd = Math.cos(spin) >= 0 ? 1 : -1;
  const thick = 3 + Math.round(3 * Math.abs(Math.sin(flip)));
  const gripUp = Math.cos(flip) >= 0;
  const top = ghost ? COL.ghost : gripUp ? COL.deckTop : COL.deckBottom;
  const bottom = ghost ? COL.ghost : gripUp ? COL.deckBottom : COL.deckTop;

  const loopPivot: J = [-5, 0];
  const place = (lx: number, ly: number): J => {
    let x = lx * kxs * noseFwd;
    let y = ly + 1;
    let p: J;
    if (r.loop !== null) {
      p = rot(x, y, loopPivot[0], loopPivot[1], r.loop);
    } else {
      p = rot(x, y, r.pivotX, 5, r.boardTilt);
    }
    x = origin[0] + p[0] + r.boardDx;
    y = origin[1] + p[1] + r.boardDy;
    return [x, y];
  };

  // Deck with kicked tail and nose.
  const tail = place(-14, -2);
  const tailJoin = place(-10, 0);
  const noseJoin = place(10, 0);
  const nose = place(14, -2);
  if (!ghost) {
    line(ctx, tail, tailJoin, thick + 2, INK);
    line(ctx, tailJoin, noseJoin, thick + 2, INK);
    line(ctx, noseJoin, nose, thick + 2, INK);
  }
  line(ctx, tail, tailJoin, thick, bottom);
  line(ctx, tailJoin, noseJoin, thick, bottom);
  line(ctx, noseJoin, nose, thick, bottom);
  // Grip tape stripe on the visible face.
  const off = gripUp ? -1 : 1;
  const lift = (p: J): J => [p[0], p[1] + off * Math.max(0, (thick - 1) / 2)];
  line(ctx, lift(tail), lift(tailJoin), 1, top);
  line(ctx, lift(tailJoin), lift(noseJoin), 1, top);
  line(ctx, lift(noseJoin), lift(nose), 1, top);
  if (!ghost) {
    ctx.fillStyle = COL.nose;
    dot(ctx, nose[0], nose[1], 3);
    // Wheels sit on the underside.
    const extra = Math.floor((thick - 3) / 2);
    const wLocal = gripUp ? 3 + extra : -1 - extra;
    for (const wxl of [-8, 8]) {
      const w = place(wxl, wLocal - 1);
      ctx.fillStyle = COL.wheel;
      dot(ctx, w[0], w[1], 4);
      ctx.fillStyle = COL.hub;
      dot(ctx, w[0], w[1], 2);
    }
  }
}

function drawBody(ctx: CanvasRenderingContext2D, r: Rider, origin: J): void {
  const pose = blendPose(POSES[r.poseA], POSES[r.poseB], r.blend);
  const pv: J = [r.pivotX, 5];
  const tf = (j: J): J => {
    const q = rot(j[0] * r.kx, j[1], pv[0], pv[1], r.bodyTilt);
    return [origin[0] + q[0], origin[1] + q[1]];
  };
  const bf = tf(pose.bf);
  const bk = tf(pose.bk);
  const ff = tf(pose.ff);
  const fk = tf(pose.fk);
  const hip = tf(pose.hip);
  const sh = tf(pose.sh);
  const head = tf(pose.head);
  const bh = tf(pose.bh);
  const fh = tf(pose.fh);
  const facing = r.kx >= 0 ? 1 : -1;

  const shoe = (f: J) => {
    ctx.fillStyle = INK;
    ctx.fillRect(Math.round(f[0] - 4), Math.round(f[1] - 2), 8, 4);
    ctx.fillStyle = COL.shoe;
    ctx.fillRect(Math.round(f[0] - 3), Math.round(f[1] - 1), 6, 2);
  };

  // Back limbs first so the front ones overlap them.
  limb(ctx, hip, bk, 4, COL.pantsBack);
  limb(ctx, bk, bf, 4, COL.pantsBack);
  shoe(bf);
  limb(ctx, sh, bh, 3, COL.skinBack);
  limb(ctx, hip, sh, 7, COL.shirt);
  // Head with a cap and visor.
  ctx.fillStyle = INK;
  ctx.fillRect(Math.round(head[0] - 5), Math.round(head[1] - 5), 10, 10);
  ctx.fillStyle = COL.skin;
  ctx.fillRect(Math.round(head[0] - 4), Math.round(head[1] - 4), 8, 8);
  ctx.fillStyle = COL.cap;
  ctx.fillRect(Math.round(head[0] - 4), Math.round(head[1] - 4), 8, 3);
  ctx.fillRect(Math.round(head[0] + (facing > 0 ? 4 : -7)), Math.round(head[1] - 3), 3, 1);
  ctx.fillStyle = INK;
  ctx.fillRect(Math.round(head[0] + (facing > 0 ? 1 : -2)), Math.round(head[1]), 1, 2);
  limb(ctx, hip, fk, 4, COL.pants);
  limb(ctx, fk, ff, 4, COL.pants);
  shoe(ff);
  limb(ctx, sh, fh, 3, COL.skin);
}

export function drawRider(ctx: CanvasRenderingContext2D, r: Rider): void {
  const origin: J = [r.x, r.y - 5];
  for (let i = r.ghosts.length - 1; i >= 0; i--) {
    drawBoard(ctx, r, r.ghosts[i].spin, r.ghosts[i].flip, true, origin);
  }
  drawBoard(ctx, r, r.spin, r.flip, false, origin);
  drawBody(ctx, r, origin);
}
