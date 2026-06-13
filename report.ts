// report.ts — 结构化分析报告生成器
// greyhound-html report <input.md> [options]

import * as fs from "node:fs";
import * as path from "node:path";

import { parseFrontmatter } from "./frontmatter.js";
import { extractTitleFromMarkdown, extractSummaryFromBody } from "./content-utils.js";
import { THEME_STYLES, type ThemePreset } from "./constants.js";

// ===== 内容结构类型 =====

interface Section {
  level: number;
  title: string;
  content: string[];
  subsections: Section[];
}

interface ContentAnalysis {
  title: string;
  description: string;
  totalSections: number;
  totalParagraphs: number;
  totalCodeBlocks: number;
  totalListItems: number;
  estimatedTokens: number;
  sections: Section[];
  keyTerms: string[];
}

// ===== 内容分析器 =====

function analyzeMarkdown(content: string): ContentAnalysis {
  const { body } = parseFrontmatter(content);
  const lines = body.split("\n");

  let totalParagraphs = 0;
  let totalCodeBlocks = 0;
  let totalListItems = 0;
  let inCodeBlock = false;
  const keyTermCount: Record<string, number> = {};

  const sections: Section[] = [];
  const stack: { level: number; section: Section }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) totalCodeBlocks++;
      continue;
    }
    if (inCodeBlock) continue;

    const trimmed = line.trim();
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/);
    const headingEmptyMatch = !headingMatch && trimmed.match(/^(#{1,6})\s*$/);

    let section: Section | null = null;
    let level = 0;

    if (headingEmptyMatch) {
      level = headingEmptyMatch[1]!.length;
      // 跳过空行查找标题文字
      let skip = 1;
      let nextLine = lines[i + skip]?.trim();
      while (nextLine === "" && i + skip < lines.length) {
        skip++;
        nextLine = lines[i + skip]?.trim();
      }
      if (nextLine && !nextLine.startsWith("#") && !nextLine.startsWith("```")) {
        section = { level, title: nextLine, content: [], subsections: [] };
        i += skip;
      }
    } else if (headingMatch) {
      level = headingMatch[1]!.length;
      section = { level, title: headingMatch[2]!.trim(), content: [], subsections: [] };
    }

    if (section) {
      while (stack.length > 0 && stack[stack.length - 1]!.level >= level) {
        stack.pop();
      }
      if (stack.length > 0) {
        stack[stack.length - 1]!.section.subsections.push(section);
      } else {
        sections.push(section);
      }
      stack.push({ level, section });
      continue;
    }

    // 添加到当前章节
    if (stack.length > 0) {
      stack[stack.length - 1]!.section.content.push(line);
    }

    // 统计
    if (line.trim() === "") { /* skip */ }
    else if (line.trim().match(/^[-*]\s/)) totalListItems++;
    else if (line.trim().match(/^\d+\.\s/)) totalListItems++;
    else if (line.trim().length > 20) totalParagraphs++;

    // 统计关键词
    const terms = line.match(/\b[A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})*\b/g);
    if (terms) {
      for (const term of terms) {
        keyTermCount[term] = (keyTermCount[term] || 0) + 1;
      }
    }
  }

  const title = extractTitleFromMarkdown(body) || path.basename(process.argv[1] || "report");
  const description = extractSummaryFromBody(body, 150);

  const keyTerms = Object.entries(keyTermCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([k]) => k);

  const estimatedTokens = Math.ceil(body.length * 0.4);

  return {
    title, description,
    totalSections: sections.length,
    totalParagraphs, totalCodeBlocks, totalListItems,
    estimatedTokens,
    sections, keyTerms,
  };
}

// ===== 报告生成器入口 =====

export interface ReportOptions {
  theme?: ThemePreset | string;
  primaryColor?: string;
  title?: string;
}

export async function generateReport(
  markdownPath: string,
  options: ReportOptions = {},
): Promise<string> {
  const content = fs.readFileSync(markdownPath, "utf-8");
  const analysis = analyzeMarkdown(content);

  const theme = (options.theme as ThemePreset) || "github";
  const style = THEME_STYLES[theme] || THEME_STYLES.github;
  const primaryColor = options.primaryColor || style.primaryColor;
  const fontFamily = style.fontFamily;
  const reportTitle = options.title || analysis.title;

  const html = buildReportHtml(reportTitle, analysis, {
    theme: String(theme), primaryColor, fontFamily,
  });

  const htmlPath = markdownPath.replace(/\.md$/i, ".html");
  const backupPath = fs.existsSync(htmlPath)
    ? `${htmlPath}.bak-${Date.now()}`
    : undefined;

  if (backupPath) fs.renameSync(htmlPath, backupPath);
  fs.writeFileSync(htmlPath, html, "utf-8");

  console.error(`[greyhound-html] Report saved → ${htmlPath}`);
  return htmlPath;
}

// ===== HTML 构建 =====

interface RTheme { theme: string; primaryColor: string; fontFamily: string; }

function buildReportHtml(title: string, a: ContentAnalysis, t: RTheme): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${e(title)} — 分析报告</title>
<style>${getReportCss(t)}</style>
</head>
<body>

<h1>📊 ${e(title)}</h1>
<div class="subtitle">
  基于 greyhound-html report 模式 · ${new Date().toLocaleString("zh-CN")}
  <span class="tag tag-blue">${a.totalSections} 章节</span>
  <span class="tag tag-purple">~${a.estimatedTokens.toLocaleString()} tokens</span>
  <span class="tag tag-green">${a.totalCodeBlocks} 代码块</span>
</div>

${overviewGrid(a)}
${keyTermsBlock(a.keyTerms)}
${sectionsBlock(a.sections)}
${conclusionBlock(a)}
</body>
</html>`;
}

function overviewGrid(a: ContentAnalysis): string {
  return `
