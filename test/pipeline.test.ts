import { describe, it, expect } from "bun:test"
import { Pipeline, PipelineError } from "../pipeline.js"

describe("Pipeline", () => {
  it("executes steps in order", async () => {
    const order: string[] = []
    const pipe = new Pipeline()
      .add("s1", async () => { order.push("1") })
      .add("s2", async () => { order.push("2") })

    await pipe.run({})
    expect(order).toEqual(["1", "2"])
  })

  it("tracks step timing", async () => {
    const pipe = new Pipeline()
      .add("slow", async () => { await new Promise(r => setTimeout(r, 10)) })

    const { results } = await pipe.run({})
    expect(results[0].durationMs).toBeGreaterThanOrEqual(5)
  })

  it("reports all steps", async () => {
    const pipe = new Pipeline()
      .add("a", async () => {})
      .add("b", async () => {})

    const { results } = await pipe.run({})
    expect(results).toHaveLength(2)
    expect(results[0].status).toBe("success")
  })

  it("stops on critical failure", async () => {
    const pipe = new Pipeline()
      .add("fail", async () => { throw new Error("boom") }, true)
      .add("after", async () => {})

    try {
      await pipe.run({})
      expect(true).toBe(false) // should not reach
    } catch (e) {
      expect(e).toBeInstanceOf(PipelineError)
      expect((e as PipelineError).step).toBe("fail")
    }
  })

  it("continues on non-critical failure", async () => {
    const order: string[] = []
    const pipe = new Pipeline()
      .add("fail", async () => { throw new Error("boom") }, false)
      .add("after", async () => { order.push("done") })

    await pipe.run({})
    expect(order).toEqual(["done"])
  })

  it("generates readable report", async () => {
    const pipe = new Pipeline()
      .add("read", async () => {})
      .add("write", async () => {})

    await pipe.run({})
    const report = pipe.getReport()
    expect(report).toContain("Pipeline Report")
    expect(report).toContain("read")
    expect(report).toContain("write")
    expect(report).toContain("ms")
  })
})
