export type ContactKind = 'whatsapp' | 'instagram' | 'tiktok' | 'email';

export interface Contact {
  kind: ContactKind;
  /** Phone number, Instagram handle/URL, or email address. */
  value: string;
}

export const contactLabel = (kind: ContactKind): string =>
  kind === 'whatsapp'
    ? 'WhatsApp'
    : kind === 'instagram'
      ? 'Instagram'
      : kind === 'tiktok'
        ? 'TikTok'
        : 'Email';

export const contactHref = (contact: Contact): string => {
  if (contact.kind === 'whatsapp') {
    const digits = contact.value.replace(/[^0-9]/g, '');
    return `https://wa.me/${digits.startsWith('0') ? `62${digits.slice(1)}` : digits}`;
  }
  if (contact.kind === 'instagram') {
    const handle = contact.value
      .replace(/^https?:\/\//, '')
      .replace(/^(www\.)?instagram\.com\//, '')
      .replace(/^@/, '');
    return `https://instagram.com/${handle}`;
  }
  if (contact.kind === 'tiktok') {
    const handle = contact.value
      .replace(/^https?:\/\//, '')
      .replace(/^(www\.)?tiktok\.com\/@?/, '')
      .replace(/^@/, '');
    return `https://www.tiktok.com/@${handle}`;
  }
  return `mailto:${contact.value}`;
};
