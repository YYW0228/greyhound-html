// renderer-premium.ts — 高级主题 HTML 渲染器
// 编码了 McKinsey 设计规则：标题重构 + 视觉隐喻 + 构图规则
// Skill: markdown-to-html

import { THEMES } from "./themes.js"
import type { PremiumThemeName } from "./constants.js"

export interface RenderOptions {
  title: string
  author: string
  summary: string
  theme: PremiumThemeName
  toc: Array<{ id: string; text: string; level: number }>
}

// ================================================================
// McKinsey 设计规则引擎
// ================================================================

/** 从长标题中提炼核心词（A层：主视觉核心词） */
function extractCoreWord(title: string): string {
  // 移除中英文冒号、破折号后的部分（通常是副标题）
  let core = title.replace(/[：:].*$/, "").replace(/[-—–].*$/, "").trim()
  // 如果太短则返回原标题
  if (core.length <= 4) return core
  // 如果太长，从结尾截取最有冲击力的 2-6 个字
  // 优先截取最后的实义词组
  const segments = core.split(/[·・\s,，、]/)
  if (segments.length > 1) {
    // 取最后一个有意义的片段
    for (let i = segments.length - 1; i >= 0; i--) {
      const s = segments[i].trim()
      if (s && s.length >= 2 && s.length <= 8) return s
    }
  }
  // 否则取最后 4 个字
  return core.length > 6 ? core.slice(-6) : core
}

/** 提炼 B 层完整标题（保留完整标题，去掉核心词重复） */
function extractFullTitle(title: string, coreWord: string): string {
  return title.replace(coreWord, "").replace(/^[：:\s]+/, "").replace(/[：:\s]+$/, "").trim() || title
}

/** 根据标题内容自动选择视觉隐喻类型 */
type MetaphorType =
  | "funnel" | "path" | "staircase" | "matrix"
  | "coordinate" | "flywheel" | "node-network"
  | "data-flow" | "gateway" | "window"
  | "defense-line" | "fault-line" | "container"
  | "compass" | "architecture"

function detectMetaphor(title: string, summary: string): MetaphorType {
  const text = (title + " " + summary).toLowerCase()
  if (/增长|扩张|上升|飞轮|复利|grow|scale|flywheel|loop/i.test(text)) return "flywheel"
  if (/转化|筛选|收敛|路径|funnel|convert|filter/i.test(text)) return "funnel"
  if (/战略|路径|方向|路线|strategy|roadmap|path/i.test(text)) return "path"
  if (/升级|进阶|阶梯|层级|ladder|level|stage|staircase/i.test(text)) return "staircase"
  if (/定位|比较|矩阵|matrix|grid|position/i.test(text)) return "matrix"
  if (/市场|坐标|区间|market|map|coordinate|opportunity/i.test(text)) return "coordinate"
  if (/系统|网络|节点|连接|network|node|system/i.test(text)) return "node-network"
  if (/价值|承载|容器|value|container|pool/i.test(text)) return "container"
  if (/风险|防线|安全|阈值|risk|defense|safety/i.test(text)) return "defense-line"
  if (/结构|架构|框架|底座|architecture|framework|foundation/i.test(text)) return "architecture"
  if (/窗口|机会|突破|入口|window|gateway|entry/i.test(text)) return "gateway"
  if (/效率|流动|自动化|data|flow|efficiency|automation/i.test(text)) return "data-flow"
  if (/方向|指南|导航|罗盘|compass|direction|guide/i.test(text)) return "compass"
  // 默认：技术类内容用 architecture，教程类用 staircase
  if (/技术|构建|build|code|engineer/i.test(text)) return "architecture"
  return "staircase"
}

