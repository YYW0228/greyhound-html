// renderer.ts — 自实现 markdown → HTML 渲染
// 替代 baoyu-md 的 renderMarkdownDocument
// 依赖: marked + marked-highlight + highlight.js

import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { THEME_STYLES, type ThemePreset } from "./constants.js";

/** 配置 marked 使用 highlight.js */
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code: string, lang: string) {
      if (!lang) return code;
      try {
        const valid = hljs.getLanguage(lang);
        if (valid) {
          return hljs.highlight(code, { language: lang }).value;
        }
      } catch { /* fallback */ }
      return code;
    },
  }),
);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface RenderOptions {
  theme?: ThemePreset | string;
  primaryColor?: string;
  fontFamily?: string;
  fontSize?: string;
  keepTitle?: boolean;
  citeStatus?: boolean;
  countStatus?: boolean;
  codeTheme?: string;
  isMacCodeBlock?: boolean;
  isShowLineNumber?: boolean;
  legend?: string;
}

export interface RenderResult {
  html: string;
  contentHtml: string;
  title: string;
  description?: string;
}

/** 渲染 markdown 为完整 HTML 文档 */
export async function renderMarkdownDocument(
  markdown: string,
  options: RenderOptions = {},
): Promise<RenderResult> {
  const theme = (options.theme as ThemePreset) || "github";
  const style = THEME_STYLES[theme] || THEME_STYLES.github;

  // 解析 frontmatter 格式的 meta
  const metaMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  let body = markdown;
  let title = "";
  let description = "";

  if (metaMatch) {
    body = metaMatch[2]!;
    const metaLines = metaMatch[1]!.split("\n");
    for (const line of metaLines) {
      const [k, ...v] = line.split(":");
      if (k?.trim() === "title") title = v.join(":").trim().replace(/^["']|["']$/g, "");
      if (k?.trim() === "description" || k?.trim() === "summary") description = v.join(":").trim().replace(/^["']|["']$/g, "");
    }
  }

  // 提取第一个 # 标题作为 fallback title
  if (!title) {
    const h1Match = body.match(/^#\s+(.+)$/m);
    title = h1Match ? h1Match[1]!.trim() : "Document";
  }

  // 渲染 content
  const contentHtml = await marked.parse(body);

  // 如果 keepTitle=false, 移除第一个 h1
  let finalContent = contentHtml;
  if (!options.keepTitle) {
    finalContent = contentHtml.replace(/<h1[^>]*>.*?<\/h1>\s*/i, "");
  }

  // 构建完整 HTML
  const primaryColor = options.primaryColor || style.primaryColor;
  const fontFamily = options.fontFamily || style.fontFamily;
  const fontSize = options.fontSize || "16px";

  const html = buildHtmlDocument({
    title,
    description,
    content: finalContent,
    theme: options.theme || "github",
    primaryColor,
    fontFamily,
    fontSize,
    codeTheme: options.codeTheme || style.codeTheme,
    isMacCodeBlock: options.isMacCodeBlock ?? true,
    isShowLineNumber: options.isShowLineNumber ?? false,
    citeStatus: options.citeStatus ?? false,
    countStatus: options.countStatus ?? false,
    legend: options.legend || "alt",
  });

  return { html, contentHtml, title, description };
}

interface DocParts {
  title: string;
  description?: string;
  content: string;
  theme: string;
  primaryColor: string;
  fontFamily: string;
  fontSize: string;
  codeTheme: string;
  isMacCodeBlock: boolean;
  isShowLineNumber: boolean;
  citeStatus: boolean;
  countStatus: boolean;
  legend: string;
}

function buildHtmlDocument(p: DocParts): string {
  return `<!doctype html>
<html style="">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(p.title)}</title>
  ${p.description ? `<meta name="description" content="${escapeHtml(p.description)}">` : ""}
  <style>
${getThemeCss(p)}
  </style>
</head>
<body style="${buildBodyStyle(p)}">
  <div id="output">
    <section class="container" style="${buildContainerStyle(p)}">
      ${p.content}
    </section>
  </div>
</body>
</html>`;
}

function buildBodyStyle(p: DocParts): string {
  return [
    "padding: 24px",
    "background: #ffffff",
    "max-width: 860px",
    "margin: 0 auto",
    `font-family: ${p.fontFamily}`,
    `font-size: ${p.fontSize}`,
    "line-height: 1.75",
    "text-align: left",
  ].join("; ");
}

function buildContainerStyle(p: DocParts): string {
  return [
    `font-family: ${p.fontFamily}`,
    `font-size: ${p.fontSize}`,
    "line-height: 1.75",
    "text-align: left",
  ].join("; ");
}

function getThemeCss(p: DocParts): string {
  return `
/* ===== Greyhound-HTML Theme: ${p.theme} ===== */
body { color: #3f3f3f; }
.container { color: #3f3f3f; }

p { margin: 1.5em 8px; letter-spacing: 0.1em; color: #3f3f3f; }
p:first-child { margin-top: 0 !important; }

h1, h2, h3, h4, h5, h6 { margin: 1.2em 0 0.5em; color: #1a202c; font-weight: 600; line-height: 1.3; }
h1 { font-size: 1.8em; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
h2 { font-size: 1.5em; border-bottom: 1px solid #edf2f7; padding-bottom: 6px; }
h3 { font-size: 1.25em; }

strong { color: ${p.primaryColor}; font-weight: bold; }
a { color: ${p.primaryColor}; text-decoration: none; }
a:hover { text-decoration: underline; }

ul, ol { padding-left: 2em; margin: 0.8em 0; }
li { margin: 0.3em 0; }

blockquote {
  border-left: 4px solid ${p.primaryColor};
  margin: 1em 0; padding: 0.5em 1em;
  background: #f7fafc; color: #4a5568;
}

pre {
  background: #1a202c; color: #e2e8f0;
  padding: 16px; border-radius: 8px;
  overflow-x: auto; font-size: 0.85em; line-height: 1.5;
  margin: 1em 0;
}
code { font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace; }
p > code, li > code {
  background: #edf2f7; padding: 2px 6px; border-radius: 4px;
  font-size: 0.9em; color: #2d3748;
}
pre code { background: transparent; padding: 0; color: inherit; }

table { width: 100%; border-collapse: collapse; margin: 1em 0; }
th, td { padding: 10px 12px; border: 1px solid #e2e8f0; }
th { background: #f7fafc; font-weight: 600; }

hr { border: none; border-top: 1px solid #e2e8f0; margin: 2em 0; }
img { max-width: 100%; height: auto; border-radius: 6px; margin: 1em 0; }

pre.mermaid { background: transparent; text-align: center; padding: 0; }
pre.mermaid img { display: block; margin: 0 auto; }

@media (max-width: 600px) {
  body { padding: 16px; }
  table { font-size: 0.85em; }
}
`;
}
