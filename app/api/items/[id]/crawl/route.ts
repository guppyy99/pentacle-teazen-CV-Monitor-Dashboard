import { NextRequest, NextResponse } from "next/server"
import { createServerClient, useMockData } from "@/lib/supabase"

const CRAWLER_API_URL = process.env.CRAWLER_API_URL || "http://localhost:3001"

// Mock 아이템 데이터 (테스트용)
const mockItems: Record<string, { url: string; platform: string; name: string }> = {
  "1": {
    url: "https://smartstore.naver.com/sanofit/products/5686164269",
    platform: "naver",
    name: "티젠 콤부차 레몬",
  },
  "2": {
    url: "https://smartstore.naver.com/example/products/123",
    platform: "naver",
    name: "테스트 상품 2",
  },
}

// POST /api/items/[id]/crawl - 아이템 리뷰 크롤링 실행
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Mock 모드일 때
    if (useMockData) {
      const mockItem = mockItems[id] || mockItems["1"]

      // Mock 크롤러 API 호출
      const crawlerResponse = await fetch(`${CRAWLER_API_URL}/crawl/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: mockItem.url,
          platform: mockItem.platform,
          itemId: id,
        }),
      })

      if (!crawlerResponse.ok) {
        return NextResponse.json(
          { error: "Crawler API failed (mock)" },
          { status: 502 }
        )
      }

      const crawledReviews = await crawlerResponse.json()

      // Mock 모드에서는 실제 DB 저장 안함
      console.log(`[Mock] Crawled ${crawledReviews.length} reviews for item ${id}`)

      return NextResponse.json({
        success: true,
        crawled: crawledReviews.length,
        inserted: crawledReviews.length,
        skipped: 0,
        mockMode: true,
      })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    // 아이템 정보 조회
    const { data: item, error: itemError } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single()

    if (itemError || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    // 외부 크롤러 API 호출
    const crawlerResponse = await fetch(`${CRAWLER_API_URL}/crawl/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: item.url,
        platform: item.platform,
        itemId: id,
      }),
    })

    if (!crawlerResponse.ok) {
      const errorData = await crawlerResponse.json().catch(() => ({}))
      console.error("Crawler API error:", errorData)
      return NextResponse.json(
        { error: "Crawler API failed", details: errorData },
        { status: 502 }
      )
    }

    const crawledReviews = await crawlerResponse.json()

    // 크롤링된 리뷰 DB에 저장 (중복 제외 - upsert)
    let insertedCount = 0
    let skippedCount = 0

    for (const review of crawledReviews) {
      const { error: insertError } = await supabase.from("reviews").upsert(
        {
          item_id: id,
          author: review.author || "Unknown",
          rating: review.rating || 5,
          content: review.content || "",
          images: review.images || [],
          date: review.date || null,
          sentiment: review.sentiment || null,
        },
        {
          onConflict: "item_id,author,date,content",
          ignoreDuplicates: true,
        }
      )

      if (insertError) {
        if (insertError.code === "23505") {
          // Unique violation - skip
          skippedCount++
        } else {
          console.error("Review insert error:", insertError)
        }
      } else {
        insertedCount++
      }
    }

    // 아이템의 last_crawled_at 업데이트
    await supabase
      .from("items")
      .update({ last_crawled_at: new Date().toISOString() })
      .eq("id", id)

    return NextResponse.json({
      success: true,
      crawled: crawledReviews.length,
      inserted: insertedCount,
      skipped: skippedCount,
    })
  } catch (error) {
    console.error("Crawl API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/items/[id]/crawl - 마지막 크롤링 상태 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Mock 모드일 때
    if (useMockData) {
      return NextResponse.json({
        last_crawled_at: new Date().toISOString(),
        review_count: Math.floor(Math.random() * 50) + 10,
        mockMode: true,
      })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { data: item, error } = await supabase
      .from("items")
      .select("last_crawled_at")
      .eq("id", id)
      .single()

    if (error || !item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    const { count } = await supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("item_id", id)

    return NextResponse.json({
      last_crawled_at: item.last_crawled_at,
      review_count: count || 0,
    })
  } catch (error) {
    console.error("Crawl status API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
