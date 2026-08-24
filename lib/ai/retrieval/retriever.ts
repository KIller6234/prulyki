import type { RetrievedChunk } from "../provider";

export interface Retriever {
  search(query: string, limit: number): Promise<RetrievedChunk[]>;
}