/** 生成隐喻 SVG（基于类型） */
function renderMetaphorSVG(metaphor: MetaphorType, accentColor: string): string {
  const c = accentColor
  switch (metaphor) {
    case "staircase":
      return `<svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="70" width="100" height="30" rx="2" fill="${c}" opacity="0.15"/>
        <rect x="30" y="50" width="100" height="30" rx="2" fill="${c}" opacity="0.3"/>
        <rect x="60" y="30" width="100" height="30" rx="2" fill="${c}" opacity="0.5"/>
        <rect x="90" y="10" width="100" height="30" rx="2" fill="${c}" opacity="0.8"/>
        <rect x="120" y="0" width="100" height="25" rx="2" fill="${c}"/>
        <text x="170" y="18" fill="#fff" font-size="10" font-weight="700" text-anchor="middle">↑</text>
      </svg>`
    case "flywheel":
      return `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="60" r="45" fill="none" stroke="${c}" stroke-width="2" opacity="0.3"/>
        <circle cx="100" cy="60" r="30" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.5"/>
        <circle cx="100" cy="60" r="15" fill="${c}" opacity="0.8"/>
        <path d="M100 15 A45 45 0 0 1 145 60" fill="none" stroke="${c}" stroke-width="3" marker-end="url(#fly-arrow)"/>
        <defs><marker id="fly-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="${c}"/></marker></defs>
        <text x="100" y="65" text-anchor="middle" fill="#fff" font-size="8" font-weight="700">↻</text>
      </svg>`
    case "funnel":
      return `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
        <polygon points="100,5 195,135 5,135" fill="${c}" opacity="0.08" stroke="${c}" stroke-width="1.5"/>
        <line x1="100" y1="5" x2="100" y2="135" stroke="${c}" stroke-width="1" opacity="0.4"/>
        <rect x="55" y="30" width="90" height="4" rx="2" fill="${c}" opacity="0.3"/>
        <rect x="40" y="55" width="120" height="4" rx="2" fill="${c}" opacity="0.5"/>
        <rect x="25" y="80" width="150" height="4" rx="2" fill="${c}" opacity="0.7"/>
        <rect x="10" y="105" width="180" height="4" rx="2" fill="${c}"/>
      </svg>`
    case "path":
      return `<svg viewBox="0 0 400 60" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="30" r="6" fill="${c}"/>
        <circle cx="100" cy="20" r="4" fill="${c}" opacity="0.6"/>
        <circle cx="180" cy="35" r="4" fill="${c}" opacity="0.6"/>
        <circle cx="260" cy="15" r="4" fill="${c}" opacity="0.6"/>
        <circle cx="340" cy="30" r="4" fill="${c}" opacity="0.6"/>
        <path d="M26 30 Q60 5 100 20 Q140 40 180 35 Q220 0 260 15 Q300 40 340 30" fill="none" stroke="${c}" stroke-width="2" opacity="0.5"/>
        <line x1="380" y1="30" x2="395" y2="30" stroke="${c}" stroke-width="2" marker-end="url(#path-arrow)"/>
        <defs><marker id="path-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="${c}"/></marker></defs>
      </svg>`
    case "architecture":
      return `<svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="80" width="380" height="30" rx="2" fill="${c}" opacity="0.1" stroke="${c}" stroke-width="1"/>
        <rect x="10" y="40" width="380" height="30" rx="2" fill="${c}" opacity="0.2" stroke="${c}" stroke-width="1"/>
        <rect x="10" y="0" width="380" height="30" rx="2" fill="${c}" opacity="0.4" stroke="${c}" stroke-width="1"/>
        <rect x="160" y="10" width="80" height="10" rx="2" fill="#fff" opacity="0.6"/>
        <rect x="160" y="50" width="80" height="10" rx="2" fill="#fff" opacity="0.6"/>
        <rect x="160" y="90" width="80" height="10" rx="2" fill="#fff" opacity="0.6"/>
      </svg>`
    default:
      return `<svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="200" height="80" rx="4" fill="none" stroke="${c}" stroke-width="1" opacity="0.3"/>
        <text x="100" y="45" text-anchor="middle" fill="${c}" font-size="24" font-weight="700" opacity="0.5">◆</text>
      </svg>`
  }
}

