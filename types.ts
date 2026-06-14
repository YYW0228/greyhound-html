// types.ts — 类型定义
// Skill: markdown-to-html

/** 原始图片信息 */
export interface ImageInfo {
  placeholder: string;
  localPath: string;
  originalPath: string;
  alt?: string;
}

/** Mermaid 渲染图片信息 */
export interface MermaidImageInfo {
  hash: string;
  localPath: string;
  cached: boolean;
}

/** 转换结果 */
export interface ParsedResult {
  title: string;
  author: string;
  summary: string;
  htmlPath: string;
  backupPath?: string;
  contentImages: ImageInfo[];
  mermaidImages: MermaidImageInfo[];
}

/** Mermaid 渲染选项 */
export interface MermaidOptions {
  enabled?: boolean;
  theme?: string;
  scale?: number;
  background?: string;
  minWidth?: number;
}

/** 转换选项（传给 convertMarkdown） */
export interface ConvertMarkdownOptions {
  title?: string;
  theme?: string;
  primaryColor?: string;
  fontFamily?: string;
  fontSize?: string | number;
  keepTitle?: boolean;
  citeStatus?: boolean;
  countStatus?: boolean;
  codeTheme?: string;
  isMacCodeBlock?: boolean;
  isShowLineNumber?: boolean;
  legend?: string;
  mermaid?: MermaidOptions;
  // 其他 baoyu-md 选项透传
  [key: string]: unknown;
}
