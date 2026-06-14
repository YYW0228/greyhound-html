// renderer-premium.ts — 高级主题 HTML 渲染器
// 核心逻辑提取自用户最喜欢的版本: /Users/mac/local-llm-guide-report.html
// 所有主题共用 BASE CSS，仅通过 CSS 变量切换颜色

import { THEMES } from "./themes.js"
import type { PremiumThemeName } from "./constants.js"

export interface RenderOptions {
  title: string
  author: string
  summary: string
  theme: PremiumThemeName
  toc: Array<{ id: string; text: string; level: number }>
}

// ===== 基础 CSS（所有主题共享） =====
const BASE_CSS = `
/* ===== 语义颜色 ===== */
.critical { border-left:4px solid var(--color-critical, #e53e3e); background:var(--bg-critical, #fff5f5); }
.warning  { border-left:4px solid var(--color-warning, #dd6b20); background:var(--bg-warning, #fffaf0); }
.info     { border-left:4px solid var(--color-info, #3182ce); background:var(--bg-info, #ebf8ff); }
.success  { border-left:4px solid var(--color-success, #38a169); background:var(--bg-success, #f0fff4); }
.pending  { border-left:4px solid var(--color-pending, #d69e2e); background:var(--bg-pending, #fffff0); }

/* ===== 基础 ===== */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body {
  font-family:var(--font-sans,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif);
  max-width:var(--content-width,960px); margin:0 auto; padding:24px;
  background:var(--bg-body,#f7fafc); color:var(--color-body,#1a202c); line-height:1.7;
  -webkit-font-smoothing:antialiased;
}

/* ===== 标题 ===== */
h1{font-size:2em;margin-bottom:4px;color:var(--color-heading,#1a202c)}
h2{font-size:1.4em;margin:24px 0 12px;padding-bottom:6px;border-bottom:2px solid var(--color-border,#e2e8f0)}
h3{font-size:1.1em;margin:16px 0 8px}
.subtitle{color:var(--color-muted,#718096);font-size:0.95em;margin-bottom:24px}

/* ===== 网格系统 ===== */
.grid-4{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:16px 0}
.grid-3{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin:16px 0}
.grid-2{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:12px;margin:16px 0}

/* ===== 卡片 ===== */
.card,.critical,.warning,.info,.success,.pending{
  padding:16px;background:var(--bg-card,#fff);border:1px solid var(--color-border,#e2e8f0);
  border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.08);margin:12px 0;
}
.card-label{
  font-size:0.8em;color:var(--color-muted,#718096);text-transform:uppercase;
  letter-spacing:0.05em;margin-bottom:2px;
}
.card-value{font-size:1.6em;font-weight:700;margin:2px 0}
.card-desc{font-size:0.9em;color:var(--color-secondary,#4a5568)}

/* ===== 折叠 ===== */
details{margin:8px 0}
details .critical,details .warning,details .info,details .success,details .pending{margin:8px 0}
summary{
  font-weight:600;cursor:pointer;padding:10px 0;
  font-size:1.05em;user-select:none;
}
summary:hover{color:var(--color-accent,#3182ce)}

/* ===== 标签 ===== */
.tag{display:inline-block;padding:2px 10px;border-radius:4px;font-size:0.8em;font-weight:600;margin:2px}
.tag-red{background:var(--bg-critical,#fed7d7);color:var(--color-critical,#c53030)}
.tag-green{background:var(--bg-success,#c6f6d5);color:var(--color-success,#276749)}
.tag-blue{background:var(--bg-info,#bee3f8);color:var(--color-info,#2b6cb0)}
.tag-yellow{background:var(--bg-pending,#fefcbf);color:var(--color-pending,#975a16)}
.tag-purple{background:#e9d8fd;color:#6b46c1}

/* ===== 图表容器 ===== */
.diagram-box{
  background:var(--bg-card,#fff);border:1px solid var(--color-border,#e2e8f0);
  border-radius:10px;padding:20px;margin:16px 0;text-align:center;
}

/* ===== 代码 ===== */
code{
  background:var(--bg-code,#edf2f7);padding:2px 6px;border-radius:4px;
  font-family:'SF Mono','Fira Code',monospace;font-size:0.9em;
}
pre{
  background:#1a202c;color:#e2e8f0;padding:16px;border-radius:8px;
  overflow-x:auto;font-size:0.85em;line-height:1.5;
}
pre code{background:transparent;padding:0;color:inherit}

/* ===== 表格 ===== */
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:0.9em}
th,td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--color-border,#e2e8f0)}
th{background:var(--bg-secondary,#f7fafc);font-weight:600;color:var(--color-secondary,#4a5568)}
tr:hover{background:var(--bg-secondary,#f7fafc)}

/* ===== 引用 ===== */
blockquote{
  border-left:3px solid var(--color-info,#3182ce);margin:12px 0;padding:8px 16px;
  background:var(--bg-info,#ebf8ff);border-radius:0 8px 8px 0;
  font-style:italic;color:var(--color-body,#2d3748);
}

/* ===== 步骤卡片 ===== */
.step{display:flex;gap:16px;align-items:flex-start;margin:12px 0;padding:12px 16px;background:var(--bg-card,#fff);border-radius:8px;border:1px solid var(--color-border,#e2e8f0)}
.step-num{width:32px;height:32px;background:var(--color-accent,#3182ce);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}

/* ===== 链接 ===== */
a{color:var(--color-accent,#3182ce);text-decoration:none}
a:hover{text-decoration:underline}
img{max-width:100%;height:auto;border-radius:8px;margin:16px 0}

/* ===== 列表 ===== */
ul,ol{padding-left:1.5em;margin:8px 0}
li{margin:4px 0}
strong{font-weight:600}

/* ===== 打印 ===== */
@media print{body{font-size:11pt;background:#fff;color:#000}}
@media(max-width:600px){
  body{padding:16px}
  .grid-4,.grid-3,.grid-2{grid-template-columns:1fr}
  .step{flex-direction:column}
}
`

