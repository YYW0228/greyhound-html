// mermaid.ts — 自实现 Mermaid 渲染
// 替代 baoyu-chrome-cdp/mermaid
// 可选依赖: puppeteer (未安装时优雅降级)

import * as fs from "node:fs";
import * as path from "node:path";
import { createHash } from "node:crypto";

export interface MermaidRenderResult {
  width: number;
  height: number;
  bytes: number;
}

let rendererReady = false;
let puppeteer: any = null;

async function ensurePuppeteer(): Promise<boolean> {
  if (rendererReady) return true;
  try {
    puppeteer = await import("puppeteer");
    rendererReady = true;
    return true;
  } catch {
    console.error("[greyhound-html] Mermaid disabled: puppeteer not available.");
    console.error("[greyhound-html] Install with: npm install puppeteer");
    return false;
  }
}

/** 渲染 Mermaid 代码为 PNG */
export async function renderMermaidToPng(
  code: string,
  outputPath: string,
  options: {
    theme?: string;
    scale?: number;
    background?: string;
    minWidth?: number;
    timeoutMs?: number;
  } = {},
): Promise<MermaidRenderResult> {
  if (!(await ensurePuppeteer())) {
    throw new Error("Mermaid rendering requires puppeteer");
  }

  const theme = options.theme ?? "default";
  const scale = options.scale ?? 2;
  const minWidth = options.minWidth ?? 860;
  const background = options.background ?? "white";
  const timeoutMs = options.timeoutMs ?? 15_000;

  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const html = buildMermaidHtml(code, theme, background, minWidth);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0", timeout: timeoutMs });

    // Wait for mermaid to render
    await page.waitForSelector("svg", { timeout: timeoutMs });

    // Get SVG dimensions
    const svgBounds = await page.evaluate(() => {
      const svg = document.querySelector("svg");
      if (!svg) return { width: minWidth, height: 200 };
      return {
        width: Math.max(minWidth, svg.viewBox.baseVal.width || svg.clientWidth || minWidth),
        height: svg.viewBox.baseVal.height || svg.clientHeight || 200,
      };
    });

    const width = Math.ceil(svgBounds.width * scale);
    const height = Math.ceil(svgBounds.height * scale);

    await page.setViewport({ width: Math.max(1280, width + 100), height: height + 100, deviceScaleFactor: scale });

    // Re-set content after viewport change
    await page.setContent(html, { waitUntil: "networkidle0", timeout: timeoutMs });
    await page.waitForSelector("svg", { timeout: timeoutMs });

    // Find the mermaid SVG and screenshot it
    const clip = await page.evaluate(() => {
      const svg = document.querySelector("svg");
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });

    if (!clip) throw new Error("Could not locate mermaid SVG");

    await page.screenshot({
      path: outputPath,
      clip: { x: clip.x, y: clip.y, width: clip.width, height: clip.height },
    });

    const stat = fs.statSync(outputPath);
    return { width: Math.round(clip.width), height: Math.round(clip.height), bytes: stat.size };
  } finally {
    await browser.close();
  }
}

/** 关闭渲染器（清理资源） */
export async function closeRenderer(): Promise<void> {
  // puppeteer 实例在每次 renderMermaidToPng 中自行关闭
  rendererReady = false;
  puppeteer = null;
}

function buildMermaidHtml(code: string, theme: string, background: string, minWidth: number): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <style>
    body { margin: 0; background: ${background}; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    svg { max-width: ${minWidth}px; }
  </style>
</head>
<body>
  <div class="mermaid" style="min-width: ${minWidth}px;">
    ${code}
  </div>
  <script>
    mermaid.initialize({ startOnLoad: true, theme: "${theme}", });
  </script>
</body>
</html>`;
}

/** Mermaid 预处理：从 markdown 中提取并渲染 mermaid 代码块 */
export interface MermaidPreprocessedImage {
  raw: string;
  code: string;
  hash: string;
  localPath: string;
  mdRef: string;
  cached: boolean;
}

export interface MermaidPreprocessResult {
  markdown: string;
  images: MermaidPreprocessedImage[];
}

export interface MermaidPreprocessOptions {
  baseDir: string;
  enabled?: boolean;
  theme?: string;
  scale?: number;
  background?: string;
  minWidth?: number;
}

export async function preprocessMermaidInMarkdown(
  markdown: string,
  options: MermaidPreprocessOptions,
): Promise<MermaidPreprocessResult> {
  const { baseDir, enabled = true, theme, scale, background, minWidth } = options;

  if (!enabled) {
    return { markdown, images: [] };
  }

  // 提取 mermaid 代码块
  const blocks: { raw: string; code: string }[] = [];
  const pattern = /```mermaid\s*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(markdown)) !== null) {
    blocks.push({ raw: match[0], code: match[1]!.trim() });
  }

  if (blocks.length === 0) {
    return { markdown, images: [] };
  }

  const cacheDir = path.resolve(baseDir, "imgs/.mermaid-cache");
  fs.mkdirSync(cacheDir, { recursive: true });

  const replacements = new Map<string, string>();
  const images: MermaidPreprocessedImage[] = [];

  for (const block of blocks) {
    const hash = createHash("md5").update(block.code + (theme ?? "") + (scale ?? 2)).digest("hex").slice(0, 12);
    const filename = `mermaid-${hash}.png`;
    const localPath = path.join(cacheDir, filename);
    const mdRef = `![Mermaid diagram](imgs/.mermaid-cache/${filename})`;
    const cached = fs.existsSync(localPath);

    if (!cached) {
      try {
        await renderMermaidToPng(block.code, localPath, { theme, scale, background, minWidth });
      } catch (err: any) {
        console.error(`[greyhound-html] Mermaid render failed: ${err.message}`);
        continue;
      }
    }

    if (!fs.existsSync(localPath)) continue;

    replacements.set(block.raw, mdRef);
    images.push({
      raw: block.raw,
      code: block.code,
      hash,
      localPath,
      mdRef,
      cached,
    });
  }

  let newMarkdown = markdown;
  for (const [raw, ref] of Array.from(replacements)) {
    newMarkdown = newMarkdown.replace(raw, ref);
  }

  return { markdown: newMarkdown, images };
}
