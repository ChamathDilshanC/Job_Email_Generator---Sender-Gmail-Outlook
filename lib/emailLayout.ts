export type EmailTextAlignment = 'left' | 'center' | 'justify';
export type EmailWidth = 'narrow' | 'medium' | 'wide';

export const EMAIL_WIDTH_PIXELS: Record<EmailWidth, number> = {
  narrow: 420,
  medium: 620,
  wide: 980,
};

function applyAlignmentToBlocks(bodyHtml: string, alignment: EmailTextAlignment): string {
  const blockPattern = /<(p|div|li|td|th|h1|h2|h3|h4|h5|h6)\b([^>]*)>/gi;

  return bodyHtml.replace(blockPattern, (match, tag: string, attributes: string) => {
    const cleanedAttributes = attributes.replace(/\salign=(["']).*?\1/gi, '');
    const styleMatch = attributes.match(/\sstyle=(["'])([\s\S]*?)\1/i);
    if (styleMatch) {
      const quote = styleMatch[1];
      const existing = styleMatch[2]
        .replace(/text-align\s*:[^;]*(;|$)/gi, '')
        .trim()
        .replace(/;$/, '');
      const updatedStyle = `${existing ? `${existing}; ` : ''}text-align:${alignment};`;
      const updatedAttributes = cleanedAttributes.replace(
        styleMatch[0],
        ` style=${quote}${updatedStyle}${quote}`
      );
      return `<${tag} align="${alignment}"${updatedAttributes}>`;
    }
    return `<${tag} align="${alignment}" style="text-align:${alignment};"${cleanedAttributes}>`;
  });
}

export function applyEmailLayout(
  bodyHtml: string,
  alignment: EmailTextAlignment,
  width: EmailWidth
): string {
  if (!bodyHtml) return '';

  const pixels = EMAIL_WIDTH_PIXELS[width];
  const alignedBody = String(bodyHtml)
    .replace(/max-width:\s*\d+px/gi, `max-width:${pixels}px`);
  const blockAlignedBody = applyAlignmentToBlocks(alignedBody, alignment);

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; border-collapse:collapse;">
<tr>
<td align="${alignment === 'center' ? 'center' : 'left'}" style="width:100%; padding:0 12px; text-align:${alignment};">
<table role="presentation" width="${pixels}" cellspacing="0" cellpadding="0" border="0" align="center" style="width:${pixels}px; max-width:${pixels}px; margin:0 auto; border-collapse:collapse;">
<tr>
<td style="width:${pixels}px; max-width:100%; padding:0 8px; text-align:${alignment};">
${blockAlignedBody}
</td>
</tr>
</table>
</td>
</tr>
</table>`;
}
