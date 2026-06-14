// exporters.ts — 多格式导出系统 (L3.1)
// 支持 HTML / PDF / Markdown 输出
// Skill: markdown-to-html

import fs from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import { convertMarkdown } from "./core.js"
import type { ConvertMarkdownOptions } from "./types.js"
import { logger } from "./utils.js"

// ===== 导出器接口 =====

export interface ExportResult {
  path: string
  format: string
  size: number
}

export interface Exporter {
  name: string
  extensions: string[]
  export(htmlPath: string, outputPath: string): Promise<ExportResult>
}

// ===== HTML 导出器（已有功能） =====
export const htmlExporter: Exporter = {
  name: "HTML",
  extensions: [".html"],
  async export(htmlPath) {
    const stat = await fs.stat(htmlPath)
    return { path: htmlPath, format: "html", size: stat.size }
  },
}

// ===== Markdown 反向导出器（HTML → MD） =====
export const markdownExporter: Exporter = {
  name: "Markdown",
  extensions: [".md"],
  async export(htmlPath, outputPath) {
    const html = await fs.readFile(htmlPath, "utf-8")

    // 简易 HTML → Markdown 转换
    let md = html
      .replace(/<h1[^>]*>([^<]+)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2[^>]*>([^<]+)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3[^>]*>([^<]+)<\/h3>/gi, "### $1\n\n")
      .replace(/<strong>([^<]+)<\/strong>/gi, "**$1**")
      .replace(/<em>([^<]+)<\/em>/gi, "*$1*")
      .replace(/<code>([^<]+)<\/code>/gi, "`$1`")
      .replace(/<p[^>]*>([^<]*)<\/p>/gi, "$1\n\n")
      .replace(/<li[^>]*>([^<]*)<\/li>/gi, "- $1\n")
      .replace(/<blockquote[^>]*>([^<]*)<\/blockquote>/gi, "> $1\n\n")
      .replace(/<hr[^>]*>/gi, "---\n\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")  // 移除剩余标签
      .replace(/\n{3,}/g, "\n\n")
      .trim()

    await fs.writeFile(outputPath, md, "utf-8")
    const stat = await fs.stat(outputPath)
    logger.info(`Exported Markdown → ${outputPath}`)
    return { path: outputPath, format: "md", size: stat.size }
  },
}

// ===== PDF 导出器（通过 gstack browser / Playwright） =====
export const pdfExporter: Exporter = {
  name: "PDF",
  extensions: [".pdf"],
  async export(htmlPath, outputPath) {
    // 尝试通过 gstack browser 生成 PDF
    const gstackBins = [
      path.join(os.homedir(), ".claude/skills/gstack/browse/dist/browse"),
      "/Users/mac/.claude/skills/gstack/browse/dist/browse",
    ]

    for (const bin of gstackBins) {
      try {
        await fs.access(bin)
        const { execSync } = await import("node:child_process")
        const url = `file://${path.resolve(htmlPath)}`
        const cmd = `"${bin}" goto "${url}" 2>/dev/null && "${bin}" pdf "${outputPath}" 2>/dev/null`
        execSync(cmd, { timeout: 30000, shell: true as any })
        const stat = await fs.stat(outputPath)
        logger.info(`Exported PDF → ${outputPath}`)
        return { path: outputPath, format: "pdf", size: stat.size }
      } catch {
        continue
      }
    }

    // 降级方案：提示用户
    logger.warn("PDF export requires gstack browser or Playwright")
    logger.warn("Install: npx playwright install chromium")
    throw new Error("PDF exporter unavailable — install gstack browse or Playwright")
  },
}

// ===== 导出调度器 =====

export const EXPORTERS: Record<string, Exporter> = {
  html: htmlExporter,
  md: markdownExporter,
  pdf: pdfExporter,
}

export async function exportMarkdown(
  markdownPath: string,
  formats: string[],
  options: ConvertMarkdownOptions = {},
): Promise<ExportResult[]> {
  // 1. 先转换 HTML
  const result = await convertMarkdown(markdownPath, options)

  // 2. 导出各格式
  const results: ExportResult[] = []
  const basePath = markdownPath.replace(/\.md$/i, "")

  for (const fmt of formats) {
    const exporter = EXPORTERS[fmt]
    if (!exporter) {
      logger.warn(`Unknown format: ${fmt}`)
      continue
    }
    const ext = exporter.extensions[0]
    const outputPath = `${basePath}${ext}`
    try {
      const r = await exporter.export(result.htmlPath, outputPath)
      results.push(r)
    } catch (err: any) {
      logger.error(`Export ${fmt} failed: ${err.message}`)
    }
  }

  return results
}