/** 生成 McKinsey 风格的 cover 栏（标题重构 + 视觉隐喻 + 核心词放大） */
function renderMckinseyHeader(title: string, summary: string, theme: PremiumThemeName): string {
  const tokens = THEMES[theme]?.designTokens ?? {}
  const t = theme === "mckinsey" ? "mckinsey" : theme
  const accent = t === "mckinsey" ? "#C8A961" : tokens["accent"] || tokens["blue"] || "#0F4C81"
  const navy = t === "mckinsey" ? "#1B2A4A" : tokens["navy"] || tokens["ink"] || "#1D272F"

  const coreWord = extractCoreWord(title)
  const fullTitle = extractFullTitle(title, coreWord)
  const metaphor = detectMetaphor(title, summary)
  const metaphorSVG = renderMetaphorSVG(metaphor, accent)

  return `
  <div class="mck-header" style="background:${navy};color:#fff;margin:-32px -24px 40px;padding:32px 32px 36px;position:relative;overflow:hidden;">
    <div style="position:absolute;right:32px;bottom:0;opacity:0.15;width:200px;height:100px;">
      ${metaphorSVG}
    </div>
    <div class="meta" style="margin-bottom:16px;">
      <span class="tag tag-${t === "mckinsey" ? "gold" : "light"}" style="border-color:${accent};color:${accent};">${metaphor.toUpperCase()}</span>
      <span class="tag tag-light">REPORT</span>
      <span class="tag tag-light">2026</span>
    </div>
    <div class="core-word" style="font-size:clamp(36px,6vw,56px);font-weight:700;line-height:1.1;letter-spacing:-0.02em;margin-bottom:8px;font-family:var(--font-serif,Georgia,serif);">
      ${coreWord}
    </div>
    ${fullTitle ? `<div style="font-size:15px;opacity:0.7;margin-bottom:6px;font-weight:400;">${fullTitle}</div>` : ""}
    ${summary ? `<div style="font-size:13px;opacity:0.5;max-width:70%;line-height:1.5;">${escHtml(summary)}</div>` : ""}
  </div>`
}

// ================================================================
// YouTube 英语教学主题专用 header
// ================================================================
function renderYouTubeHeader(title: string, author: string): string {
  return `
  <div style="background:linear-gradient(135deg,#FF6B35 0%,#FF8C42 100%);color:#fff;margin:-32px -24px 0;padding:40px 32px 32px;border-radius:0 0 24px 24px;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <div style="width:48px;height:48px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;">▶</div>
      <div>
        <div style="font-size:12px;opacity:0.7;text-transform:uppercase;letter-spacing:0.1em;">ENGLISH · TUTORIAL</div>
        <div style="font-size:14px;font-weight:600;">${author || "English Mastery"}</div>
      </div>
    </div>
    <div style="font-size:clamp(24px,4vw,36px);font-weight:700;line-height:1.3;margin-bottom:8px;">${escHtml(title)}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">
      <span style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:12px;">📺 视频课程</span>
      <span style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:12px;">🎯 实景教学</span>
      <span style="background:rgba(255,255,255,0.2);padding:4px 12px;border-radius:20px;font-size:12px;">📝 练习材料</span>
    </div>
  </div>`
}

// ================================================================
// 中国企业 LLM 布道主题专用 header
// ================================================================
function renderEnterpriseHeader(title: string, summary: string): string {
  return `
  <div style="background:linear-gradient(135deg,#8B1A1A 0%,#C41E24 50%,#8B1A1A 100%);color:#fff;margin:-32px -24px 0;padding:40px 32px 32px;position:relative;overflow:hidden;">
    <div style="position:absolute;top:-20px;right:-20px;width:120px;height:120px;border:2px solid rgba(255,255,255,0.08);border-radius:50%;"></div>
    <div style="position:absolute;bottom:-40px;left:-40px;width:200px;height:200px;border:1px solid rgba(255,255,255,0.05);border-radius:50%;"></div>
    <div style="font-size:12px;opacity:0.6;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:12px;">企业数字化转型 · 大模型本地部署 · 战略报告</div>
    <div style="font-size:clamp(22px,3.5vw,32px);font-weight:800;line-height:1.25;margin-bottom:8px;">${escHtml(title)}</div>
    ${summary ? `<div style="font-size:14px;opacity:0.65;max-width:80%;line-height:1.6;">${escHtml(summary)}</div>` : ""}
    <div style="display:flex;gap:12px;margin-top:20px;flex-wrap:wrap;">
      <span style="background:rgba(255,255,255,0.15);padding:4px 14px;border-radius:4px;font-size:11px;font-weight:600;letter-spacing:0.05em;">🏭 制造业</span>
      <span style="background:rgba(255,255,255,0.15);padding:4px 14px;border-radius:4px;font-size:11px;font-weight:600;letter-spacing:0.05em;">🔒 数据安全</span>
      <span style="background:rgba(255,255,255,0.15);padding:4px 14px;border-radius:4px;font-size:11px;font-weight:600;letter-spacing:0.05em;">📈 ROI 分析</span>
      <span style="background:rgba(255,255,255,0.15);padding:4px 14px;border-radius:4px;font-size:11px;font-weight:600;letter-spacing:0.05em;">⚙️ 落地路径</span>
    </div>
  </div>`
}

