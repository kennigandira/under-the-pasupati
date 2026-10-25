import type { APIRoute, GetStaticPaths } from 'astro';
import path from 'node:path';
import { languages, type Lang } from '../../../i18n/ui';
import { posts } from '../../../data/content';
import { renderArticleCard } from '../../../lib/og';
import { plainInline } from '../../../lib/inline';

export const getStaticPaths = (() =>
  languages.flatMap((lang) => posts.map((p) => ({ params: { lang, slug: p.slug } })))
) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Lang;
  const post = posts.find((p) => p.slug === params.slug);
  if (!post) return new Response('Not found', { status: 404 });

  const date = new Date(post.date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const png = await renderArticleCard({
    title: plainInline(post.title[lang]),
    kicker: `${lang === 'id' ? 'JURNAL' : 'JOURNAL'} · ${date.toUpperCase()}`,
    cover: post.cover.src ? path.join(process.cwd(), 'public', post.cover.src) : undefined,
    coverAlt: post.cover.hint[lang],
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
