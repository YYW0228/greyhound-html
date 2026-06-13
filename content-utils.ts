// content-utils.ts — 自实现文本提取工具
// 替代 baoyu-md 的 extractTitleFromMarkdown / extractSummaryFromBody

import { stripWrappingQuotes } from "./frontmatter.js";

/** 从 markdown body 中提取第一个 `# ` 标题 */
export function extractTitleFromMarkdown(body: string): string | undefined {
  const match = body.match(/^#\s+(.+)$/m);
  return match ? stripWrappingQuotes(match[1]!.trim()) : undefined;
}

/** 从 body 中提取第一段纯文本作为摘要 */
export function extractSummaryFromBody(body: string, maxLen = 120): string {
  // 跳过 frontmatter 和空行，找第一个非空段落
  const lines = body.split("\n");
  let summary = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // 跳过标题、代码块、引用、列表
    if (trimmed.startsWith("#") || trimmed.startsWith("```") || trimmed.startsWith(">")) continue;
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) continue;
    // 纯文本段落
    summary = stripWrappingQuotes(trimmed);
    break;
  }

  if (summary.length <= maxLen) return summary;
  return summary.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}
