import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken, type StaffSessionPayload } from "./session";

/** Reads and verifies the staff session from cookies. Server-side only. */
export async function getStaffSession(): Promise<StaffSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireStaffSession(): Promise<StaffSessionPayload> {
  const session = await getStaffSession();
  if (!session) {
    throw new Error("Немає активної сесії співробітника");
  }
  return session;
}

/** Сесія лише для ролі ADMIN — управління персоналом (ФВ-8.1/8.2). */
export async function getAdminSession(): Promise<StaffSessionPayload | null> {
  const session = await getStaffSession();
  if (!session || session.role !== "ADMIN") return null;
  return session;
}
