# PRD: Kolong Run, a hidden two-button skateboard runner

**Status:** Draft for review, revision 1. Built through M4 (popup flag off in production); see the TRD revision 2 for tuning changes.

**Revision 3 (2026-11-06).** Owner design feedback applied: bigger rider and board with tilt and trick detail, quiet greyscale background, rails need a timed A (manual) or B (nose manual), stairs and bowl are raised structures you ride up onto, sparser obstacles, no how-to-play section. Details are in the TRD revision 3. The "Stairs" and "Bowl" rows and the rail behaviour in section 6.6 are superseded by it.

**Date:** 2026-11-06

**Working title:** Kolong Run, route `/kolong-run/` (decided, Q1). "Kolong" is what the park copy already calls the space under the flyover.

**Revision 1 (2026-11-06).** Owner decisions applied:

- Discovery is a first-visit popup on the homepage with a feature flag (Q2), see sections 7 and 11 (M4). The flag gates only the popup. The hidden route is always built and reachable by URL in every environment, so it can be tested with the flag off.
- A bail ends the run (Q3), see section 6.5.
- Dropped: SOTM skins (Q4), gtag events (Q6), all sound (Q7).
- Added: `npm test` and a CI step (Q8), reference devices (Q9), Indonesian and English from M1 (Q10).

Evidence markers used throughout:

- **[V]** verified in this repo, source given.
- **[A]** assumption or tunable number, to be settled in playtests.
- **[E]** estimate.

## 1. Summary

**Ask.** A pixel-art endless runner in the spirit of Chrome's offline dino game, but on a skateboard, at the hidden route `/kolong-run/` on underthepasupati.org. The route is always reachable by URL. It is also offered once to first-time visitors as a popup on the homepage, behind a feature flag that controls only the popup. Two inputs only: A and B. Obstacles can be dodged, ridden (rail, ledge, stairs) or used as launchers (ramp, bowl). Tricks come from tap sequences on the two buttons.

**Recommendation.** Build it as a self-contained canvas game with no new dependency, no image assets and no audio, driven by a deterministic fixed-step simulation that is separate from rendering. Theme it on the real park: the obstacle set in `src/data/content.ts` already names a bank ramp, kicker, quarters, ledge, flat rail, manual pad and pyramid [V]. The route stays out of navigation, sitemap and search (`noindex`) but is never gated by the flag. The homepage popup loads the route in a dialog only when the flag is on and the visitor is new.

## 2. Problem

The site is an informational record of the park: journal, SOTM, partners, events [V: nav in `src/layouts/Base.astro`]. There is nothing playful for the community to share, and nothing that lets non-skaters feel what the park's obstacles are about.

This is a delight feature for the skater community, not a conversion feature. The route itself must not appear in navigation, search results or the sitemap. People reach it through the first-visit homepage popup or a direct link.

## 3. Goals and non-goals

### Goals

- G1. One-hand-per-button play on phone (A and B on screen) and with two arrow keys on desktop (left = A, right = B).
- G2. Dino-like readability: dodge or clear obstacles, speed ramps up, one clear failure condition, instant retry.
- G3. Skate depth from only two inputs: pop height from hold time, rideable obstacles, ramps and bowls as big-air windows, and a tap-sequence trick grammar that rewards exploration.
- G4. Pixel look that matches the site's sticker/zine palette.
- G5. The route is not in the nav, not in the sitemap and not indexable, and it is always reachable by direct URL regardless of the popup flag.
- G6. Bilingual UI (id default, en) following the existing locale routing.
- G7. A first-visit homepage popup offers the game, with a feature flag to show or hide only the popup, and a game-over screen that sends the player back to the park ("Gas absen di kolong!") or into another run ("Masih penasaran").

### Non-goals

- Accounts, online leaderboard, multiplayer, monetisation.
- Gamepad, key remapping, installable app, service-worker offline mode.
- Sound of any kind, and custom analytics events.
- A pixel-art asset pipeline. Sprites are defined in code.
- Server changes in the App-UTP Supabase project.

## 4. Repo findings that shape the design

