// pipeline.ts — 可视化转换管道
// 每步追踪 + 计时 + 错误恢复，调试友好
// Skill: markdown-to-html

import { logger } from "./utils.js"

// ===== 管道步骤定义 =====

export interface StepResult {
  name: string
  status: "success" | "failed" | "skipped"
  durationMs: number
  error?: string
  data?: any
}

export class PipelineError extends Error {
  constructor(
    message: string,
    public readonly step: string,
    public readonly cause?: Error,
  ) {
    super(message)
    this.name = "PipelineError"
  }
}

// ===== 管道执行器 =====

type StepFn<T> = (ctx: T) => Promise<any>

interface StepDef<T> {
  name: string
  fn: StepFn<T>
  critical?: boolean // true 时失败则中止管道
}

export class Pipeline<T extends Record<string, any>> {
  private steps: StepDef<T>[] = []
  private results: StepResult[] = []
  private startTime = 0
  private failed = false

  /** 添加步骤 */
  add(name: string, fn: StepFn<T>, critical = true): this {
    this.steps.push({ name, fn, critical })
    return this
  }

  /** 运行管道 */
  async run(ctx: T): Promise<{ ctx: T; results: StepResult[] }> {
    this.startTime = Date.now()
    this.results = []
    this.failed = false

    logger.info(`═══ Pipeline start (${this.steps.length} steps) ═══`)

    for (const step of this.steps) {
      if (this.failed && step.critical) {
        this.results.push({ name: step.name, status: "skipped", durationMs: 0 })
        logger.warn(`  ⏭  ${step.name} (skipped — prior failure)`)
        continue
      }

      const t0 = Date.now()
      try {
        const data = await step.fn(ctx)
        const ms = Date.now() - t0
        this.results.push({ name: step.name, status: "success", durationMs: ms, data })
        logger.info(`  ✅ ${step.name} (${ms}ms)`)
      } catch (err: any) {
        const ms = Date.now() - t0
        this.results.push({
          name: step.name,
          status: "failed",
          durationMs: ms,
          error: err.message,
        })
        logger.error(`  ❌ ${step.name} (${ms}ms): ${err.message}`)

        if (step.critical) {
          this.failed = true
          throw new PipelineError(
            `Pipeline failed at "${step.name}": ${err.message}`,
            step.name,
            err,
          )
        }
        // 非关键步骤 — 继续
      }
    }

    const total = Date.now() - this.startTime
    const success = this.results.filter(r => r.status === "success").length
    logger.info(`═══ Pipeline complete (${success}/${this.steps.length} passed, ${total}ms) ═══`)

    return { ctx, results: this.results }
  }

  /** 获取管道报告（供调试 / 课程展示） */
  getReport(): string {
    const lines = ["📊 Pipeline Report", "─".repeat(60)]
    for (const r of this.results) {
      const icon = r.status === "success" ? "✅" : r.status === "failed" ? "❌" : "⏭"
      lines.push(`  ${icon} ${r.name.padEnd(25)} ${r.durationMs}ms${r.error ? `  ⚠ ${r.error}` : ""}`)
    }
    const total = this.results.reduce((s, r) => s + r.durationMs, 0)
    lines.push("─".repeat(60))
    lines.push(`  Total: ${total}ms`)
    return lines.join("\n")
  }
}

// ===== 上下文类型 =====

export interface ConversionContext {
  // 输入
  markdownPath: string
  rawContent: string
  options: Record<string, any>

  // 各步骤产出
  body?: string
  frontmatter?: Record<string, any>
  title?: string
  author?: string
  summary?: string
  html?: string
  htmlPath?: string
  backupPath?: string
  contentImages?: any[]
  mermaidImages?: any[]
}
