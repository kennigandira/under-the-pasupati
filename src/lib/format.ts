import type { Lang } from '../i18n/ui';

// Years as a unit-bearing phrase: "19 tahun" / "19 years". Indonesian does not
// inflect the noun, so only English needs the singular branch.
export const years = (value: number, lang: Lang): string =>
  lang === 'en'
    ? `${value} ${value === 1 ? 'year' : 'years'}`
    : `${value} tahun`;

// One-line pitch used as the share-card description on a coach page: what they
// teach, who it suits, and where. `specialty` is the already-joined label list.
export const coachSummary = (specialty: string | undefined, levels: string, lang: Lang): string =>
  lang === 'en'
    ? `${specialty ?? 'Skateboard'} skateboard coach, ${levels} level, in Bandung.`
    : `Coach skateboard${specialty ? ` ${specialty}` : ''} level ${levels} di Bandung.`;

// Short stamp for the sticker on cards: "OKT ’26" / "OCT ’26".
export const monthTag = (iso: string, lang: Lang): string => {
  const d = new Date(`${iso.slice(0, 7)}-01T00:00:00Z`);
  const month = d
    .toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { month: 'short', timeZone: 'UTC' })
    .replace('.', '')
    .toUpperCase();
  return `${month} ’${String(d.getUTCFullYear()).slice(2)}`;
};
