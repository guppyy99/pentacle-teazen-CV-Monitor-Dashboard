import { describe, it, expect, beforeEach, vi } from "vitest"
import RateLimiter from "@/lib/utils/rate-limiter"

describe("RateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it("should allow requests within limit", async () => {
    const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 })

    expect(limiter.canAcquire()).toBe(true)
    await limiter.acquire()
    expect(limiter.getRemainingTokens()).toBe(2)

    await limiter.acquire()
    expect(limiter.getRemainingTokens()).toBe(1)

    await limiter.acquire()
    expect(limiter.getRemainingTokens()).toBe(0)
  })

  it("should block when limit is reached", async () => {
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 })

    await limiter.acquire()
    expect(limiter.canAcquire()).toBe(false)
  })

  it("should refill tokens over time", async () => {
    const limiter = new RateLimiter({ maxRequests: 10, windowMs: 1000 })

    // 토큰 5개 소모
    for (let i = 0; i < 5; i++) {
      await limiter.acquire()
    }
    expect(limiter.getRemainingTokens()).toBe(5)

    // 500ms 경과 -> 5개 refill
    vi.advanceTimersByTime(500)
    expect(limiter.getRemainingTokens()).toBe(10)
  })

  it("should not exceed max tokens on refill", async () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 })

    // 시간 경과 후에도 최대치를 넘지 않아야 함
    vi.advanceTimersByTime(5000)
    expect(limiter.getRemainingTokens()).toBe(5)
  })
})
