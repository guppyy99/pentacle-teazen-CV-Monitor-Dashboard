import { describe, it, expect, beforeEach, vi } from "vitest"
import Cache from "@/lib/utils/cache"

describe("Cache", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it("should store and retrieve values", () => {
    const cache = new Cache<string>(5000)

    cache.set("key1", "value1")
    expect(cache.get("key1")).toBe("value1")
  })

  it("should return null for non-existent keys", () => {
    const cache = new Cache<string>(5000)

    expect(cache.get("nonexistent")).toBeNull()
  })

  it("should expire entries after TTL", () => {
    const cache = new Cache<string>(1000) // 1초 TTL

    cache.set("key1", "value1")
    expect(cache.get("key1")).toBe("value1")

    // 1초 경과 후
    vi.advanceTimersByTime(1001)
    expect(cache.get("key1")).toBeNull()
  })

  it("should support custom TTL per entry", () => {
    const cache = new Cache<string>(5000) // 기본 5초

    cache.set("short", "value", 1000) // 1초
    cache.set("long", "value", 10000) // 10초

    vi.advanceTimersByTime(2000) // 2초 경과

    expect(cache.get("short")).toBeNull() // 만료됨
    expect(cache.get("long")).toBe("value") // 아직 유효
  })

  it("should check existence with has()", () => {
    const cache = new Cache<string>(5000)

    cache.set("key1", "value1")
    expect(cache.has("key1")).toBe(true)
    expect(cache.has("key2")).toBe(false)

    vi.advanceTimersByTime(6000)
    expect(cache.has("key1")).toBe(false) // 만료됨
  })

  it("should delete entries", () => {
    const cache = new Cache<string>(5000)

    cache.set("key1", "value1")
    expect(cache.delete("key1")).toBe(true)
    expect(cache.get("key1")).toBeNull()
    expect(cache.delete("key1")).toBe(false) // 이미 삭제됨
  })

  it("should clear all entries", () => {
    const cache = new Cache<string>(5000)

    cache.set("key1", "value1")
    cache.set("key2", "value2")
    cache.clear()

    expect(cache.size()).toBe(0)
  })

  it("should cleanup expired entries", () => {
    const cache = new Cache<string>(1000)

    cache.set("key1", "value1")
    cache.set("key2", "value2")
    cache.set("key3", "value3")

    vi.advanceTimersByTime(1500)

    const removed = cache.cleanup()
    expect(removed).toBe(3)
    expect(cache.size()).toBe(0)
  })
})