| Finding | Source | Consequence |
|---|---|---|
| Astro 5 static output, `trailingSlash: 'always'`, deployed to Cloudflare Pages | `astro.config.mjs`, `package.json` [V] | The game is a client-only script on a static page. No backend. |
| Pages live in `src/pages/[...lang]/` and use `localeRoutes()` and `routeLang()`; default language `id` sits at the root, `en` under `/en/` | `src/pages/[...lang]/support.astro`, `src/i18n/ui.ts` [V] | Route is `/<slug>/` and `/en/<slug>/`. Strings go in `ui.ts` under `game.*`. |
| `Base.astro` has no robots or noindex prop and always emits canonical and hreflang | `src/layouts/Base.astro` [V] | Add an optional `noindex` prop to the layout. |
| Nav is a hard-coded array in `Base.astro`; static sitemap paths are a hard-coded array in `sitemap.xml.ts` | both files [V] | Hidden means: do not add the route to either list. |
| `public/robots.txt` allows everything and points to the sitemap | `public/robots.txt` [V] | Do not add a `Disallow` line: it advertises the path and stops crawlers from seeing `noindex`. |
| A fixed full-screen grain overlay (`body::after`, `z-index: 200`, multiply blend) covers every page | `src/styles/global.css` [V] | It would blur the pixels. The game page must switch it off with a page-scoped class. |
| Palette tokens: paper `#f4efe2`, ink `#101010`, accent `#ff4d00`, pink `#ff3ea5`, blue `#2b5cff`, green `#1f9d55`, tape `#ffd400` | `src/styles/global.css` [V] | The game palette reuses these plus a few greys. |
| Webfonts come from Google Fonts (Anton, Bungee, Space Grotesk, Space Mono) | `src/layouts/Base.astro` [V] | In-canvas HUD uses a code-defined bitmap font, not a webfont, to stay pixel-exact. |
| Components that need JS use an Astro `<script>` block (`ShareBar`, `LiveVisitors`, `CoachMedia`) | `src/components/*` [V] | Same pattern for the game shell. Helpers go in `src/lib/`. |
| `LiveVisitors` calls `public_stats` on Supabase with optional env keys; with empty keys it renders nothing | `src/components/LiveVisitors.astro`, `.env.example` [V] | A live "skaters in the kolong now" feature is possible and must degrade to nothing. |
| `ShareBar` hands a generated PNG to `navigator.share` on phones and downloads it on desktop | `README.md` Sharing section [V] | Same flow for sharing a run card. |
| Park obstacles in data: `bank-ramp`, `kicker-hitam`, `quarter-perak`, `ledge-merah`, `quarter-biru`, `quarter-pilar`, `manual-pad`, `pyramid-biru`, `flat-rail` (list matched by name filter, may not be exhaustive) | `src/data/content.ts` lines 788-886 [V] | The in-game obstacle set maps one-to-one onto the real park. |
| `body` has `overflow-x: hidden`; there is no `dvh` handling and no 404 page | `src/styles/global.css`, `src/pages` [V] | Game shell must set its own viewport height (`100dvh`) and touch behaviour. |
| No test runner in `package.json`; CI builds on Node 22 and deploys | `package.json`, `.github/workflows/deploy.yml` [V] | Tests use built-in `node --test` on the pure sim, with an `npm test` script and a CI step (decided, Q8). |
| gtag loads in production builds only | `src/layouts/Base.astro` [V] | The game adds no events of its own (decided, Q6). Site-wide gtag is untouched. |
| `.env.production` is committed and holds build-time `PUBLIC_*` variables; Cloudflare git builds ignore dashboard variables | `.env.production`, commit `0cdec63` [V] | The popup flag is a `PUBLIC_*` variable in the same file. Flipping it is a commit and a deploy. |
| The homepage already has inline scripts and a `LiveVisitors` block | `src/pages/[...lang]/index.astro` lines 186, 406, 430 [V] | The popup mounts in that page. |
| Not verified | n/a | Whether Google's intrusive-interstitial guidance applies to a first-visit popup on mobile landings from search. |

## 5. Users and stories

