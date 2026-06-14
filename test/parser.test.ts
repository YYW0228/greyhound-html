import { describe, it, expect } from "bun:test"
import { parseMarkdown, astToHtml, resetBlockCounter } from "../parser.js"
import { buildSections, flattenSections } from "../ast.js"

describe("Parser", () => {
  it("parses heading", () => {
    const ast = parseMarkdown("# Hello\n\nWorld")
    expect(ast.blocks[0].type).toBe("heading")
    expect(ast.blocks[0].level).toBe(1)
    expect(ast.blocks[0].content).toBe("Hello")
  })

  it("parses nested headings", () => {
    const ast = parseMarkdown("# H1\n## H2\n### H3")
    expect(ast.blocks).toHaveLength(3)
    expect(ast.blocks.map(b => b.level)).toEqual([1, 2, 3])
  })

  it("parses bold and italic", () => {
    const ast = parseMarkdown("**bold** *italic*")
    const html = astToHtml(ast)
    expect(html).toContain("<strong>bold</strong>")
    expect(html).toContain("<em>italic</em>")
  })

  it("parses inline code", () => {
    const html = astToHtml(parseMarkdown("Use `code` here"))
    expect(html).toContain("<code>code</code>")
  })

  it("parses blockquote", () => {
    const ast = parseMarkdown("> A quote")
    expect(ast.blocks[0].type).toBe("blockquote")
  })

  it("parses code block", () => {
    const ast = parseMarkdown("```js\nconsole.log(1)\n```")
    expect(ast.blocks[0].type).toBe("code")
    expect(ast.blocks[0].lang).toBe("js")
  })

  it("parses mermaid block", () => {
    const ast = parseMarkdown("```mermaid\ngraph TD; A-->B\n```")
    expect(ast.blocks[0].type).toBe("mermaid")
  })

  it("parses unordered list", () => {
    const ast = parseMarkdown("- a\n- b\n- c")
    expect(ast.blocks[0].type).toBe("list")
    expect(ast.blocks[0].items).toHaveLength(3)
  })

  it("parses ordered list", () => {
    const ast = parseMarkdown("1. first\n2. second")
    expect(ast.blocks[0].type).toBe("list")
    expect(ast.blocks[0].meta?.ordered).toBe(true)
  })

  it("parses thematic break", () => {
    const ast = parseMarkdown("---")
    expect(ast.blocks[0].type).toBe("thematic-break")
  })

  it("parses link", () => {
    const html = astToHtml(parseMarkdown("[text](https://x.com)"))
    expect(html).toContain('<a href="https://x.com"')
    expect(html).toContain(">text</a>")
  })

  it("parses image", () => {
    const html = astToHtml(parseMarkdown("![alt](img.png)"))
    expect(html).toContain('<img src="img.png"')
  })
})

describe("Section tree", () => {
  it("builds flat sections", () => {
    const ast = parseMarkdown("# A\np1\n## B\np2\n# C")
    expect(ast.sections).toHaveLength(2)
    expect(ast.sections[0].title).toBe("A")
    expect(ast.sections[0].subsections).toHaveLength(1)
    expect(ast.sections[0].subsections[0].title).toBe("B")
  })

  it("flattens to TOC", () => {
    const ast = parseMarkdown("# A\n## B\n### C")
    const flat = flattenSections(ast.sections)
    expect(flat).toHaveLength(3)
    expect(flat[0].level).toBe(1)
    expect(flat[2].level).toBe(3)
  })
})

describe("astToHtml", () => {
  it("generates valid HTML", () => {
    const html = astToHtml(parseMarkdown("# Title\n\nParagraph.\n\n> Quote"))
    expect(html).toContain("<h1")
    expect(html).toContain("<p>")
    expect(html).toContain("<blockquote>")
  })

  it("handles empty input", () => {
    const html = astToHtml(parseMarkdown(""))
    expect(html).toBe("")
  })
})
