import sharp from 'sharp';

// Open Graph cards are generated at build time (see src/pages/og/*.png.ts) so
// every page has a 1200×630 preview that matches the zine look. They are plain
// PNGs because no social platform renders SVG previews.

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const PAPER = '#f4efe2';
const INK = '#101010';
const ACCENT = '#ff4d00';
const PINK = '#ff3ea5';
const MUTED = '#6b6558';
const FONT = "DejaVu Sans, Helvetica Neue, Arial, sans-serif";
const MONO = "DejaVu Sans Mono, Courier New, monospace";

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// No text measurement in librsvg, so wrap on an estimated average glyph width.
function wrap(text: string, maxWidth: number, fontSize: number, factor = 0.55) {
  const perLine = Math.max(8, Math.floor(maxWidth / (fontSize * factor)));
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > perLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const textBlock = (
  lines: string[],
  x: number,
  y: number,
  fontSize: number,
  lineHeight: number,
  fill = INK,
  weight = '700',
) =>
  lines
    .map(
      (line, i) =>
        `<text x="${x}" y="${y + i * lineHeight}" font-family="${FONT}" font-size="${fontSize}" font-weight="${weight}" fill="${fill}">${esc(line)}</text>`,
    )
    .join('');

export interface ArticleCardInput {
  title: string;
  kicker: string; // e.g. "JURNAL · 25 OKTOBER 2026"
  cover?: string; // absolute file path
  coverAlt?: string;
}

// Article card: copy on paper on the left, cover photo full-height on the right.
export async function renderArticleCard({ title, kicker, cover, coverAlt }: ArticleCardInput) {
  const photoW = 500;
  const textX = 64;
  const textW = OG_WIDTH - photoW - textX - 64;
  const titleSize = title.length > 110 ? 40 : title.length > 70 ? 46 : 54;
  const titleLines = wrap(title, textW, titleSize, 0.56).slice(0, 6);
  const titleTop = 250;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
    <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${PAPER}"/>
    <rect x="14" y="14" width="${OG_WIDTH - 28}" height="${OG_HEIGHT - 28}" fill="none" stroke="${INK}" stroke-width="6"/>
    <rect x="${textX - 8}" y="74" width="18" height="18" fill="${ACCENT}" transform="rotate(-8 ${textX + 1} 83)"/>
    <text x="${textX + 22}" y="90" font-family="${FONT}" font-size="20" font-weight="700" letter-spacing="2.5" fill="${INK}">UNDER THE PASUPATI</text>
    <text x="${textX}" y="164" font-family="${MONO}" font-size="20" fill="${ACCENT}" letter-spacing="1.5">${esc(kicker)}</text>
    <rect x="${textX}" y="188" width="120" height="8" fill="${INK}"/>
    ${textBlock(titleLines, textX, titleTop + titleSize, titleSize, Math.round(titleSize * 1.18))}
    <text x="${textX}" y="${OG_HEIGHT - 74}" font-family="${MONO}" font-size="19" fill="${MUTED}">underthepasupati.org</text>
  </svg>`;

  const layers: sharp.OverlayOptions[] = [];
  if (cover) {
    const photo = await sharp(cover)
      .resize(photoW, OG_HEIGHT, { fit: 'cover', position: 'attention' })
      .toBuffer();
    layers.push({ input: photo, left: OG_WIDTH - photoW, top: 0 });
    // Redraw the frame on top of the photo so it stays crisp.
    layers.push({
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
        <rect x="${OG_WIDTH - photoW}" y="0" width="${photoW}" height="${OG_HEIGHT}" fill="none" stroke="${INK}" stroke-width="8"/>
        <rect x="${OG_WIDTH - photoW + 22}" y="22" width="${photoW - 44}" height="${OG_HEIGHT - 44}" fill="none" stroke="${PAPER}" stroke-width="3" stroke-dasharray="10 8"/>
      </svg>`),
      left: 0,
      top: 0,
    });
  }

  return sharp(Buffer.from(svg))
    .composite(layers)
    .png({ compressionLevel: 9 })
    .toBuffer();
}

export interface SiteCardInput {
  headline: string;
  tagline: string;
  kicker: string;
}

