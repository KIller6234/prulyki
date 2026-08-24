"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatWidgetContext, type ChatWidgetContextValue } from "./ChatWidgetContext";
import type { ChatMessageView } from "./MessageBubble";
import type { ChatReplyResult } from "@/app/api/chat/route";
import type { ApiResponse } from "@/types/api";

const SESSION_STORAGE_KEY = "chp_chat_session_token";

const WELCOME_MESSAGE: ChatMessageView = {
  role: "assistant",
  text:
    "Вітаю! Я — ШІ-консультант «Чисті Прилуки». Запитайте про правила " +
    "сортування, графік вивезення відходів або строки розгляду звернень.",
};

/**
 * Глобальний стан чат-віджета — монтується один раз у (public)/layout.tsx,
 * тому історія діалогу та стан відкрито/закрито зберігаються при
 * навігації між сторінками сайту (не прив'язані до конкретного маршруту).
 */
export function ChatWidgetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessageView[]>([
    WELCOME_MESSAGE,
  ]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) setSessionToken(stored);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
      setIsSending(true);
      setError(null);

      fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken, message: trimmed }),
      })
        .then((res) => res.json() as Promise<ApiResponse<ChatReplyResult>>)
        .then((body) => {
          if (!body.success || !body.data) {
            setError(body.error ?? "Не вдалося отримати відповідь");
            return;
          }
          const { data } = body;
          window.localStorage.setItem(SESSION_STORAGE_KEY, data.sessionToken);
          setSessionToken(data.sessionToken);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: data.text,
              citations: data.citations,
              isFallback: data.isFallback,
              suggestSubmitComplaint: data.suggestSubmitComplaint,
            },
          ]);
        })
        .catch(() => setError("Помилка мережі. Спробуйте ще раз."))
        .finally(() => setIsSending(false));
    },
    [sessionToken, isSending],
  );

  const value = useMemo<ChatWidgetContextValue>(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((prev) => !prev),
      messages,
      isSending,
      error,
      sendMessage,
    }),
    [isOpen, messages, isSending, error, sendMessage],
  );

  return (
    <ChatWidgetContext.Provider value={value}>
      {children}
    </ChatWidgetContext.Provider>
  );
}
