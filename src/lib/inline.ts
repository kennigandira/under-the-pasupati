// Journal copy supports exactly one inline mark: *italic*. Author source docs
// (Google Docs exports) italicise loanwords, so the data keeps the same marks
// and every surface renders or strips them from one place.

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

// Escapes first, then turns *…* into <em>…</em>. Safe for set:html.
export function renderInline(text: string): string {
  return text
    .replace(/[&<>"']/g, (c) => HTML_ESCAPES[c])
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
}

// Plain text for <title>, meta descriptions, OG cards and share messages.
export function plainInline(text: string): string {
  return text.replace(/\*/g, '');
}
