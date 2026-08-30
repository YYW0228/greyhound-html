# 吞噬借鉴证据 (ADOPTION EVIDENCE)

> 2026-08-11 | 来源: chekusu/wanman (Apache-2.0) + chekusu/sandbank (无 License, 只借鉴思路)
> 方法: harness-devour 5 阶段吞噬 (评分: wanman 23/30, sandbank 100.0, 文档资产 85.0)
> 全仓库证据链: 本文件在所有 YYW0228 仓库同步 (本地 + GitHub)
> 模式库: harness-devour/patterns/ (24 模式) | 索引: hermes-brain/skills/autonomous-ai-agents/harness-devour/references/

## greyhound-html

方法论受益 (2026-08-11):
- 吞噬工具验证清单 (harness-devour): 首次真实交付前 5 项内容检查 — 表格缺陷已记录场景矩阵

## 验证
- 全量测试: pulse-data-engine 143 passed
- 服务: 8501/8502 HTTP 200
- 克隆源已清理 (本地无残留)

---

# ADOPTION-EVIDENCE — no-mistakes (2026-08-31)

> 吞噬证据链 (用户 2026-08-11 要求全仓建立)。本文件记录本仓库对 no-mistakes 吞噬轮次的借鉴证据。

## 统一头部

- 来源: [kunchenguid/no-mistakes](https://github.com/kunchenguid/no-mistakes) (MIT, 8,067⭐, 活跃)
- 方法: harness-devour skill, 吞噬报告 `harness-devour/docs/no-mistakes-devour-report.md` (评分卡 96.0/100)
- 模式库: `harness-devour/patterns/` — push_gate / findings_disposition (migrated), intent_conformance (experiment), evidence_branch (watch)
- 核心模式: **push 前置门禁** (流水线全绿才转发远端 + 自动干净 PR) / **findings 分流** (机械修复自动, 意图判断留人) / **fail closed** (无法验证 = 拒绝 + 大声失败) / **证据附着** (run 证据文件 + PR 引用)
- 落地: YYW0228/pregate (Python 重写, 零重依赖)

## 本仓库定制借鉴条目

| 文档资产 | 方法论受益 | 文档归属地图 (每配置键唯一权威) 可借鉴 | ✅ |
