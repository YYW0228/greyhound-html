// cli.ts — CLI 参数解析、help、子命令逻辑
// Skill: markdown-to-html
// 支持：基础主题（baoyu-md）+ 高级主题（premium/mckinsey/wsj/blackrock）

import { parseArgs } from "baoyu-md";
import { printUsage } from "./utils.js";
import type { ConvertMarkdownOptions } from "./types.js";
import { PREMIUM_THEME_NAMES } from "./constants.js";

export interface CliResult {
  markdownPath: string;
  options: ConvertMarkdownOptions;
  watch: boolean;
}

/**
 * 解析 CLI 参数
 * 对 premium 系列主题，跳过 baoyu-md 的 parseArgs 以避免未知主题错误
 */
export function parseCliArgs(argv: string[]): CliResult {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    printUsage(0);
  }

  let watch = false;
  let theme = "default";
  let color = "blue";
  let title: string | undefined;
  let keepTitle = false;
  let citeStatus = false;
  let quiet = false;
  let verbose = false;
  let markdownPath = "";

  // 先过一遍参数，提取我们关心的关键项
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--watch" || arg === "-w") {
      watch = true;
    } else if (arg === "--quiet") {
      quiet = true;
    } else if (arg === "--verbose") {
      verbose = true;
    } else if (arg === "--theme" && i + 1 < argv.length) {
      theme = argv[++i];
    } else if (arg === "--color" && i + 1 < argv.length) {
      color = argv[++i];
    } else if (arg === "--title" && i + 1 < argv.length) {
      title = argv[++i];
    } else if (arg === "--keep-title") {
      keepTitle = true;
    } else if (arg === "--cite") {
      citeStatus = true;
    } else if (!arg.startsWith("--") && !markdownPath) {
      markdownPath = arg;
    }
  }

  if (!markdownPath) {
    console.error("[markdown-to-html] Error: missing markdown file path");
    printUsage(1);
  }

  const isPremium = (PREMIUM_THEME_NAMES as readonly string[]).includes(theme);
  const options: ConvertMarkdownOptions & { quiet?: boolean; verbose?: boolean } = {
    title,
    theme,
    primaryColor: color,
    keepTitle,
    citeStatus,
    quiet,
    verbose,
  };

  // 高级主题：跳过 baoyu-md 的 parseArgs，它不认可这些主题名
  if (isPremium) {
    return { markdownPath, options, watch };
  }

  // 基础主题：走 baoyu-md 的标准解析获取所有参数
  const rawOptions: Record<string, any> = parseArgs(argv) ?? {};

  options.fontFamily = rawOptions.fontFamily;
  options.fontSize = rawOptions.fontSize;
  options.countStatus = rawOptions.countStatus;
  options.codeTheme = rawOptions.codeTheme;
  options.isMacCodeBlock = rawOptions.macCodeBlock;
  options.isShowLineNumber = rawOptions.showLineNumber;
  options.legend = rawOptions.legend;
  options.mermaid = {
    enabled: rawOptions.noMermaid !== true,
    theme: rawOptions.mermaidTheme,
    scale: rawOptions.mermaidScale,
    minWidth: rawOptions.mermaidWidth,
    background: rawOptions.mermaidBg,
  };

  return { markdownPath, options, watch };
}
