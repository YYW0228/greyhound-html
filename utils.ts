// utils.ts
import * as fs from "node:fs";
import * as process from "node:process";
import { CLI_USAGE, DEFAULT_WATCH_INTERVAL_MS } from "./constants.js";

/**
 * Print CLI usage and exit.
 */
export function printUsage(exitCode: number = 0): never {
  console.error(CLI_USAGE);
  process.exit(exitCode);
}

/**
 * Polling-based watch mode.
 * Checks file mtime every `interval` ms and re-runs convertFn on change.
 * Uses simple polling (no chokidar dependency) for zero-overhead file watching.
 */
export function watchMode(
  markdownPath: string,
  convertFn: (path: string) => Promise<unknown>,
  interval: number = DEFAULT_WATCH_INTERVAL_MS
): void {
  let lastMtime = 0;
  let running = false;

  // Prime initial mtime
  try {
    lastMtime = fs.statSync(markdownPath).mtimeMs;
  } catch {
    console.error(`[greyhound-html] Cannot stat file: ${markdownPath}`);
    process.exit(1);
  }

  console.error(`[greyhound-html] Watching: ${markdownPath} (poll every ${interval}ms)`);

  const check = async () => {
    if (running) return; // skip if previous conversion still in-flight
    try {
      const stat = fs.statSync(markdownPath);
      const mtime = stat.mtimeMs;
      if (mtime > lastMtime) {
        lastMtime = mtime;
        running = true;
        console.error(`\n[greyhound-html] Change detected, converting...`);
        try {
          await convertFn(markdownPath);
          console.error(`[greyhound-html] Done.`);
        } finally {
          running = false;
        }
      }
    } catch (err: any) {
      console.error(`[greyhound-html] Watch error: ${err.message}`);
      running = false;
    }
  };

  setInterval(check, interval);
}

/**
 * Format a Date to a filesystem-safe string.
 */
export function formatTime(date: Date): string {
  return date.toISOString().replace(/[:.]/g, "-");
}
