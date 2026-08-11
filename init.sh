#!/bin/bash
# init.sh — 环境初始化 + 基础验证 (Anthropic long-running harness 契约)
# 会话开局跑: bash init.sh  (幂等, 可重复执行)
set -e
cd "$(dirname "$0")"

echo "══ greyhound-html init ══"

# 1. 环境初始化
if [ ! -d node_modules ]; then
  echo "  → bun install"
  bun install
fi


# 2. 基础验证
bun test 2>/dev/null | tail -1 || echo "  (无 bun test)"


echo "✅ greyhound-html ready (git: $(git log --oneline -1 2>/dev/null | cut -c1-50))"
