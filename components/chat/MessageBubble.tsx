import Link from "next/link";
import { CitationList } from "./CitationList";

export interface ChatMessageView {
  role: "user" | "assistant";
  text: string;
  citations?: { documentTitle: string; citationLabel: string }[];
  isFallback?: boolean;
  suggestSubmitComplaint?: boolean;
}

export function MessageBubble({ message }: { message: ChatMessageView }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
          isUser
            ? "bg-primary-600 text-white"
            : "bg-mint-100 text-gray-800"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        {!isUser && message.isFallback ? (
          <p className="mt-1 text-xs italic text-amber-600">
            AI-провайдер ще не підключено — відповідь сформована без LLM.
          </p>
        ) : null}
        {!isUser && message.citations ? (
          <CitationList citations={message.citations} />
        ) : null}
        {!isUser && message.suggestSubmitComplaint ? (
          <Link
            href="/zvernennya"
            className="mt-2 inline-block text-xs font-medium text-primary-700 underline"
          >
            Подати звернення →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
