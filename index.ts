// index.ts — 库入口，方便其他模块 import
// Skill: markdown-to-html

// 核心转换
export { convertMarkdown } from "./core.js";

// 类型
export type {
  ImageInfo,
  MermaidImageInfo,
  ParsedResult,
  MermaidOptions,
  ConvertMarkdownOptions,
} from "./types.js";

// 常量 / 预设
export {
  THEME_NAMES,
  COLOR_PRESETS,
  COLOR_NAMES,
  FONT_FAMILY_MAP,
  FONT_SIZE_OPTIONS,
  DEFAULTS,
  MERMAID_THEMES,
} from "./constants.js";
export type { ThemeName } from "./constants.js";

// 工具
export {
  formatTimestamp,
  escapeHtml,
  wordCount,
  basenameNoExt,
  debounce,
} from "./utils.js";

// 元数据
export { extractMetadata, serializeFrontmatter } from "./metadata.js";

// CLI (库使用者可能也需要)
export { parseCliArgs } from "./cli.js";
export type { CliResult } from "./cli.js";
