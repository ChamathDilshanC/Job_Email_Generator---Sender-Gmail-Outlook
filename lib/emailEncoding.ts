export function normalizeEmailText(value: string): string {
  return String(value || "")
    .normalize("NFC")
    .replace(/â€“|â€”/g, "-")
    .replace(/â€™|â€˜/g, "'")
    .replace(/â€œ|â€|â€\u009d/g, '"')
    .replace(/Ã©/g, "é")
    .replace(/Ã¡/g, "á")
    .replace(/Ã³/g, "ó")
    .replace(/Ãº/g, "ú")
    .replace(/Ã±/g, "ñ")
    .replace(/Â/g, "")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\r\n?/g, "\n")
    .trim();
}

export function encodeMimeSubject(subject: string): string {
  const normalized = normalizeEmailText(subject);
  if (/^[\x20-\x7E]*$/.test(normalized)) return normalized;
  return `=?UTF-8?B?${Buffer.from(normalized, "utf8").toString("base64")}?=`;
}
