// component-registry.ts — 组件库 + 主题系统重构 (L3.2)
// 主题只定义 Design Tokens，组件样式自动编译
// Skill: markdown-to-html

// ===== Design Token 类型 =====
export interface DesignTokens {
  colors: Record<string, string>
  typography: Record<string, string>
  spacing: Record<string, string>
  radius: Record<string, string>
  shadow: Record<string, string>
  layout: Record<string, string>
}

// ===== 组件定义 =====
export interface ComponentDef {
  name: string
  selector: string
  css: (tokens: DesignTokens) => string
  variants?: Record<string, (tokens: DesignTokens) => string>
}

// ===== 主题定义 =====
export interface ThemeDef {
  name: string
  description: string
  tokens: DesignTokens
  extends?: string  // 可继承其他主题
}

// ===== 组件注册表 =====
export class ComponentRegistry {
  private components = new Map<string, ComponentDef>()
  private themes = new Map<string, ThemeDef>()

  // ---- 组件注册 ----
  register(component: ComponentDef): void {
    this.components.set(component.name, component)
  }

  get(name: string): ComponentDef | undefined {
    return this.components.get(name)
  }

  listComponents(): string[] {
    return [...this.components.keys()]
  }

  // ---- 主题注册 ----
  registerTheme(theme: ThemeDef): void {
    this.themes.set(theme.name, theme)
  }

  getTheme(name: string): ThemeDef | undefined {
    const theme = this.themes.get(name)
    if (!theme && name.includes(":")) {
      const [base, variant] = name.split(":")
      return this.themes.get(base)
    }
    return theme
  }

  listThemes(): ThemeDef[] {
    return [...this.themes.values()]
  }

  // ---- 编译 ----
  compileComponent(name: string, themeName: string): string {
    const comp = this.components.get(name)
    const theme = this.getTheme(themeName)
    if (!comp || !theme) return ""
    return comp.css(theme.tokens)
  }

  compileAll(themeName: string): string {
    const theme = this.getTheme(themeName)
    if (!theme) return ""

    // 编译 CSS 变量
    const t = theme.tokens
    const vars = [
      ...Object.entries(t.colors).map(([k, v]) => `  --color-${k}: ${v};`),
      ...Object.entries(t.typography).map(([k, v]) => `  --font-${k}: ${v};`),
      ...Object.entries(t.spacing).map(([k, v]) => `  --spacing-${k}: ${v};`),
      ...Object.entries(t.radius).map(([k, v]) => `  --radius-${k}: ${v};`),
      ...Object.entries(t.shadow).map(([k, v]) => `  --shadow-${k}: ${v};`),
      ...Object.entries(t.layout).map(([k, v]) => `  --layout-${k}: ${v};`),
    ].join("\n")

    // 编译所有组件 CSS
    const compCSS = [...this.components.values()]
      .map(c => c.css(t))
      .join("\n\n")

    return `:root {\n${vars}\n}\n\n${compCSS}`
  }
}

// ===== 全局单例 =====
export const registry = new ComponentRegistry()

// ===== 内置组件 =====
registry.register({
  name: "body",
  selector: "body",
  css: (t) => `body {
  font-family: var(--font-sans);
  max-width: var(--layout-content-width);
  margin: 0 auto; padding: var(--spacing-page);
  background: var(--color-bg-body); color: var(--color-text-body);
  line-height: 1.7; -webkit-font-smoothing: antialiased;
}`})

registry.register({
  name: "card",
  selector: ".card",
  css: (t) => `.card, .critical, .warning, .info, .success, .pending {
  padding: var(--spacing-card); background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card); margin: 12px 0;
}`})

registry.register({name:"card-label",selector:".card-label",css:(t)=>`.card-label{font-size:0.8em;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px}`})
registry.register({name:"card-value",selector:".card-value",css:(t)=>`.card-value{font-size:1.6em;font-weight:700;margin:2px 0}`})
registry.register({name:"card-desc",selector:".card-desc",css:(t)=>`.card-desc{font-size:0.9em;color:var(--color-text-secondary)}`})