- As a skater at the park, I want to open the link on my phone and play with two thumbs, so that I can kill time between turns.
- As a skater, I want the obstacles to look like the ones I ride, so that the game feels like our park.
- As a first-timer, I want to clear the first obstacles with a plain ollie, so that I do not need a tutorial to start.
- As a returning player, I want to discover trick combos by experimenting, so that I keep finding new ones.
- As a desktop visitor, I want to play with the left and right arrow keys only.
- As a maintainer, I want the game to stay out of search results and navigation, so that it remains an easter egg.
- As a maintainer, I want game tuning (tricks, chunks) in data files, so that I can adjust without touching the engine.

## 6. Game concept

### 6.1 Core loop

The skater rolls right at an automatic, rising speed. Obstacles scroll in from the right. The run ends on a solid collision or a bail. Score comes from distance, clean clears, grinds and tricks. Retry is one button press.

### 6.2 Presentation

- Fixed logical resolution of 176 by 96 pixels [A], drawn to a canvas at that size and scaled by CSS with `image-rendering: pixelated` at an integer factor. Fixed logical size means identical gameplay on every device. Letterbox the remainder.
- Palette of at most 16 colours, built from the site tokens in section 4.
- Parallax: far sky, flyover deck and pillars overhead (the "kolong"), mid walls and warung silhouettes, near ground with concrete seams.
- HUD drawn in canvas with a 3 by 5 bitmap font: score, best, multiplier, current trick name.
- Screen shake and flash are disabled when `prefers-reduced-motion: reduce`.

### 6.3 Controls

| Input | Desktop | Mobile | Meaning |
|---|---|---|---|
| A | Left arrow | On-screen A, bottom-left | Left foot on screen: the tail, the rear of the board |
| B | Right arrow | On-screen B, bottom-right | Right foot on screen: the nose, the front of the board |
| Pause | P (standalone), Esc (standalone) | Small pause control in the corner | Not a gameplay input. In the popup, Esc closes it. |

The mapping is spatial (left button = rear of the board) so no stance setting is needed [A].

Mobile buttons use pointer events with `touch-action: none`, support two simultaneous touches, are at least 88 by 88 CSS pixels [A] (above the 44 px touch-target floor), respect `env(safe-area-inset-*)`, and suppress text selection and the long-press callout. Buttons appear when `(pointer: coarse)` matches or after the first touch. Desktop ignores `keydown` repeats and calls `preventDefault` on arrows inside the game page so the page does not scroll.

### 6.4 Input grammar

All times are tunables [A].

| Situation | Input | Result |
|---|---|---|
| On ground | Hold A, release | Ollie. The skater crouches while held. Height scales with hold time in three steps (low, mid, high), capped at roughly 350 ms of hold. |
| On ground | Hold B, release | Nollie, the other foot. 85% of ollie height cap, tricks scored with a 1.1 multiplier. |
| On ground | Quick press and release | Minimum-height pop. Any release on the ground is a pop, so there is no tap-or-hold ambiguity on the ground. |
| In air | Tap A or B (press shorter than 10 ticks, 167 ms) | Adds one symbol to the trick buffer. |
| In air | Hold A or B (167 ms or longer) | Grab, rideable on ramps and bowls only (M3). |
| Grinding | Hold the button for the style, release to pop off | Style is the button held while grinding (M3). Release pops off the obstacle. |
| Anywhere | A and B together on a manual pad | Manual (M3). |

Feel rules:

- Coyote time of 90 ms [A]: a pop pressed shortly after leaving a ledge still counts.
- Input buffer of 100 ms [A]: a press shortly before landing becomes the next crouch.
- One pop per ground contact, so mashing cannot chain hops.

### 6.5 Trick grammar

A sequence is 1 to 4 taps of A and B in the air. The buffer closes when 9 ticks (150 ms) pass after the last tap, or the fourth tap lands [A, see TRD]. The resolved trick animates for 16 ticks (0.27 s, one tap) up to 28 ticks (0.47 s, four taps) [A].

Latency answer: the first tap plays a neutral 120 ms board flick at once, and the rotation commits when the buffer closes. This keeps one-tap tricks from feeling late and is the first thing to playtest.

