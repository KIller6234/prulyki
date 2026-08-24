"use client";

import { createContext, useContext } from "react";
import type { ChatMessageView } from "./MessageBubble";

export interface ChatWidgetContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: ChatMessageView[];
  isSending: boolean;
  error: string | null;
  sendMessage: (text: string) => void;
}

export const ChatWidgetContext = createContext<ChatWidgetContextValue | null>(
  null,
);

/** Доступ до глобального стану чат-віджета (кнопка, банер тощо). */
export function useChatWidget(): ChatWidgetContextValue {
  const context = useContext(ChatWidgetContext);
  if (!context) {
    throw new Error("useChatWidget повинен використовуватись всередині ChatWidgetProvider");
  }
  return context;
}
