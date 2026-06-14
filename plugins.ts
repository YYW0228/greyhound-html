// plugins.ts — 插件系统（含优先级 + 依赖管理 + 启用/禁用）
// Skill: markdown-to-html

import type { DocumentAST, Block } from "./ast.js"
import { logger } from "./utils.js"

// ===== 优先级枚举 =====
export enum PluginPriority {
  EARLY = 0,
  NORMAL = 10,
  LATE = 20,
}

// ===== 插件元数据 =====
export interface PluginMetadata {
  priority?: PluginPriority
  depends?: string[]
  enabled?: boolean
}

// ===== 插件钩子 =====
export interface PluginHooks {
  beforeParse?: (raw: string) => string | Promise<string>
  afterParse?: (ast: DocumentAST) => void | Promise<void>
  transformBlock?: (block: Block) => Block | Promise<Block>
  afterRenderBlock?: (html: string, block: Block) => string | Promise<string>
  afterRender?: (html: string) => string | Promise<string>
}

// ===== 插件接口 =====
export interface GreyhoundPlugin {
  name: string
  version: string
  description?: string
  metadata?: PluginMetadata
  hooks: PluginHooks
}

// ===== 插件管理器 =====
export class PluginManager {
  private plugins: GreyhoundPlugin[] = []
  private sortDirty = false

  /** 注册插件 */
  use(plugin: GreyhoundPlugin): void {
    if (this.plugins.find(p => p.name === plugin.name)) {
      logger.warn(`[plugin] "${plugin.name}" already registered, skipping`)
      return
    }
    this.plugins.push(plugin)
    this.sortDirty = true  // 自动标记需重排序
    logger.info(`[plugin] Registered: ${plugin.name}@${plugin.version}`)
  }

  /** 移除插件 */
  remove(name: string): void {
    this.plugins = this.plugins.filter(p => p.name !== name)
    this.sortDirty = true
  }

  /** 启用/禁用插件 */
  setEnabled(name: string, enabled: boolean): void {
    const p = this.plugins.find(p => p.name === name)
    if (p) {
      p.metadata = { ...p.metadata, enabled }
      logger.info(`[plugin] ${name} → ${enabled ? "enabled" : "disabled"}`)
    }
  }

  /** 获取活跃插件列表 */
  list(): GreyhoundPlugin[] {
    return [...this.plugins]
  }

  /** 验证依赖 */
  validateDependencies(): void {
    const names = new Set(this.plugins.map(p => p.name))
    for (const p of this.plugins) {
      for (const dep of p.metadata?.depends ?? []) {
        if (!names.has(dep)) {
          throw new Error(
            `Plugin "${p.name}" depends on "${dep}" which is not registered`,
          )
        }
      }
    }
  }

  /** 按优先级排序 */
  private ensureSorted(): void {
    if (!this.sortDirty) return
    this.plugins.sort(
      (a, b) => (a.metadata?.priority ?? PluginPriority.NORMAL) -
                 (b.metadata?.priority ?? PluginPriority.NORMAL),
    )
    this.sortDirty = false
  }

  /** 获取启用的插件 */
  private getEnabled(): GreyhoundPlugin[] {
    this.ensureSorted()
    return this.plugins.filter(p => p.metadata?.enabled !== false)
  }

  // ===== 钩子执行（带错误隔离） =====

  async executeBeforeParse(raw: string): Promise<string> {
    let result = raw
    for (const p of this.getEnabled()) {
      if (!p.hooks.beforeParse) continue
      try { result = await p.hooks.beforeParse(result) }
      catch (e) { logger.error(`[plugin] ${p.name}.beforeParse failed: ${e}`) }
    }
    return result
  }

  async executeAfterParse(ast: DocumentAST): Promise<void> {
    for (const p of this.getEnabled()) {
      if (!p.hooks.afterParse) continue
      try { await p.hooks.afterParse(ast) }
      catch (e) { logger.error(`[plugin] ${p.name}.afterParse failed: ${e}`) }
    }
  }

  async executeTransformBlock(block: Block): Promise<Block> {
    let result = block
    for (const p of this.getEnabled()) {
      if (!p.hooks.transformBlock) continue
      try { result = await p.hooks.transformBlock(result) }
      catch (e) { logger.error(`[plugin] ${p.name}.transformBlock failed: ${e}`) }
    }
    return result
  }

  async executeAfterRenderBlock(html: string, block: Block): Promise<string> {
    let result = html
    for (const p of this.getEnabled()) {
      if (!p.hooks.afterRenderBlock) continue
      try { result = await p.hooks.afterRenderBlock(result, block) }
      catch (e) { logger.error(`[plugin] ${p.name}.afterRenderBlock failed: ${e}`) }
    }
    return result
  }

  async executeAfterRender(html: string): Promise<string> {
    let result = html
    for (const p of this.getEnabled()) {
      if (!p.hooks.afterRender) continue
      try { result = await p.hooks.afterRender(result) }
      catch (e) { logger.error(`[plugin] ${p.name}.afterRender failed: ${e}`) }
    }
    return result
  }
}

// ===== 全局单例 =====
export const pluginManager = new PluginManager()

// ===== 内置插件 =====

export const lazyLoadImagesPlugin: GreyhoundPlugin = {
  name: "lazy-load-images",
  version: "1.0.0",
  description: "Add loading='lazy' to all <img> tags",
  metadata: { priority: PluginPriority.LATE, enabled: true },
  hooks: {
    afterRender: (html: string) =>
      html.replace(/<img\s+/gi, m => m.includes("loading=") ? m : m + 'loading="lazy" '),
  },
}

export const externalLinksPlugin: GreyhoundPlugin = {
  name: "external-links",
  version: "1.0.0",
  description: "Add target=_blank to external links",
  metadata: { priority: PluginPriority.LATE, enabled: true },
  hooks: {
    afterRender: (html: string) =>
      html.replace(/<a\s+href="https?:\/\/(?!mp\.weixin)[^"]+"/gi,
        m => m + ' target="_blank" rel="noopener"'),
  },
}
