// main.ts — CLI 入口（极简）
// Skill: markdown-to-html
// 支持：单次转换 + --watch 热重载

import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { convertMarkdown } from "./core.js";
import { parseCliArgs } from "./cli.js";
import { closeRenderer } from "baoyu-chrome-cdp/mermaid";
import { debounce } from "./utils.js";

async function runOnce(markdownPath: string, options: any): Promise<void> {
  const result = await convertMarkdown(markdownPath, options);
  console.log(JSON.stringify(result, null, 2));
}

async function runWatch(markdownPath: string, options: any): Promise<void> {
  const absPath = path.resolve(markdownPath);
  console.error(`[markdown-to-html] 👀 Watching: ${absPath}`);

  // 初次运行
  await runOnce(markdownPath, options);

  const onChange = debounce(async () => {
    console.error(`\n[markdown-to-html] 🔄 File changed, reconverting...`);
    try {
      await runOnce(markdownPath, options);
      console.error(`[markdown-to-html] ✅ Reconversion complete`);
    } catch (err: any) {
      console.error(`[markdown-to-html] ❌ Error: ${err.message}`);
    }
  }, 300);

  // fs.watch 比 fs.watchFile 更高效
  const watcher = fs.watch(absPath, (eventType) => {
    if (eventType === "change") onChange();
  });

  // 保持进程存活
  process.on("SIGINT", () => {
    console.error(`\n[markdown-to-html] 👋 Stopping watch`);
    watcher.close();
    closeRenderer();
    process.exit(0);
  });

  // 永不自然退出
  await new Promise(() => {});
}

async function main() {
  try {
    const { markdownPath, options, watch } = parseCliArgs(process.argv.slice(2));

    if (watch) {
      await runWatch(markdownPath, options);
    } else {
      await runOnce(markdownPath, options);
    }
  } catch (err: any) {
    console.error(`[markdown-to-html] Error: ${err.message}`);
    process.exitCode = 1;
  } finally {
    // 只有非 watch 模式才关闭
    if (!process.argv.includes("--watch") && !process.argv.includes("-w")) {
      await closeRenderer();
    }
  }
}

main();