Rule of thumb the player can learn: A taps scoop the tail (spin the board flat), B taps flick the nose (flip the board). Counts set how many rotations, order picks the variant.

Starter table. Names stay as listed for now; the park-skater review is skipped (Q14). Points are base values before obstacle bonus and multiplier [A].

| Sequence | Trick | Base |
|---|---|---|
| A | Pop shove-it | 100 |
| B | Kickflip | 150 |
| A A | 360 shove-it | 200 |
| B B | Double kickflip | 300 |
| A B | Varial kickflip | 250 |
| B A | Hardflip | 250 |
| A A B | 360 flip | 400 |
| A B A | Impossible | 350 |
| B A B | Bigspin flip | 400 |
| B B B | Triple kickflip | 500 |
| B B B A | Triple flip plus shove-it | 700 |
| A A A B | 540 flip | 650 |

The two combos from the brief are in the table: double tap A then B (`A A B`) and triple tap B then one tap A (`B B B A`). Sequences not in the table resolve to the longest recognised prefix and the extra taps are ignored.

Air budget creates the skill ceiling. Minimum clean airtime [E, derived in the TRD]: one tap about 0.58 s, two taps about 0.82 s, three taps about 1.05 s, four taps about 1.28 s. A plain ollie gives 0.57 s to 0.90 s [A], so one and two taps fit on flat ground, and three or four taps need a stair gap, kicker, quarter or bowl. That includes both combos from the brief (`A A B`, `B B B A`). The player chooses risk. Decided (OQ2): trick animations must be intuitive and are not shortened to fit. If a trick does not fit the air available after M0 tuning, it is removed from the table.

Landing check:

| Result | Condition | Effect |
|---|---|---|
| Clean | Trick animation finished before touchdown | Points awarded, multiplier +1 |
| Sketchy | Animation finishes within 120 ms after touchdown | Points halved, multiplier kept |
| Bail | Animation still running more than 120 ms after touchdown | The skater slams and the run ends, same as a collision (decided, Q3) |

Variety rule: repeating the same trick within the last three tricks scores x0.5. This pushes players to explore the grammar.

Trick Book: a screen reachable from the title with B. Undiscovered sequences show only their length. Discovered tricks are stored in `localStorage`.

### 6.6 World and obstacles

All obstacles are optional to ride: every one of them can be passed with a plain ollie of the right height. Tricks and rides are score only.

| Obstacle | Park counterpart [V] | Behaviour | Plain pass | Ride or use |
|---|---|---|---|---|
| Box | generic | Solid, 8 px tall [A] | Ollie over (+10) | Not rideable |
| Ledge | `ledge-merah` | Solid box, 10 px tall [A], rideable top | Ollie over | Land on top to slide or manual; points per px. Falling off the end is safe |
| Flat rail | `flat-rail` | Thin bar at 11 px [A] | Ollie over | Land on it to grind; points per px |
| Stairs (down set) | n/a | 3 to 6 steps down | Ollie across the gap | Clearing the gap scores by step count. A short pop drops you onto the steps: bail |
| Kicker | `kicker-hitam` | Ramp up, drop behind | Ollie over | Launches with speed carried, pop at the lip adds height |
| Bank ramp | `bank-ramp` | Longer ramp up and down | Ollie over or ride through | Medium air |
| Pyramid | `pyramid-biru` | Up, flat top, down | Ollie over | Land on top for a short ride, then launch |
| Quarter | `quarter-perak`, `quarter-biru`, `quarter-pilar` | Steep transition | Not required | Big air above the lip |
| Bowl | quarter pair | Drop in, gain speed, climb the far wall | Ride through (no crash) | Largest air, the only place for 4-tap sequences with margin |
| Puddle | puddle by `quarter-perak` | Slows the skater, never crashes | Ollie over | n/a |
| Low beam (M3) | flyover | Overhead girder over a ramp line | Do not pop to full height | Punishes max pops, so hold time matters in both directions |

