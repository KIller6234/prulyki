/**
 * Normalizes a Ukrainian street name for search/matching:
 * lowercase, unify apostrophe variants, strip the "вулиця/вул./провулок" prefix
 * and punctuation, collapse whitespace.
 */
export function normalizeUkrainianStreetName(raw: string): string {
  const withoutPrefix = raw
    .toLowerCase()
    .replace(/['’ʼ`]/g, "'")
    .replace(/^(вулиця|вул\.?|провулок|пров\.?|площа|пл\.?|в'їзд)\s+/u, "")
    .replace(/\s+(вулиця|вул\.?)$/u, "");

  return withoutPrefix
    .replace(/[^\p{L}\p{N}'\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
