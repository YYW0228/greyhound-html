// core.ts — 核心转换逻辑（convertMarkdown）
// 6 步纯函数异步管道：解析 → 元数据 → 预处理 → 渲染 → 保存 → 后处理
// Skill: markdown-to-html

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
  parseFrontmatter,
  preprocessMermaidInMarkdown,
  renderMarkdownDocument,
  replaceMarkdownImagesWithPlaceholders,
  resolveContentImages,
  serializeFrontmatter,
} from "baoyu-md";
import { renderMermaidToPng } from "baoyu-chrome-cdp/mermaid";

import type { ConvertMarkdownOptions, ParsedResult, ImageInfo, MermaidImageInfo } from "./types.js";
import { extractMetadata } from "./metadata.js";
import { PREMIUM_THEME_NAMES } from "./constants.js";
import type { PremiumThemeName } from "./constants.js";
import { renderPremiumPage } from "./renderer-premium.js";
import { logger } from "./utils.js";

// ==================================================================
// Step 1: 读取并解析 Markdown 文件
// ==================================================================
interface ParsedMarkdown {
  content: string;
  frontmatter: Record<string, any>;
  body: string;
  baseDir: string;
}

async function parseMarkdownFile(markdownPath: string): Promise<ParsedMarkdown> {
  const content = await fs.readFile(markdownPath, "utf-8");
  const baseDir = path.dirname(markdownPath);
  const { frontmatter, body } = parseFrontmatter(content);
  logger.info(`Parsed markdown (${content.length.toLocaleString()} chars)`);
  return { content, frontmatter, body, baseDir };
}

// ==================================================================
// Step 3: 预处理 Mermaid + 图片占位符
// ==================================================================
interface PreprocessedContent {
  rewrittenMarkdown: string;
  contentImages: any[];
  mermaidImages: MermaidImageInfo[];
}

async function preprocessContent(
  body: string,
  baseDir: string,
  effectiveFrontmatter: Record<string, any>,
  options?: ConvertMarkdownOptions,
): Promise<PreprocessedContent> {
  const mermaidEnabled = options?.mermaid?.enabled !== false;
  const mermaidMinWidth = options?.mermaid?.minWidth ?? 860;

  const { markdown: mermaidBody, images: mermaidImages } =
    await preprocessMermaidInMarkdown(body, {
      baseDir,
      renderFn: renderMermaidToPng,
      enabled: mermaidEnabled,
      theme: options?.mermaid?.theme,
      scale: options?.mermaid?.scale,
      background: options?.mermaid?.background,
      minWidth: mermaidMinWidth,
    });

  const { images: placeholderImages, markdown: bodyWithPlaceholders } =
    replaceMarkdownImagesWithPlaceholders(mermaidBody);

  const rewrittenMarkdown = serializeFrontmatter(effectiveFrontmatter) + bodyWithPlaceholders;

  return {
    rewrittenMarkdown,
    contentImages: placeholderImages,
    mermaidImages: mermaidImages.map((m: any) => ({
      hash: m.hash,
      localPath: m.localPath,
      cached: m.cached,
    })),
  };
}

// ==================================================================
// Step 4: 渲染 Markdown → HTML
// ==================================================================
async function renderHtml(markdown: string, options?: ConvertMarkdownOptions): Promise<string> {
  const { html } = await renderMarkdownDocument(markdown, {
    theme: options?.theme,
    primaryColor: options?.primaryColor,
    fontFamily: options?.fontFamily,
    fontSize: options?.fontSize,
    keepTitle: options?.keepTitle ?? false,
    citeStatus: options?.citeStatus ?? false,
    countStatus: options?.countStatus,
    codeTheme: options?.codeTheme,
    isMacCodeBlock: options?.isMacCodeBlock,
    isShowLineNumber: options?.isShowLineNumber,
    legend: options?.legend,
    ...options,
  });
  return html;
}

// ==================================================================
// Step 5: 保存 HTML（带备份 + 错误恢复）
// ==================================================================
interface SaveResult {
  htmlPath: string;
  backupPath?: string;
}

async function saveHtmlWithBackup(html: string, targetPath: string): Promise<SaveResult> {
  let backupPath: string | undefined;

  try {
    await fs.access(targetPath);
    // file exists → backup
    backupPath = `${targetPath}.bak-${new Date().toISOString().replace(/[:.]/g, "")}`;
    await fs.rename(targetPath, backupPath);
    logger.info(`Backed up existing file → ${backupPath}`);
  } catch {
    // file doesn't exist → skip backup
  }

  await fs.writeFile(targetPath, html, "utf-8");
  logger.info(`HTML saved → ${targetPath}`);

  return { htmlPath: targetPath, backupPath };
}

/** 转换失败时自动恢复备份 */
export async function restoreBackup(htmlPath: string, backupPath?: string): Promise<void> {
  if (!backupPath) return;
  try {
    await fs.copyFile(backupPath, htmlPath);
    logger.warn(`Restored backup: ${backupPath} → ${htmlPath}`);
  } catch {
    logger.error(`Failed to restore backup: ${backupPath}`);
  }
}

