"use client";

import { useChatWidget } from "./ChatWidgetContext";
import { ChatBubbleIcon } from "@/components/icons";

/** Банер на головній — відкриває той самий чат-віджет програмно, без переходу на окрему сторінку. */
export function AskConsultantBanner() {
  const { open } = useChatWidget();

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl bg-mint-100 p-6 sm:flex-row sm:text-left">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
        <ChatBubbleIcon className="h-7 w-7" />
      </span>
      <div className="text-center sm:text-left">
        <p className="font-bold text-gray-800">ШІ-консультант</p>
        <p className="mt-0.5 text-sm text-gray-600">
          Є питання щодо сортування чи вивезення відходів? Запитайте — і
          отримайте відповідь із посиланням на джерело.{" "}
          <button
            type="button"
            onClick={open}
            className="font-semibold text-primary-700 underline underline-offset-2 hover:text-primary-800"
          >
            Запитайте ШІ-консультанта
          </button>
        </p>
      </div>
    </div>
  );
}
