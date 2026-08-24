import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";

const WINDOW_MS = 60_000;

interface RateLimitCheckParams {
  ip: string;
  endpoint: string;
  limitPerMinute: number;
}

/** Fixed-window rate limiter backed by the RateLimitLog table. See plan's
 * "Rate limit" simplification — no Redis/Upstash for the 4-day MVP. */
export async function isWithinRateLimit({
  ip,
  endpoint,
  limitPerMinute,
}: RateLimitCheckParams): Promise<boolean> {
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const windowStart = new Date(Math.floor(Date.now() / WINDOW_MS) * WINDOW_MS);

  const record = await prisma.rateLimitLog.upsert({
    where: {
      ipHash_endpoint_windowStart: { ipHash, endpoint, windowStart },
    },
    create: { ipHash, endpoint, windowStart, count: 1 },
    update: { count: { increment: 1 } },
  });

  return record.count <= limitPerMinute;
}

/** Best-effort client IP extraction for serverless/proxy deployments. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
