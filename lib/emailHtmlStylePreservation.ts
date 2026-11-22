function toDocument(html: string): HTMLDivElement {
  const documentFragment = document.createElement('div');
  documentFragment.innerHTML = String(html || '')
    .replace(/<(style|script|head|title|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
  return documentFragment;
}

function visibleText(root: HTMLElement): string {
  return root.textContent
    ?.replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim() || '';
}

function textNodes(root: Node): Text[] {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    nodes.push(node as Text);
    node = walker.nextNode();
  }
  return nodes;
}

/**
 * Merge the text of a Quill edit back onto the original template DOM.
 * Quill intentionally removes tables, div styles, and email letterhead
 * markup, so sending the raw Quill HTML would destroy the selected template.
 * This keeps the original inline styles and replaces only the changed text.
 */
export function preserveTemplateEmailStyles(
  originalHtml: string,
  editedHtml: string
): string {
  if (typeof document === 'undefined') return editedHtml;
  if (!originalHtml || !editedHtml) return editedHtml;

  const original = toDocument(originalHtml);
  const edited = toDocument(editedHtml);
  const originalText = visibleText(original);
  const editedText = visibleText(edited);

  if (!originalText || originalText === editedText) return originalHtml;

  let prefixLength = 0;
  while (
    prefixLength < originalText.length &&
    prefixLength < editedText.length &&
    originalText[prefixLength] === editedText[prefixLength]
  ) {
    prefixLength++;
  }

  let originalSuffix = originalText.length - 1;
  let editedSuffix = editedText.length - 1;
  while (
    originalSuffix >= prefixLength &&
    editedSuffix >= prefixLength &&
    originalText[originalSuffix] === editedText[editedSuffix]
  ) {
    originalSuffix--;
    editedSuffix--;
  }

  const originalChangeEnd = originalSuffix + 1;
  const editedChangeEnd = editedSuffix + 1;
  const replacement = editedText.slice(prefixLength, editedChangeEnd);

  if (
    prefixLength === originalText.length &&
    prefixLength === editedText.length
  ) {
    return originalHtml;
  }

  const originalNodes = textNodes(original);
  let nodeStart = 0;
  let startNode: Text | null = null;
  let startOffset = 0;
  let endNode: Text | null = null;
  let endOffset = 0;

  for (const node of originalNodes) {
    const nodeText = node.textContent || '';
    const nodeEnd = nodeStart + nodeText.length;
    if (!startNode && prefixLength >= nodeStart && prefixLength <= nodeEnd) {
      startNode = node;
      startOffset = prefixLength - nodeStart;
    }
    if (
      !endNode &&
      originalChangeEnd >= nodeStart &&
      originalChangeEnd <= nodeEnd
    ) {
      endNode = node;
      endOffset = originalChangeEnd - nodeStart;
    }
    nodeStart = nodeEnd;
  }

  if (!startNode || !endNode) return editedHtml;

  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  range.deleteContents();
  if (replacement) {
    range.insertNode(document.createTextNode(replacement));
  }

  return original.innerHTML;
}
