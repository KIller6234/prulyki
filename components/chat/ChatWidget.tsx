import { ChatWidgetButton } from "./ChatWidgetButton";
import { ChatWidgetPanel } from "./ChatWidgetPanel";

/** Плаваюча кнопка + спливаюче вікно ШІ-консультанта. Монтується один раз
 * у (public)/layout.tsx — стан всередині ChatWidgetProvider. */
export function ChatWidget() {
  return (
    <>
      <ChatWidgetPanel />
      <ChatWidgetButton />
    </>
  );
}
