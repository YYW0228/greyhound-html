// plugins.ts — 插件系统
// 允许用户在渲染管道的任意阶段注入自定义逻辑
// Skill: markdown-to-html

import type { DocumentAST, Block } from "./ast.js"

// ===== 插件接口 =====

export interface PluginHooks {
  /** 在解析 Markdown 之前 */
  beforeParse?: (raw: string) => string | Promise<string>
  /** 解析完成后，构建 AST 之后 */
  afterParse?: (ast: DocumentAST) => void | Promise<void>
  /** 每个 Block 被渲染前 */
  transformBlock?: (block: Block) => Block | Promise<Block>
  /** 每个 Block 渲染完成后 */
  afterRenderBlock?: (html: string, block: Block) => string | Promise<string>
  /** 完整页面 HTML 生成后 */
  afterRender?: (html: string) => string | Promise<string>
}

export interface GreyhoundPlugin {
  name: string
  version: string
  description?: string
  hooks: PluginHooks
}

// ===== 插件管理器 =====

export class PluginManager {
  private plugins: GreyhoundPlugin[] = []

  /** 注册一个插件 */
  use(plugin: GreyhoundPlugin): void {
    if (this.plugins.find(p => p.name === plugin.name)) {
      console.warn(`[plugin] "${plugin.name}" already registered, skipping`)
      return
    }
    this.plugins.push(plugin)
    console.info(`[plugin] Registered: ${plugin.name}@${plugin.version}`)
  }

  /** 移除插件 */
  remove(name: string): void {
    this.plugins = this.plugins.filter(p => p.name !== name)
  }

  /** 获取所有插件 */
  list(): GreyhoundPlugin[] {
    return [...this.plugins]
  }

  // ===== 钩子执行 =====

  async executeBeforeParse(raw: string): Promise<string> {
    let result = raw
    for (const p of this.plugins) {
      if (p.hooks.beforeParse) result = await p.hooks.beforeParse(result)
    }
    return result
  }

  async executeAfterParse(ast: DocumentAST): Promise<void> {
    for (const p of this.plugins) {
      if (p.hooks.afterParse) await p.hooks.afterParse(ast)
    }
  }

  async executeTransformBlock(block: Block): Promise<Block> {
    let result = block
    for (const p of this.plugins) {
      if (p.hooks.transformBlock) result = await p.hooks.transformBlock(result)
    }
    return result
  }

  async executeAfterRenderBlock(html: string, block: Block): Promise<string> {
    let result = html
    for (const p of this.plugins) {
      if (p.hooks.afterRenderBlock) result = await p.hooks.afterRenderBlock(result, block)
    }
    return result
  }

  async executeAfterRender(html: string): Promise<string> {
    let result = html
    for (const p of this.plugins) {
      if (p.hooks.afterRender) result = await p.hooks.afterRender(result)
    }
    return result
  }
}

// ===== 全局单例 =====
export const pluginManager = new PluginManager()

// ===== 内置插件示例 =====

/** 为所有图片添加懒加载 */
export const lazyLoadImagesPlugin: GreyhoundPlugin = {
  name: "lazy-load-images",
  version: "1.0.0",
  description: "Add loading='lazy' to all <img> tags",
  hooks: {
    afterRender: (html: string) => {
      return html.replace(/<img\s+/gi, (match) => {
        return match.includes("loading=") ? match : match + 'loading="lazy" '
      })
    },
  },
}

/** 为所有外部链接添加 target=_blank */
export const externalLinksPlugin: GreyhoundPlugin = {
  name: "external-links",
  version: "1.0.0",
  description: "Add target=_blank and rel=noopener to external links",
  hooks: {
    afterRender: (html: string) => {
      return html.replace(
        /<a\s+href="https?:\/\/(?!mp\.weixin)[^"]+"/gi,
        (match) => match + ' target="_blank" rel="noopener"',
      )
    },
  },
}
