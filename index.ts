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
  PREMIUM_THEME_NAMES,
  ALL_THEME_NAMES,
  COLOR_PRESETS,
  COLOR_NAMES,
  FONT_FAMILY_MAP,
  FONT_SIZE_OPTIONS,
  DEFAULTS,
  MERMAID_THEMES,
} from "./constants.js";
export type { ThemeName, PremiumThemeName } from "./constants.js";

// 主题
export { THEMES, PREMIUM_THEME_NAMES as PREMIUM_THEME_LIST } from "./themes.js";
export type { ThemeDefinition } from "./themes.js";
export { renderPremiumPage } from "./renderer-premium.js";

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
