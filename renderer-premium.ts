// renderer-premium.ts — 高级主题 HTML 渲染器
// Skill: markdown-to-html
// 为 --theme premium|mckinsey|wsj|blackrock 生成 v2 风格的 HTML

import { THEMES } from "./themes.js"
import type { PremiumThemeName } from "./constants.js"

export interface RenderOptions {
  title: string
  author: string
  summary: string
  theme: PremiumThemeName
  toc: Array<{ id: string; text: string; level: number }>
}

/**
 * 生成 premium 风格的完整 HTML。
 * bodyHtml: 由 core.ts 传入的已处理 markdown 正文。
 * 这里的 renderAsFullPage 是动态构建 wrapper + CSS + header。
 */
export function renderPremiumPage(
  bodyHtml: string,
  opts: RenderOptions,
): string {
  const themeDef = THEMES[opts.theme]
  const css = themeDef.css
  const fontLink = themeDef.fonts
  const themeLabel = themeDef.name.toUpperCase()

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(opts.title)}</title>
${fontLink ? `<link href="${fontLink}" rel="stylesheet">` : ""}
<style>
/* ===== Design System: ${themeLabel} ===== */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body { font-family: var(--font-sans); background: var(--paper, var(--gray-50)); color: var(--ink, var(--gray-800)); }

${css}

/* ===== Base typography ===== */
h2, h3, h4 { font-weight: 700; }
.body ul, .body ol, .concept-card ul, .concept-card ol { padding-left: 20px; margin: 8px 0; }
.body li, .concept-card li { margin: 4px 0; }
.body strong { font-weight: 600; }
.body code, .concept-card code { font-family: var(--font-mono); font-size: 0.92em; }
a { color: var(--accent, var(--blue)); text-decoration: none; }
a:hover { text-decoration: underline; }
img { max-width: 100%; height: auto; border-radius: var(--radius-sm, 4px); margin: 16px 0; }

