import type { WasteConsultantProvider } from "./provider";
import { NoLLMConfiguredProvider } from "./providers/mock-provider";
import { AnthropicConsultantProvider } from "./providers/anthropic-provider";
import { GeminiConsultantProvider } from "./providers/gemini-provider";

type ProviderName = "gemini" | "anthropic" | "mock";

/**
 * Вибір LLM-провайдера консультанта:
 *   AI_PROVIDER=gemini|anthropic|mock  — явно фіксує провайдера;
 *   інакше автовибір за наявним ключем: спершу GEMINI_API_KEY, потім
 *   ANTHROPIC_API_KEY, інакше — mock (чесна відповідь без виклику LLM).
 */
function resolveProviderName(): ProviderName {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (explicit === "gemini" || explicit === "anthropic" || explicit === "mock") {
    return explicit;
  }
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return "mock";
}

export function getWasteConsultantProvider(): WasteConsultantProvider {
  switch (resolveProviderName()) {
    case "gemini":
      return new GeminiConsultantProvider();
    case "anthropic":
      return new AnthropicConsultantProvider();
    default:
      return new NoLLMConfiguredProvider();
  }
}
