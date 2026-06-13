// core.ts — 核心转换流水线（自实现，不依赖 baoyu）
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import { parseFrontmatter } from "./frontmatter.js";
import { preprocessMermaidInMarkdown } from "./mermaid.js";
import { renderMarkdownDocument } from "./renderer.js";
import { replaceMarkdownImagesWithPlaceholders, resolveContentImages } from "./images.js";

import type { ConvertMarkdownOptions, ParsedResult } from "./types.js";
import { extractMetadata, serializeFrontmatter } from "./metadata.js";

const LOG = "[greyhound-html]";
const PLACEHOLDER_PREFIX = "%%img-";

async function saveHtmlWithBackup(html: string, targetPath: string) {
  let backupPath: string | undefined;
  const exists = await fs.stat(targetPath).then(() => true).catch(() => false);
  if (exists) {
    backupPath = `${targetPath}.bak-${new Date().toISOString().replace(/[:.]/g, "")}`;
    await fs.rename(targetPath, backupPath);
    console.error(`${LOG} Backed up: ${backupPath}`);
  }
  await fs.writeFile(targetPath, html, "utf-8");
  console.error(`${LOG} HTML saved → ${targetPath}`);
  return { htmlPath: targetPath, backupPath };
}

async function postProcessImages(
  htmlPath: string,
  placeholderImages: any[],
  baseDir: string
) {
  const hasRemote = placeholderImages.some(i => /^https?:\/\//.test(i.originalPath));
  const tempDir = hasRemote
    ? await fs.mkdtemp(path.join(os.tmpdir(), "greyhound-html-"))
    : baseDir;

  const resolvedImages = await resolveContentImages(
    placeholderImages, baseDir, tempDir, "greyhound-html"
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

export async function convertMarkdown(
  markdownPath: string,
  options: ConvertMarkdownOptions = {}
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
    absolutePath
  );

  // 3. Mermaid + 图片占位符预处理
  const { markdown: mermaidBody, images: mermaidImages } =
    await preprocessMermaidInMarkdown(body, {
      baseDir,
      enabled: options.mermaid?.enabled !== false,
      theme: options.mermaid?.theme,
      scale: options.mermaid?.scale,
      background: options.mermaid?.background,
      minWidth: options.mermaid?.minWidth ?? 860,
    });

  const { images: placeholderImages, markdown: bodyWithPlaceholders } =
    replaceMarkdownImagesWithPlaceholders(mermaidBody, PLACEHOLDER_PREFIX);

  const rewrittenMarkdown =
    serializeFrontmatter(effectiveFrontmatter) + bodyWithPlaceholders;

  // 4. 渲染
  const { html } = await renderMarkdownDocument(rewrittenMarkdown, {
    theme: options.theme,
    primaryColor: options.primaryColor,
    fontFamily: options.fontFamily,
    fontSize: options.fontSize != null ? String(options.fontSize) : undefined,
    keepTitle: options.keepTitle ?? false,
    citeStatus: options.citeStatus ?? false,
    countStatus: options.countStatus,
    codeTheme: options.codeTheme,
    isShowLineNumber: options.isShowLineNumber,
  });

  // 5. 保存
  const htmlPath = absolutePath.replace(/\.md$/i, ".html");
  const { htmlPath: finalHtmlPath, backupPath } = await saveHtmlWithBackup(
    html, htmlPath
  );

  // 6. 图片后处理
  const contentImages = await postProcessImages(
    finalHtmlPath, placeholderImages, baseDir
  );

  return {
    title,
    author,
    summary,
    htmlPath: finalHtmlPath,
    backupPath,
    contentImages,
    mermaidImages: mermaidImages.map(m => ({
      hash: m.hash,
      localPath: m.localPath,
      cached: m.cached,
    })),
  };
}
