// Kolong Run tunables. Everything in the simulation is counted in ticks (1/60 s).
// Numbers marked [A] in docs/trd-kolong-run.md are meant to be tuned here.

export const STEP_MS = 1000 / 60;

// Playfield: 176 wide, 96 tall. The canvas is at least MIN_CANVAS_H tall and
// grows in portrait (up to MAX_CANVAS_H); the extra headroom is drawn above the
// playfield. Simulation coordinates never change.
export const LOGICAL_W = 176;
export const PLAYFIELD_H = 96;
export const MIN_CANVAS_H = 170;
export const MAX_CANVAS_H = 240;
export const GROUND_Y = 76;
export const PLAYER_X = 44;

// Jump physics.
export const GRAVITY = 0.1;
// Pop height grows smoothly with crouch time: APEX_MIN at a tap, APEX_MAX once
// the crouch reaches CROUCH_FULL_TICKS (holding longer adds nothing).
export const APEX_MIN = 14;
export const APEX_MAX = 60;
export const CROUCH_FULL_TICKS = 30;
export const MANUAL_POP_TICKS = 12;
export const NOLLIE_APEX = 0.85;
export const MAX_LAUNCH_VY = -3.6;
export const RIDE_POP_BONUS = 0.9;

// Speed (px per tick).
export const START_SPEED = 70 / 60;
export const CAP_SPEED = 140 / 60;
export const RAMP_DISTANCE = 9450;
export const SPEED_PER_PX = (CAP_SPEED - START_SPEED) / RAMP_DISTANCE;
export const PUDDLE_SLOW = 0.7;
export const BOWL_BOOST = 0.15;

// Input feel.
export const COYOTE_TICKS = 5;
export const BUFFER_TICKS = 6;
export const TAP_MAX = 10;
export const COMBO_GAP = 9;
export const BAIL_WINDOW = 7;

// Rails: press A (manual) or B (nose manual) this close to touchdown or lose
// the run. EARLY counts presses before touchdown, LATE after.
export const RAIL_EARLY_TICKS = 8;
export const RAIL_LATE_TICKS = 6;

// Collision.
export const SNAP_BAND = 2;
export const WALL_RISE = 6;
export const DROP_STICK = 4;
export const FOOT_HALF = 3;

// Scoring.
export const DIST_POINTS_PER_PX = 0.1;
export const GRIND_POINTS_PER_TICK = 0.4;
export const MANUAL_MUL = 1.3;
export const NOSE_MANUAL_MUL = 1.6;
export const MULT_CAP = 8;
export const NOLLIE_TRICK_MUL = 1.1;
export const REPEAT_TRICK_MUL = 0.5;
export const SKETCHY_MUL = 0.5;

// Level generation. Gaps are generous on purpose: about one obstacle per screen.
export const T_LOW = 40;
export const REACT_TICKS = 34;
export const GAP_EXTRA_MIN = 40;
export const GAP_EXTRA_RANGE = 100;
export const SPAWN_MARGIN = 40;
export const FIRST_CHUNK_X = 260;
export const TIER_START = [0, 600, 1800, 3600] as const;

// Presentation.
export const DEAD_SHOW_TICKS = 50;
