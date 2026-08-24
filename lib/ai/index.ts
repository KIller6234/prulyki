import type { WasteConsultantProvider } from "./provider";
import { NoLLMConfiguredProvider } from "./providers/mock-provider";
import { AnthropicConsultantProvider } from "./providers/anthropic-provider";

export function getWasteConsultantProvider(): WasteConsultantProvider {
  return process.env.ANTHROPIC_API_KEY
    ? new AnthropicConsultantProvider()
    : new NoLLMConfiguredProvider();
}