// ===== Theme: override color variables =====
function themeCSS(theme: string): string {
  const colors: Record<string, string> = {
    premium: `
  --color-critical:#e53e3e; --bg-critical:#fff5f5;
  --color-warning:#dd6b20; --bg-warning:#fffaf0;
  --color-info:#3182ce;    --bg-info:#ebf8ff;
  --color-success:#38a169; --bg-success:#f0fff4;
  --color-pending:#d69e2e; --bg-pending:#fffff0;
  --color-accent:#3182ce;
  --bg-body:#f7fafc; --bg-card:#fff;
  --color-body:#1a202c; --color-heading:#1a202c;
  --color-secondary:#4a5568; --color-muted:#718096;
  --color-border:#e2e8f0; --bg-secondary:#f7fafc; --bg-code:#edf2f7;
  --font-sans:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  --content-width:960px;`,
    mckinsey: `
  --color-critical:#B85450; --bg-critical:#fdf2f2;
  --color-warning:#B8860B; --bg-warning:#fdf8e8;
  --color-info:#1B2A4A;    --bg-info:#e8ecf3;
  --color-success:#2F855A; --bg-success:#e6f7ef;
  --color-pending:#C8A961; --bg-pending:#f5f0e0;
  --color-accent:#C8A961;
  --bg-body:#FAFAF8; --bg-card:#FFFFFF;
  --color-body:#2D3748; --color-heading:#1B2A4A;
  --color-secondary:#5C5A57; --color-muted:#9C9A96;
  --color-border:#E2E0DB; --bg-secondary:#F0EFED; --bg-code:#edf2f7;
  --font-sans:'Helvetica Neue','Noto Sans SC','Microsoft YaHei',sans-serif;
  --content-width:1040px;`,
    wsj: `
  --color-critical:#CC3333; --bg-critical:#fdf2f2;
  --color-warning:#B8963E; --bg-warning:#fdf8e8;
  --color-info:#006699;    --bg-info:#e0edf5;
  --color-success:#2F855A; --bg-success:#e6f7ef;
  --color-pending:#B8963E; --bg-pending:#f5f0e0;
  --color-accent:#006699;
  --bg-body:#F7F5F0; --bg-card:#FCFAF5;
  --color-body:#111111; --color-heading:#111111;
  --color-secondary:#333333; --color-muted:#666666;
  --color-border:#D4D0C6; --bg-secondary:#E8E5DD; --bg-code:#edf2f7;
  --font-sans:'Georgia','Noto Serif SC','Source Han Serif SC',serif;
  --content-width:900px;`,
    "blackrock": `
  --color-critical:#C53030; --bg-critical:#fde8e8;
  --color-warning:#B8860B; --bg-warning:#fdf6e3;
  --color-info:#2B6CB0;    --bg-info:#e6eff9;
  --color-success:#2F855A; --bg-success:#e6f7ef;
  --color-pending:#D69E2E; --bg-pending:#fffff0;
  --color-accent:#2B6CB0;
  --bg-body:#F7F8F9; --bg-card:#FFFFFF;
  --color-body:#1D272F; --color-heading:#1D272F;
  --color-secondary:#4A5568; --color-muted:#8B95A5;
  --color-border:#D1D5DB; --bg-secondary:#EDEFF2; --bg-code:#edf2f7;
  --font-sans:'Inter','Helvetica Neue','Noto Sans SC',sans-serif;
  --content-width:1000px;`,
    "youtube-english": `
  --color-critical:#E53E3E; --bg-critical:#fde8e8;
  --color-warning:#FF8C42; --bg-warning:#fff0e8;
  --color-info:#2563EB;    --bg-info:#dbeafe;
  --color-success:#0D9488; --bg-success:#ccfbf1;
  --color-pending:#FF6B35; --bg-pending:#fff0e8;
  --color-accent:#FF6B35;
  --bg-body:#FFFAF5; --bg-card:#FFFFFF;
  --color-body:#1F2937; --color-heading:#1F2937;
  --color-secondary:#4B5563; --color-muted:#9CA3AF;
  --color-border:#E5E7EB; --bg-secondary:#F3F4F6; --bg-code:#f3f4f6;
  --font-sans:'Inter','Noto Sans SC','PingFang SC',sans-serif;
  --content-width:960px;`,
    "enterprise-cn": `
  --color-critical:#C41E24; --bg-critical:#fde8e8;
  --color-warning:#B8860B; --bg-warning:#fdf6e3;
  --color-info:#1B2A4A;    --bg-info:#e8ecf3;
  --color-success:#2F855A; --bg-success:#e6f7ef;
  --color-pending:#B8860B; --bg-pending:#faecc8;
  --color-accent:#C41E24;
  --bg-body:#FEFCF8; --bg-card:#FFFFFF;
  --color-body:#222222; --color-heading:#1B2A4A;
  --color-secondary:#555555; --color-muted:#888888;
  --color-border:#E0DDD6; --bg-secondary:#F5F3F0; --bg-code:#f3f3f0;
  --font-sans:'Noto Sans SC','PingFang SC','Microsoft YaHei UI',sans-serif;
  --content-width:1020px;`,
  }
  return `:root{${colors[theme] || colors.premium}}`
}