<h2>📊 内容概览</h2>
<div class="grid-4">
  <div class="card"><div class="card-label">章节</div><div class="card-value" style="color:#3182ce;">${a.totalSections}</div><div class="card-desc">个主章节</div></div>
  <div class="card"><div class="card-label">段落</div><div class="card-value" style="color:#38a169;">${a.totalParagraphs}</div><div class="card-desc">个内容段落</div></div>
  <div class="card"><div class="card-label">代码块</div><div class="card-value" style="color:#dd6b20;">${a.totalCodeBlocks}</div><div class="card-desc">个代码示例</div></div>
  <div class="card"><div class="card-label">列表项</div><div class="card-value" style="color:#6b46c1;">${a.totalListItems}</div><div class="card-desc">个列表条目</div></div>
</div>
${a.description ? `<blockquote>${e(a.description)}</blockquote>` : ""}`;
}

function keyTermsBlock(terms: string[]): string {
  if (terms.length === 0) return "";
  return `\n<h2>🏷️ 关键术语</h2>\n<div class="tag-list">${terms.map(t => `<span class="tag tag-blue">${e(t)}</span>`).join(" ")}</div>`;
}

function sectionsBlock(sections: Section[]): string {
  if (sections.length === 0) return "\n<p style='color:#718096;'>未检测到章节结构。</p>\n";
  let html = "\n<h2>📖 章节分析</h2>\n";
  for (const s of sections) html += sectionHtml(s, 0);
  return html;
}

function sectionHtml(s: Section, depth: number): string {
  const lines = s.content.filter(l => !l.trim().match(/^#{1,6}\s/)).join("\n").trim();
  const hasContent = lines.length > 0 || s.subsections.length > 0;
  if (!hasContent) return "";

  const cls = depth === 0 ? "info" : "success";
  let html = `<details>\n<summary>${"📌"} ${e(s.title)}</summary>\n<div class="${cls}">\n`;

  for (const sub of s.subsections) {
    html += sectionHtml(sub, depth + 1);
  }

  if (s.subsections.length === 0 && lines) {
    const preview = lines.length > 200 ? lines.slice(0, 200) + "…" : lines;
    html += `<p>${e(preview)}</p>\n`;
  }

  html += "</div>\n</details>\n";
  return html;
}

function conclusionBlock(a: ContentAnalysis): string {
  return `
<h2>💡 概要</h2>
<div class="card info">
<p>本文共 <strong>${a.totalSections} 个章节</strong>，约 <strong>${a.estimatedTokens.toLocaleString()} tokens</strong>，包含 ${a.totalCodeBlocks} 个代码块和 ${a.totalListItems} 个列表项。</p>
<p>报告基于 greyhound-html report 模式自动生成，使用 details/summary 折叠保持概览整洁。</p>
</div>`;
}

// ===== 工具函数 =====

function e(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getReportCss(t: RTheme): string {
  return `
body{font-family:${t.fontFamily};max-width:960px;margin:0 auto;padding:24px;background:#f7fafc;color:#1a202c;line-height:1.7}
h1{font-size:2em;margin-bottom:4px;color:#1a202c}
h2{font-size:1.4em;margin:24px 0 12px;padding-bottom:6px;border-bottom:2px solid #e2e8f0}
.subtitle{color:#718096;font-size:.95em;margin-bottom:24px}
.grid-4{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:16px 0}
.card{padding:16px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 1px 3px #00000014;margin:12px 0}
.card-label{font-size:.8em;color:#718096;text-transform:uppercase;letter-spacing:.05em;margin-bottom:2px}
.card-value{font-size:1.6em;font-weight:700;margin:2px 0}
.card-desc{font-size:.9em;color:#4a5568}
.critical,.warning,.info,.success,.pending{padding:16px;background:#fff;border:1px solid #e2e8f0;border-radius:10px;box-shadow:0 1px 3px #00000014;margin:12px 0}
.critical{border-left:4px solid #e53e3e;background:#fff5f5}
.warning{border-left:4px solid #dd6b20;background:#fffaf0}
.info{border-left:4px solid #3182ce;background:#ebf8ff}
.success{border-left:4px solid #38a169;background:#f0fff4}
.pending{border-left:4px solid #d69e2e;background:#fffff0}
details{margin:8px 0}
details .critical,details .warning,details .info,details .success,details .pending{margin:8px 0}
summary{font-weight:600;cursor:pointer;padding:10px 0;font-size:1.05em;user-select:none}
summary:hover{color:${t.primaryColor}}
.tag{display:inline-block;padding:2px 10px;border-radius:4px;font-size:.8em;font-weight:600;margin:2px}
.tag-blue{background:#bee3f8;color:#2b6cb0}
.tag-green{background:#c6f6d5;color:#276749}
.tag-purple{background:#e9d8fd;color:#6b46c1}
.tag-list{margin:12px 0;line-height:2.2}
code{background:#edf2f7;padding:2px 6px;border-radius:4px;font-family:'SF Mono','Fira Code',monospace;font-size:.9em}
pre{background:#1a202c;color:#e2e8f0;padding:16px;border-radius:8px;overflow-x:auto;font-size:.85em;line-height:1.5}
pre code{background:transparent;color:inherit}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:.9em}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #e2e8f0}
th{background:#f7fafc;font-weight:600;color:#4a5568}
blockquote{border-left:3px solid ${t.primaryColor};margin:12px 0;padding:8px 16px;background:#ebf8ff;border-radius:0 8px 8px 0;font-style:italic;color:#2d3748}
p{margin:1em 0}
ul,ol{padding-left:2em;margin:.8em 0}
li{margin:.3em 0}
@media(max-width:600px){.grid-4{grid-template-columns:1fr}body{padding:16px}}
`;
}
