import type { APIRoute, GetStaticPaths } from 'astro';
import { languages, t, type Lang } from '../../i18n/ui';
import { renderSiteCard } from '../../lib/og';

export const getStaticPaths = (() =>
  languages.map((lang) => ({ params: { lang } }))
) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const lang = params.lang as Lang;
  const png = await renderSiteCard({
    headline: t(lang, 'site.title').toUpperCase(),
    tagline: t(lang, 'site.tagline'),
    kicker: 'SKATEPARK PASUPATI · BANDUNG',
  });

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
