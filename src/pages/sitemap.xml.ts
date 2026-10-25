import type { APIRoute } from 'astro';
import { localeHref, type Lang } from '../i18n/ui';
import { posts, skaters, lessonProviders } from '../data/content';

// Static routes plus the per-language detail pages. Kept next to the data
// source so a new post/coach/skater is indexed the moment it is added.
const staticPaths = [
  '',
  '/the-park',
  '/hall-of-fame',
  '/journal',
  '/partners',
  '/events',
  '/about',
  '/support',
];

const detailPaths = [
  ...posts.map((p) => ({ path: `/journal/${p.slug}`, lastmod: p.date })),
  ...skaters.map((s) => ({ path: `/hall-of-fame/${s.slug}`, lastmod: undefined })),
  ...lessonProviders.map((c) => ({ path: `/coaches/${c.slug}`, lastmod: undefined })),
];

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://underthepasupati.org')).origin;
  const url = (lang: Lang, path: string) => new URL(localeHref(lang, path), origin).href;

  const entries = [
    ...staticPaths.map((path) => ({ path, lastmod: undefined })),
    ...detailPaths,
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries
  .map(
    ({ path, lastmod }) => `  <url>
    <loc>${esc(url('id', path))}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <xhtml:link rel="alternate" hreflang="id" href="${esc(url('id', path))}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${esc(url('en', path))}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(url('id', path))}"/>
  </url>
  <url>
    <loc>${esc(url('en', path))}</loc>
${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <xhtml:link rel="alternate" hreflang="id" href="${esc(url('id', path))}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${esc(url('en', path))}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(url('id', path))}"/>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
