---
name: markdown-to-html
description: Convert Markdown to styled HTML with WeChat-compatible themes, code highlighting, Mermaid diagrams, and --watch mode
version: 1.0.0
author: You
license: MIT
metadata:
  hermes:
    tags: [markdown, html, converter, wechat, publishing]
    category: content
    homepage: https://github.com/YYW0228/greyhound-html
---

# Markdown → HTML Converter

Converts Markdown files to styled HTML with inline CSS, optimized for WeChat Official Account and other platforms.

Built on top of `baoyu-md` rendering engine with a clean modular architecture: CLI, core logic, metadata extraction, types, constants, and utilities are separated into individual files.

## File Structure

```
markdown-to-html/
├── main.ts        # CLI entry point (minimal)
├── cli.ts         # Argument parsing, help, subcommand logic
├── core.ts        # Core conversion (convertMarkdown)
├── metadata.ts    # Frontmatter + title/author/summary extraction
├── types.ts       # Type definitions
├── utils.ts       # Utility functions
├── constants.ts   # Constants, presets, color palettes
├── index.ts       # Library entry point (for external imports)
├── package.json
```

## Usage

### CLI

```bash
# Basic conversion
bun main.ts article.md

# Theme + color
bun main.ts article.md --theme grace --color red

# External links → bottom citations
bun main.ts article.md --cite

# Watch mode (auto-reconvert on file change)
bun main.ts article.md --watch

# Show help
bun main.ts --help
```

### Library

```typescript
import { convertMarkdown } from "markdown-to-html";

const result = await convertMarkdown("article.md", {
  theme: "grace",
  primaryColor: "#0F4C81",
  citeStatus: true,
});

console.log(result.htmlPath); // → /path/to/article.html
```

## Options

| Option            | Description                                      | Default   |
|-------------------|--------------------------------------------------|-----------|
| `--theme`         | Theme: default, grace, simple, modern            | default   |
| `--color`         | Primary color: blue, red, green, or hex          | blue      |
| `--font-family`   | Font: sans, serif, mono                          | sans      |
| `--font-size`     | Base font size in px                             | 16        |
| `--title`         | Override document title                          | frontmatter |
| `--keep-title`    | Keep first heading in output                     | false     |
| `--cite`          | External links → bottom citations                | false     |
| `--count`         | Add word count to output                         | false     |
| `--watch`         | Watch file and reconvert on change               | false     |
| `--no-mermaid`    | Skip Mermaid rendering                           | false     |
| `--help`          | Show help                                        |           |

## Themes

| Theme   | Description                                          |
|---------|------------------------------------------------------|
| default | Classic — centered title, H2 with colored background  |
| grace   | Elegant — text shadow, rounded cards, refined quotes  |
| simple  | Minimal — modern minimalist, clean whitespace         |
| modern  | Modern — large radius, pill-shaped titles             |

## Publishing to GitHub

```bash
# 1. Create repo on GitHub
# 2. Push code
git init
git add -A
git commit -m "feat: markdown-to-html converter"
git remote add origin git@github.com:<username>/markdown-to-html.git
git push -u origin main

# 3. Publish to npm (optional)
npm publish
```
