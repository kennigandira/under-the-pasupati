import type { APIRoute, GetStaticPaths } from 'astro';
import path from 'node:path';
import { languages, localeHref, type Lang } from '../../../../i18n/ui';
import { posts } from '../../../../data/content';
import { renderStoryCard } from '../../../../lib/og';
import { plainInline } from '../../../../lib/inline';

export const getStaticPaths = (() =>
  languages.flatMap((lang) => posts.map((p) => ({ params: { lang, slug: p.slug } })))
) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params, site }) => {
  const lang = params.lang as Lang;
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return new Response('Not found', { status: 404 });

  const date = new Date(post.date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const canonical = new URL(localeHref(lang, `/journal/${post.slug}`), site ?? 'https://underthepasupati.org');

  const png = await renderStoryCard({
    title: plainInline(post.title[lang]),
    kicker: `${lang === 'id' ? 'JURNAL' : 'JOURNAL'} · ${date.toUpperCase()}`,
    tag: post.category,
    url: `${canonical.host}${canonical.pathname}`.replace(/\/$/, ''),
    cover: post.cover.src ? path.join(process.cwd(), 'public', post.cover.src) : undefined,
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
