// core.ts — 核心转换逻辑（convertMarkdown）
// 使用 Pipeline + AST renderer 替代 baoyu-md 黑盒渲染
// Skill: markdown-to-html

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

// baoyu-md 仅用于 Mermaid 和图片预处理（Chrome CDP 复杂逻辑保留）
import { parseFrontmatter, preprocessMermaidInMarkdown, replaceMarkdownImagesWithPlaceholders, resolveContentImages } from "baoyu-md";
import { renderMermaidToPng } from "baoyu-chrome-cdp/mermaid";

import type { ConvertMarkdownOptions, ParsedResult, ImageInfo, MermaidImageInfo } from "./types.js";
import { extractMetadata } from "./metadata.js";
import { PREMIUM_THEME_NAMES } from "./constants.js";
import type { PremiumThemeName } from "./constants.js";
import { logger } from "./utils.js";
import { Pipeline, PipelineError, type ConversionContext } from "./pipeline.js";
import { renderWithAST } from "./ast-renderer.js";

// ==================================================================
// 步骤函数（每个都是 Pipeline 的一个 step）
// ==================================================================

async function stepParseFile(ctx: ConversionContext): Promise<void> {
  const content = await fs.readFile(ctx.markdownPath, "utf-8");
  const baseDir = path.dirname(ctx.markdownPath);
  const { frontmatter, body } = parseFrontmatter(content);
  ctx.rawContent = content;
  ctx.frontmatter = frontmatter;
  ctx.body = body;
  ctx.data = { ...(ctx.data || {}), baseDir };
}

async function stepMetadata(ctx: ConversionContext): Promise<void> {
  const { title, author, summary } = extractMetadata(
    ctx.frontmatter || {},
    ctx.body || "",
    ctx.options.title,
    ctx.markdownPath,
  );
  ctx.title = title;
  ctx.author = author;
  ctx.summary = summary;
}

async function stepPreprocess(ctx: ConversionContext): Promise<void> {
  const body = ctx.body || "";
  const baseDir = (ctx.data?.baseDir as string) || path.dirname(ctx.markdownPath);
  const options = ctx.options as ConvertMarkdownOptions;

  const mermaidEnabled = options.mermaid?.enabled !== false;
  const mermaidMinWidth = options.mermaid?.minWidth ?? 860;

  const { markdown: mermaidBody, images: mermaidImages } =
    await preprocessMermaidInMarkdown(body, {
      baseDir,
      renderFn: renderMermaidToPng,
      enabled: mermaidEnabled,
      theme: options.mermaid?.theme,
      scale: options.mermaid?.scale,
      background: options.mermaid?.background,
      minWidth: mermaidMinWidth,
    });

  const { images: placeholderImages, markdown: bodyWithPlaceholders } =
    replaceMarkdownImagesWithPlaceholders(mermaidBody);

  ctx.body = bodyWithPlaceholders;
  ctx.mermaidImages = mermaidImages.map((m: any) => ({
    hash: m.hash,
    localPath: m.localPath,
    cached: m.cached,
  }));
  ctx.contentImages = placeholderImages;
}

async function stepRender(ctx: ConversionContext): Promise<void> {
  const body = ctx.body || "";
  const options = ctx.options;
  const theme = (options.theme as string) || "default";
  const isPremium = (PREMIUM_THEME_NAMES as readonly string[]).includes(theme);

  // 使用 AST 渲染器（替代 baoyu-md 的 renderMarkdownDocument）
  const { fullHtml } = await renderWithAST(body, {
    theme,
    title: ctx.title,
    author: ctx.author,
    summary: ctx.summary,
    keepTitle: options.keepTitle ?? false,
    citeStatus: options.citeStatus ?? false,
  });

  ctx.html = fullHtml;
}

async function stepSave(ctx: ConversionContext): Promise<void> {
  if (!ctx.html) throw new Error("No HTML to save");

  const htmlPath = ctx.markdownPath.replace(/\.md$/i, ".html");

  let backupPath: string | undefined;
  try {
    await fs.access(htmlPath);
    backupPath = `${htmlPath}.bak-${new Date().toISOString().replace(/[:.]/g, "")}`;
    await fs.rename(htmlPath, backupPath);
  } catch { /* no existing file */ }

  await fs.writeFile(htmlPath, ctx.html, "utf-8");
  ctx.htmlPath = htmlPath;
  ctx.backupPath = backupPath;
  logger.info(`HTML saved → ${htmlPath}`);
}

async function stepPostProcess(ctx: ConversionContext): Promise<void> {
  const images = ctx.contentImages || [];
  if (!images.length) return;

  const htmlPath = ctx.htmlPath;
  if (!htmlPath) return;

  const baseDir = (ctx.data?.baseDir as string) || path.dirname(ctx.markdownPath);
  const hasRemote = images.some((i: any) => /^https?:\/\//.test(i.originalPath));
  const tempDir = hasRemote
    ? await fs.mkdtemp(path.join(os.tmpdir(), "md-to-html-"))
    : baseDir;

  const resolved = await resolveContentImages(images, baseDir, tempDir, "markdown-to-html");

  let content = await fs.readFile(htmlPath, "utf-8");
  for (const img of resolved) {
    const alt = img.alt ? ` alt="${img.alt.replace(/"/g, "&quot;")}"` : "";
    const tag = `<img src="${img.originalPath}" data-local-path="${img.localPath}"${alt} style="display:block;width:100%;margin:1.5em auto;">`;
    content = content.replace(img.placeholder, tag);
  }
  await fs.writeFile(htmlPath, content, "utf-8");
}

// ==================================================================
// 主入口
// ==================================================================

export async function convertMarkdown(
  markdownPath: string,
  options: ConvertMarkdownOptions = {},
): Promise<ParsedResult> {
  const absolutePath = path.resolve(markdownPath);

  const ctx: ConversionContext = {
    markdownPath: absolutePath,
    rawContent: "",
    options: options as Record<string, any>,
  };

  try {
    const pipe = new Pipeline<ConversionContext>()
      .add("parse", stepParseFile, true)
      .add("metadata", stepMetadata, true)
      .add("preprocess", stepPreprocess, false)   // Mermaid 失败不中止
      .add("render", stepRender, true)
      .add("save", stepSave, true)
      .add("images", stepPostProcess, false);     // 图片失败不中止

    await pipe.run(ctx);

    // 成功后清理备份
    if (ctx.backupPath) {
      try { await fs.unlink(ctx.backupPath); } catch { /* ignore */ }
    }

    return {
      title: ctx.title || "",
      author: ctx.author || "",
      summary: ctx.summary || "",
      htmlPath: ctx.htmlPath || "",
      backupPath: ctx.backupPath,
      contentImages: (ctx.contentImages || []) as ImageInfo[],
      mermaidImages: (ctx.mermaidImages || []) as MermaidImageInfo[],
    };
  } catch (err) {
    // 错误恢复：自动还原备份
    if (ctx.htmlPath && ctx.backupPath) {
      try {
        await fs.copyFile(ctx.backupPath, ctx.htmlPath);
        logger.warn(`Restored backup: ${ctx.backupPath} → ${ctx.htmlPath}`);
      } catch { /* best effort */ }
    }
    throw err;
  }
}

/** 外部可用的错误恢复函数 */
export async function restoreBackup(htmlPath: string, backupPath?: string): Promise<void> {
  if (!backupPath) return;
  try {
    await fs.copyFile(backupPath, htmlPath);
  } catch { /* best effort */ }
}
