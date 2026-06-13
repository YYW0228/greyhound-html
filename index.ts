// index.ts — Public library API entry
//
// 使用方式:
//   import { convertMarkdown } from "greyhound-html";
//   const result = await convertMarkdown("doc.md", { theme: "dark" });

export { convertMarkdown } from "./core.js";
export { extractMetadata, serializeFrontmatter } from "./metadata.js";
export { parseCliArgs } from "./cli.js";
export { printUsage, watchMode, formatTime } from "./utils.js";
export { parseFrontmatter, stripWrappingQuotes } from "./frontmatter.js";
export { renderMarkdownDocument } from "./renderer.js";
export { replaceMarkdownImagesWithPlaceholders, resolveContentImages } from "./images.js";
export { preprocessMermaidInMarkdown, renderMermaidToPng, closeRenderer } from "./mermaid.js";
export { generateReport } from "./report.js";
export type { ReportOptions } from "./report.js";
export { extractTitleFromMarkdown, extractSummaryFromBody } from "./content-utils.js";
export {
  DEFAULT_THEME, DEFAULT_CODE_THEME, DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE,
  DEFAULT_PRIMARY_COLOR, THEME_PRESETS, THEME_STYLES, MERMAID_THEMES, CLI_USAGE,
} from "./constants.js";

export type {
  ImageInfo, MermaidImageInfo, ParsedResult, MermaidOptions, ConvertMarkdownOptions,
} from "./types.js";
export type { ThemePreset } from "./constants.js";
export type { CliResult } from "./cli.js";
export type { FrontmatterFields } from "./frontmatter.js";
export type { RenderOptions, RenderResult } from "./renderer.js";
export type { MermaidPreprocessedImage, MermaidPreprocessOptions } from "./mermaid.js";
