// ast.ts — 文档抽象语法树模型
// 将 Markdown 解析为结构化 AST，替代 baoyu-md 的黑盒渲染
// Skill: markdown-to-html

/** 文档节点类型 */
export type BlockType =
  | "heading" | "paragraph" | "blockquote"
  | "code" | "image" | "list" | "table"
  | "mermaid" | "thematic-break" | "html"
  | "footnote" | "definition"

/** 文档元数据 */
export interface DocumentMeta {
  title: string
  author: string
  summary: string
  tags?: string[]
  date?: string
  [key: string]: unknown
}

/** 单个内容块 */
export interface Block {
  id: string
  type: BlockType
  level?: number           // heading: 1-6
  content: string          // 文本内容
  lang?: string            // code/mermaid: 语言
  src?: string             // image: 路径
  alt?: string             // image: 替代文本
  items?: string[]         // list: 列表项
  rows?: string[][]        // table: 行数据
  headers?: string[]       // table: 列头
  meta?: Record<string, any> // 扩展属性
  children?: Block[]        // 嵌套块
}

/** 完整文档 AST */
export interface DocumentAST {
  meta: DocumentMeta
  sections: Section[]
  blocks: Block[]           // 扁平块列表（用于快速遍历）
}

/** 章节（含标题 + 内容块 + 子章节） */
export interface Section {
  id: string
  title: string
  level: number
  blocks: Block[]
  subsections: Section[]
}

// ===== AST 构建器 =====

export function createAST(meta: DocumentMeta): DocumentAST {
  return { meta, sections: [], blocks: [] }
}

export function addBlock(ast: DocumentAST, block: Block): void {
  ast.blocks.push(block)
}

export function buildSections(blocks: Block[]): Section[] {
  const sections: Section[] = []
  let stack: Section[] = []

  for (const block of blocks) {
    if (block.type === "heading") {
      const newSection: Section = {
        id: block.id,
        title: block.content,
        level: block.level || 1,
        blocks: [],
        subsections: [],
      }

      // 根据 heading 层级决定插入位置
      while (stack.length > 0 && stack[stack.length - 1].level >= (block.level || 1)) {
        stack.pop()
      }

      if (stack.length === 0) {
        sections.push(newSection)
      } else {
        stack[stack.length - 1].subsections.push(newSection)
      }
      stack.push(newSection)
    } else if (stack.length > 0) {
      stack[stack.length - 1].blocks.push(block)
    }
  }

  return sections
}

/** 展平章节树为层级列表（用于 TOC 生成） */
export function flattenSections(
  sections: Section[],
  depth = 0,
): Array<{ id: string; title: string; level: number; depth: number }> {
  const result: Array<{ id: string; title: string; level: number; depth: number }> = []
  for (const sec of sections) {
    result.push({ id: sec.id, title: sec.title, level: sec.level, depth })
    result.push(...flattenSections(sec.subsections, depth + 1))
  }
  return result
}
