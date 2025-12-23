/**
 * 간단한 인메모리 캐시
 * 크롤링 결과 및 API 응답 캐싱용
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class Cache<T = unknown> {
  private store: Map<string, CacheEntry<T>> = new Map()
  private readonly defaultTTL: number

  constructor(defaultTTLMs: number = 5 * 60 * 1000) {
    // 기본 5분
    this.defaultTTL = defaultTTLMs
  }

  set(key: string, data: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTTL)
    this.store.set(key, { data, expiresAt })
  }

  get(key: string): T | null {
    const entry = this.store.get(key)

    if (!entry) {
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    const entry = this.store.get(key)

    if (!entry) {
      return false
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }

  // 만료된 엔트리 정리
  cleanup(): number {
    const now = Date.now()
    let removed = 0

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key)
        removed++
      }
    }

    return removed
  }

  size(): number {
    return this.store.size
  }
}

// 크롤링 결과 캐시 (30분 TTL)
export const crawlCache = new Cache<{
  reviews: unknown[]
  crawledAt: string
}>(30 * 60 * 1000)

// 메타데이터 추출 결과 캐시 (1시간 TTL)
export const metadataCache = new Cache<{
  platform: string
  product_name: string | null
  product_image: string | null
  price: number | null
}>(60 * 60 * 1000)

// 분석 결과 캐시 (10분 TTL)
export const analysisCache = new Cache<unknown>(10 * 60 * 1000)

export default Cache
