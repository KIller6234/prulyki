const MAX_WORDS_PER_CHUNK = 400;

export interface KnowledgeChunkSeed {
  citationLabel: string;
  content: string;
}

export interface ParsedKnowledgeDocument {
  title: string;
  sourceType: string;
  sourceUrl: string | null;
  fullText: string;
  chunks: KnowledgeChunkSeed[];
}

function parseFrontmatter(raw: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Документ бази знань має містити YAML frontmatter");
  }
  const [, frontmatterRaw, body] = match;

  const frontmatter: Record<string, string> = {};
  for (const line of frontmatterRaw.split("\n")) {
    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    frontmatter[key] = value;
  }

  return { frontmatter, body: body.trim() };
}

/** Ділить документ на чанки по секціях `## заголовок`; довгі секції — по абзацах. */
export function parseKnowledgeMarkdown(raw: string): ParsedKnowledgeDocument {
  const { frontmatter, body } = parseFrontmatter(raw);
  const title = frontmatter.title ?? "Без назви";
  const sourceType = frontmatter.sourceType ?? "OTHER";
  const sourceUrl =
    frontmatter.sourceUrl && frontmatter.sourceUrl !== "null"
      ? frontmatter.sourceUrl
      : null;

  const sections = body
    .split(/\n(?=## )/g)
    .map((section) => section.trim())
    .filter(Boolean);

  const chunks: KnowledgeChunkSeed[] = [];

  for (const section of sections) {
    const headingMatch = section.match(/^##\s+(.+)$/m);
    const heading = headingMatch ? headingMatch[1].trim() : title;
    const contentText = section.replace(/^##\s+.+$/m, "").trim();
    if (!contentText) continue;

    const wordCount = contentText.split(/\s+/).length;
    if (wordCount <= MAX_WORDS_PER_CHUNK) {
      chunks.push({ citationLabel: `${title}, ${heading}`, content: contentText });
      continue;
    }

    const paragraphs = contentText.split(/\n\s*\n/).filter(Boolean);
    paragraphs.forEach((paragraph, index) => {
      chunks.push({
        citationLabel: `${title}, ${heading} (${index + 1})`,
        content: paragraph.trim(),
      });
    });
  }

  return { title, sourceType, sourceUrl, fullText: body, chunks };
}