// ================================================================
// 主渲染函数
// ================================================================

export function renderPremiumPage(
  bodyHtml: string,
  opts: RenderOptions,
): string {
  const themeDef = THEMES[opts.theme]
  const css = themeDef.css
  const fontLink = themeDef.fonts

  const headerHtml = opts.theme === "mckinsey"
    ? renderMckinseyHeader(opts.title, opts.summary, opts.theme)
    : opts.theme === "youtube-english"
    ? renderYouTubeHeader(opts.title, opts.author)
    : opts.theme === "enterprise-cn"
    ? renderEnterpriseHeader(opts.title, opts.summary)
    : defaultHeader(opts.title, opts.summary, opts.theme)

  const sectionLabel = opts.theme === "youtube-english" ? "📚 课程目录" :
    opts.theme === "enterprise-cn" ? "📊 核心指标" : "📖 详细分析"

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(opts.title)}</title>
${fontLink ? `<link href="${fontLink}" rel="stylesheet">` : ""}
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--font-sans);background:var(--paper,var(--gray-50));color:var(--ink,var(--gray-800));-webkit-font-smoothing:antialiased}
.container{max-width:var(--max-w);margin:0 auto;padding:32px 24px 64px}
${opts.theme === "youtube-english" ? ".container{padding-top:0}" : ""}
${opts.theme === "enterprise-cn" ? ".container{padding-top:0}" : ""}
${css}
h2,h3,h4{font-weight:700}
.body ul,.body ol{padding-left:20px;margin:8px 0}
.body li{margin:4px 0}
.body strong{font-weight:600}
.body code,.concept-card code{font-family:var(--font-mono);font-size:0.92em}
a{color:var(--accent,var(--blue));text-decoration:none}
a:hover{text-decoration:underline}
img{max-width:100%;height:auto;border-radius:var(--radius-sm,4px);margin:16px 0}
.mck-header .tag-light{border-color:rgba(255,255,255,0.3);color:rgba(255,255,255,0.7)}
.mck-header .tag-gold{border-color:#C8A961;color:#C8A961}
@media print{.toc-sidebar,.sidebar-toggle,.theme-switcher{display:none!important}body{font-size:11pt;background:#fff;color:#000}}
</style>
</head>
<body>
<div class="container">
${headerHtml}
<section class="section" style="${opts.theme === "youtube-english" ? "margin-top:24px" : ""}">
  <h2 class="section-title">${sectionLabel}</h2>
  <div class="body">
    ${bodyHtml || renderDefaultBody(opts)}
  </div>
</section>
<div class="final-quote">
  <p>${opts.theme === "youtube-english" ? "Keep learning, keep growing. 🌟" :
      opts.theme === "enterprise-cn" ? "AI 不是未来，是现在。本地部署，自主可控。" :
      "本地 LLM 主要是内存数学 + 格式化 + 评估"}</p>
  <div style="font-size:14px;opacity:0.6;margin-top:8px;">${escHtml(opts.title)} · ${opts.theme.toUpperCase()} · Generated by markdown-to-html</div>
</div>
</div>
</body>
</html>`
}

function defaultHeader(title: string, summary: string, theme: string): string {
  return `
  <header class="header">
    <div class="meta">
      <span class="tag tag-${theme === "premium" ? "blue" : "gray"}">${theme.toUpperCase()}</span>
      <span class="tag tag-gray">REPORT</span>
    </div>
    <h1>${escHtml(title)}</h1>
    ${summary ? `<div class="subtitle">${escHtml(summary)}</div>` : ""}
  </header>`
}

function renderDefaultBody(opts: RenderOptions): string {
  // 当没有正文时，从 TOC 生成结构化的章节导航
  if (!opts.toc.length) return "<p>内容加载中...</p>"
  return opts.toc.map(t =>
    `<details class="detail-block"><summary>${escHtml(t.text)}</summary><div class="body"><p>${escHtml(t.text)} — 详细内容待展开。</p></div></details>`
  ).join("\n")
}

function escHtml(s: string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")
}
