import type { Lang } from '../i18n/ui';

// Years as a unit-bearing phrase: "19 tahun" / "19 years". Indonesian does not
// inflect the noun, so only English needs the singular branch.
export const years = (value: number, lang: Lang): string =>
  lang === 'en'
    ? `${value} ${value === 1 ? 'year' : 'years'}`
    : `${value} tahun`;
