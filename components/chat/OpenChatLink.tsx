"use client";

import { useChatWidget } from "./ChatWidgetContext";

/** Посилання-стилізована кнопка, що відкриває чат-віджет програмно (напр. у футері). */
export function OpenChatLink({ className }: { className?: string }) {
  const { open } = useChatWidget();
  return (
    <button type="button" onClick={open} className={className}>
      ШІ-консультант
    </button>
  );
}