// ===== 生成完整 HTML =====
export function renderPremiumPage(
  bodyHtml: string,
  opts: RenderOptions,
): string {
  const theme = opts.theme
  const pageTitle = opts.title

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(pageTitle)}</title>
<style>
${themeCSS(theme)}
${BASE_CSS}
</style>
</head>
<body>

<h1>${escHtml(pageTitle)}</h1>
<div class="subtitle">
  ${opts.author ? `${escHtml(opts.author)} · ` : ""}
  ${opts.summary ? escHtml(opts.summary) : ""}
  <br>
  <span class="tag tag-blue">${theme.toUpperCase()}</span>
  <span class="tag tag-purple">REPORT</span>
  <span class="tag tag-green">2026</span>
</div>

<!-- ===== 核心指标 ===== -->
<h2>📊 核心指标速览</h2>
<div class="grid-4">
  <div class="card">
    <div class="card-label">核心循环</div>
    <div class="card-value" style="color:var(--color-info)">6 步</div>
    <div class="card-desc">Token → Transformer → Attention → KV Cache → Decode → Repeat</div>
  </div>
  <div class="card">
    <div class="card-label">推荐 VRAM</div>
    <div class="card-value" style="color:var(--color-success)">16-24 GB</div>
    <div class="card-desc">2026 年本地用户最低舒适层</div>
  </div>
  <div class="card">
    <div class="card-label">量化甜区</div>
    <div class="card-value" style="color:var(--color-warning)">Q4-Q5</div>
    <div class="card-desc">消费级本地部署的最佳权衡</div>
  </div>
  <div class="card">
    <div class="card-label">关键家族</div>
    <div class="card-value" style="color:var(--color-pending)">6+</div>
    <div class="card-desc">Qwen / Gemma / DeepSeek / Mistral / Kimi / Nemotron</div>
  </div>
