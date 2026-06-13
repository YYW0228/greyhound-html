// constants.ts
export const DEFAULT_THEME = "github";
export const DEFAULT_CODE_THEME = "github-dark";
export const DEFAULT_FONT_FAMILY = [
  "-apple-system",
  "BlinkMacSystemFont",
  "'Segoe UI'",
  "Roboto",
  "sans-serif",
].join(", ");
export const DEFAULT_FONT_SIZE = "16px";
export const DEFAULT_PRIMARY_COLOR = "#2563eb";

export const DEFAULT_MERMAID_THEME = "default";
export const DEFAULT_MERMAID_SCALE = 2;
export const DEFAULT_MERMAID_BACKGROUND = "transparent";
export const DEFAULT_MERMAID_MIN_WIDTH = 860;

export const DEFAULT_WATCH_INTERVAL_MS = 1000;

export const PRINT_WIDTH = 80;

export const THEME_PRESETS: Record<
  string,
  { primaryColor: string; codeTheme: string; fontFamily: string }
> = {
  github: {
    primaryColor: "#0969da",
    codeTheme: "github-light",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Noto Sans, Helvetica, Arial, sans-serif",
  },
  dark: {
    primaryColor: "#58a6ff",
    codeTheme: "github-dark",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
  },
  minimal: {
    primaryColor: "#000000",
    codeTheme: "one-light",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
} as const;

export type ThemePreset = keyof typeof THEME_PRESETS;

/** 主题完整样式定义（给 renderer 使用） */
export const THEME_STYLES: Record<
  string,
  { primaryColor: string; codeTheme: string; fontFamily: string }
> = {
  ...THEME_PRESETS,
  default: THEME_PRESETS.github,
};

export const MERMAID_THEMES = [
  "default",
  "dark",
  "neutral",
  "forest",
  "base",
] as const;

export const CLI_USAGE = `
greyhound-html — Convert Markdown to styled HTML

Usage:
  greyhound-html <input.md> [options]

Options:
  --title <str>           Override document title
  --theme <name>          Theme preset (github, dark, minimal)
  --color <hex>           Primary color override
  --font-family <str>     Font family
  --font-size <str>       Font size (e.g. "16px")
  --keep-title            Keep title in document body
  --cite                  Show citation status
  --count                 Show word count
  --code-theme <name>     Code block syntax theme
  --line-number           Show line numbers in code blocks
  --legend <str>          Figure / table legend text

  --no-mermaid            Disable Mermaid diagram rendering
  --mermaid-theme <name>  Mermaid theme (default, dark, neutral, forest)
  --mermaid-scale <num>   Mermaid render scale (default: 2)
  --mermaid-bg <str>      Mermaid background color
  --mermaid-width <num>   Minimum Mermaid diagram width (default: 860)

  --watch, -w             Watch input file for changes
  --help, -h              Show this help

Examples:
  greyhound-html README.md
  greyhound-html doc.md --theme dark --color "#e63946" --watch
  greyhound-html article.md --no-mermaid --keep-title --cite
`.trim();
