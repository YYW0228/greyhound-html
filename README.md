# 🐕 greyhound-html

> **Markdown → 结构化 HTML · AST pipeline · 6 主题 · 多格式导出**
> 
> HTML is the new Markdown — 让 AI 生成专业级报告，即开即用。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/bun-≥1.3-black)](https://bun.sh)
[![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

---

## 目录

- [为什么用 HTML 替代 Markdown？](#为什么用-html-替代-markdown)
- [快速开始](#快速开始)
- [6 个 Premium 主题](#6-个-premium-主题)
- [使用方式](#使用方式)
- [核心架构](#核心架构)
- [重构路线图](#重构路线图)
- [项目文件结构](#项目文件结构)
- [发布到 GitHub](#发布到-github)

---

## 为什么用 HTML 替代 Markdown？

```
Markdown:  线性结构，信息密度低，无法表达视觉层级
HTML:      Details/Summary 折叠 · 彩色语义卡片 · 网格布局 · SVG 流程图
           标签系统 · 响应式设计 · 打印优化 · 暗黑模式
```

在大上下文 AI 生成场景中，HTML 结构化输出显著提升文档可读性与信息获取效率。

> "HTML is the new Markdown — 实践在 AI Agent 辅助开发场景下，通过视觉优先的设计大幅降低团队阅读门槛。"

---

## 快速开始

```bash
# 1. 安装依赖
bun install

# 2. 转换单个文件
bun main.ts article.md --theme premium

# 3. 查看帮助
bun main.ts --help

# 4. 实时预览
open preview.html
```

### 选项速查

| 选项 | 说明 | 默认 |
|------|------|------|
| `--theme` | 主题: `premium` `mckinsey` `wsj` `blackrock` `youtube-english` `enterprise-cn` | default |
| `--color` | 强调色: blue / red / green / hex | blue |
| `--watch` | 文件变更自动重新转换 | false |
| `--quiet` | 仅输出 JSON 结果 | false |
| `--verbose` | 输出 debug 日志 | false |
| `--help` | 显示帮助 | |

---

## 6 个 Premium 主题

```bash
bun main.ts article.md --theme premium       # v2 报告风
bun main.ts article.md --theme mckinsey      # 麦肯锡咨询风格
bun main.ts article.md --theme wsj           # 华尔街日报风格
bun main.ts article.md --theme blackrock     # 贝莱德财报风格
bun main.ts article.md --theme youtube-english  # YouTube 英语教学
bun main.ts article.md --theme enterprise-cn    # 中国企业布道
```

| 主题 | 色系 | 字体 | 定位 |
|------|------|------|------|
| **premium** | 蓝/绿/橙/紫 | system sans | 通用报告 |
| **mckinsey** | 深蓝 #1B2A4A + 金 #C8A961 | 衬线标题 | 战略咨询 |
| **wsj** | 墨 #111 + 纸 #F7F5F0 | Georgia 衬线 | 报章质感 |
| **blackrock** | 碳灰 #1D272F + 红 #C41E24 | Inter | 财报数据 |
| **youtube-english** | 橘 #FF6B35 + 蓝 #2563EB | Inter | 视频教学 |
| **enterprise-cn** | 中国红 #C41E24 + 金 #B8860B | Noto Sans SC | 民营企业 |

所有主题共享同一套 BASE_CSS（`.critical/.warning/.info/.success/.pending` 语义颜色 + `.grid-4` 网格 + `.card` 卡片系统），仅通过 ~18 行 CSS 变量切换外观。

---

## 使用方式

### 作为 CLI 工具

```bash
# 基本
bun main.ts article.md

# 主题 + 颜色
bun main.ts article.md --theme mckinsey

# 热重载
bun main.ts article.md --theme blackrock --watch
```

### 作为 Node.js 库

```typescript
import { convertMarkdown } from "./index.js"

const result = await convertMarkdown("article.md", {
  theme: "mckinsey",
  keepTitle: true,
})
console.log(result.htmlPath) // → /path/to/article.html
```

### 使用 AST 直接操作

```typescript
import { parseMarkdown, astToHtml, buildSections, flattenSections } from "./index.js"

const ast = parseMarkdown(mdContent)
console.log(ast.blocks)          // 扁平块列表
console.log(ast.sections)        // 层级章节树
console.log(flattenSections(ast.sections))  // TOC 用平铺列表

// 自定义渲染
const html = astToHtml(ast)
```

### 插件系统

```typescript
import { pluginManager, lazyLoadImagesPlugin, externalLinksPlugin } from "./index.js"

pluginManager.use(lazyLoadImagesPlugin)
pluginManager.use(externalLinksPlugin)

// 自定义插件
pluginManager.use({
  name: "my-plugin",
  version: "1.0.0",
  hooks: {
    afterRender: (html) => html + "<!-- rendered -->",
  },
})
```

### Pipeline 调试

```typescript
import { Pipeline } from "./index.js"

const pipe = new Pipeline()
  .add("read", readFile, true)
  .add("parse", parseContent, true)
  .add("render", renderHtml, true)

await pipe.run(context)
console.log(pipe.getReport())
// ✅ read      12ms
// ✅ parse      3ms
// ✅ render   120ms
```

---

## 核心架构

```
Markdown
  │
  ▼
Pipeline (6 步，每步可追踪/可恢复)
  │
  ├─ Step 1: parseFile       读取 + YAML frontmatter
  ├─ Step 2: metadata        标题/作者/摘要
  ├─ Step 3: preprocess      Mermaid 渲染 + 图片占位符
  ├─ Step 4: render          parseMarkdown() → AST → astToHtml()
  ├─ Step 5: save            备份 + 写入 HTML
  └─ Step 6: images          图片路径解析 + 替换
       │
       ▼
Plugin Hooks (beforeParse → afterParse → transformBlock → afterRenderBlock → afterRender)
       │
       ▼
Component Registry (Design Tokens → 自动编译组件 CSS)
       │
       ▼
Exporters (HTML / PDF / Markdown)
```

### 架构特点

- **Pipeline 可见性** — 每一步有计时、状态、错误追踪
- **AST 白盒渲染** — 替代 baoyu-md 黑盒，每步可 debug、可教学
- **插件系统** — 5 个钩子点注入自定义逻辑
- **组件注册表** — 主题只定义 Design Tokens，组件 CSS 自动编译

---

## 重构路线图

```
Week 1 (基础)
├─ ✅ L1.1: 插件系统
├─ ✅ L1.2: Pipeline 管道框架
└─ ✅ L2.1: AST 层

Week 2 (核心)
├─ ✅ L2.2: AST 渲染器（替代 baoyu-md 黑盒）
├─ ✅ L3.1: 多格式导出 (HTML/PDF/MD)
└─ ✅ L3.2: 组件库 + 主题系统重构

Week 3 (体验)
├─ ✅ Web UI 实时预览
└─ ◻ 完整测试覆盖
```

---

## 项目文件结构

```
greyhound-html/
├── main.ts                  CLI 入口（错误恢复 + --quiet/--verbose）
├── cli.ts                   参数解析（6 主题 + --watch）
├── core.ts                  6 步 Pipeline 编排
│
├── ast.ts                   AST 类型 + 章节树
├── parser.ts                Markdown → AST 解析器
├── ast-renderer.ts          AST → HTML 渲染器
├── pipeline.ts              可视化管道框架
│
├── plugins.ts               插件系统（5 钩子）
├── component-registry.ts    组件库 + Design Token 主题系统
├── exporters.ts             多格式导出 (HTML/PDF/MD)
├── renderer-premium.ts      Premium 主题包装器
├── themes.ts                6 主题设计系统
│
├── types.ts                 类型定义
├── metadata.ts              元数据提取
├── utils.ts                 工具函数 + Logger
├── constants.ts             常量/预设
├── index.ts                 库入口
│
├── preview.html             Web UI 实时预览
├── package.json             npm 配置（bin: md2html）
├── .github/workflows/       GitHub Actions 自动部署
└── SKILL.md                 Hermes 技能注册
```

---

## 发布到 GitHub

```bash
git init
git add -A
git commit -m "initial: greyhound-html — Markdown to structured HTML"
git remote add origin git@github.com:YYW0228/greyhound-html.git
git push -u origin main
```
