import { describe, it, expect } from "bun:test"
import { renderWithAST } from "../ast-renderer.js"
import { pluginManager } from "../plugins.js"

describe("AST Renderer", () => {
  it("renders with premium theme", async () => {
    const { fullHtml } = await renderWithAST("# Title\n\nContent", {
      theme: "premium",
      title: "Test",
    })
    expect(fullHtml).toContain("<html")
    expect(fullHtml).toContain("--color-accent")
    expect(fullHtml).toContain("PREMIUM")
  })

  it("renders with mckinsey theme", async () => {
    const { fullHtml } = await renderWithAST("# Title", {
      theme: "mckinsey",
      title: "McK",
    })
    expect(fullHtml).toContain("MCKINSEY")
  })

  it("renders with basic theme", async () => {
    const { fullHtml } = await renderWithAST("# Title", {
      theme: "default",
      title: "Test",
    })
    // basic theme wraps with its own h1
    expect(fullHtml).toContain(">Title<")
  })

  it("produces AST", async () => {
    const { ast } = await renderWithAST("# H1\n## H2", { theme: "premium" })
    expect(ast.blocks).toHaveLength(2)
    expect(ast.blocks[0].level).toBe(1)
  })

  it("integrates plugin hooks", async () => {
    // Remove any existing test plugins
    let beforeCalled = false
    
    const testPlugin = {
      name: "render-test",
      version: "1.0",
      hooks: {
        beforeParse: (md: string) => { beforeCalled = true; return md },
      },
    }
    pluginManager.use(testPlugin)

    await renderWithAST("# Test", { theme: "default" })
    expect(beforeCalled).toBe(true)

    pluginManager.remove("render-test")
  })
})
