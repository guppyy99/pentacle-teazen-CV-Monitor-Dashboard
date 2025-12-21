import { NextRequest, NextResponse } from "next/server"
import { detectPlatform } from "@/types"

const CRAWLER_API_URL = process.env.CRAWLER_API_URL || "http://localhost:3001"

// POST /api/items/extract - URL에서 상품 메타데이터 추출
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // 플랫폼 감지
    const platform = detectPlatform(url)
    if (!platform) {
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
    }

    // 외부 크롤러 API 호출
    const crawlerResponse = await fetch(`${CRAWLER_API_URL}/extract/metadata`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })

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

    return NextResponse.json({
      platform: metadata.platform || platform,
      product_name: metadata.name || null,
      product_image: metadata.image || null,
      price: metadata.price || null,
    })
  } catch (error) {
    console.error("Extract API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