Level generation: hand-authored chunks ("lines") of one to three screens, picked by weighted random from a seeded generator, with difficulty tiers unlocked by distance. Reachability constraint: for every chunk and every speed up to cap, the gap between hazards is at least the ground distance of the minimum useful ollie, so a plain-ollie bot can always survive. This is checked by a simulation test (section 9).

Speed: starts at 70 px/s and rises to a cap of 140 px/s over about 90 s of play, tunable up to 170 px/s in M0 [A, see TRD].

### 6.7 Scoring

- Distance: 1 point per metre-equivalent of scroll.
- Clears: fixed points per obstacle type.
- Rides: points per second on a grind, slide or manual, with a style bonus for non-default grind (M3).
- Tricks: base x obstacle bonus x multiplier x variety rule x nollie 1.1.
- Multiplier: +1 per clean landing, capped at 8 [A]. A sketchy landing keeps it. The run ends on collision or bail, and the final score is whatever was banked.

### 6.8 Screens

All screens are driven by A and B so the game never needs a third gameplay control.

| Screen | A | B |
|---|---|---|
| Title | Start | Trick Book |
| Playing | Left foot | Right foot |
| Paused | Resume | Quit to title |
| Game over, standalone | Retry | Share the run (M5) |
| Game over, in the popup | "Masih penasaran" / "Still curious": retry | "Udah mainnya? Gas absen di kolong!" / "Done playing? Go check in at the kolong!": close the popup |

The first run shows two contextual prompts only: "hold A, release" when the first obstacle approaches, and "tap in the air" after the first ramp or stair gap.

## 7. Route and homepage popup

- Path: `src/pages/[...lang]/kolong-run/index.astro`, served at `/kolong-run/` and `/en/kolong-run/` (decided, Q1). The page is built in every environment and is not conditional on any flag: open the URL directly to test, with the popup flag on or off. A sibling route `/kolong-run/embed/` (and `/en/kolong-run/embed/`) is the popup's iframe target, also always built and also `noindex`.
- Not added to the `nav` array in `Base.astro` and not added to `staticPaths` in `sitemap.xml.ts`.
- `Base.astro` gets an optional `noindex?: boolean` prop that emits `<meta name="robots" content="noindex,nofollow">`. The game page passes it.
- Optional hardening: a Cloudflare Pages `public/_headers` entry sending `X-Robots-Tag: noindex` for the route. The repo has no `_headers` file today [V: `public/` listing].
- No `Disallow` in `robots.txt` (see section 4).
- Discovery is the homepage popup below or a direct link, not a nav link.
- Hidden is not secret: the route is public to anyone with the URL and contains nothing sensitive.
- Default social card is acceptable; the page needs no custom OG image.
- Game page turns off the grain overlay and sets `100dvh`, `overscroll-behavior: none` and `touch-action` rules scoped to the page.

### Homepage popup

- Where: the Indonesian homepage (`/`) and the English homepage (`/en/`), in `src/pages/[...lang]/index.astro`.
- When: first visit only. A `localStorage` key (for example `kolong:seen`) is written when the popup is shown, so a reload does not show it again. The popup opens after the page has loaded and gone idle, with a delay of about 2 s [A]. If storage is unavailable, show nothing.
- Flag: build-time `PUBLIC_KOLONG_POPUP`, read like the Supabase variables in `LiveVisitors.astro` [V]. Only the exact value `true` enables it. It controls the popup only: the `/kolong-run/` route is unaffected. When off, no popup markup and no popup script are rendered, so the homepage is unchanged. Document it in `.env.example` (default off) and set it in `.env.production`.
- Mechanism [A]: a native `<dialog>` opened with `showModal()` that holds an `<iframe>` pointing at `/kolong-run/embed/` (or `/en/kolong-run/embed/`). The frame is created only when the popup opens, so the game code is never downloaded for returning visitors or when the flag is off. The alternative, importing the game module straight into the homepage, saves the frame but couples the game to the homepage bundle.
- Embed route: `/kolong-run/embed/` is a separate static page built with a `bare` layout (new optional `Base.astro` prop that skips header and footer). It shows the popup game-over buttons and posts a `kolong:close` message to the parent. The standalone `/kolong-run/` keeps the site header and footer. A separate route is used because the site is static and a query string is unknown at build time.
- Dismissal: a visible close button and Esc work at any time, including before the first run. The popup never forces the player to reach game over.
- Game over buttons (copy from the owner, English translated): "Udah mainnya? Gas absen di kolong!" (en: "Done playing? Go check in at the kolong!") closes the popup. "Masih penasaran" (en: "Still curious") starts a new run. A is retry, B is close, matching the rest of the A/B screen mapping.
- Phones: the dialog fills the dynamic viewport so the canvas and both buttons fit; on desktop it is a centred panel.
- Keyboard: when the dialog opens, focus moves into the frame so the arrow keys reach the game; on close, focus returns to the element that had it.