// ==================================================================
// Step 6: 图片后处理（占位符 → 真实引用）
// ==================================================================
async function postProcessImages(
  htmlPath: string,
  contentImages: any[],
  baseDir: string,
): Promise<ImageInfo[]> {
  if (!contentImages.length) return [];

  const hasRemote = contentImages.some((i: any) =>
    /^https?:\/\//.test(i.originalPath),
  );
  const tempDir = hasRemote
    ? await fs.mkdtemp(path.join(os.tmpdir(), "md-to-html-"))
    : baseDir;

  const resolvedImages: ImageInfo[] = await resolveContentImages(
    contentImages,
    baseDir,
    tempDir,
    "markdown-to-html",
  );

  let content = await fs.readFile(htmlPath, "utf-8");
  for (const img of resolvedImages) {
    const alt = img.alt ? ` alt="${img.alt.replace(/"/g, "&quot;")}"` : "";
    const tag = `<img src="${img.originalPath}" data-local-path="${img.localPath}"${alt} style="display: block; width: 100%; margin: 1.5em auto;">`;
    content = content.replace(img.placeholder, tag);
  }
  await fs.writeFile(htmlPath, content, "utf-8");

  return resolvedImages;
}

// ==================================================================
// Premium 主题渲染管道（替代 baoyu-md 渲染）
// ==================================================================
async function renderPremium(
  absolutePath: string,
  body: string,
  frontmatter: Record<string, any>,
  options: ConvertMarkdownOptions,
): Promise<ParsedResult> {
  const { title, author, summary } = extractMetadata(
    frontmatter,
    body,
    options.title,
    absolutePath,
  );

  const htmlPath = absolutePath.replace(/\.md$/i, ".html");

  // 备份
  let backupPath: string | undefined;
  try {
    await fs.access(htmlPath);
    backupPath = `${htmlPath}.bak-${new Date().toISOString().replace(/[:.]/g, "")}`;
    await fs.rename(htmlPath, backupPath);
  } catch { /* no existing file */ }

  // 构建 TOC
  const toc: Array<{ id: string; text: string; level: number }> = [];
  const headingRe = /^(#{1,6})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(body)) !== null) {
    const level = m[1].length;
    const text = m[2].trim();
    if (!text) continue;
    const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "");
    toc.push({ id, text, level });
  }

  const html = renderPremiumPage("", {
    title,
    author,
    summary,
    theme: options.theme as PremiumThemeName,
    toc,
  });

  await fs.writeFile(htmlPath, html, "utf-8");
  logger.info(`HTML saved → ${htmlPath}`);

  return { title, author, summary, htmlPath, backupPath, contentImages: [], mermaidImages: [] };
}

// ==================================================================
// 主入口：convertMarkdown — 6 步编排
// ==================================================================
export async function convertMarkdown(
  markdownPath: string,
  options: ConvertMarkdownOptions = {},
): Promise<ParsedResult> {
  const absolutePath = path.resolve(markdownPath);
  logger.info(`Converting: ${absolutePath}`);

  // Step 1: 解析文件
  const { frontmatter, body, baseDir } = await parseMarkdownFile(absolutePath);

  // 判断是否 premium 主题
  const theme = options.theme as string | undefined;
  if (theme && (PREMIUM_THEME_NAMES as readonly string[]).includes(theme)) {
    return renderPremium(absolutePath, body, frontmatter, options);
  }

  // Step 2: 元数据
  const { title, author, summary, effectiveFrontmatter } = extractMetadata(
    frontmatter,
    body,
    options.title,
    absolutePath,
  );

  // Step 3: Mermaid + 图片预处理
  const { rewrittenMarkdown, contentImages, mermaidImages } = await preprocessContent(
    body,
    baseDir,
    effectiveFrontmatter,
    options,
  );

  // Step 4: 渲染 HTML
  logger.info(`Rendering theme: ${options.theme ?? "default"}`);
  const html = await renderHtml(rewrittenMarkdown, options);

  // Step 5: 保存（带备份）
  const htmlPath = absolutePath.replace(/\.md$/i, ".html");
  let saveResult: SaveResult;
  try {
    saveResult = await saveHtmlWithBackup(html, htmlPath);
  } catch (err) {
    logger.error(`Failed to save HTML: ${err}`);
    throw err;
  }

  // Step 6: 图片后处理
  let resolvedImages: ImageInfo[] = [];
  try {
    resolvedImages = await postProcessImages(saveResult.htmlPath, contentImages, baseDir);
  } catch (err) {
    logger.warn(`Image post-processing failed: ${err}`);
    // 非致命 — 继续返回结果
  }

  return {
    title,
    author,
    summary,
    htmlPath: saveResult.htmlPath,
    backupPath: saveResult.backupPath,
    contentImages: resolvedImages,
    mermaidImages,
  };
}
