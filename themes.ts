// themes.ts — 高级主题 CSS 骨架与设计 Token
// Skill: markdown-to-html
// 为 --theme premium|mckinsey|wsj|blackrock 提供完整 CSS 设计系统

export interface ThemeDefinition {
  name: string
  description: string
  designTokens: Record<string, string>
  css: string      // 完整 CSS 骨架（由 designTokens 编译 or 手写）
  fonts: string    // Google Fonts / @font-face 引用（空字符串表示无外部依赖）
}

// ===== 编译函数：从 designTokens 生成 CSS 变量 + 基础样式 =====
function compileCSS(tokens: Record<string, string>, overrides: string): string {
  const vars = Object.entries(tokens)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n")
  return `:root {
${vars}
}
${overrides}`
}

// ================================================================
// THEME: premium — 基于 v2 报告的设计系统
// ================================================================
const premiumTokens: Record<string, string> = {
  "blue": "#0F4C81", "blue-light": "#e8f0fe", "blue-bg": "#d0e1fd",
  "green": "#009874", "green-light": "#e6f7f0", "green-bg": "#b8e6d0",
  "orange": "#D97757", "orange-light": "#fef3e9", "orange-bg": "#fde2c4",
  "purple": "#6b46c1", "purple-light": "#f0ecfc", "purple-bg": "#d9cef7",
  "red": "#A93226", "red-light": "#fde8e8", "red-bg": "#f8c8c8",
  "gray-50": "#f8f9fa", "gray-100": "#f1f3f5", "gray-200": "#e9ecef",
  "gray-300": "#dee2e6", "gray-400": "#ced4da", "gray-500": "#adb5bd",
  "gray-600": "#6c757d", "gray-700": "#495057", "gray-800": "#343a40",
  "gray-900": "#212529",
  "font-sans": "-apple-system, 'SF Pro Text', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  "font-mono": "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
  "shadow-sm": "0 1px 3px rgba(0,0,0,0.06)",
  "shadow-md": "0 4px 6px rgba(0,0,0,0.05)",
  "shadow-lg": "0 10px 25px rgba(0,0,0,0.06)",
  "radius-sm": "8px", "radius-md": "12px", "radius-lg": "16px",
  "max-w": "960px",
}

