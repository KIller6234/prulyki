import type {
  ChatTurn,
  ConsultantAnswer,
  RetrievedChunk,
  WasteConsultantProvider,
} from "../provider";

const TOP_FRAGMENTS_TO_SHOW = 3;

/**
 * Тимчасова заглушка, що працює до підключення реального AI-провайдера
 * (ANTHROPIC_API_KEY). Жодного виклику LLM — лише чесна відповідь на основі
 * keyword-пошуку по базі знань. Див. план, розділ "AI-провайдер".
 */
export class NoLLMConfiguredProvider implements WasteConsultantProvider {
  async answer(
    _query: string,
    retrievedChunks: RetrievedChunk[],
    _history: ChatTurn[],
  ): Promise<ConsultantAnswer> {
    if (retrievedChunks.length === 0) {
      return {
        text:
          "Наразі не маю релевантної інформації у базі знань за цим запитом. " +
          "Рекомендую подати звернення через розділ «Зворотний зв'язок» — " +
          "диспетчер розгляне його протягом встановленого законом строку.",
        citations: [],
        suggestSubmitComplaint: true,
        isFallback: true,
      };
    }

    const topChunks = retrievedChunks.slice(0, TOP_FRAGMENTS_TO_SHOW);
    const text =
      "AI-провайдер (LLM) ще не підключено. Ось найбільш релевантні фрагменти бази знань:\n\n" +
      topChunks
        .map((chunk) => `• ${chunk.content}\n  (${chunk.citationLabel})`)
        .join("\n\n");

    return {
      text,
      citations: topChunks.map((chunk) => ({
        documentTitle: chunk.documentTitle,
        citationLabel: chunk.citationLabel,
      })),
      suggestSubmitComplaint: false,
      isFallback: true,
    };
  }
}
