import { prisma } from "@/lib/db";
import type { RetrievedChunk } from "../provider";
import type { Retriever } from "./retriever";
import { extractKeywords } from "./keywords";

/**
 * MVP-дефолт retrieval: keyword-скорування в пам'яті процесу (база знань —
 * кілька документів, десятки чанків, тож повне сканування дешеве).
 * Замінюється на VectorRetriever (pgvector) після підключення
 * embedding-провайдера — див. план.
 */
export class KeywordRetriever implements Retriever {
  async search(query: string, limit: number): Promise<RetrievedChunk[]> {
    const keywords = extractKeywords(query);
    if (keywords.length === 0) return [];

    const chunks = await prisma.knowledgeChunk.findMany({
      where: { document: { isActive: true } },
      include: { document: { select: { title: true } } },
    });

    const scored = chunks
      .map((chunk) => {
        const lowerContent = chunk.content.toLowerCase();
        const score = keywords.reduce(
          (acc, keyword) => acc + (lowerContent.includes(keyword) ? 1 : 0),
          0,
        );
        return { chunk, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(({ chunk, score }) => ({
      chunkId: chunk.id,
      documentTitle: chunk.document.title,
      citationLabel: chunk.citationLabel,
      content: chunk.content,
      score,
    }));
  }
}