## 8. Requirements

### Functional

- F1. Route renders in both languages, is always built regardless of the popup flag, and stays out of nav, sitemap and search per section 7.
- F2. Canvas at 176 by 96 logical pixels, integer scaling, pixelated rendering, letterboxed.
- F3. Two-input control scheme per section 6.3, including simultaneous touches.
- F4. Ollie and nollie with three hold-time heights; coyote time and input buffer.
- F5. Obstacles of section 6.6 with ride, grind and launch behaviour; M1 ships box, ledge, flat rail, stairs and kicker, M3 the rest.
- F6. Trick buffer and recogniser per section 6.5, driven by a data table.
- F7. Landing check, multiplier and variety rule per section 6.5 and 6.7.
- F8. Title, play, pause, game over and Trick Book screens per section 6.8.
- F9. Best score and discovered tricks persisted in `localStorage`; the game works if storage is unavailable.
- F10. Auto-pause on `visibilitychange` and window blur.
- F11. Run reproducible from `(seed, input log)`.
- F12. All visible strings in `ui.ts` for `id` and `en`. Trick names stay in English in both languages.
- F13. Homepage popup per section 7: first visit only, feature-flagged, native dialog with a close button and Esc.
- F14. Embed route (`/kolong-run/embed/`): no site header or footer, popup game-over buttons, `kolong:close` message to the parent.
- F15. Flag off means no popup markup, no popup script and no game download on the homepage, while `/kolong-run/` and `/en/kolong-run/` still build and work.

### Non-functional

- N1. 60 FPS target; the fixed timestep decouples simulation from display rate and works on 120 Hz screens [A].
- N2. Zero image or audio files. Game JavaScript at most 40 KB gzipped [A: budget to confirm after M1]. Nothing from the game loads on the homepage until the popup opens.
- N3. No new runtime dependency.
- N4. Accessibility floor: real `<button>` elements with accessible names for A, B, pause and the popup close; visible instructions as text; reduced-motion respected; the popup is a native modal dialog; arrow-key scrolling only suppressed on the game page. The game itself is visual and timing-based and has no screen-reader equivalent; this is stated, not hidden.
- N5. Works at 360 px width portrait and in landscape, with safe-area insets.
- N6. Sim logic has no DOM access so it runs under `node --test`.
- N7. Nothing runs on other pages. The Supabase ghost feature (M5) is optional and silent on failure.

## 9. Proposed structure

Follows the existing convention of page plus `<script>` plus helpers in `src/lib/` [V].

- `src/pages/[...lang]/kolong-run/index.astro` and `embed.astro`: the two routes, both rendering the shared `src/components/KolongGame.astro`.
- `src/components/KolongPopup.astro`: flag check, first-visit logic, dialog and lazy frame; mounted from the homepage.
- `src/lib/game/sim.ts`: pure fixed-step simulation (state, step, collisions, scoring).
- `src/lib/game/input.ts`: key and pointer to A/B events, press timing, buffer.
- `src/lib/game/tricks.ts`: trick table and recogniser.
- `src/lib/game/chunks.ts`: authored chunks and seeded picker.
- `src/lib/game/render.ts`, `sprites.ts`, `font.ts`: canvas drawing, code-defined pixel maps, bitmap font.
- `src/lib/game/storage.ts`: best score, discovered tricks, first-visit flag.

