const escapeHtml = (value: string): string =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char]!,
  );

/**
 * Escapes copy and wraps every "pendamping"/"buddy" mention in a focusable
 * tooltip. The tip is a real child element so it only lays out while shown;
 * the page that renders these also shifts it inside the viewport (see the
 * tooltip script in `pages/[...lang]/index.astro`).
 */
export const withBuddyTip = (text: string, tip: string): string =>
  escapeHtml(text).replace(
    /\b(pendamping|buddy)\b/gi,
    `<span class="term" tabindex="0">$1<span class="tip">${escapeHtml(tip)}</span></span>`,
  );
