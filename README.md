# Under the Pasupati

Frontend for the independent community record of the Pasupati Flyover skatepark, Bandung. Astro static site, bilingual (`/id`, `/en`), mobile-first, concrete/zine visual direction.

## Develop

```sh
npm install
npm run dev      # local dev server
npm run build    # static build → dist/
npm run preview  # serve the build
```

## Add / edit content

All content lives in `src/data/content.ts` (stub for the future Directus collections). Every text field has `id` and `en` values. Collections:

| Collection      | Content model      | Used by                        |
| --------------- | ------------------ | ------------------------------ |
| `skaters`       | `Skater`           | Hall of Fame + Home skater of the month |
| `posts`         | `Post`             | Journal + Home latest          |
| `partners`      | `Partner`          | Partners page                  |
| `events`        | `EventItem`        | Events page (split by `past`)  |
| `conditionEntries` | `ConditionEntry`| The Park + Home status         |
| `obstacles`     | `Obstacle`         | The Park obstacle gallery      |
| `lessonProviders` | `LessonProvider` | Home instructors section + `/coaches/<slug>` |
| `boardRental`   | `{ label, title, body, note, cta, partner }` | Home rental callout + FAQ |
| `faqs`          | `{ q, a }`         | Home FAQ                       |
| `usageSnapshot`, `timeline` | — | The Park |

### Home section order

1. Hero
2. Skater of the month (newest `featuredFrom`) alongside the park condition ledger
3. Journal — 3 latest posts
4. Skateboard instructors (`lessonProviders`, anchored at `#pengajar`)
5. FAQ (`faqs`)

### Publishing an instructor

Append a `LessonProvider` to `lessonProviders` in `src/data/content.ts` and only
after the provider agreed in writing. `consentOn` is the internal date they agreed
(it is not rendered); leave the entry out until you have it.

Each card shows, in order: name, specialty, age, years skating, competition experience,
levels, rate and contacts. `specialty`, `age`, `yearsSkating`,
`competition` and `rate` are optional — omit any of them and the row
simply doesn't render, so a provider can be listed without publishing their age or
record. Contacts are a list (`contacts: [{ kind, value }]`) so a provider can publish
WhatsApp, Instagram and TikTok together; local `08…` numbers are converted to `wa.me` links.

### Coach detail pages

Every provider gets `/coaches/<slug>` (both languages) with their portrait, the
full fact ledger, contact, and **two videos**:

- `trainingVideo` — footage of them teaching a session
- `trickVideo` — footage of them skating: a line or signature trick

Both are required fields; each carries its own bilingual shooting brief. The
cards on Home link through via *Lihat profil lengkap →*. Adding a provider
automatically creates their page at build time.

### Board rental

The rental offer (boards to rent, plus a buddy for first-timers) lives in
`boardRental` — one highlighted callout at the top of the instructors section,
and a FAQ entry that points at it. Rates: board Rp15,000/hour; buddy Rp50,000/hour
for 15 and over; under 15 goes straight to private. `buddyTip` is the buddy
explanation, rendered as a tooltip on every `pendamping`/`buddy` mention by
`withBuddyTip` in `src/lib/terms.ts`. Its CTA links to the contact route on
`/about`; keep that contact address current, since it is where rental and
listing requests land.

### Obstacle gallery

Each `Obstacle` carries a fixed photo hint — shoot the same angle every time so
before/after comparisons stay honest. `condition` (optional) reuses the severity
tags: `ok`, `repair`, `hazard`.

## Media placeholders

Every photo/video/map/logo slot renders a dashed placeholder box whose text says **exactly what asset to shoot and its intended alt text** (bilingual). Put the asset under `public/images/` (or `public/media/`) and set `src` on the slot; `<MediaSlot>` then renders the real `<img>` (hint becomes the alt text) instead of the placeholder. Photos should be black-and-white (the CSS already applies `grayscale(1)` to all images as a safety net).

### Coach photo + videos

`/coaches/<slug>` lays the description out above three columns: portrait, teaching
video, riding-alone video (`LessonProvider.portrait` / `trainingVideo` /
`trickVideo`). Clicking a real asset opens it full-screen over a blurred,
non-scrollable backdrop with the media fitted between equal gaps. A video slot
takes `src` (`.mp4`, `-movflags +faststart`) plus `poster` (a still frame); without
a poster the tile falls back to loading the first frame. Video tiles also carry a
yellow barcode tag top-left (`coach.media.teaching.tape` / `coach.media.riding.tape`,
e.g. "Sesi Mengajar" / "Sesi Solo"). Assets live in `public/media/coaches/<slug>/`.
Coach media is exempt from the grayscale filter — colour reads body position better
while instructing. A slot without `src` stays a placeholder in the row, so partial
coach media is fine.

