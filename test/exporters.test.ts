import { describe, it, expect } from "bun:test"
import fs from "node:fs/promises"
import path from "node:path"
import { exportMarkdown } from "../exporters.js"
import { convertMarkdown } from "../core.js"

describe("Exporters", () => {
  it("exports HTML via convertMarkdown", async () => {
    // Use a small temp file
    const tmpMd = "/tmp/greyhound-test-export.md"
    await fs.writeFile(tmpMd, "# Test\n\nHello world", "utf-8")

    const result = await convertMarkdown(tmpMd, { theme: "premium" })
    expect(result.htmlPath).toContain(".html")

    const stat = await fs.stat(result.htmlPath)
    expect(stat.size).toBeGreaterThan(0)

    // Cleanup
    await fs.unlink(tmpMd).catch(() => {})
    await fs.unlink(result.htmlPath).catch(() => {})
  })

  it("exports Markdown from HTML", async () => {
    const tmpMd = "/tmp/greyhound-test-reverse.md"
    await fs.writeFile(tmpMd, "# Title\n\n**bold** *italic*", "utf-8")

    const results = await exportMarkdown(tmpMd, ["md"], { theme: "default" })
    expect(results).toHaveLength(1)
    expect(results[0].format).toBe("md")

    const exported = await fs.readFile(results[0].path, "utf-8")
    expect(exported).toContain("Title")
    expect(exported).toContain("bold")

    // Cleanup
    await fs.unlink(tmpMd).catch(() => {})
    await fs.unlink(results[0].path).catch(() => {})
  })
})

describe("End-to-End", () => {
  it("converts real markdown file", async () => {
    const testFile = path.join(import.meta.dir!, "..", "test-build-your-own-llm-stack.md")
    const exists = await fs.stat(testFile).then(() => true).catch(() => false)
    if (!exists) {
      console.warn("Skipping e2e test — test file not found")
      return
    }

    const result = await convertMarkdown(testFile, { theme: "blackrock" })
    expect(result.title).toBeTruthy()
    expect(result.htmlPath).toContain(".html")
    expect(result.summary.length).toBeGreaterThan(10)

    // verify HTML exists
    const stat = await fs.stat(result.htmlPath)
    expect(stat.size).toBeGreaterThan(5000)
  })

  it("supports all 6 themes", async () => {
    const themes = ["premium", "mckinsey", "wsj", "blackrock", "youtube-english", "enterprise-cn"]
    const tmpMd = "/tmp/greyhound-test-themes.md"
    await fs.writeFile(tmpMd, "# Test\n\nAll themes work.", "utf-8")

    for (const theme of themes) {
      const r = await convertMarkdown(tmpMd, { theme: theme as any })
      expect(r.htmlPath).toContain(".html")
      expect(r.title).toBe("Test")
    }

    // Cleanup
    await fs.unlink(tmpMd).catch(() => {})
  })
})
