// images.ts — 自实现图片处理
// 替代 baoyu-md 的 replaceMarkdownImagesWithPlaceholders / resolveContentImages

import * as fs from "node:fs";
import * as path from "node:path";
import * as https from "node:https";
import * as http from "node:http";
import { createHash } from "node:crypto";

export interface ImagePlaceholder {
  originalPath: string;
  placeholder: string;
  alt?: string;
}

export interface ResolvedImageInfo extends ImagePlaceholder {
  localPath: string;
}

/** 将 markdown 中的图片替换为占位符 */
export function replaceMarkdownImagesWithPlaceholders(
  markdown: string,
  placeholderPrefix: string,
): { images: ImagePlaceholder[]; markdown: string } {
  const images: ImagePlaceholder[] = [];
  let imageCounter = 0;
  let lastIndex = 0;
  let rewritten = "";
  const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)|!\[\[([^\]\n]+)\]\]/g;

  for (const match of markdown.matchAll(imagePattern)) {
    const fullMatch = match[0];
    const matchIndex = match.index ?? 0;
    const markdownAlt = match[1];
    const markdownSrc = match[2];
    const wikilinkTarget = match[3];

    const originalPath = wikilinkTarget ?? markdownSrc ?? "";
    const alt = wikilinkTarget ? "" : (markdownAlt ?? "");
    const placeholder = `${placeholderPrefix}${++imageCounter}`;

    rewritten += markdown.slice(lastIndex, matchIndex);
    images.push({ alt, originalPath, placeholder });
    rewritten += placeholder;
    lastIndex = matchIndex + fullMatch.length;
  }

  rewritten += markdown.slice(lastIndex);
  return { images, markdown: rewritten };
}

/** 获取图片扩展名 */
function getImageExtension(urlOrPath: string): string {
  const match = urlOrPath.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i);
  return match ? match[1]!.toLowerCase() : "png";
}

/** 下载远程图片 */
async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https://") ? https : http;
    const file = fs.createWriteStream(destPath);

    const request = protocol.get(url, { headers: { "User-Agent": "greyhound-html/1.0" } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          fs.unlinkSync(destPath);
          void downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
          return;
        }
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`Download failed: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    });

    request.on("error", (error) => {
      file.close();
      fs.unlink(destPath, () => {});
      reject(error);
    });
    request.setTimeout(30_000, () => { request.destroy(); reject(new Error("Download timeout")); });
  });
}

/** 解析图片路径（本地/远程） */
async function resolveImagePath(
  imagePath: string,
  baseDir: string,
  tempDir: string,
  logLabel = "greyhound-html",
): Promise<string> {
  if (/^https?:\/\//.test(imagePath)) {
    const hash = createHash("md5").update(imagePath).digest("hex").slice(0, 8);
    const ext = getImageExtension(imagePath);
    const localPath = path.join(tempDir, `remote_${hash}.${ext}`);
    if (!fs.existsSync(localPath)) {
      console.error(`[${logLabel}] Downloading: ${imagePath}`);
      await downloadFile(imagePath, localPath);
    }
    return localPath;
  }

  // 本地路径
  const resolved = path.isAbsolute(imagePath)
    ? imagePath
    : path.resolve(baseDir, imagePath);

  // 带 fallback 的解析
  if (fs.existsSync(resolved)) return resolved;

  // fallback: 尝试扩展名替换
  const ext = path.extname(resolved);
  const base = ext ? resolved.slice(0, -ext.length) : resolved;
  const fallbacks = [".webp", ".jpg", ".jpeg", ".png", ".gif"]
    .map(e => `${base}${e}`)
    .filter(c => c !== resolved);

  for (const fb of fallbacks) {
    if (fs.existsSync(fb)) {
      console.error(`[${logLabel}] Image fallback: ${path.basename(resolved)} → ${path.basename(fb)}`);
      return fb;
    }
  }

  return resolved; // 返回原路径，让 HTML 决定
}

/** 解析所有图片为本地路径 */
export async function resolveContentImages(
  images: ImagePlaceholder[],
  baseDir: string,
  tempDir: string,
  logLabel = "greyhound-html",
): Promise<ResolvedImageInfo[]> {
  const resolved: ResolvedImageInfo[] = [];
  for (const image of images) {
    resolved.push({
      ...image,
      localPath: await resolveImagePath(image.originalPath, baseDir, tempDir, logLabel),
    });
  }
  return resolved;
}
