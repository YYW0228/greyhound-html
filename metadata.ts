// metadata.ts — 元数据提取（自实现，不依赖 baoyu-md）
import * as path from "node:path";

import { extractSummaryFromBody, extractTitleFromMarkdown } from "./content-utils.js";
import { serializeFrontmatter, stripWrappingQuotes } from "./frontmatter.js";

export function extractMetadata(
  frontmatter: any,
  body: string,
  optionsTitle: string | undefined,
  markdownPath: string
) {
  let title =
    stripWrappingQuotes(optionsTitle ?? "") ||
    stripWrappingQuotes(frontmatter.title ?? "") ||
    extractTitleFromMarkdown(body);

  if (!title) {
    title = path.basename(markdownPath, path.extname(markdownPath));
  }

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
