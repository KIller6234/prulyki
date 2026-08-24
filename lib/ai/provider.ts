export interface RetrievedChunk {
  chunkId: string;
  documentTitle: string;
  citationLabel: string;
  content: string;
  score: number;
}

export interface ConsultantCitation {
  documentTitle: string;
  citationLabel: string;
}

export interface ConsultantAnswer {
  text: string;
  citations: ConsultantCitation[];
  suggestSubmitComplaint: boolean;
  /** true when a real LLM was not used to produce this answer (no API key configured). */
  isFallback: boolean;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface WasteConsultantProvider {
  answer(
    query: string,
    retrievedChunks: RetrievedChunk[],
    history: ChatTurn[],
  ): Promise<ConsultantAnswer>;
}
