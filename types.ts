// types.ts
export interface ImageInfo {
  placeholder: string;
  localPath: string;
  originalPath: string;
  alt?: string;
}

export interface MermaidImageInfo {
  hash: string;
  localPath: string;
  cached: boolean;
}

export interface ParsedResult {
  title: string;
  author: string;
  summary: string;
  htmlPath: string;
  backupPath?: string;
  contentImages: ImageInfo[];
  mermaidImages: MermaidImageInfo[];
}

export interface MermaidOptions {
  enabled?: boolean;
  theme?: string;
  scale?: number;
  background?: string;
  minWidth?: number;
}

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
  // 其他选项...
}
