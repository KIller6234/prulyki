import { GoogleGenAI } from "@google/genai";
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

const DEFAULT_MODEL = "gemini-2.5-flash";

// Нижча температура — консультант має триматися фрагментів бази знань,
// а не імпровізувати.
const TEMPERATURE = 0.2;

export class GeminiConsultantProvider implements WasteConsultantProvider {
  private readonly client: GoogleGenAI;
  private readonly model: string;

  constructor() {
    this.client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.model = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  }

  async answer(
    query: string,
    retrievedChunks: RetrievedChunk[],
    history: ChatTurn[],
  ): Promise<ConsultantAnswer> {
    const response = await this.client.models.generateContent({
      model: this.model,
      // Gemini використовує ролі "user" / "model" (не "assistant").
      contents: [
        ...history.map((turn) => ({
          role: turn.role === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: turn.content }],
        })),
        { role: "user" as const, parts: [{ text: query }] },
      ],
      config: {
        systemInstruction: buildConsultantSystemPrompt(retrievedChunks),
        maxOutputTokens: MAX_RESPONSE_TOKENS,
        temperature: TEMPERATURE,
      },
    });

    return finalizeConsultantAnswer(response.text ?? "", retrievedChunks);
  }
}
