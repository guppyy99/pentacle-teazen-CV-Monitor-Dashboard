/**
 * 간단한 토큰 버킷 기반 Rate Limiter
 * OpenAI API 호출 제한을 위해 사용
 */

interface RateLimiterConfig {
  maxRequests: number // 최대 요청 수
  windowMs: number // 윈도우 시간 (밀리초)
}

class RateLimiter {
  private tokens: number
  private lastRefill: number
  private readonly maxTokens: number
  private readonly refillRate: number // tokens per ms

  constructor(config: RateLimiterConfig) {
    this.maxTokens = config.maxRequests
    this.tokens = config.maxRequests
    this.lastRefill = Date.now()
    this.refillRate = config.maxRequests / config.windowMs
  }

  private refill(): void {
    const now = Date.now()
    const elapsed = now - this.lastRefill
    const tokensToAdd = elapsed * this.refillRate

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
    this.lastRefill = now
  }

  async acquire(): Promise<void> {
    this.refill()

    if (this.tokens >= 1) {
      this.tokens -= 1
      return
    }

    // 토큰이 없으면 대기
    const waitTime = Math.ceil((1 - this.tokens) / this.refillRate)
    await new Promise((resolve) => setTimeout(resolve, waitTime))
    this.refill()
    this.tokens -= 1
  }

  canAcquire(): boolean {
    this.refill()
    return this.tokens >= 1
  }

  getRemainingTokens(): number {
    this.refill()
    return Math.floor(this.tokens)
  }
}

// OpenAI Rate Limiter 인스턴스 (분당 60회 제한 - gpt-4o-mini 기준 여유있게 설정)
export const openaiRateLimiter = new RateLimiter({
  maxRequests: 60,
  windowMs: 60 * 1000, // 1분
})

// 크롤러 API Rate Limiter (분당 10회)
export const crawlerRateLimiter = new RateLimiter({
  maxRequests: 10,
  windowMs: 60 * 1000,
})

export default RateLimiter
