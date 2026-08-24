"use client";

import { useEffect, useRef, useState } from "react";
import { useChatWidget } from "./ChatWidgetContext";
import { MessageBubble } from "./MessageBubble";
import { ChatBubbleIcon, CloseIcon, SendIcon } from "@/components/icons";

const EXIT_ANIMATION_DURATION_MS = 200;

export function ChatWidgetPanel() {
  const { isOpen, close, messages, isSending, error, sendMessage } =
    useChatWidget();
  const [input, setInput] = useState("");
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimatedIn, setIsAnimatedIn] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const raf = requestAnimationFrame(() => setIsAnimatedIn(true));
      return () => cancelAnimationFrame(raf);
    }
    setIsAnimatedIn(false);
    const timeout = setTimeout(
      () => setShouldRender(false),
      EXIT_ANIMATION_DURATION_MS,
    );
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isSending) return;
    sendMessage(input);
    setInput("");
  };

  if (!shouldRender) return null;

  return (
    <div
      role="dialog"
      aria-label="ШІ-консультант"
      aria-modal="false"
      className={`fixed inset-0 z-[1200] flex flex-col overflow-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.15)] transition-all duration-200 ease-out sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[600px] sm:max-h-[80vh] sm:w-[380px] sm:rounded-2xl ${
        isAnimatedIn
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
    >
      <header className="flex shrink-0 items-center gap-3 bg-primary-600 px-4 py-3.5 text-white">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
          <ChatBubbleIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">ШІ-консультант</p>
          <p className="truncate text-xs text-white/75">
            Відповіді з посиланням на джерело
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          aria-label="Закрити чат"
          className="rounded-full p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        {isSending ? (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-mint-100 px-4 py-2 text-sm text-gray-500">
              Друкує…
            </div>
          </div>
        ) : null}
        <div ref={scrollAnchorRef} />
      </div>

      {error ? (
        <p className="shrink-0 border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2 border-t border-gray-100 bg-white p-3"
      >
        <label htmlFor="chat-widget-input" className="sr-only">
          Повідомлення
        </label>
        <input
          id="chat-widget-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Напишіть питання…"
          className="min-w-0 flex-1 rounded-full border border-gray-300 px-3.5 py-2 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          aria-label="Надіслати"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40"
        >
          <SendIcon className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