const premiumCSS = `
body { font-family: var(--font-sans); font-size: 15px; line-height: 1.7; color: var(--gray-800); background: var(--gray-50); }
.container { max-width: var(--max-w); margin: 0 auto; padding: 32px 24px 64px; }
.tag { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.tag-blue { background: var(--blue-bg); color: var(--blue); }
.tag-purple { background: var(--purple-bg); color: var(--purple); }
.tag-green { background: var(--green-bg); color: var(--green); }
.tag-orange { background: var(--orange-bg); color: var(--orange); }
.tag-red { background: var(--red-bg); color: var(--red); }
.tag-gray { background: var(--gray-200); color: var(--gray-700); }
.section-title { font-size: 20px; font-weight: 700; color: var(--gray-900); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.metric-card { background: #fff; border: 1px solid var(--gray-200); border-radius: var(--radius-md); padding: 20px; box-shadow: var(--shadow-sm); transition: box-shadow 0.2s, transform 0.2s; }
.metric-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
.metric-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gray-500); margin-bottom: 4px; }
.metric-value { font-size: 28px; font-weight: 800; line-height: 1.2; margin-bottom: 4px; }
.metric-desc { font-size: 13px; color: var(--gray-600); }
.concept-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.concept-card { background: #fff; border: 1px solid var(--gray-200); border-radius: var(--radius-md); padding: 20px; box-shadow: var(--shadow-sm); }
.concept-card .icon { font-size: 24px; margin-bottom: 8px; }
.concept-card h3 { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
.concept-card p { font-size: 14px; color: var(--gray-600); }
details.detail-block { margin: 12px 0; border: 1px solid var(--gray-200); border-radius: var(--radius-md); overflow:hidden; background:#fff; box-shadow:var(--shadow-sm); }
details.detail-block[open] { box-shadow:var(--shadow-md); }
details.detail-block summary { padding:14px 20px; cursor:pointer; font-size:15px; font-weight:600; display:flex; align-items:center; gap:8px; user-select:none; }
details.detail-block summary::before { content:"▶"; font-size:10px; color:var(--gray-500); transition:transform 0.2s; margin-right:4px; }
details.detail-block[open] summary::before { transform:rotate(90deg); }
details.detail-block .body { padding:0 20px 16px; font-size:14px; color:var(--gray-700); }
.border-blue  { border-left:4px solid var(--blue)   !important; }
.border-green { border-left:4px solid var(--green)  !important; }
.border-orange{border-left:4px solid var(--orange) !important; }
.border-purple{border-left:4px solid var(--purple) !important; }
.border-red   { border-left:4px solid var(--red)    !important; }
.bg-blue  { background:var(--blue-light)   !important; }
.bg-green { background:var(--green-light)  !important; }
.bg-orange{ background:var(--orange-light) !important; }
.bg-purple{ background:var(--purple-light) !important; }
.bg-red   { background:var(--red-light)    !important; }
.step-item { display:flex; gap:12px; align-items:flex-start; padding:12px 14px; margin:8px 0; background:var(--gray-50); border-radius:var(--radius-sm); }
.step-num { width:28px; height:28px; border-radius:50%; background:var(--blue); color:#fff; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700; flex-shrink:0; }
.mini-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:10px; margin:12px 0; }
.mini-card { padding:12px 14px; border-radius:var(--radius-sm); border:1px solid var(--gray-200); font-size:13px; }
.family-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.family-card { padding:14px; border-radius:var(--radius-sm); border:1px solid var(--gray-200); font-size:13px; }
.scenario-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px; }
.scenario-card { padding:12px; border-radius:var(--radius-sm); font-size:13px; }
blockquote { margin:12px 0; padding:10px 14px; border-left:3px solid var(--blue); background:var(--blue-light); border-radius:0 var(--radius-sm) var(--radius-sm) 0; color:var(--gray-700); font-style:italic; }
table { width:100%; border-collapse:collapse; margin:12px 0; font-size:13px; }
th,td { padding:10px 12px; text-align:left; border-bottom:1px solid var(--gray-200); }
th { background:var(--gray-50); font-weight:600; color:var(--gray-700); }
.final-quote { margin-top:40px; padding:24px; background:linear-gradient(135deg,var(--gray-900) 0%,#1a1a2e 100%); border-radius:var(--radius-md); color:#fff; text-align:center; }
.final-quote p { font-size:18px; font-weight:600; }
@media(max-width:768px){ .metric-grid{grid-template-columns:repeat(2,1fr)} .concept-grid{grid-template-columns:1fr} .family-grid{grid-template-columns:1fr} }
@media(max-width:480px){ .metric-grid{grid-template-columns:1fr} }
`

// ================================================================
// THEME: mckinsey — 麦肯锡风格（深蓝+白+灰金，极致克制）
// ================================================================
const mckinseyTokens: Record<string, string> = {
  "navy": "#1B2A4A", "navy-light": "#e8ecf3", "navy-bg": "#d0d8e8",
  "accent": "#C8A961", "accent-light": "#f5f0e0",  // 低调金
  "red-accent": "#B85450",
  "gray-50": "#FAFAF8", "gray-100": "#F0EFED", "gray-200": "#E2E0DB",
  "gray-500": "#9C9A96", "gray-700": "#5C5A57", "gray-900": "#1A1917",
  "font-sans": "'Helvetica Neue', 'Noto Sans SC', 'Microsoft YaHei', sans-serif",
  "font-serif": "'Georgia', 'Noto Serif SC', serif",
  "font-mono": "'SF Mono', 'JetBrains Mono', monospace",
  "shadow-sm": "0 1px 2px rgba(0,0,0,0.04)",
  "shadow-md": "0 2px 8px rgba(0,0,0,0.06)",
  "radius-sm": "4px", "radius-md": "8px", "radius-lg": "12px",
  "max-w": "1040px",
}

