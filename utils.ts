// utils.ts — 通用工具函数
// Skill: markdown-to-html

import process from "node:process";
import { THEME_NAMES, COLOR_NAMES, FONT_FAMILY_MAP, FONT_SIZE_OPTIONS, MERMAID_THEMES } from "./constants.js";

/** 打印 help 信息并退出 */
export function printUsage(exitCode = 0) {
  console.log(`
markdown-to-html — Convert Markdown to styled HTML

Usage:
  bun main.ts <markdown_file> [options]

Options:
  --theme <name>         Theme: ${THEME_NAMES.join(", ")} (default: default)
  --color <name|hex>     Primary color: ${COLOR_NAMES.join(", ")} or hex (default: blue)
  --font-family <name>   Font: ${Object.keys(FONT_FAMILY_MAP).join(", ")} or CSS value
  --font-size <N>        Font size: ${FONT_SIZE_OPTIONS.join(", ")} (default: 16)
  --title <title>        Override title from frontmatter
  --keep-title           Keep the first heading in content (default: removed)
  --cite                 Convert external links to bottom citations
  --count                Add word count to output
  --code-theme <name>    Code highlight theme: github, monokai, dracula (default: github)
  --mac-code-block       Render code blocks in macOS style
  --show-line-number     Show line numbers in code blocks
  --legend <text>        Custom legend text
  --mermaid-theme <name> Mermaid theme: ${MERMAID_THEMES.join(", ")} (default: default)
  --mermaid-scale <N>    Mermaid render scale (1-4, default: 2)
  --mermaid-width <N>    Mermaid target display width (default: 860)
  --mermaid-bg <value>   Mermaid background: white, transparent, #hex (default: white)
  --no-mermaid           Skip Mermaid rendering; emit <pre class="mermaid">
  --watch                Watch file for changes and auto-reconvert
  --help, -h             Show this help

Examples:
  bun main.ts article.md
  bun main.ts article.md --theme grace --color red
  bun main.ts article.md --cite
  bun main.ts article.md --watch
`);
  process.exit(exitCode);
}

/** 格式化时间戳为文件名安全格式 */
export function formatTimestamp(date = new Date()): string {
  return date
    .toISOString()
    .replace(/[:.]/g, "")
    .slice(0, 15);
}

/** HTML 转义 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** 简单的 word count（中英文混合） */
export function wordCount(text: string): number {
  const en = (text.match(/[a-zA-Z]+/g) || []).length;
  const cn = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length;
  return en + cn;
}

/** 提取文件基础名（不含扩展名） */
export function basenameNoExt(filePath: string): string {
  const base = filePath.split("/").pop() || filePath;
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(0, dot) : base;
}

/** 解析 rawOptions 中的 boolean-ish 值 */
export function parseBool(val: string | undefined): boolean | undefined {
  if (val === undefined) return undefined;
  return val === "true" || val === "1" || val === "";
}

/** 延迟函数（用于 watch 模式去抖） */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
