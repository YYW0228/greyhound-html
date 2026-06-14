// metadata.ts — 元数据提取
// Skill: markdown-to-html

import path from "node:path";
import {
  extractSummaryFromBody,
  extractTitleFromMarkdown,
  parseFrontmatter,
  serializeFrontmatter,
  stripWrappingQuotes,
} from "baoyu-md";

export function extractMetadata(
  frontmatter: Record<string, any>,
  body: string,
  optionsTitle: string | undefined,
  markdownPath: string,
) {
  const title =
    stripWrappingQuotes(optionsTitle ?? "") ||
    stripWrappingQuotes(frontmatter.title ?? "") ||
    extractTitleFromMarkdown(body) ||
    path.basename(markdownPath, path.extname(markdownPath));

  const author = stripWrappingQuotes(frontmatter.author ?? "");
  const summary =
    stripWrappingQuotes(frontmatter.description ?? "") ||
    stripWrappingQuotes(frontmatter.summary ?? "") ||
    extractSummaryFromBody(body, 120);

  const effectiveFrontmatter = optionsTitle
    ? { ...frontmatter, title }
    : frontmatter;

  return { title, author, summary, effectiveFrontmatter };
}

export { serializeFrontmatter };
