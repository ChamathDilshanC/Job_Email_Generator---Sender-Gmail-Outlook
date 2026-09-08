/**
 * Turning a sent email into something readable in History.
 *
 * The bodies we send are full HTML documents — `<style>` blocks with font
 * `@import`s, tables, inline styles. Naively running `.replace(/<[^>]*>/g, '')`
 * over one keeps the *contents* of `<style>`/`<script>`, so the "preview" ends
 * up being a wall of CSS instead of the letter. These helpers strip the
 * non-content blocks first, then the tags, then decode entities.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  mdash: '\u2014',
  ndash: '\u2013',
  hellip: '\u2026',
  bull: '\u2022',
  rsquo: '\u2019',
  lsquo: '\u2018',
  rdquo: '\u201d',
  ldquo: '\u201c',
  middot: '\u00b7',
};

function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => {
      const value = NAMED_ENTITIES[String(name).toLowerCase()];
      return value === undefined ? match : value;
    });
}

/**
 * Drop stylesheet leftovers from text that was already (badly) tag-stripped —
 * history rows saved before we cleaned this up still hold raw CSS, so we scrub
 * them again at render time rather than migrating the collection.
 */
export function cleanPreviewText(text: string): string {
  return decodeEntities(
    String(text ?? '')
      .replace(/@import\s+url\([^)]*\)\s*;?/gi, ' ')
      .replace(/@(?:charset|namespace)[^;]*;/gi, ' ')
      // at-rules with nested blocks (@media, @font-face, @keyframes, …)
      .replace(/@[a-z-]+[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/gi, ' ')
      // plain `selector { prop: value; }` remnants
      .replace(/[^{}\n]{1,160}\{[^{}]*\}/g, ' ')
  )
    .replace(/[ \t\u00a0]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Convert an HTML email body to readable plain text, preserving paragraph and
 * line breaks. Safe to hand text that isn't HTML — it just gets cleaned.
 */
export function htmlToPlainText(html: string): string {
  if (!html) return '';

  const withoutNonContent = String(html)
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(style|script|head|title|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    // a tracking pixel or spacer image adds nothing to a text preview
    .replace(/<img\b[^>]*>/gi, ' ');

  const withBreaks = withoutNonContent
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|li|h[1-6]|table|section|blockquote)\s*>/gi, '\n')
    .replace(/<(hr)\s*\/?>/gi, '\n');

  return cleanPreviewText(withBreaks.replace(/<[^>]*>/g, ' '));
}

/**
 * Build the short snippet stored on a history row. Truncates on a word
 * boundary so the preview doesn't end mid-word.
 */
export function buildEmailPreview(source: string, limit = 400): string {
  const text = htmlToPlainText(source);
  if (text.length <= limit) return text;

  const clipped = text.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(' ');
  return `${(lastSpace > limit * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}
