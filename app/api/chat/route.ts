import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getClientIp, isWithinRateLimit } from "@/lib/rate-limit";
import { chatMessageSchema } from "@/lib/validation/chat";
import { KeywordRetriever } from "@/lib/ai/retrieval/keyword-retriever";
import { getWasteConsultantProvider } from "@/lib/ai";
import type { ChatTurn, ConsultantCitation } from "@/lib/ai/provider";
import type { ApiResponse } from "@/types/api";

const CHAT_RATE_LIMIT_PER_MINUTE = 20;
const RETRIEVAL_LIMIT = 5;
const HISTORY_LIMIT = 10;

export interface ChatReplyResult {
  sessionToken: string;
  text: string;
  citations: ConsultantCitation[];
  suggestSubmitComplaint: boolean;
  isFallback: boolean;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ChatReplyResult>>> {
  const clientIp = getClientIp(request);
  const withinLimit = await isWithinRateLimit({
    ip: clientIp,
    endpoint: "chat",
    limitPerMinute: CHAT_RATE_LIMIT_PER_MINUTE,
  });
  if (!withinLimit) {
    return NextResponse.json(
      { success: false, error: "Забагато запитів. Зачекайте хвилину." },
      { status: 429 },
    );
  }

  const rawBody: unknown = await request.json().catch(() => null);
  const parseResult = chatMessageSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: parseResult.error.issues[0]?.message ?? "Некоректний запит",
      },
      { status: 400 },
    );
  }

  const { message } = parseResult.data;

  const session = await getOrCreateChatSession(parseResult.data.sessionToken);

  const priorMessages = await prisma.chatMessage.findMany({
    where: { chatSessionId: session.id },
    orderBy: { createdAt: "asc" },
    take: HISTORY_LIMIT,
  });
  const history: ChatTurn[] = priorMessages.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));

  const retriever = new KeywordRetriever();
  const chunks = await retriever.search(message, RETRIEVAL_LIMIT);

  const provider = getWasteConsultantProvider();
  const answer = await provider.answer(message, chunks, history);

  await prisma.$transaction([
    prisma.chatMessage.create({
      data: { chatSessionId: session.id, role: "USER", content: message },
    }),
    prisma.chatMessage.create({
      data: {
        chatSessionId: session.id,
        role: "ASSISTANT",
        content: answer.text,
        citations: JSON.parse(JSON.stringify(answer.citations)),
      },
    }),
    prisma.chatSession.update({
      where: { id: session.id },
      data: { lastActivityAt: new Date() },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      sessionToken: session.sessionToken,
      text: answer.text,
      citations: answer.citations,
      suggestSubmitComplaint: answer.suggestSubmitComplaint,
      isFallback: answer.isFallback,
    },
  });
}

async function getOrCreateChatSession(sessionToken: string | undefined) {
  if (sessionToken) {
    const existing = await prisma.chatSession.findUnique({
      where: { sessionToken },
    });
    if (existing) return existing;
  }

  return prisma.chatSession.create({
    data: { sessionToken: randomUUID() },
  });
}
