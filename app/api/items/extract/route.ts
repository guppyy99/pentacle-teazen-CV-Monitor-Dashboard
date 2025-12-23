import { NextRequest, NextResponse } from "next/server"
import { detectPlatform } from "@/types"
import { metadataCache } from "@/lib/utils/cache"

const CRAWLER_API_URL = process.env.CRAWLER_API_URL || "http://localhost:3001"
const EXTRACT_TIMEOUT = 30000 // 30초

// 타임아웃이 있는 fetch 헬퍼
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

// POST /api/items/extract - URL에서 상품 메타데이터 추출
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // 캐시 확인
    const cacheKey = `metadata:${url}`
    const cached = metadataCache.get(cacheKey)
    if (cached) {
      console.log(`[Cache] Using cached metadata for URL: ${url}`)
      return NextResponse.json(cached)
    }

    // 플랫폼 감지
    const platform = detectPlatform(url)
    if (!platform) {
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
    }

    // 외부 크롤러 API 호출
    const crawlerResponse = await fetchWithTimeout(
      `${CRAWLER_API_URL}/extract/metadata`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      },
      EXTRACT_TIMEOUT
    )

    if (!crawlerResponse.ok) {
      // 크롤러 실패 시 기본값 반환
      console.warn("Crawler API failed, returning defaults")
      return NextResponse.json({
        platform,
        product_name: null,
        product_image: null,
        price: null,
      })
    }

    const metadata = await crawlerResponse.json()

    const result = {
      platform: metadata.platform || platform,
      product_name: metadata.name || null,
      product_image: metadata.image || null,
      price: metadata.price || null,
    }

    // 캐시에 저장
    metadataCache.set(cacheKey, result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Extract API error:", error)
    if (error instanceof Error && error.name === "AbortError") {
      // 타임아웃 시에도 기본값 반환
      return NextResponse.json({
        platform: null,
        product_name: null,
        product_image: null,
        price: null,
      })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
