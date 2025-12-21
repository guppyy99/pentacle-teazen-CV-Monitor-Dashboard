import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/reviews - 리뷰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const itemId = searchParams.get("itemId")
    const itemIds = searchParams.get("itemIds") // 쉼표로 구분된 여러 ID
    const sentiment = searchParams.get("sentiment")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    let query = supabase
      .from("reviews")
      .select(`
        *,
        items (id, product_name, platform, product_image)
      `, { count: "exact" })
      .order("crawled_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // 단일 아이템 필터
    if (itemId) {
      query = query.eq("item_id", itemId)
    }

    // 복수 아이템 필터
    if (itemIds) {
      const ids = itemIds.split(",").map((id) => id.trim())
      query = query.in("item_id", ids)
    }

    // 감정 필터
    if (sentiment && sentiment !== "all") {
      query = query.eq("sentiment", sentiment)
    }

    // 날짜 필터
    if (dateFrom) {
      query = query.gte("date", dateFrom)
    }
    if (dateTo) {
      query = query.lte("date", dateTo)
    }

    const { data, count, error } = await query

    if (error) {
      console.error("Reviews fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      reviews: data,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Reviews API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/reviews/stats - 리뷰 통계
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { itemIds, dateRange } = body

    if (!itemIds || itemIds.length === 0) {
      return NextResponse.json({ error: "itemIds required" }, { status: 400 })
    }

    // 기간 계산
    const now = new Date()
    const days = {
      "7d": 7,
      "1m": 30,
      "3m": 90,
      "6m": 180,
      "1y": 365,
    }[dateRange || "7d"] || 7

    const fromDate = new Date(now)
    fromDate.setDate(fromDate.getDate() - days)
    const fromDateStr = fromDate.toISOString().split("T")[0]

    // 각 아이템별 통계 계산
    const stats = await Promise.all(
      itemIds.map(async (itemId: string) => {
        // 전체 리뷰
        const { data: reviews, count } = await supabase
          .from("reviews")
          .select("rating, sentiment, date", { count: "exact" })
          .eq("item_id", itemId)
          .gte("date", fromDateStr)

        if (!reviews || reviews.length === 0) {
          return {
            itemId,
            totalReviews: 0,
            avgRating: 0,
            positiveRate: 0,
            negativeRate: 0,
            neutralRate: 0,
            dailyReviews: [],
          }
        }

        // 평균 별점
        const avgRating =
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length

        // 감정 비율
        const positive = reviews.filter((r) => r.sentiment === "positive").length
        const negative = reviews.filter((r) => r.sentiment === "negative").length
        const neutral = reviews.length - positive - negative

        // 일별 리뷰 수
        const dailyCounts: Record<string, number> = {}
        reviews.forEach((r) => {
          if (r.date) {
            dailyCounts[r.date] = (dailyCounts[r.date] || 0) + 1
          }
        })

        const dailyReviews = Object.entries(dailyCounts)
          .map(([date, count]) => ({ date, count }))
          .sort((a, b) => a.date.localeCompare(b.date))

        return {
          itemId,
          totalReviews: count || 0,
          avgRating: Math.round(avgRating * 10) / 10,
          positiveRate: Math.round((positive / reviews.length) * 100),
          negativeRate: Math.round((negative / reviews.length) * 100),
          neutralRate: Math.round((neutral / reviews.length) * 100),
          dailyReviews,
        }
      })
    )

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Reviews stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
