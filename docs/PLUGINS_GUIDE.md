# 插件开发指南

## 快速开始

一个 greyhound-html 插件是一个包含 `name`、`version` 和 `hooks` 的对象。

```typescript
// my-plugin.ts
import type { GreyhoundPlugin } from "greyhound-html"

export const myPlugin: GreyhoundPlugin = {
  name: "my-plugin",
  version: "1.0.0",
  description: "描述这个插件做什么",
  metadata: {
    priority: PluginPriority.NORMAL,
  },
  hooks: {
    beforeParse: (raw) => raw,
    afterRender: (html) => html + "<!-- done -->",
  },
}
```

## 五大钩子点

| 钩子 | 时机 | 典型用途 |
|------|------|---------|
| `beforeParse` | Markdown 文本被解析之前 | 预处理（移除广告、规范化格式） |
| `afterParse` | AST 构建完成后 | 增强元数据、注入 TOC 节点 |
| `transformBlock` | 每个 Block 渲染前 | 修改/替换/移除 Block |
| `afterRenderBlock` | 每个 Block 渲染后 | 添加 CSS 类、包裹容器 |
| `afterRender` | 完整 HTML 生成后 | 注入脚本、分析代码、压缩 |

## 优先级

```typescript
import { PluginPriority } from "greyhound-html"

export const myPlugin: GreyhoundPlugin = {
  metadata: {
    priority: PluginPriority.EARLY,  // 在最前面执行
    // EARLY=0  NORMAL=10  LATE=20
  },
}
```

**推荐规则**：
- `EARLY` — 输入验证 / 格式标准化
- `NORMAL` — 内容转换（默认）
- `LATE` — 输出美化 / 注入脚本

## 依赖管理

```typescript
export const plugin: GreyhoundPlugin = {
  name: "my-advanced-plugin",
  version: "1.0.0",
  metadata: {
    depends: ["external-links"],  // 必须先注册 external-links
  },
}
```

## 错误隔离

每个插件的钩子执行都被 `try/catch` 包裹。一个插件失败不会阻止其他插件：

```typescript
// 错误日志示例：
// [error] [plugin] bad-plugin.afterRender failed: Error: something broke
// ✅ 继续执行下一个插件
```

## 完整示例：图片 Wrapper 插件

```typescript
export const imageWrapperPlugin: GreyhoundPlugin = {
  name: "image-wrapper",
  version: "1.0.0",
  description: "Wrap all images in a figure with caption",
  metadata: { priority: PluginPriority.LATE },

  hooks: {
    afterRender: (html: string) =>
      html.replace(
        /<img\s+src="([^"]+)"\s+alt="([^"]*)"[^>]*>/g,
        (_, src, alt) =>
          `<figure class="image-figure">
             <img src="${src}" alt="${alt}" loading="lazy">
             ${alt ? `<figcaption>${alt}</figcaption>` : ""}
           </figure>`,
      ),
  },
}
```

## 最佳实践

1. **最小依赖** — 插件应该独立工作，除非明确声明 `depends`
2. **幂等** — 多次执行应产生相同结果
3. **不修改全局状态** — 只操作传入的数据
4. **记录日志** — 使用 `console.error` 或 `logger` 记录关键操作
5. **加测试** — 为插件的钩子函数编写单元测试
