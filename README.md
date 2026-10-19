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
| `skaters`       | `Skater`           | Hall of Fame + Home featured   |
| `posts`         | `Post`             | Journal + Home latest          |
| `communities`   | `Community`        | Communities page               |
| `events`        | `EventItem`        | Events page (split by `past`)  |
| `conditionEntries` | `ConditionEntry`| The Park + Home status         |
| `usageSnapshot`, `timeline`, `parkMapSlot` | — | The Park |

## Media placeholders

Every photo/video/map/logo slot renders a dashed placeholder box whose text says **exactly what asset to shoot and its intended alt text** (bilingual). Replace a `<MediaSlot>` with a real `<img>`/embed when the asset exists; copy the hint into the `alt` attribute. Photos should be black-and-white (the CSS already applies `grayscale(1)` to all images as a safety net).

## Deploy

Cloudflare Pages project: **`under-the-pasupati`** (production branch `main`).
`wrangler.jsonc` points at `dist/`, so no flags are needed locally:

```sh
npm run build
npx wrangler pages deploy --branch=main     # production
npx wrangler pages deploy --branch=<name>   # preview alias
```

### CI (GitHub Actions)

`.github/workflows/deploy.yml` builds and deploys on every push to `main`
(production), on pull requests (preview alias `pr-<number>`, never touching
production), and on manual `workflow_dispatch`.

Add these repository secrets (Settings → Secrets and variables → Actions):

| Secret | Value |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | API token with **Cloudflare Pages: Edit** permission |
| `CLOUDFLARE_ACCOUNT_ID` | `8b416f679a46313c3cf2128b548d45a9` |

Without them the deploy step fails; fork PRs skip the deploy step by design.

### URLs

- Production alias: `https://under-the-pasupati.pages.dev/` (assigns on the first production deploy)
- Preview: `https://<branch>.under-the-pasupati.pages.dev/`

All routes are directories (`/id/`, `/id/journal/`), so internal links are
generated with trailing slashes via `localeHref()` in `src/i18n/ui.ts`.
Keep it that way — a missing slash costs a 308 redirect on every navigation.
