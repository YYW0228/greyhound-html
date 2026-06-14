# 主题定制指南

## 三步创建主题

### 1. 定义 Design Tokens

```typescript
const myTokens = {
  colors: {
    accent: "#ff6600",
    body: "#333333",
    "bg-body": "#fafafa",
    "bg-card": "#ffffff",
    border: "#e0e0e0",
    muted: "#999999",
    secondary: "#666666",
    critical: "#e53e3e",
    warning: "#dd6b20",
    info: "#3182ce",
    success: "#38a169",
    pending: "#d69e2e",
  },
  typography: {
    sans: "'Inter', 'Noto Sans SC', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  spacing: {
    page: "32px",
  },
  radius: {
    card: "12px",
  },
  shadow: {
    card: "0 4px 12px rgba(0,0,0,0.08)",
  },
  layout: {
    "content-width": "800px",
  },
}
```

### 2. 注册主题

```typescript
import { registry } from "greyhound-html"

registry.registerTheme({
  name: "my-theme",
  description: "我的自定义主题 — 暖橙色 + 大圆角",
  tokens: myTokens,
})
```

### 3. 使用主题

```bash
bun main.ts article.md --theme my-theme
```

```typescript
import { renderWithAST } from "greyhound-html"
const { fullHtml } = await renderWithAST(md, { theme: "my-theme" })
```

## 主题继承

```typescript
registry.registerTheme({
  name: "my-theme-dark",
  description: "暗黑版本",
  tokens: { ...myTokens, colors: { ...myTokens.colors, "bg-body": "#1a1a2e", body: "#e0e0e0" } },
})
```

## 色板速查

| 主题 | accent | bg-body | 风格 |
|------|--------|---------|------|
| premium | `#3182ce` | `#f7fafc` | 通用报告 |
| mckinsey | `#C8A961` | `#FAFAF8` | 战略咨询 |
| wsj | `#006699` | `#F7F5F0` | 报章 |
| blackrock | `#2B6CB0` | `#F7F8F9` | 财报 |
| youtube-english | `#FF6B35` | `#FFFAF5` | 教学 |
| enterprise-cn | `#C41E24` | `#FEFCF8` | 企业 |

## 注册自定义组件

```typescript
registry.register({
  name: "hero",
  selector: ".hero",
  css: (tokens) => `.hero {
    background: ${tokens.colors.accent};
    color: white;
    padding: ${tokens.spacing.page};
    border-radius: ${tokens.radius.card};
    text-align: center;
  }`,
})
```
