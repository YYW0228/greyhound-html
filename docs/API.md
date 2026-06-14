# API 参考文档

> greyhound-html — Markdown 转结构化 HTML

---

## 目录

- [convertMarkdown](#convertmarkdown)
- [parseMarkdown / astToHtml](#parsemarkdown--asttohtml)
- [renderWithAST](#renderwithast)
- [Pipeline](#pipeline)
- [PluginManager](#pluginmanager)
- [ComponentRegistry](#componentregistry)
- [exportMarkdown](#exportmarkdown)
- [CLI 选项](#cli-选项)
- [类型参考](#类型参考)

---

## convertMarkdown

核心转换函数。读取 Markdown 文件，经 6 步 Pipeline 处理，输出结构化 HTML。

```typescript
import { convertMarkdown } from "./index.js"

const result = await convertMarkdown("article.md", {
  theme: "mckinsey",
  keepTitle: true,
})
```

### 参数

| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `markdownPath` | `string` | ✅ | 要转换的 `.md` 文件路径 |
| `options` | `ConvertMarkdownOptions` | ❌ | 转换选项 |

### 返回值

```typescript
interface ParsedResult {
  title: string
  author: string
  summary: string
  htmlPath: string
  backupPath?: string
  contentImages: ImageInfo[]
  mermaidImages: MermaidImageInfo[]
}
```

### ConvertMarkdownOptions

```typescript
interface ConvertMarkdownOptions {
  title?: string
  theme?: string        // premium | mckinsey | wsj | blackrock | youtube-english | enterprise-cn
  primaryColor?: string  // blue / red / green / hex
  fontFamily?: string
  fontSize?: string | number
  keepTitle?: boolean    // 保留第一个标题（默认移除）
  citeStatus?: boolean   // 外部链接 → 底部引用
  countStatus?: boolean  // 添加字数统计
  mermaid?: MermaidOptions
}
```

---

## parseMarkdown / astToHtml

将 Markdown 文本解析为 AST，或将 AST 渲染为纯 HTML。

```typescript
import { parseMarkdown, astToHtml, buildSections, flattenSections } from "./index.js"

// 解析为 AST
const ast = parseMarkdown(mdContent, { title: "My Doc" })
console.log(ast.blocks)         // 所有块
console.log(ast.sections)       // 层级章节树

// 构建 TOC
const toc = flattenSections(ast.sections)
toc.forEach(s => console.log(`${"  ".repeat(s.depth)}${s.title}`))

// 渲染为 HTML
const html = astToHtml(ast)
```

### parseMarkdown

```typescript
parseMarkdown(raw: string, meta?: Partial<DocumentMeta>): DocumentAST
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `raw` | `string` | Markdown 文本 |
| `meta` | `Partial<DocumentMeta>` | 可选元数据（title/author/summary） |

### DocumentAST

```typescript
interface DocumentAST {
  meta: DocumentMeta
  sections: Section[]    // 层级章节树
  blocks: Block[]        // 扁平块列表
}
```

### Block 类型

| type | 说明 | 属性 |
|------|------|------|
| `heading` | 标题 | `level: 1-6`, `content` |
| `paragraph` | 段落 | `content` |
| `blockquote` | 引用 | `content` |
| `code` | 代码块 | `lang`, `content` |
| `mermaid` | Mermaid 图表 | `content` |
| `list` | 列表 | `items[]`, `meta.ordered` |
| `thematic-break` | 分割线 | — |
| `image` | 图片 | `src`, `alt` |

---

## renderWithAST

使用 AST 渲染器生成完整的 HTML 页面（支持 Premium 主题）。

```typescript
import { renderWithAST } from "./index.js"

const { ast, bodyHtml, fullHtml } = await renderWithAST(mdContent, {
  theme: "blackrock",
  title: "ML 基础知识",
})
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `rawMarkdown` | `string` | Markdown 文本 |
| `options.theme` | `string` | 主题名（支持 6 种 premium + 基础） |
| `options.title` | `string` | 文档标题 |
| `options.author` | `string` | 作者 |
| `options.summary` | `string` | 摘要 |

### 返回值

```typescript
interface AstRenderResult {
  ast: DocumentAST        // 解析后的 AST
  bodyHtml: string        // 正文 HTML（无外包装）
  fullHtml: string        // 完整页面 HTML（含主题）
}
```

---

## Pipeline

可追踪、可恢复的转换管道。

```typescript
import { Pipeline, PipelineError } from "./index.js"

const pipe = new Pipeline()
  .add("read", readFile, true)
  .add("parse", parseContent, true)
  .add("render", renderHtml, true)

try {
  const { ctx, results } = await pipe.run(context)
  console.log(pipe.getReport())
  // ✅ read      12ms
  // ✅ parse      3ms
  // ✅ render   120ms
} catch (e) {
  if (e instanceof PipelineError) {
    console.error(`Failed at step: ${e.step}`)
  }
}
```

### API

| 方法 | 说明 |
|------|------|
| `add(name, fn, critical?)` | 添加步骤（critical=true 时失败中止） |
| `run(ctx)` | 执行管道 |
| `getReport()` | 获取可读报告 |

---

## PluginManager

插件系统 — 5 个钩子点 + 优先级 + 依赖管理。

```typescript
import { pluginManager, PluginPriority, lazyLoadImagesPlugin } from "./index.js"

// 使用内置插件
pluginManager.use(lazyLoadImagesPlugin)

// 自定义插件
pluginManager.use({
  name: "my-plugin",
  version: "1.0.0",
  metadata: {
    priority: PluginPriority.EARLY,
    depends: ["lazy-load-images"],
  },
  hooks: {
    beforeParse: (md) => md.replace(/foo/g, "bar"),
    afterRender: (html) => html + "<!-- done -->",
  },
})

// 管理
pluginManager.setEnabled("my-plugin", false)
pluginManager.validateDependencies()
pluginManager.remove("my-plugin")
```

### 钩子点

| 钩子 | 时机 | 签名 |
|------|------|------|
| `beforeParse` | 解析 Markdown 前 | `(raw: string) => string` |
| `afterParse` | 构建 AST 后 | `(ast: DocumentAST) => void` |
| `transformBlock` | 每个 Block 渲染前 | `(block: Block) => Block` |
| `afterRenderBlock` | 每个 Block 渲染后 | `(html: string, block: Block) => string` |
| `afterRender` | 完整 HTML 生成后 | `(html: string) => string` |

---

## ComponentRegistry

Design Token → 自动编译组件 CSS。

```typescript
import { registry } from "./index.js"

// 编译全部组件
const fullCSS = registry.compileAll("premium")

// 编译单个组件
const cardCSS = registry.compileComponent("card", "premium")

// 注册自定义组件
registry.register({
  name: "my-component",
  selector: ".my-component",
  css: (tokens) => `.my-component { color: ${tokens.colors.accent}; }`,
})

// 注册自定义主题
registry.registerTheme({
  name: "my-theme",
  description: "自定义主题",
  tokens: {
    colors: { accent: "#ff6600", body: "#333" },
    typography: { sans: "Arial, sans-serif" },
    spacing: { page: "24px", card: "16px" },
    radius: { card: "8px" },
    shadow: { card: "0 1px 3px rgba(0,0,0,0.1)" },
    layout: { "content-width": "960px" },
  },
})
```

---

## exportMarkdown

多格式导出。

```typescript
import { exportMarkdown, EXPORTERS } from "./index.js"

// 同时导出 HTML + Markdown
const results = await exportMarkdown("article.md", ["html", "md"], {
  theme: "premium",
})

results.forEach(r => console.log(`${r.format}: ${r.path} (${r.size} bytes)`))

// 注册自定义导出器
EXPORTERS["txt"] = {
  name: "Text",
  extensions: [".txt"],
  async export(htmlPath, outputPath) {
    // ... 导出逻辑
    return { path: outputPath, format: "txt", size: 0 }
  },
}
```

---

## CLI 选项

```bash
bun main.ts <file.md> [options]
```

| 选项 | 说明 | 默认 |
|------|------|------|
| `--theme` | 主题 | default |
| `--color` | 强调色 | blue |
| `--font-family` | 字体 | sans |
| `--font-size` | 字号 (14-18) | 16 |
| `--title` | 覆盖标题 | frontmatter |
| `--keep-title` | 保留第一个标题 | false |
| `--cite` | 外链→底部引用 | false |
| `--count` | 字数统计 | false |
| `--no-mermaid` | 跳过 Mermaid | false |
| `--watch` / `-w` | 热重载 | false |
| `--quiet` | 仅 JSON 输出 | false |
| `--verbose` | debug 日志 | false |
| `--help` / `-h` | 帮助 | |

---

## 类型参考

```typescript
// 核心类型
interface ParsedResult { title, author, summary, htmlPath, backupPath?, contentImages, mermaidImages }
interface ConvertMarkdownOptions { title?, theme?, primaryColor?, fontFamily?, fontSize?, keepTitle?, citeStatus?, countStatus?, mermaid? }

// AST
interface DocumentAST { meta: DocumentMeta, sections: Section[], blocks: Block[] }
interface Block { id, type, level?, content, lang?, src?, alt?, items?, meta? }
interface Section { id, title, level, blocks, subsections }

// 插件
interface GreyhoundPlugin { name, version, description?, metadata?, hooks }
interface PluginHooks { beforeParse?, afterParse?, transformBlock?, afterRenderBlock?, afterRender? }
enum PluginPriority { EARLY=0, NORMAL=10, LATE=20 }

// 管道
class Pipeline<T> { add(name, fn, critical?), run(ctx), getReport() }
class PipelineError extends Error { step }

// 组件
interface ComponentDef { name, selector, css, variants?, render?, props? }
interface ThemeDef { name, description, tokens }

// 导出
interface Exporter { name, extensions[], export(htmlPath, outputPath): ExportResult }
interface ExportResult { path, format, size }
```
