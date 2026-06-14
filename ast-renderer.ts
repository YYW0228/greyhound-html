// ast-renderer.ts — 基于 AST 的 HTML 渲染器（替代 baoyu-md 黑盒）
// 使用 parser.ts 的 parseMarkdown 生成 AST，再用 renderPremiumPage 包装
// Skill: markdown-to-html

import type { DocumentAST, Block } from "./ast.js"
import { parseMarkdown } from "./parser.js"
import { renderPremiumPage } from "./renderer-premium.js"
import type { PremiumThemeName } from "./constants.js"
import { pluginManager } from "./plugins.js"

// ===== 渲染选项 =====

export interface AstRenderOptions {
  theme: PremiumThemeName | string
  title?: string
  author?: string
  summary?: string
  keepTitle?: boolean
  citeStatus?: boolean
}

// ===== AST → body HTML（纯净语义标签，无内联样式） =====

function renderBlock(block: Block, options: AstRenderOptions): string {
  const content = block.content

  switch (block.type) {
    case "heading": {
      // 如果 keepTitle=false 且是第一个 h1，跳过
      const id = block.meta?.htmlId || block.id
      return `<h${block.level} id="${id}">${content}</h${block.level}>`
    }

    case "paragraph":
      return `<p>${content}</p>`

    case "blockquote":
      return `<blockquote>${content}</blockquote>`

    case "code": {
      const lang = block.lang || ""
      return `<pre><code class="lang-${lang}">${escHtml(content)}</code></pre>`
    }

    case "mermaid":
      return `<pre class="mermaid">${content}</pre>`

    case "list": {
      const tag = block.meta?.ordered ? "ol" : "ul"
      const items = (block.items || content.split("\n"))
        .map(item => `<li>${item}</li>`)
        .join("")
      return `<${tag}>${items}</${tag}>`
    }

    case "thematic-break":
      return "<hr>"

    case "image":
      return `<img src="${block.src || ""}" alt="${block.alt || ""}" loading="lazy">`

    default:
      return `<p>${content}</p>`
  }
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

// ===== 主渲染函数 =====

export interface AstRenderResult {
  ast: DocumentAST
  bodyHtml: string
  fullHtml: string
}

export async function renderWithAST(
  rawMarkdown: string,
  options: AstRenderOptions,
): Promise<AstRenderResult> {
  // 1. 插件：beforeParse
  const processedMd = await pluginManager.executeBeforeParse(rawMarkdown)

  // 2. 解析为 AST
  const ast = parseMarkdown(processedMd, {
    title: options.title,
    author: options.author,
    summary: options.summary,
  })

  // 3. 插件：afterParse
  await pluginManager.executeAfterParse(ast)

  // 4. 遍历 blocks 生成 body HTML
  const bodyParts: string[] = []
  for (let block of ast.blocks) {
    // 插件：transformBlock
    block = await pluginManager.executeTransformBlock(block)

    let html = renderBlock(block, options)

    // 插件：afterRenderBlock
    html = await pluginManager.executeAfterRenderBlock(html, block)

    bodyParts.push(html)
  }
  const bodyHtml = bodyParts.join("\n")

  // 5. 判断是否使用 premium 主题
  const premiumThemes = ["premium", "mckinsey", "wsj", "blackrock", "youtube-english", "enterprise-cn"]
  const isPremium = premiumThemes.includes(options.theme)

  let fullHtml: string

  if (isPremium) {
    // 使用 premium 主题包装
    const toc = ast.blocks
      .filter(b => b.type === "heading")
      .map(b => ({
        id: (b.meta?.htmlId as string) || b.id,
        text: b.content,
        level: b.level || 1,
      }))

    fullHtml = renderPremiumPage(bodyHtml, {
      title: options.title || ast.meta.title || "",
      author: options.author || ast.meta.author || "",
      summary: options.summary || ast.meta.summary || "",
      theme: options.theme as PremiumThemeName,
      toc,
    })
  } else {
    // 基础主题：简单包装
    fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escHtml(options.title || "")}</title>
<style>body{max-width:800px;margin:0 auto;padding:24px;font-family:sans-serif;line-height:1.7;color:#333}h1,h2,h3{color:#111}pre{background:#f5f5f5;padding:12px;border-radius:6px;overflow-x:auto}code{background:#f0f0f0;padding:2px 6px;border-radius:3px}blockquote{border-left:3px solid #3182ce;margin:12px 0;padding:8px 16px;background:#ebf8ff}table{border-collapse:collapse;width:100%}th,td{padding:8px 12px;border-bottom:1px solid #e2e8f0}img{max-width:100%}</style></head>
<body>
<h1>${escHtml(options.title || "")}</h1>
${bodyHtml}
</body></html>`
  }

  // 6. 插件：afterRender
  fullHtml = await pluginManager.executeAfterRender(fullHtml)

  return { ast, bodyHtml, fullHtml }
}
