import { NextRequest, NextResponse } from "next/server"
import { createServerClient, useLocalDB } from "@/lib/supabase"
import { localDB } from "@/lib/local-db"

const CRAWLER_API_URL = process.env.CRAWLER_API_URL || "http://localhost:3001"
const CRAWLER_TIMEOUT = 120000 // 2분 (크롤링은 시간이 오래 걸릴 수 있음)

// 타임아웃이 있는 fetch 헬퍼
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

// POST /api/items/[id]/crawl - 아이템 리뷰 크롤링 실행
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 로컬 DB 모드
    if (useLocalDB) {
      const item = await localDB.items.getById(id)
      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }

      // 외부 크롤러 API 호출
      console.log(`[LocalDB] Crawling item: ${item.product_name || item.url}`)
      const crawlerResponse = await fetchWithTimeout(
        `${CRAWLER_API_URL}/crawl/reviews`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: item.url,
            platform: item.platform,
            itemId: id,
          }),
        },
        CRAWLER_TIMEOUT
      )

      if (!crawlerResponse.ok) {
        const errorText = await crawlerResponse.text()
        console.error("[LocalDB] Crawler API failed:", errorText)
        return NextResponse.json(
          { error: "Crawler API failed", details: errorText },
          { status: 502 }
        )
      }

      const crawledReviews = await crawlerResponse.json()
      console.log(`[LocalDB] Received ${crawledReviews.length} reviews from crawler`)

      // 로컬 DB에 리뷰 저장
      const { inserted, skipped } = await localDB.reviews.bulkUpsert(id, crawledReviews)

      // 마지막 크롤링 시간 업데이트
      await localDB.items.updateLastCrawled(id)

      console.log(`[LocalDB] Saved: ${inserted} inserted, ${skipped} skipped`)

      return NextResponse.json({
        success: true,
        crawled: crawledReviews.length,
        inserted,
        skipped,
        localDB: true,
      })
    }

    // Supabase 모드
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
    const crawlerResponse = await fetchWithTimeout(
      `${CRAWLER_API_URL}/crawl/reviews`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: item.url,
          platform: item.platform,
          itemId: id,
        }),
      },
      CRAWLER_TIMEOUT
    )

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
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json({ error: "Crawler request timeout" }, { status: 504 })
    }
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

    // 로컬 DB 모드
    if (useLocalDB) {
      const item = await localDB.items.getById(id)
      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }

      const reviews = await localDB.reviews.getByItemId(id)

      return NextResponse.json({
        last_crawled_at: item.last_crawled_at,
        review_count: reviews.length,
        localDB: true,
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
