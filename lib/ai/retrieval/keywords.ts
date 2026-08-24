const MIN_KEYWORD_LENGTH = 3;

// Найчастіші українські службові слова, які не несуть пошукового смислу.
const STOPWORDS = new Set([
  "як", "що", "чи", "де", "коли", "чому", "для", "від", "при", "про",
  "або", "але", "щоб", "цей", "ця", "це", "той", "яка", "який", "які",
  "мене", "мені", "можна", "будь", "ласка", "дуже", "дякую",
]);

/** Витягує значущі слова запиту (укр. літери, довжина ≥3, без стоп-слів). */
export function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .match(/\p{L}+/gu) ?? [];

  const unique = new Set(
    words.filter(
      (word) => word.length >= MIN_KEYWORD_LENGTH && !STOPWORDS.has(word),
    ),
  );

  return [...unique];
}
