import { randomInt } from "node:crypto";

const WORD_PARTS = ["pryluky", "green", "waste", "eco", "clean", "flow"];

/** Тимчасовий пароль для нового співробітника — показується адміну один раз. */
export function generateTempPassword(): string {
  const word = WORD_PARTS[randomInt(WORD_PARTS.length)];
  const digits = String(randomInt(1000, 10000));
  const capitalized = word.charAt(0).toUpperCase() + word.slice(1);
  return `${capitalized}${digits}!`;
}
