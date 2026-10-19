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

Cloudflare Pages, direct upload: `npm run build` then upload `dist/` (Wrangler `cf`/`wrangler pages deploy dist`). No backend in production.