registry.register({name:"grid-4",selector:".grid-4",css:(t)=>`.grid-4{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:16px 0}`})
registry.register({name:"grid-2",selector:".grid-2",css:(t)=>`.grid-2{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:12px;margin:16px 0}`})

registry.register({name:"semantic",selector:".critical,.warning,.info,.success,.pending",css:(t)=>`.critical{border-left:4px solid var(--color-critical);background:var(--bg-critical)}
.warning{border-left:4px solid var(--color-warning);background:var(--bg-warning)}
.info{border-left:4px solid var(--color-info);background:var(--bg-info)}
.success{border-left:4px solid var(--color-success);background:var(--bg-success)}
.pending{border-left:4px solid var(--color-pending);background:var(--bg-pending)}`})

registry.register({name:"tag",selector:".tag",css:(t)=>`.tag{display:inline-block;padding:2px 10px;border-radius:4px;font-size:0.8em;font-weight:600;margin:2px}
.tag-red{background:var(--bg-critical);color:var(--color-critical)}
.tag-green{background:var(--bg-success);color:var(--color-success)}
.tag-blue{background:var(--bg-info);color:var(--color-info)}
.tag-yellow{background:var(--bg-pending);color:var(--color-pending)}
.tag-purple{background:#e9d8fd;color:#6b46c1}`})

registry.register({name:"diagram",selector:".diagram-box",css:(t)=>`.diagram-box{background:var(--color-bg-card);border:1px solid var(--color-border);border-radius:var(--radius-card);padding:20px;margin:16px 0;text-align:center}`})

registry.register({name:"step",selector:".step",css:(t)=>`.step{display:flex;gap:16px;align-items:flex-start;margin:12px 0;padding:12px 16px;background:var(--color-bg-card);border-radius:8px;border:1px solid var(--color-border)}
.step-num{width:32px;height:32px;background:var(--color-accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}`})

registry.register({name:"responsive",selector:"@media",css:(t)=>`@media(max-width:600px){body{padding:var(--spacing-page-mobile)}.grid-4,.grid-2{grid-template-columns:1fr}.step{flex-direction:column}}`})

// ===== 内置主题 =====
registry.registerTheme({
  name: "premium",
  description: "v2 报告风 — 彩色卡片+SVG流程",
  tokens: {
    colors: { "body":"#1a202c","bg-body":"#f7fafc","bg-card":"#ffffff","border":"#e2e8f0","muted":"#718096","secondary":"#4a5568","accent":"#3182ce","critical":"#e53e3e","warning":"#dd6b20","info":"#3182ce","success":"#38a169","pending":"#d69e2e" },
    typography: { "sans":"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", "mono":"'SF Mono','Fira Code',monospace" },
    spacing: { "page":"24px","page-mobile":"16px","card":"16px" },
    radius: { "card":"10px","sm":"6px" },
    shadow: { "card":"0 1px 3px rgba(0,0,0,0.08)" },
    layout: { "content-width":"960px" },
  },
})

registry.registerTheme({
  name: "mckinsey",
  description: "麦肯锡 — 深蓝+金色",
  tokens: {
    colors: { "body":"#2D3748","bg-body":"#FAFAF8","bg-card":"#FFFFFF","border":"#E2E0DB","muted":"#9C9A96","secondary":"#5C5A57","accent":"#C8A961","critical":"#B85450","warning":"#B8860B","info":"#1B2A4A","success":"#2F855A","pending":"#C8A961" },
    typography: { "sans":"'Helvetica Neue','Noto Sans SC',sans-serif", "serif":"Georgia,'Noto Serif SC',serif", "mono":"'SF Mono',monospace" },
    spacing: { "page":"32px","page-mobile":"16px","card":"16px" },
    radius: { "card":"8px","sm":"4px" },
    shadow: { "card":"0 1px 2px rgba(0,0,0,0.04)" },
    layout: { "content-width":"1040px" },
  },
})
