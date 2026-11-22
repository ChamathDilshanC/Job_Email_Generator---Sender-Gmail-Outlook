export type EmailTextAlignment = 'left' | 'center' | 'justify';
export type EmailWidth = 'narrow' | 'medium' | 'wide';

export const EMAIL_WIDTH_PIXELS: Record<EmailWidth, number> = {
  narrow: 480,
  medium: 640,
  wide: 760,
};

export function applyEmailLayout(
  bodyHtml: string,
  alignment: EmailTextAlignment,
  width: EmailWidth
): string {
  if (!bodyHtml) return '';

  const pixels = EMAIL_WIDTH_PIXELS[width];
  const alignedBody = String(bodyHtml)
    .replace(/max-width:\s*\d+px/gi, `max-width:${pixels}px`);

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; border-collapse:collapse;">
<tr>
<td align="${alignment === 'center' ? 'center' : 'left'}" style="width:100%; text-align:${alignment};">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width:${pixels}px; max-width:100%; margin:${alignment === 'center' ? '0 auto' : '0'}; border-collapse:collapse;">
<tr>
<td style="width:${pixels}px; max-width:100%; padding:0 8px; text-align:${alignment};">
${alignedBody}
</td>
</tr>
</table>
</td>
</tr>
</table>`;
}