Tests use the built-in runner with Node type stripping. Add an `npm test` script and a CI step in `.github/workflows/deploy.yml` before the build (decided, Q8). CI is on Node 22 [V] [A: needs a Node 22 minor with unflagged type stripping, to be confirmed in M0].

- Recogniser: timed tap timelines produce the expected trick, including `A A B` and `B B B A`, buffer timeout and prefix fallback.
- Fairness: an ollie-only bot survives every chunk at every speed up to the cap.
- Determinism: same seed and inputs give the same score.
- Landing: clean, sketchy and bail thresholds at the boundary, and that a bail ends the run.
- Popup flag: with the flag off, `dist/index.html` has no popup markup while `dist/kolong-run/index.html` exists (a build-output check, not a unit test).

## 10. Exploration: further ideas

Ranked by value for cost. None is required for launch unless marked.

| Idea | What it does | Cost | Notes |
|---|---|---|---|
| Park-accurate art | Obstacles and background drawn after the real park | Low | Section 6.6. In scope. |
| Trick Book discovery | Hidden sequences shown as unknowns | Low | In scope (M2). |
| Daily seed and copyable result | Same layout for everyone each day, result as text like `Kolong Run #312 · 4,820 · AAB BBBA` | Low | Falls out of the seeded generator (F11). |
| Share run card | Canvas PNG through `navigator.share`, download on desktop | Low | Reuses the `ShareBar` flow [V]. |
| Time-of-day sky | Sky follows the Asia/Jakarta clock; night adds under-flyover lights | Low | Park hours exist in data (`parkHours`) [V]. |
| Ghost skaters | `public_stats` live count spawns up to 5 translucent background skaters | Medium | Reuses the `LiveVisitors` call [V]. Count only, no personal data. Silent if keys are empty. |
| Wet-day puddles | Park condition entries add puddles to chunks | Medium | `conditionEntries` exist [V]; decorative, stale data risk. |
| Leaderboard | Server-verified scores | High | Deterministic sim enables re-simulating `(seed, input log)` server-side. Needs a Supabase table, rate limiting and abuse handling. Out of scope. |
| Offline page | Game as the offline fallback, like the real dino | High | Needs a service worker; revisit after launch. |

## 11. Milestones

- **M0, feel spike.** Grey-box sim with pop, a box and a ledge on a plain canvas, to tune hold-to-height, coyote time and buffer on a real phone. Exit: ollie feels right to two skaters.
- **M1, playable core.** Hidden route and `noindex`, scaling, A/B buttons and arrow keys, ollie and nollie, box, ledge, flat rail, stairs, kicker, scoring, game over and retry, best score, id/en strings.
- **M2, trick system.** Trick buffer and table, landing check, multiplier, variety rule, Trick Book, first-run prompts, recogniser and fairness tests.
- **M3, world and polish.** Bank, pyramid, quarters and bowl, grabs, grind styles, manual pad, low beam, parallax and time-of-day, pause, reduced motion, mobile layout pass.
- **M4, homepage popup.** Embed mode, `KolongPopup`, first-visit logic, flag, game-over buttons, dialog accessibility, flag-off build check.
- **M5, social.** Share card, daily seed, ghost skaters.

Launch needs M1 to M4. The route is testable from M1 onward by URL, independent of M4.

## 12. Success metrics

This is an easter egg, so the bar is quality and containment, not traffic.

| Metric | Target | How |
|---|---|---|
| Containment | Zero entries for the route in the sitemap and search index 30 days after launch | Inspect `dist/sitemap.xml` at build; Search Console URL inspection later |
| Frame rate | 55 FPS or better at p95 on both reference devices (Q9) [A] | Manual run with the performance panel |
| First-run clear | At least 60% of testers clear the first obstacle with a plain ollie in their first run [A] | Observed playtest with at least 5 skaters |
| Trick discovery | A new player lands a trick within three runs [A] | Observed playtest |
| Payload | Game script at most 40 KB gzipped, no asset requests | `npm run build` output and network panel |
| Run length | Median first-session run of at least 30 s [A] | Observed playtest only; no analytics events (Q6) |
| Flag off | Homepage build output has no popup markup and no game requests; the route still builds | Inspect `dist/index.html`, `dist/kolong-run/index.html` and the network panel |
| Popup dismissal | Close button and Esc work before the first run and at game over | Manual check on desktop and one phone |

