// cli.ts — CLI 参数解析、help、子命令逻辑
// Skill: markdown-to-html

import { parseArgs } from "baoyu-md";
import { printUsage } from "./utils.js";
import type { ConvertMarkdownOptions } from "./types.js";

export interface CliResult {
  markdownPath: string;
  options: ConvertMarkdownOptions;
  watch: boolean;
}

/**
 * 解析 CLI 参数
 * 支持: bun main.ts <file> [options]
 *       bun main.ts --watch <file>
 *       bun main.ts --help
 */
export function parseCliArgs(argv: string[]): CliResult {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    printUsage(0);
  }

  let watch = false;
  const filtered: string[] = [];

  for (const arg of argv) {
    if (arg === "--watch" || arg === "-w") {
      watch = true;
    } else {
      filtered.push(arg);
    }
  }

  if (filtered.length === 0) {
    console.error("[markdown-to-html] Error: missing markdown file path");
    printUsage(1);
  }

  // parseArgs 需要完整 argv（文件路径 + flags）
  const rawOptions: Record<string, any> = parseArgs(filtered) ?? {};

  const markdownPath = rawOptions.inputPath || filtered[0]!;

  const mermaid = {
    enabled: rawOptions.noMermaid !== true,
    theme: rawOptions.mermaidTheme,
    scale: rawOptions.mermaidScale,
    minWidth: rawOptions.mermaidWidth,
    background: rawOptions.mermaidBg,
  };

  const options: ConvertMarkdownOptions = {
    title: rawOptions.title,
    theme: rawOptions.theme,
    primaryColor: rawOptions.color,
    fontFamily: rawOptions.fontFamily,
    fontSize: rawOptions.fontSize,
    keepTitle: rawOptions.keepTitle,
    citeStatus: rawOptions.cite,
    countStatus: rawOptions.count,
    codeTheme: rawOptions.codeTheme,
    isMacCodeBlock: rawOptions.macCodeBlock,
    isShowLineNumber: rawOptions.showLineNumber,
    legend: rawOptions.legend,
    ...rawOptions,
    mermaid,
  };

  return { markdownPath, options, watch };
}
