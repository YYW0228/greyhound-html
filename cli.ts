// cli.ts — Arg parser (standalone, no baoyu-md dependency)
import { printUsage } from "./utils.js";
import type { ConvertMarkdownOptions } from "./types.js";

export interface CliResult {
  markdownPath: string;
  options: ConvertMarkdownOptions;
  watch: boolean;
}

/** Minimal key=value / --flag parser for custom options */
export function parseCliArgs(argv: string[]): CliResult {
  if (argv.length === 0 || argv.includes("--help") || argv.includes("-h")) {
    printUsage(0);
  }

  const markdownPath = argv[0]!;
  const raw = argv.slice(1);

  const opts: Record<string, string | boolean> = {};
  for (let i = 0; i < raw.length; i++) {
    const arg = raw[i]!;
    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx !== -1) {
        opts[arg.slice(2, eqIdx)] = arg.slice(eqIdx + 1);
      } else {
        const next = raw[i + 1];
        if (next && !next.startsWith("--")) {
          opts[arg.slice(2)] = next;
          i++;
        } else {
          opts[arg.slice(2)] = true;
        }
      }
    } else if (arg.startsWith("-") && arg.length === 2) {
      opts[arg.slice(1)] = true;
    }
  }

  const watch = opts.watch === true || opts.w === true;

  const mermaid = {
    enabled: opts.noMermaid !== true,
    theme: opts.mermaidTheme as string | undefined,
    scale: opts.mermaidScale ? Number(opts.mermaidScale) : undefined,
    minWidth: opts.mermaidWidth ? Number(opts.mermaidWidth) : undefined,
    background: opts.mermaidBg as string | undefined,
  };

  const options: ConvertMarkdownOptions = {
    title: opts.title as string | undefined,
    theme: opts.theme as string | undefined,
    primaryColor: opts.color as string | undefined,
    fontFamily: opts.fontFamily as string | undefined,
    fontSize: opts.fontSize as string | undefined,
    keepTitle: opts.keepTitle === true,
    citeStatus: opts.cite === true,
    countStatus: opts.count === true,
    codeTheme: opts.codeTheme as string | undefined,
    isShowLineNumber: opts.lineNumber === true,
    legend: opts.legend as string | undefined,
    mermaid,
  };

  return { markdownPath, options, watch };
}