const mckinseyCSS = `
body { font-family: var(--font-sans); font-size: 14.5px; line-height: 1.8; color: var(--gray-700); background: var(--gray-50); }
.container { max-width: var(--max-w); margin: 0 auto; padding: 40px 32px 80px; }
.header { border-bottom: 1px solid var(--gray-200); padding-bottom: 20px; margin-bottom: 32px; }
.header h1 { font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--navy); letter-spacing: -0.01em; }
.header .subtitle { font-size: 13px; color: var(--gray-500); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; }
.tag { display: inline-block; padding: 2px 10px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; border: 1px solid; }
.tag-navy { border-color: var(--navy); color: var(--navy); }
.tag-gold { border-color: var(--accent); color: var(--accent); }
.tag-gray { border-color: var(--gray-500); color: var(--gray-500); }
.section-title { font-size: 16px; font-weight: 700; color: var(--navy); margin-bottom: 20px; padding-bottom: 8px; border-bottom: 2px solid var(--navy); }
.metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.metric-card { background: #fff; border: 1px solid var(--gray-200); padding: 16px 20px; }
.metric-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray-500); margin-bottom: 4px; }
.metric-value { font-size: 22px; font-weight: 700; color: var(--navy); line-height: 1.2; margin-bottom: 2px; }
.metric-desc { font-size: 12px; color: var(--gray-500); }
.concept-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.concept-card { background: #fff; border: 1px solid var(--gray-200); padding: 16px 20px; }
.concept-card h3 { font-size: 14px; font-weight: 700; color: var(--navy); margin-bottom: 6px; }
.concept-card p { font-size: 13px; color: var(--gray-700); line-height: 1.6; }
details.detail-block { margin: 8px 0; border: 1px solid var(--gray-200); background:#fff; }
details.detail-block summary { padding:12px 20px; cursor:pointer; font-size:14px; font-weight:600; color:var(--navy); }
details.detail-block .body { padding:0 20px 14px; font-size:13px; color:var(--gray-700); }
blockquote { margin:12px 0; padding:8px 16px; border-left:3px solid var(--accent); color:var(--gray-500); font-style:italic; font-size:13px; }
table { width:100%; border-collapse:collapse; margin:12px 0; font-size:12.5px; }
th,td { padding:8px 12px; text-align:left; border-bottom:1px solid var(--gray-200); }
th { background: var(--gray-100); font-weight:600; color:var(--navy); font-size:11px; text-transform:uppercase; letter-spacing:0.05em; }
.border-left-navy { border-left:3px solid var(--navy); padding-left:12px; }
.final-quote { margin-top:48px; padding:24px 32px; background: var(--navy); color: #fff; text-align:center; }
.final-quote p { font-size:17px; font-weight:600; font-family:var(--font-serif); }
.step-item { display:flex; gap:12px; padding:10px 14px; margin:6px 0; background:var(--gray-100); }
.step-num { width:24px; height:24px; background:var(--navy); color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; flex-shrink:0; }
.mini-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:10px; }
.mini-card { padding:10px 14px; border-left:3px solid var(--navy); background:var(--gray-100); font-size:12px; }
@media(max-width:768px){ .metric-grid{grid-template-columns:repeat(2,1fr)} .concept-grid{grid-template-columns:1fr} }
`

// ================================================================
// THEME: wsj — 华尔街日报风格（衬线字体+窄栏目+报章质感）
// ================================================================
const wsjTokens: Record<string, string> = {
  "ink": "#111111", "ink-light": "#333333", "ink-muted": "#666666",
  "paper": "#F7F5F0", "paper-light": "#FCFAF5",
  "accent": "#006699", "accent-light": "#e0edf5",
  "red": "#CC3333", "gold": "#B8963E",
  "gray-100": "#E8E5DD", "gray-200": "#D4D0C6",
  "font-serif": "'Georgia', 'Noto Serif SC', 'Source Han Serif SC', serif",
  "font-sans": "'Helvetica Neue', Arial, sans-serif",
  "font-mono": "'Courier New', monospace",
  "max-w": "900px",
}

