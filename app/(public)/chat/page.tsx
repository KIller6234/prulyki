"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatWidget } from "@/components/chat/ChatWidgetContext";

/**
 * Застарілий прямий маршрут /chat — основний спосіб доступу до
 * консультанта тепер спливаюче вікно (ChatWidget), змонтоване в
 * (public)/layout.tsx. Цей маршрут лишається fallback'ом для старих
 * посилань: відкриває віджет і повертає на головну.
 */
export default function ChatFallbackPage() {
  const router = useRouter();
  const { open } = useChatWidget();

  useEffect(() => {
    open();
    router.replace("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
