// main.ts — CLI entry
import * as process from "node:process";
import { convertMarkdown } from "./core.js";
import { parseCliArgs } from "./cli.js";
import { watchMode } from "./utils.js";
import { closeRenderer } from "./mermaid.js";

async function run(markdownPath: string, options: any) {
  const result = await convertMarkdown(markdownPath, options);
  console.log(JSON.stringify(result, null, 2));
  return result;
}

async function main() {
  const { markdownPath, options, watch } = parseCliArgs(process.argv.slice(2));

  if (watch) {
    watchMode(markdownPath, (p: string) => run(p, options));
  } else {
    try {
      await run(markdownPath, options);
    } catch (err: any) {
      console.error(`[greyhound-html] Error: ${err.message}`);
      process.exit(1);
    } finally {
      await closeRenderer();
    }
  }
}

main();
