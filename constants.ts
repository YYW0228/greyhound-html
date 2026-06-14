// constants.ts — 常量、预设、主题色板
// Skill: markdown-to-html

/** 主题名称列表 */
export const THEME_NAMES = ["default", "grace", "simple", "modern"] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

/** 颜色预设：名称 → Hex */
export const COLOR_PRESETS: Record<string, string> = {
  blue: "#0F4C81",
  green: "#009874",
  vermilion: "#FA5151",
  yellow: "#FECE00",
  purple: "#92617E",
  sky: "#55C9EA",
  rose: "#B76E79",
  olive: "#556B2F",
  black: "#333333",
  gray: "#A9A9A9",
  pink: "#FFB7C5",
  red: "#A93226",
  orange: "#D97757",
};

/** 颜色预设名称列表（用于 --help 展示） */
export const COLOR_NAMES = Object.keys(COLOR_PRESETS);

/** 字体族映射 */
export const FONT_FAMILY_MAP: Record<string, string> = {
  sans:
    "'-apple-system-font','BlinkMacSystemFont','Helvetica Neue','PingFang SC','Hiragino Sans GB','Microsoft YaHei UI','Microsoft YaHei',Arial,sans-serif",
  serif: "'Georgia','Noto Serif CJK SC','Source Han Serif SC','SimSun','STSong',serif",
  "serif-cjk": "'Noto Serif CJK SC','Source Han Serif SC','STSong',serif",
  mono: "'SF Mono','Fira Code','JetBrains Mono','Consolas',monospace",
};

/** 字号选项 */
export const FONT_SIZE_OPTIONS = [14, 15, 16, 17, 18] as const;

/** 默认配置 */
export const DEFAULTS = {
  theme: "default" as ThemeName,
  primaryColor: COLOR_PRESETS.blue,
  fontFamily: FONT_FAMILY_MAP.sans,
  fontSize: 16,
  keepTitle: false,
  citeStatus: false,
  countStatus: false,
  codeTheme: "github",
  isMacCodeBlock: false,
  isShowLineNumber: false,
  legend: "",
  mermaid: {
    enabled: true,
    theme: "default",
    scale: 2,
    background: "white",
    minWidth: 860,
  },
};

/** Mermaid 主题列表 */
export const MERMAID_THEMES = ["default", "forest", "dark", "neutral", "base"] as const;
