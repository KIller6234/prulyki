import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";

export const SESSION_COOKIE_NAME = "chp_staff_session";

// MVP: без 2FA і без відкликання токенів — див. план, розділ "що свідомо
// не робимо". Коротший строк дії, ніж класична 8-годинна зміна, аби
// зменшити вікно ризику за відсутності відкликання.
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

const staffSessionPayloadSchema = z.object({
  staffId: z.string(),
  email: z.string(),
  role: z.enum(["DISPATCHER", "INSPECTOR", "ADMIN"]),
});

export type StaffSessionPayload = z.infer<typeof staffSessionPayloadSchema>;

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET не налаштовано або закороткий (мінімум 32 символи)",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  payload: StaffSessionPayload,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string,
): Promise<StaffSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const parsed = staffSessionPayloadSchema.safeParse(payload);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE_SECONDS = SESSION_DURATION_SECONDS;