Posters are made with `ffmpeg -ss <seconds> -i clip.mp4 -frames:v 1 frame.png`
(pick a sharp beat — phone footage is often motion-blurred), then optionally
`scale=1152:-2:flags=lanczos,unsharp=7:7:1.6,cas=0.5` for a 2x sharpened still, and
`cwebp -q 88 frame.png -o poster.webp`.

A coach lists one or more `specialties` (`{ label, video }`), each clickable when
`video` matches an entry in `specialtyVideos` (`street` / `bowl` / `transition`);
it opens the shared YouTube dialog
(`youtube-nocookie` embed, autoplay, blurred unscrollable backdrop). Set
`vertical: true` on a Shorts clip and the frame switches to 9:16 instead of
letterboxing. Swap an `id` in `specialtyVideos` to change the clip, or drop a
specialty's `video` to leave the label plain text. `age` / `yearsSkating` render through
`src/lib/format.ts` (`years()`) so they always carry "tahun" / "years".

Partners carry a real `logo` slot with `src`, and every `LessonProvider` can point at one via `partner: '<partner slug>'` — coach cards and profile pages then show that partner's logo as a linked chip. `boardRental.partner` does the same for the rental callout.

## Accounts: three Cloudflare logins

This machine uses several Cloudflare accounts. Each one gets a named `cf` profile,
bound to the project folder that owns it, so no command ever needs an account flag.

```sh
cf auth create <name>                              # one browser approval per account
cf auth activate <name> <project-dir>              # pin it to that folder
cf auth list                                       # see bindings
cf auth whoami                                     # in a folder: confirms the active account
```

| Account | Profile | Bound to |
| --- | --- | --- |
| devkenni.g@gmail.com | `devkenni` | this project |
| aktivasiatech@gmail.com | `default` | — |
| sustaindeveloper396@gmail.com | *to add* | — |

`cf` handles account-level work (creating projects, listing resources). It cannot
deploy Pages — that is Wrangler's job.

**Gotcha:** `cf` auto-loads `.env.local` from the current directory. Inside this
project that file defines `CLOUDFLARE_API_TOKEN`, so `cf auth` commands refuse to
run there ("Cannot manage auth profiles while CLOUDFLARE_API_TOKEN is set").
Run profile management from outside the project:

```sh
cd /tmp && cf auth create <name>
```

### Wrangler has no profiles

`wrangler login` stores **one** global OAuth token, so it is the wrong tool for
switching accounts. Instead, credentials are per project, in `.env.local`
(gitignored):

```
CLOUDFLARE_ACCOUNT_ID=<account id>
CLOUDFLARE_API_TOKEN=<Pages:Edit token>
```

`npm run deploy` sources that file before deploying, so this project always hits
the devkenni account regardless of which account Wrangler is logged into globally.
Create the token at https://dash.cloudflare.com/profile/api-tokens with
**Account → Cloudflare Pages → Edit**.

Two rough edges worth knowing:

- Pages config files **reject `account_id`** (`wrangler.jsonc` cannot pin it), so
  the pin lives in `CLOUDFLARE_ACCOUNT_ID` from `.env.local` / the CI secret. Always
  deploy through `npm run deploy` / `deploy:preview` rather than a bare
  `npx wrangler pages deploy` — a bare call falls back to Wrangler's global login
  and would target whatever account that happens to be.
- `wrangler whoami` needs account-listing rights the Pages:Edit token doesn't
  have, so it errors misleadingly. Use `npm run account` instead: it lists the
  Pages projects the current credentials can actually reach, which is the honest
  answer to "which account is this project deploying to".

### Setting up another account's project

```sh
cf auth create sustaindeveloper
cf auth activate sustaindeveloper /path/to/that/project
```

Then create `.env.local` there with that account's ID and a Pages:Edit token from
its dashboard. Nothing global changes, and no project can deploy into the wrong
account by accident.

## Deploy

Cloudflare Pages project: **`under-the-pasupati`** (production branch `main`),
owned by the devkenni.g@gmail.com account.
`wrangler.jsonc` points at `dist/`, so no flags are needed:

```sh
npm run deploy          # build + production deploy
npm run deploy:preview  # build + preview alias
```

### CI (GitHub Actions)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`
(production), on pull requests (preview alias `pr-<number>`, never touching
production), and on manual `workflow_dispatch`.

Add these repository secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Pages:Edit token from the **devkenni** account |
| `CLOUDFLARE_ACCOUNT_ID` | `fdfd99f39ae433ab6b17c88f62af0316` |

Without them the deploy step fails; fork PRs skip the deploy step by design.

### URLs

- Production alias: `https://under-the-pasupati.pages.dev/`
- Preview: `https://<branch>.under-the-pasupati.pages.dev/`

All routes are directories (`/id/`, `/id/journal/`), so internal links are
generated with trailing slashes via `localeHref()` in `src/i18n/ui.ts`.
Keep it that way — a missing slash costs a 308 redirect on every navigation.
