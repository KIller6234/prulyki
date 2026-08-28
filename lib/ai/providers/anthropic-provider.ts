import Anthropic from "@anthropic-ai/sdk";
import type {
  ChatTurn,
  ConsultantAnswer,
  RetrievedChunk,
  WasteConsultantProvider,
} from "../provider";
import {
  buildConsultantSystemPrompt,
  finalizeConsultantAnswer,
  MAX_RESPONSE_TOKENS,
} from "../consultantPrompt";

const DEFAULT_MODEL = "claude-haiku-4-5";

export class AnthropicConsultantProvider implements WasteConsultantProvider {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor() {
    this.client = new Anthropic();
    this.model = process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL;
  }

  async answer(
    query: string,
    retrievedChunks: RetrievedChunk[],
    history: ChatTurn[],
  ): Promise<ConsultantAnswer> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: MAX_RESPONSE_TOKENS,
      system: buildConsultantSystemPrompt(retrievedChunks),
      messages: [
        ...history.map((turn) => ({
          role: turn.role,
          content: turn.content,
        })),
        { role: "user" as const, content: query },
      ],
    });

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text",
    );

    return finalizeConsultantAnswer(textBlock?.text ?? "", retrievedChunks);
  }
}