const wsjCSS = `
body { font-family: var(--font-serif); font-size: 16px; line-height: 1.7; color: var(--ink); background: var(--paper); }
.container { max-width: var(--max-w); margin: 0 auto; padding: 24px 20px 48px; }
.rule { border: none; height: 1px; background: var(--gray-200); margin: 24px 0; }
.header h1 { font-size: 30px; font-weight: 700; color: var(--ink); line-height: 1.15; margin-bottom: 8px; }
.header .subtitle { font-size: 14px; color: var(--ink-muted); font-family: var(--font-sans); }
.header .meta { font-size: 11px; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.05em; font-family: var(--font-sans); }
.tag { display: inline-block; padding: 1px 8px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-family: var(--font-sans); border: 1px solid var(--ink-muted); color: var(--ink-muted); }
.section-title { font-family: var(--font-sans); font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink-muted); margin-bottom: 16px; }
.metric-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
.metric-card { border-top: 3px solid var(--ink); padding: 12px 0; }
.metric-value { font-size: 26px; font-weight: 700; color: var(--ink); }
.metric-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--ink-muted); font-family: var(--font-sans); }
.metric-desc { font-size: 12px; color: var(--ink-muted); font-family: var(--font-sans); }
.concept-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
.concept-card { border-bottom: 1px solid var(--gray-200); padding: 12px 0; }
.concept-card h3 { font-size: 17px; font-weight: 700; color: var(--ink); }
.concept-card p { font-size: 14px; color: var(--ink-light); }
details.detail-block { margin: 12px 0; border-bottom: 1px solid var(--gray-200); }
details.detail-block summary { padding: 12px 0; cursor:pointer; font-size: 17px; font-weight: 700; color: var(--ink); }
details.detail-block .body { padding: 0 0 16px; font-size: 15px; color: var(--ink-light); }
blockquote { margin: 16px 0; padding: 12px 20px; background: var(--paper-light); border-left: 1px solid var(--accent); color: var(--ink-muted); font-style: italic; }
table { width:100%; border-collapse:collapse; margin:16px 0; font-size:14px; font-family:var(--font-sans); }
th,td { padding:8px 10px; text-align:left; border-bottom:1px solid var(--gray-100); }
th { font-size:11px; text-transform:uppercase; letter-spacing:0.05em; color:var(--ink-muted); }
.final-quote { margin-top:40px; padding:24px; border:1px solid var(--gray-200); text-align:center; }
.final-quote p { font-size:18px; font-weight:700; }
@media(max-width:768px){ .metric-grid{grid-template-columns:repeat(2,1fr)} .concept-grid{grid-template-columns:1fr} }
`

// ================================================================
// THEME: blackrock — 贝莱德财报风格（深色header+数据驱动+碳灰）
// ================================================================
const blackrockTokens: Record<string, string> = {
  "header-bg": "#1D272F", "header-text": "#FFFFFF",
  "ink": "#1D272F", "ink-light": "#4A5568",
  "accent": "#2B6CB0", "accent-light": "#e6eff9",
  "green": "#2F855A", "red": "#C53030",
  "gray-50": "#F7F8F9", "gray-100": "#EDEFF2", "gray-200": "#D1D5DB",
  "gray-500": "#8B95A5", "gray-700": "#4A5568",
  "font-sans": "'Inter', 'Helvetica Neue', 'Noto Sans SC', sans-serif",
  "font-mono": "'SF Mono', 'JetBrains Mono', monospace",
  "radius-sm": "2px", "radius-md": "4px",
  "max-w": "1000px",
}

