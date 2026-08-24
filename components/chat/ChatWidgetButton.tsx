"use client";

import { useChatWidget } from "./ChatWidgetContext";
import { ChatBubbleIcon, CloseIcon } from "@/components/icons";

export function ChatWidgetButton() {
  const { isOpen, toggle } = useChatWidget();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isOpen ? "Закрити чат" : "Запитати ШІ-консультанта"}
      aria-expanded={isOpen}
      title={isOpen ? "Закрити чат" : "Запитати консультанта"}
      className={`group fixed right-5 bottom-5 z-[1200] ${
        isOpen ? "hidden sm:flex" : "flex"
      } h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-transform hover:scale-105 hover:bg-primary-700 sm:right-6 sm:bottom-6`}
    >
      {isOpen ? (
        <CloseIcon className="h-6 w-6" />
      ) : (
        <ChatBubbleIcon className="h-7 w-7" />
      )}
      {!isOpen ? (
        <span
          role="tooltip"
          className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-white group-hover:block"
        >
          Запитати консультанта
        </span>
      ) : null}
    </button>
  );
}
