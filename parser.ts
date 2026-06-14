// parser.ts — Markdown → AST 解析器
// 从 Markdown 文本构建结构化文档树，替代 baoyu-md 的黑盒
// Skill: markdown-to-html

import type { Block, DocumentAST, DocumentMeta } from "./ast.js"
import { createAST, addBlock, buildSections } from "./ast.js"

// ===== 简易 Markdown 解析器 =====
// 功能完整、代码可读、适合教学调试
//
// 支持的语法：
//   #~###### 标题  |  **粗体** *斜体* `行内代码`
//   > 引用       |  -/*/+ 无序列表  |  1. 有序列表
//   ```lang 代码块  |  ![alt](src) 图片  |  [text](url) 链接
//   表格          |  --- 分割线     |  ```mermaid 图表

let _blockCounter = 0
function nextId(): string {
  return `b${++_blockCounter}`
}
export function resetBlockCounter(): void {
  _blockCounter = 0
}

/** 行内格式渲染（粗体/斜体/代码/链接/图片） */
function renderInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
}

/** 解析 Markdown 文本 → AST */
export function parseMarkdown(raw: string, meta?: Partial<DocumentMeta>): DocumentAST {
  resetBlockCounter()
  const lines = raw.split("\n")
  const ast = createAST({
    title: meta?.title || "",
    author: meta?.author || "",
    summary: meta?.summary || "",
    tags: meta?.tags,
    date: meta?.date,
  })

  let inCodeBlock = false
  let codeLang = ""
  let codeLines: string[] = []
  let inBlockquote = false
  let bqLines: string[] = []
  let inList = false
  let listItems: string[] = []
  let listOrdered = false

  function makeBlock(type: Block["type"], content: string, extra?: Partial<Block>): Block {
    return { id: nextId(), type, content, ...extra }
  }

  function flushCode(): void {
    if (codeLines.length > 0) {
      const lang = codeLang
      if (lang === "mermaid") {
        ast.blocks.push(makeBlock("mermaid", codeLines.join("\n"), { lang }))
      } else {
        ast.blocks.push(makeBlock("code", codeLines.join("\n"), { lang }))
      }
      codeLines = []
      codeLang = ""
    }
  }

  function flushBlockquote(): void {
    if (bqLines.length > 0) {
      ast.blocks.push(makeBlock("blockquote", bqLines.join("\n")))
      bqLines = []
    }
    inBlockquote = false
  }

  function flushList(): void {
    if (listItems.length > 0) {
      ast.blocks.push(makeBlock("list", listItems.join("\n"), {
        items: listItems,
        meta: { ordered: listOrdered },
      }))
      listItems = []
    }
    inList = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // 代码块 fence
    if (/^```/.test(trimmed)) {
      if (inCodeBlock) {
        inCodeBlock = false
        flushCode()
      } else {
        flushBlockquote()
        flushList()
        inCodeBlock = true
        codeLang = trimmed.slice(3).trim()
      }
      continue
    }
    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    // 空行
    if (trimmed === "") {
      if (inBlockquote) flushBlockquote()
      if (inList) flushList()
      continue
    }

    // 分割线
    if (/^[-*_]{3,}\s*$/.test(trimmed)) {
      flushBlockquote()
      flushList()
      ast.blocks.push(makeBlock("thematic-break", "<hr>"))
      continue
    }

    // 标题
    const hm = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (hm) {
      flushBlockquote()
      flushList()
      const level = hm[1].length
      const text = hm[2].trim()
      const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, "-").replace(/^-|-$/g, "") || `h${level}-${i}`
      ast.blocks.push(makeBlock("heading", text, { level, id, meta: { htmlId: id } }))
      continue
    }

    // 引用
    if (trimmed.startsWith(">")) {
      if (inList) flushList()
      inBlockquote = true
      bqLines.push(trimmed.slice(1).trim())
      continue
    }
    if (inBlockquote) flushBlockquote()

    // 列表
    const taskM = trimmed.match(/^[-*+]\s+\[([ xX])\]\s+(.+)$/)
    const ulM = trimmed.match(/^[-*+]\s+(.+)$/)
    const olM = trimmed.match(/^\d+[.)]\s+(.+)$/)

    if (taskM) {
      if (!inList) { inList = true; listOrdered = false }
      else if (inList && listOrdered) { flushList(); inList = true; listOrdered = false }
      listItems.push(taskM[2])
      continue
    }
    if (ulM) {
      if (!inList) { inList = true; listOrdered = false }
      else if (inList && listOrdered) { flushList(); inList = true; listOrdered = false }
      listItems.push(ulM[1])
      continue
    }
    if (olM) {
      if (!inList) { inList = true; listOrdered = true }
      else if (inList && !listOrdered) { flushList(); inList = true; listOrdered = true }
      listItems.push(olM[1])
      continue
    }
    if (inList) flushList()

    // 普通段落
    ast.blocks.push(makeBlock("paragraph", renderInline(trimmed)))
  }

  // 收尾
  if (inCodeBlock) flushCode()
  flushBlockquote()
  flushList()

  // 构建层级章节
  ast.sections = buildSections(ast.blocks)

  return ast
}

/** AST → 简单 HTML（纯语义标签，无样式） */
export function astToHtml(ast: DocumentAST): string {
  const parts: string[] = []

  for (const block of ast.blocks) {
    switch (block.type) {
      case "heading":
        parts.push(`<h${block.level} id="${block.meta?.htmlId || block.id}">${renderInline(block.content)}</h${block.level}>`)
        break
      case "paragraph":
        parts.push(`<p>${block.content}</p>`)
        break
      case "blockquote":
        parts.push(`<blockquote>${block.content}</blockquote>`)
        break
      case "code":
        parts.push(`<pre><code class="lang-${block.lang || ""}">${escHtml(block.content)}</code></pre>`)
        break
      case "mermaid":
        parts.push(`<pre class="mermaid">${block.content}</pre>`)
        break
      case "list":
        const tag = block.meta?.ordered ? "ol" : "ul"
        const items = (block.items || []).map(item => `<li>${renderInline(item)}</li>`).join("")
        parts.push(`<${tag}>${items}</${tag}>`)
        break
      case "thematic-break":
        parts.push("<hr>")
        break
      case "image":
        parts.push(`<img src="${block.src || ""}" alt="${block.alt || ""}" loading="lazy">`)
        break
      default:
        parts.push(`<p>${block.content}</p>`)
    }
  }

  return parts.join("\n")
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}