const blackrockCSS = `
body { font-family: var(--font-sans); font-size: 14px; line-height: 1.6; color: var(--ink); background: var(--gray-50); }
.container { max-width: var(--max-w); margin: 0 auto; padding: 0 24px 64px; }
.header { background: var(--header-bg); color: var(--header-text); margin: 0 -24px 32px; padding: 32px; }
.header h1 { font-size: 24px; font-weight: 700; letter-spacing: -0.01em; }
.header .subtitle { font-size: 13px; opacity: 0.7; margin-top: 4px; }
.header .meta { font-size: 11px; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.08em; }
.tag { display: inline-block; padding: 2px 8px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid; }
.tag-light { border-color: rgba(255,255,255,0.4); color: rgba(255,255,255,0.8); }
.tag-dark { border-color: var(--gray-200); color: var(--gray-500); }
.section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--ink); margin-bottom: 16px; padding-bottom: 6px; border-bottom: 2px solid var(--ink); display:flex; align-items:center; gap:8px; }
.metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.metric-card { background: #fff; border: 1px solid var(--gray-200); padding: 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.04); }
.metric-value { font-size: 22px; font-weight: 700; color: var(--ink); }
.metric-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gray-500); }
.metric-desc { font-size: 12px; color: var(--gray-500); }
.concept-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.concept-card { background: #fff; border: 1px solid var(--gray-200); padding: 16px; }
.concept-card h3 { font-size: 14px; font-weight: 700; color: var(--ink); }
.concept-card p { font-size: 13px; color: var(--ink-light); }
details.detail-block { margin: 8px 0; border: 1px solid var(--gray-200); background:#fff; }
details.detail-block summary { padding: 12px 16px; cursor:pointer; font-size: 13px; font-weight: 700; color: var(--ink); }
details.detail-block .body { padding: 0 16px 14px; font-size: 13px; color: var(--ink-light); }
blockquote { margin: 12px 0; padding: 8px 14px; border-left: 3px solid var(--accent); background: var(--accent-light); font-size: 13px; }
table { width:100%; border-collapse:collapse; margin:12px 0; font-size:12.5px; }
th,td { padding:8px 10px; text-align:left; border-bottom:1px solid var(--gray-200); }
th { font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:var(--gray-500); }
.final-quote { margin-top:40px; padding:20px 24px; background: var(--header-bg); color: #fff; text-align:center; }
.final-quote p { font-size:16px; font-weight:600; }
@media(max-width:768px){ .metric-grid{grid-template-columns:repeat(2,1fr)} .concept-grid{grid-template-columns:1fr} }
`

// ================================================================
// 主题注册表
// ================================================================

export const THEMES: Record<string, ThemeDefinition> = {
  premium: {
    name: "premium",
    description: "v2 报告风 — 彩色卡片+SVG流程+折叠详情的现代化报告",
    designTokens: premiumTokens,
    css: compileCSS(premiumTokens, premiumCSS),
    fonts: "",
  },
  mckinsey: {
    name: "mckinsey",
    description: "麦肯锡风格 — 深蓝+金+衬线标题，极致理性克制",
    designTokens: mckinseyTokens,
    css: compileCSS(mckinseyTokens, mckinseyCSS),
    fonts: "",
  },
  wsj: {
    name: "wsj",
    description: "华尔街日报风格 — 衬线排版+报章质感+窄栏目",
    designTokens: wsjTokens,
    css: compileCSS(wsjTokens, wsjCSS),
    fonts: "",
  },
  blackrock: {
    name: "blackrock",
    description: "贝莱德财报风格 — 深色顶栏+数据驱动+碳灰配色",
    designTokens: blackrockTokens,
    css: compileCSS(blackrockTokens, blackrockCSS),
    fonts: "",
  },
}

/** 新增主题名称列表（在 baoyu-md 的 default/grace/simple/modern 基础上扩展）*/
export const PREMIUM_THEME_NAMES = Object.keys(THEMES)
