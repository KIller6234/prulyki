import bcrypt from "bcryptjs";

// ТЗ п. 4.9: коефіцієнт складності bcrypt не нижче 12.
const SALT_ROUNDS = 12;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  passwordHash: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}
