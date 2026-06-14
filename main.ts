// main.ts — CLI 入口（极简）
// Skill: markdown-to-html
// 支持：单次转换 + --watch 热重载 + 失败自动恢复备份

import process from "node:process";
import fs from "node:fs";
import path from "node:path";
import { convertMarkdown, restoreBackup } from "./core.js";
import { parseCliArgs } from "./cli.js";
import { closeRenderer } from "baoyu-chrome-cdp/mermaid";
import { logger, debounce } from "./utils.js";

async function runOnce(markdownPath: string, options: any): Promise<void> {
  let backupPath: string | undefined;

  try {
    const result = await convertMarkdown(markdownPath, options);
    backupPath = result.backupPath;
    console.log(JSON.stringify(result, null, 2));
  } catch (err: any) {
    logger.error(`Conversion failed: ${err.message}`);

    // 错误恢复：自动还原备份
    if (backupPath) {
      const htmlPath = markdownPath.replace(/\.md$/i, ".html");
      await restoreBackup(htmlPath, backupPath);
    }
    throw err;
  }
}

async function runWatch(markdownPath: string, options: any): Promise<void> {
  const absPath = path.resolve(markdownPath);
  logger.info(`👀 Watching: ${absPath}`);

  // 初次运行
  await runOnce(markdownPath, options);

  const onChange = debounce(async () => {
    logger.info(`🔄 File changed, reconverting...`);
    try {
      await runOnce(markdownPath, options);
      logger.info(`✅ Reconversion complete`);
    } catch (err: any) {
      logger.error(`❌ Reconversion failed: ${err.message}`);
    }
  }, 300);

  const watcher = fs.watch(absPath, (eventType) => {
    if (eventType === "change") onChange();
  });

  process.on("SIGINT", () => {
    logger.info(`👋 Stopping watch`);
    watcher.close();
    closeRenderer();
    process.exit(0);
  });

  await new Promise(() => {});
}

async function main() {
  try {
    const { markdownPath, options, watch } = parseCliArgs(process.argv.slice(2));

    // 设置日志级别
    if ((options as any).quiet) logger.setLevel("error");
    if ((options as any).verbose) logger.setLevel("debug");

    if (watch) {
      await runWatch(markdownPath, options);
    } else {
      await runOnce(markdownPath, options);
    }
  } catch (err: any) {
    logger.error(`Fatal: ${err.message}`);
    process.exitCode = 1;
  } finally {
    const argv = process.argv;
    if (!argv.includes("--watch") && !argv.includes("-w")) {
      await closeRenderer();
    }
  }
}

main();