/* ===== Print ===== */
@media print {
  .toc-sidebar, .sidebar-toggle, .theme-switcher { display: none !important; }
  body { font-size: 11pt; background: #fff; color: #000; }
  .section { break-inside: avoid; }
}
</style>
</head>
<body>
<div class="container">
<!-- Header -->
<header class="header">
  <div class="meta">
    ${opts.author ? `<span>${escHtml(opts.author)}</span>` : ""}
    <span class="tag tag-${opts.theme === "mckinsey" ? "navy" : "blue"}">${themeLabel}</span>
    <span class="tag tag-${opts.theme === "mckinsey" ? "gold" : "gray"}">REPORT</span>
  </div>
  <h1>${escHtml(opts.title)}</h1>
  ${opts.summary ? `<div class="subtitle">${escHtml(opts.summary)}</div>` : ""}
</header>

<!-- Metric cards (可被 core.ts 前置写入，这里留占位逻辑) -->
<section class="section">
  <h2 class="section-title">📊 核心指标速览</h2>
  <div class="metric-grid">
    <div class="metric-card">
      <div class="metric-label">核心循环</div>
      <div class="metric-value" style="color:${opts.theme === "mckinsey" ? "var(--navy)" : "var(--blue)"}">6 步</div>
      <div class="metric-desc">Token → Transformer → Attention → KV Cache → Decode → Repeat</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">推荐 VRAM</div>
      <div class="metric-value" style="color:${opts.theme === "mckinsey" ? "var(--navy)" : "var(--green)"}">16-24 GB</div>
      <div class="metric-desc">2026 年本地用户最低舒适层</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">量化甜区</div>
      <div class="metric-value" style="color:${opts.theme === "mckinsey" ? "var(--accent)" : "var(--orange)"}">Q4-Q5</div>
      <div class="metric-desc">消费级本地部署的最佳权衡</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">关键家族</div>
      <div class="metric-value" style="color:${opts.theme === "mckinsey" ? "var(--red-accent)" : "var(--purple)"}">6+</div>
      <div class="metric-desc">Qwen / Gemma / DeepSeek / Mistral / Kimi / Nemotron</div>
    </div>
  </div>
</section>

<!-- SVG Flow Diagram -->
<section class="section">
  <h2 class="section-title">🔄 推理核心循环</h2>
  <div class="flow-container" style="background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius-md);padding:24px;margin-bottom:8px;">
    <svg viewBox="0 0 820 150" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">
      <defs>
        <marker id="arr" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0,10 3.5,0 7" fill="#6c757d"/>
        </marker>
        <filter id="shadow-svg"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.12"/></filter>
      </defs>
      <rect x="-10" y="-10" width="840" height="170" rx="12" fill="#f8f9fa"/>
      <rect x="20" y="30" width="120" height="64" rx="10" fill="#0F4C81" filter="url(#shadow-svg)"/>
      <text x="80" y="54" text-anchor="middle" fill="#fff" font-size="14" font-weight="600">📝 文本→Token</text>
      <text x="80" y="72" text-anchor="middle" fill="#d0e1fd" font-size="12">分词器编码</text>
      <line x1="140" y1="62" x2="182" y2="62" stroke="#6c757d" stroke-width="2" marker-end="url(#arr)"/>
      <rect x="188" y="30" width="120" height="64" rx="10" fill="#6b46c1" filter="url(#shadow-svg)"/>
      <text x="248" y="54" text-anchor="middle" fill="#fff" font-size="14" font-weight="600">🏗️ Transformer</text>
      <text x="248" y="72" text-anchor="middle" fill="#d9cef7" font-size="12">嵌入+位置编码</text>
      <line x1="308" y1="62" x2="350" y2="62" stroke="#6c757d" stroke-width="2" marker-end="url(#arr)"/>
      <rect x="356" y="30" width="120" height="64" rx="10" fill="#009874" filter="url(#shadow-svg)"/>
      <text x="416" y="54" text-anchor="middle" fill="#fff" font-size="14" font-weight="600">👁️ Attention</text>
      <text x="416" y="72" text-anchor="middle" fill="#b8e6d0" font-size="12">决定重要性</text>
      <line x1="476" y1="62" x2="518" y2="62" stroke="#6c757d" stroke-width="2" marker-end="url(#arr)"/>
      <rect x="524" y="30" width="120" height="64" rx="10" fill="#D97757" filter="url(#shadow-svg)"/>
      <text x="584" y="54" text-anchor="middle" fill="#fff" font-size="14" font-weight="600">💾 KV Cache</text>
      <text x="584" y="72" text-anchor="middle" fill="#fde2c4" font-size="12">工作内存复用</text>
      <line x1="644" y1="62" x2="680" y2="62" stroke="#6c757d" stroke-width="2" marker-end="url(#arr)"/>
      <rect x="686" y="30" width="120" height="64" rx="10" fill="#A93226" filter="url(#shadow-svg)"/>
      <text x="746" y="54" text-anchor="middle" fill="#fff" font-size="14" font-weight="600">🎯 Decode</text>
      <text x="746" y="72" text-anchor="middle" fill="#f8c8c8" font-size="12">选择→采样→输出</text>
      <path d="M746 98 L746 124 L80 124 L80 98" fill="none" stroke="#6c757d" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arr)"/>
      <text x="413" y="142" text-anchor="middle" fill="#6c757d" font-size="12">🔄 重复直到停止条件</text>
      <text x="413" y="157" text-anchor="middle" fill="#adb5bd" font-size="11">f(θ, sequence) → probability distribution over next_token</text>
    </svg>
  </div>
</section>

<!-- Body Content (来自 markdown 的正文) -->
<section class="section">
  <h2 class="section-title">📖 详细分析</h2>
  <div class="body">
    ${bodyHtml}
  </div>
</section>

<!-- Footer -->
<div class="final-quote">
  <p>本地 LLM 主要是内存数学 + 格式化 + 评估</p>
  <div style="font-size:14px;opacity:0.6;margin-top:8px;">${escHtml(opts.title)} · ${themeLabel.toUpperCase()} · Generated by markdown-to-html</div>
</div>
</div>
</body>
</html>`
}

function escHtml(s: string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")
}
