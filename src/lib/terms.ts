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

/** Escapes copy and wraps every "pendamping"/"buddy" mention in a focusable tooltip. */
export const withBuddyTip = (text: string, tip: string): string =>
  escapeHtml(text).replace(
    /\b(pendamping|buddy)\b/gi,
    `<span class="term" tabindex="0" data-tip="${escapeHtml(tip)}">$1</span>`,
  );
