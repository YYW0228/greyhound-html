# greyhound-html 🐕

**Convert Markdown to styled HTML** — AI analysis reports with rich visual hierarchy.

Built for the "HTML is the new Markdown" philosophy. Markdown as the intermediate language (Git-friendly), HTML as the final display layer (browser-native, rich styling).

## Install

```bash
npm install @baiyun-canggou/greyhound-html
```

## CLI

```bash
# Basic conversion
greyhound-html input.md

# Themed output
greyhound-html input.md --theme dark --keep-title

# Watch mode (auto-rebuild on change)
greyhound-html input.md --watch

# Disable Mermaid
greyhound-html input.md --no-mermaid
```

## Library

```ts
import { convertMarkdown } from "greyhound-html";

const result = await convertMarkdown("doc.md", {
  theme: "dark",
  keepTitle: true,
});

console.log(result.htmlPath); // "doc.html"
```

## Architecture

```
├── main.ts           # CLI entry (minimal)
├── cli.ts            # Arg parsing (zero-dependency)
├── core.ts           # ConvertMarkdown — the pipeline
├── metadata.ts       # Title/author/summary extraction
├── renderer.ts       # Markdown → HTML (marked + highlight.js)
├── frontmatter.ts    # --- frontmatter parser/serializer
├── content-utils.ts  # extractTitle, extractSummary
├── images.ts         # Image placeholder + resolve
├── mermaid.ts        # Mermaid diagram (optional, needs puppeteer)
├── types.ts          # All type definitions
├── utils.ts          # printUsage, watchMode, formatTime
├── constants.ts      # Presets, defaults, CSS themes
└── index.ts          # Library entry
```

## Dependencies

| Package | Role |
|---------|------|
| `marked` + `marked-highlight` | Markdown → HTML parsing |
| `highlight.js` | Code syntax highlighting |
| `puppeteer` *(optional)* | Mermaid diagram → PNG rendering |

## Acknowledgements

This tool's architecture was inspired by [baoyu-md](https://github.com/baoyu-org/baoyu-md) — a markdown rendering ecosystem by Baoyu. The pipeline design (frontmatter → mermaid → images → render → post-process) follows the same battle-tested flow. Key differences:

- **Self-contained**: no external markdown framework dependency beyond `marked`
- **Standard libraries**: uses `highlight.js` for syntax highlighting instead of custom CSS
- **Optional Mermaid**: puppeteer is an optional dependency, graceful fallback when absent
- **Lightweight**: focused on analysis report generation, not general-purpose rendering

## License

MIT © 白云苍狗
