# AGENTS.md — greyhound-html 工作区规范

本文件注入所有在 greyhound-html 目录运行的 agent 会话。

## 仓库定位

HTML 设计引擎 (bun):--theme industry-tech/finance/education 出方案书/课件/合规报告。

## 核心命令

```bash
bun main.ts --theme industry-tech    # 渲染报告
bun test                             # 测试 (5 文件)
```

## 已知边界 (验证过, 勿踩)

- GFM 表格降级纯文本 — 仅叙事型文档可用; 表格密集走 make-pdf
- 架构图 → 手写 HTML + Chromium 截图
- 交付前必过内容完整性验证: 标题数/表格数/关键词命中

## 提交规范

- 不提交 node_modules/ dist/ bun.lock 变更需谨慎