// Default card for pages without their own artwork.
export async function renderSiteCard({ headline, tagline, kicker }: SiteCardInput) {
  const titleLines = wrap(headline, 620, 100, 0.58).slice(0, 2);
  const tagLines = wrap(tagline, 640, 27, 0.5).slice(0, 3);
  const kickerBoxWidth = Math.ceil(kicker.length * 13.2) + 40;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
    <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${PAPER}"/>
    <rect x="14" y="14" width="${OG_WIDTH - 28}" height="${OG_HEIGHT - 28}" fill="none" stroke="${INK}" stroke-width="6"/>
    <circle cx="985" cy="300" r="96" fill="none" stroke="${INK}" stroke-width="6"/>
    <circle cx="985" cy="300" r="62" fill="${INK}"/>
    <rect x="800" y="430" width="340" height="70" fill="${PINK}" transform="rotate(-6 970 465)"/>
    <rect x="860" y="512" width="220" height="46" fill="${ACCENT}" transform="rotate(4 970 535)"/>
    <rect x="72" y="74" width="18" height="18" fill="${ACCENT}" transform="rotate(-8 81 83)"/>
    <text x="102" y="90" font-family="${FONT}" font-size="20" font-weight="700" letter-spacing="2.5" fill="${INK}">UNDER THE PASUPATI</text>
    ${textBlock(titleLines, 80, 258, 100, 112)}
    ${textBlock(tagLines, 84, 470, 27, 38, MUTED, '400')}
    <rect x="80" y="${OG_HEIGHT - 92}" width="${kickerBoxWidth}" height="44" fill="${INK}"/>
    <text x="98" y="${OG_HEIGHT - 62}" font-family="${MONO}" font-size="18" letter-spacing="2" fill="${PAPER}">${esc(kicker)}</text>
  </svg>`;

  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}

// ---- Instagram Story card (1080×1920) -------------------------------------
// Instagram has no web intent for Stories: the only path is handing a 9:16
// image to the native share sheet, so each article gets one at build time.
// Copy stays between y≈300 and y≈1660 because Instagram paints its own header
// (avatar, progress bar) and reply bar over the top and bottom of a Story.

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

export interface StoryCardInput {
  title: string;
  kicker: string; // e.g. "JURNAL · 25 OKTOBER 2026"
  tag?: string; // category — drawn as a taped label on the photo
  url: string; // printed below the title, without scheme
  cover?: string; // absolute file path
}

// Largest size whose wrapped lines still fit between `top` and `bottom`.
function fitStoryTitle(title: string, width: number, top: number, bottom: number) {
  for (const size of [84, 74, 64, 56, 48]) {
    const lh = Math.round(size * 1.15);
    const lines = wrap(title, width, size, 0.57);
    if (top + (lines.length - 1) * lh + size * 0.32 <= bottom) return { size, lh, lines };
  }
  const size = 48;
  const lh = Math.round(size * 1.15);
  const maxLines = Math.max(2, Math.floor((bottom - top) / lh) + 1);
  const lines = wrap(title, width, size, 0.57).slice(0, maxLines);
  lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[\s,;:.]+$/, '')}…`;
  return { size, lh, lines };
}

export async function renderStoryCard({ title, kicker, tag, url, cover }: StoryCardInput) {
  const pad = 72;
  const textW = STORY_WIDTH - pad * 2;
  const photoTop = 352;
  const photoH = cover ? 860 : 0;
  const photoLeft = pad;
  const photoW = textW;
  const titleTop = cover ? 1298 : 620;
  const titleBottom = 1606;
  const { size, lh, lines } = fitStoryTitle(title, textW, titleTop, titleBottom);
  const urlY = 1664;

  const tagText = tag?.trim().toUpperCase() ?? '';
  const tagW = Math.ceil(tagText.length * 14.5) + 44;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${STORY_WIDTH}" height="${STORY_HEIGHT}" viewBox="0 0 ${STORY_WIDTH} ${STORY_HEIGHT}">
    <rect width="${STORY_WIDTH}" height="${STORY_HEIGHT}" fill="${PAPER}"/>
    <rect x="18" y="18" width="${STORY_WIDTH - 36}" height="${STORY_HEIGHT - 36}" fill="none" stroke="${INK}" stroke-width="6"/>
    <rect x="${pad}" y="216" width="20" height="20" fill="${ACCENT}" transform="rotate(-8 ${pad + 10} 226)"/>
    <text x="${pad + 34}" y="232" font-family="${FONT}" font-size="26" font-weight="700" letter-spacing="3" fill="${INK}">UNDER THE PASUPATI</text>
    <text x="${pad}" y="312" font-family="${MONO}" font-size="26" fill="${ACCENT}" letter-spacing="1.5">${esc(kicker)}</text>
    ${textBlock(lines, pad, titleTop + size, size, lh)}
    <rect x="${pad}" y="${urlY - 22}" width="16" height="16" fill="${INK}"/>
    <text x="${pad + 28}" y="${urlY}" font-family="${MONO}" font-size="25" fill="${MUTED}">${esc(url)}</text>
  </svg>`;

  const layers: sharp.OverlayOptions[] = [];
  if (cover) {
    const photo = await sharp(cover)
      .resize(photoW, photoH, { fit: 'cover', position: 'south' })
      .grayscale()
      .toBuffer();
    layers.push({ input: photo, left: photoLeft, top: photoTop });
    layers.push({
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${STORY_WIDTH}" height="${STORY_HEIGHT}">
        <rect x="${photoLeft}" y="${photoTop}" width="${photoW}" height="${photoH}" fill="none" stroke="${INK}" stroke-width="8"/>
        <rect x="${photoLeft + 22}" y="${photoTop + 22}" width="${photoW - 44}" height="${photoH - 44}" fill="none" stroke="${PAPER}" stroke-width="3" stroke-dasharray="12 9"/>
        ${
          tagText
            ? `<g transform="rotate(-5 ${photoLeft + 28} ${photoTop + 66})">
                 <rect x="${photoLeft + 28}" y="${photoTop + 20}" width="${tagW}" height="46" fill="${ACCENT}"/>
                 <text x="${photoLeft + 50}" y="${photoTop + 51}" font-family="${MONO}" font-size="23" font-weight="700" letter-spacing="2" fill="${INK}">${esc(tagText)}</text>
               </g>`
            : ''
        }
      </svg>`),
      left: 0,
      top: 0,
    });
  }

  return sharp(Buffer.from(svg))
    .composite(layers)
    .png({ compressionLevel: 9 })
    .toBuffer();
}
