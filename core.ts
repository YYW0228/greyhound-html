// core.ts — 核心转换逻辑（convertMarkdown）
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

import type { ConvertMarkdownOptions, ParsedResult } from "./types.js";
import { extractMetadata } from "./metadata.js";

// ---- 内部辅助 ----

async function saveHtmlWithBackup(
  html: string,
  targetPath: string,
): Promise<{ htmlPath: string; backupPath?: string }> {
  let backupPath: string | undefined;
  const exists = await fs
    .stat(targetPath)
    .then(() => true)
    .catch(() => false);

  if (exists) {
    backupPath = `${targetPath}.bak-${new Date().toISOString().replace(/[:.]/g, "")}`;
    await fs.rename(targetPath, backupPath);
    console.error(`[markdown-to-html] Backed up: ${backupPath}`);
  }

  await fs.writeFile(targetPath, html, "utf-8");
  console.error(`[markdown-to-html] HTML saved → ${targetPath}`);
  return { htmlPath: targetPath, backupPath };
}

async function postProcessImages(
  htmlPath: string,
  placeholderImages: any[],
  baseDir: string,
) {
  const hasRemote = placeholderImages.some((i) =>
    /^https?:\/\//.test(i.originalPath),
  );
  const tempDir = hasRemote
    ? await fs.mkdtemp(path.join(os.tmpdir(), "md-to-html-"))
    : baseDir;

  const resolvedImages = await resolveContentImages(
    placeholderImages,
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

// ---- 公开 API ----

export async function convertMarkdown(
  markdownPath: string,
  options: ConvertMarkdownOptions = {},
): Promise<ParsedResult> {
  const absolutePath = path.resolve(markdownPath);
  const baseDir = path.dirname(absolutePath);

  // 1. 读取 + 前置解析
  const content = await fs.readFile(absolutePath, "utf-8");
  const { frontmatter, body } = parseFrontmatter(content);

  // 2. 元数据
  const { title, author, summary, effectiveFrontmatter } = extractMetadata(
    frontmatter,
    body,
    options.title,
    absolutePath,
  );

  // 3. Mermaid 渲染 + 图片占位符预处理
  const { markdown: mermaidBody, images: mermaidImages } =
    await preprocessMermaidInMarkdown(body, {
      baseDir,
      renderFn: renderMermaidToPng,
      enabled: options.mermaid?.enabled !== false,
      theme: options.mermaid?.theme,
      scale: options.mermaid?.scale,
      background: options.mermaid?.background,
      minWidth: options.mermaid?.minWidth ?? 860,
    });

  const { images: placeholderImages, markdown: bodyWithPlaceholders } =
    replaceMarkdownImagesWithPlaceholders(mermaidBody);

  const rewrittenMarkdown =
    serializeFrontmatter(effectiveFrontmatter) + bodyWithPlaceholders;

  // 4. 渲染
  const { html } = await renderMarkdownDocument(rewrittenMarkdown, {
    theme: options.theme,
    primaryColor: options.primaryColor,
    fontFamily: options.fontFamily,
    fontSize: options.fontSize,
    keepTitle: options.keepTitle ?? false,
    citeStatus: options.citeStatus ?? false,
    countStatus: options.countStatus,
    codeTheme: options.codeTheme,
    isMacCodeBlock: options.isMacCodeBlock,
    isShowLineNumber: options.isShowLineNumber,
    legend: options.legend,
    // 其他选项透传
    ...options,
  });

  // 5. 保存（带备份）
  const htmlPath = absolutePath.replace(/\.md$/i, ".html");
  const { htmlPath: finalHtmlPath, backupPath } = await saveHtmlWithBackup(
    html,
    htmlPath,
  );

  // 6. 图片后处理
  const contentImages = await postProcessImages(
    finalHtmlPath,
    placeholderImages,
    baseDir,
  );

  return {
    title,
    author,
    summary,
    htmlPath: finalHtmlPath,
    backupPath,
    contentImages,
    mermaidImages: mermaidImages.map((m) => ({
      hash: m.hash,
      localPath: m.localPath,
      cached: m.cached,
    })),
  };
}