## 13. Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Trick sequences feel laggy because the buffer waits 150 ms for more taps | High | High | Neutral flick on the first tap, commit on close; tune the gap in M0 and M2 |
| R2 | Tap chords are hard on small phones or with one thumb | Medium | High | 88 px buttons, a forgiving gap, plain ollie always sufficient to survive |
| R3 | Browser gestures steal touches (double-tap zoom, long-press callout, pull-to-refresh) | High | Medium | `touch-action: none`, `overscroll-behavior: none`, selection and callout off; test on iOS Safari and Android Chrome |
| R4 | Site grain overlay blurs pixel art | Certain without a fix | Medium | Page-scoped class that disables it [V cause in section 4] |
| R5 | Non-integer device pixel ratios cause shimmer | Medium | Low | Backing store at logical size, integer CSS scale, accept minor shimmer at fractional DPR |
| R6 | Hidden route still leaks through `hreflang`, canonical or social unfurls | Low | Low | `noindex`; the leak is a URL, not data. Accepted |
| R7 | A bail ending the run makes players avoid tricks | Medium | High | Tune the 120 ms bail window in M0 and M2; widen it if testers stop attempting tricks; a plain ollie still scores |
| R8 | Tuning drift: speed and gaps make some chunks unfair | Medium | Medium | Fairness bot test on every chunk |
| R9 | The popup reads as an intrusive interstitial on mobile landings from search | Medium | Medium | Delay, once per browser, visible close button, feature flag to turn it off [A: guidance not verified] |
| R10 | Game script grows past budget | Low | Low | Code-defined sprites, no libraries, budget check at M1 and M3 |
| R11 | The popup traps focus or the iframe swallows arrow keys | Medium | Medium | Native dialog, focus the frame on open, Esc and close button, return focus on close |
| R12 | Flipping the flag needs a deploy because it is build-time | Low | Low | Documented in `.env.example`; accepted, matches how the Supabase variables work [V] |

## 14. Decisions and open questions

Decided by the owner on 2026-11-06:

| # | Question | Decision |
|---|---|---|
| Q1 | Name and slug | Kolong Run, `/kolong-run/` |
| Q2 | Discovery | First-visit homepage popup with a feature flag that controls only the popup; the route stays reachable by URL; game-over buttons "Udah mainnya? Gas absen di kolong!" (close) and "Masih penasaran" (retry) |
| Q3 | Bail rule | A bail ends the run |
| Q4 | SOTM skins | Not now. Removed from scope |
| Q5 | Trick names and mapping | Keep the names in the table; the park-skater review is skipped (Q14) |
| Q6 | gtag events | None |
| Q7 | Sound | None |
| Q8 | Tests | Add `npm test` and a CI step |
| Q9 | Reference phones | One mid-range Android and one iPhone SE class device, as proposed (Q13 confirmed) |
| Q10 | Languages | Indonesian and English from M1 |
| Q11 | "Gas absen di kolong!" action | Only closes the popup. No link to the check-in app |
| Q12 | Popup timing and repeat | 2 s delay and once per browser, as proposed. No re-show after N days |
| Q13 | Reference devices | As proposed in Q9 |
| Q14 | Park-skater review of trick names | Skipped by the owner |
| OQ1 | Skip gtag on the game routes | Skipped for now; site-wide gtag unchanged |
| OQ2 | Animations versus long combos | Animations must stay intuitive and are not negotiable; cut tricks if needed |

No open questions remain.

## 15. Status

| Area | Status | Verified | Not verified |
|---|---|---|---|
| PRD | Draft | Repo facts in section 4 read from source | All numbers marked [A] and [E]; feel; any device behaviour |
| Implementation | M1 to M4 built, M5 and some M3 items not | See the TRD status table | Real-phone behaviour; see the TRD |
