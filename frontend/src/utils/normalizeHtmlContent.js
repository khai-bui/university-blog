const HTML_ENTITIES = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
};

export function normalizeHtmlContent(content = '') {
  let value = String(content ?? '');

  if (!value) return '';

  value = value.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  value = value.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

  Object.entries(HTML_ENTITIES).forEach(([entity, replacement]) => {
    value = value.replace(new RegExp(entity, 'gi'), replacement);
  });

  return value;
}

export function stripHtmlTags(content = '') {
  const normalized = normalizeHtmlContent(content);
  return normalized.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
