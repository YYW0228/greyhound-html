import { describe, it, expect } from "bun:test"
import { PluginManager, PluginPriority } from "../plugins.js"

describe("PluginManager", () => {
  it("registers plugins", () => {
    const pm = new PluginManager()
    pm.use({ name: "a", version: "1.0", hooks: {} })
    expect(pm.list()).toHaveLength(1)
  })

  it("prevents duplicate registration", () => {
    const pm = new PluginManager()
    pm.use({ name: "a", version: "1.0", hooks: {} })
    pm.use({ name: "a", version: "1.0", hooks: {} })
    expect(pm.list()).toHaveLength(1)
  })

  it("removes plugins", () => {
    const pm = new PluginManager()
    pm.use({ name: "a", version: "1.0", hooks: {} })
    pm.remove("a")
    expect(pm.list()).toHaveLength(0)
  })

  it("enables/disables plugins", () => {
    const pm = new PluginManager()
    pm.use({ name: "a", version: "1.0", hooks: { afterRender: (h) => h + "!" } })
    pm.setEnabled("a", false)
    // afterRender should NOT execute "!" when disabled
  })

  it("sorts by priority", async () => {
    const pm = new PluginManager()
    const order: string[] = []

    pm.use({
      name: "early", version: "1.0",
      metadata: { priority: PluginPriority.EARLY },
      hooks: { afterParse: () => { order.push("early") } },
    })
    pm.use({
      name: "late", version: "1.0",
      metadata: { priority: PluginPriority.LATE },
      hooks: { afterParse: () => { order.push("late") } },
    })

    const ast = { meta: { title: "", author: "", summary: "" }, sections: [], blocks: [] }
    await pm.executeAfterParse(ast)
    expect(order).toEqual(["early", "late"])
  })

  it("validates dependencies", () => {
    const pm = new PluginManager()
    pm.use({ name: "a", version: "1.0", metadata: { depends: ["b"] }, hooks: {} })
    expect(() => pm.validateDependencies()).toThrow("depends on")
  })

  it("passes dependencies check", () => {
    const pm = new PluginManager()
    pm.use({ name: "a", version: "1.0", metadata: { depends: ["b"] }, hooks: {} })
    pm.use({ name: "b", version: "1.0", hooks: {} })
    expect(() => pm.validateDependencies()).not.toThrow()
  })

  it("executes hooks in order", async () => {
    const pm = new PluginManager()
    let ran = false

    pm.use({
      name: "test", version: "1.0", hooks: {
        afterRender: (html: string) => { ran = true; return html },
      },
    })

    await pm.executeAfterRender("<p>hi</p>")
    expect(ran).toBe(true)
  })

  it("isolates plugin errors", async () => {
    const pm = new PluginManager()

    pm.use({
      name: "bad", version: "1.0", hooks: {
        afterRender: () => { throw new Error("fail") },
      },
    })
    pm.use({
      name: "good", version: "1.0", hooks: {
        afterRender: (h: string) => h + "!",
      },
    })

    const result = await pm.executeAfterRender("ok")
    expect(result).toBe("ok!")
  })
})
