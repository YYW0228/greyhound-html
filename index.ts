// index.ts — 库入口，方便其他模块 import
// Skill: markdown-to-html

// 核心转换
export { convertMarkdown, restoreBackup } from "./core.js";

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

// 主题系统
export { THEMES, PREMIUM_THEME_NAMES as PREMIUM_THEME_LIST } from "./themes.js";
export type { ThemeDefinition } from "./themes.js";
export { renderPremiumPage } from "./renderer-premium.js";

// 工具
export {
  logger,
  formatTimestamp,
  escapeHtml,
  wordCount,
  basenameNoExt,
  debounce,
  printUsage,
} from "./utils.js";
export type { LogLevel } from "./utils.js";

// AST / 解析器
export type { Block, DocumentAST, DocumentMeta, Section, BlockType } from "./ast.js";
export { createAST, addBlock, buildSections, flattenSections } from "./ast.js";
export { parseMarkdown, astToHtml, resetBlockCounter } from "./parser.js";

// 插件系统
export { PluginManager, pluginManager, lazyLoadImagesPlugin, externalLinksPlugin } from "./plugins.js";
export type { GreyhoundPlugin, PluginHooks } from "./plugins.js";

// 管道
export { Pipeline, PipelineError } from "./pipeline.js";
export type { StepResult, ConversionContext } from "./pipeline.js";

// AST 渲染器
export { renderWithAST } from "./ast-renderer.js";
export type { AstRenderOptions, AstRenderResult } from "./ast-renderer.js";

// 元数据
export { extractMetadata } from "./metadata.js";

// CLI
export { parseCliArgs } from "./cli.js";
export type { CliResult } from "./cli.js";
