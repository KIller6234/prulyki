import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { ChatWidgetProvider } from "@/components/chat/ChatWidgetProvider";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatWidgetProvider>
      <div className="flex min-h-dvh flex-col">
        <PublicHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <PublicFooter />
        <ChatWidget />
      </div>
    </ChatWidgetProvider>
  );
}