</div>

<!-- ===== 推理核心循环 SVG ===== -->
<h2>🔄 推理核心循环</h2>
<div class="diagram-box">
  ${renderFlowSVG()}
</div>

<!-- ===== 详细分析 ===== -->
<h2>📖 详细分析</h2>

${bodyHtml || renderDefaultBody(opts.toc)}

<!-- ===== 结语 ===== -->
<div class="success" style="text-align:center;margin-top:32px;padding:24px;">
  <strong>本地 LLM 主要是内存数学 + 格式化 + 评估</strong><br>
  <span style="font-size:0.9em;color:var(--color-muted);">${escHtml(pageTitle)} · ${theme.toUpperCase()} · Generated by markdown-to-html</span>
</div>

</body>
</html>`
}

// ===== SVG 流程图 =====
function renderFlowSVG(): string {
  return `<svg viewBox="0 0 800 160" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;">
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#4a5568"/>
      </marker>
    </defs>
    <rect x="0" y="0" width="800" height="160" rx="12" fill="#f7fafc"/>
    <rect x="20" y="30" width="110" height="60" rx="8" fill="#3182ce" opacity="0.9"/>
    <text x="75" y="55" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">📝 文本 → Token</text>
    <text x="75" y="72" text-anchor="middle" fill="#bee3f8" font-size="11">分词器编码</text>
    <line x1="130" y1="60" x2="170" y2="60" stroke="#4a5568" stroke-width="2" marker-end="url(#arrow)"/>
    <rect x="175" y="30" width="110" height="60" rx="8" fill="#6b46c1" opacity="0.9"/>
    <text x="230" y="55" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">🏗️ Transformer</text>
    <text x="230" y="72" text-anchor="middle" fill="#e9d8fd" font-size="11">嵌入 + 位置编码</text>
    <line x1="285" y1="60" x2="325" y2="60" stroke="#4a5568" stroke-width="2" marker-end="url(#arrow)"/>
    <rect x="330" y="30" width="110" height="60" rx="8" fill="#38a169" opacity="0.9"/>
    <text x="385" y="55" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">👁️ Attention</text>
    <text x="385" y="72" text-anchor="middle" fill="#c6f6d5" font-size="11">决定哪些 token 重要</text>
    <line x1="440" y1="60" x2="480" y2="60" stroke="#4a5568" stroke-width="2" marker-end="url(#arrow)"/>
    <rect x="485" y="30" width="110" height="60" rx="8" fill="#dd6b20" opacity="0.9"/>
    <text x="540" y="55" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">💾 KV Cache</text>
    <text x="540" y="72" text-anchor="middle" fill="#fffaf0" font-size="11">工作内存复用</text>
    <line x1="595" y1="60" x2="635" y2="60" stroke="#4a5568" stroke-width="2" marker-end="url(#arrow)"/>
    <rect x="640" y="30" width="140" height="60" rx="8" fill="#e53e3e" opacity="0.9"/>
    <text x="710" y="55" text-anchor="middle" fill="#fff" font-size="13" font-weight="600">🎯 Decode</text>
    <text x="710" y="72" text-anchor="middle" fill="#fff5f5" font-size="11">选择 → 采样 → 输出</text>
    <path d="M 710 95 L 710 120 L 75 120 L 75 95" fill="none" stroke="#4a5568" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrow)"/>
    <text x="390" y="138" text-anchor="middle" fill="#718096" font-size="11">🔄 重复直到停止条件</text>
    <text x="390" y="155" text-anchor="middle" fill="#a0aec0" font-size="10">f(θ, sequence) → probability distribution over next_token</text>
  </svg>`
}

function renderDefaultBody(toc: Array<{id:string;text:string;level:number}>): string {
  if (!toc.length) return "<p>内容加载中...</p>"
  return toc.map(t => {
    const icon = t.level === 1 ? "📌" : t.level === 2 ? "▸" : "•"
    return `<details>
  <summary>${icon} ${escHtml(t.text)}</summary>
  <div class="info">
    <p>${escHtml(t.text)} — 详细内容待展开。</p>
  </div>
</details>`
  }).join("\n")
}

function escHtml(s: string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")
}
