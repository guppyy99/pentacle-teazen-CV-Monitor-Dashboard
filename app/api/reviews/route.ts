import { NextRequest, NextResponse } from "next/server"
import { createServerClient, useMockData } from "@/lib/supabase"
import { mockReviews, mockItems, mockReviewStats, filterDataByDateRange, type DateRange } from "@/lib/mock-data"

// GET /api/reviews - 리뷰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const itemId = searchParams.get("itemId")
    const itemIds = searchParams.get("itemIds") // 쉼표로 구분된 여러 ID
    const sentiment = searchParams.get("sentiment")
    const limit = parseInt(searchParams.get("limit") || "100")
    const offset = parseInt(searchParams.get("offset") || "0")

    // Mock 모드
    if (useMockData) {
      let reviews = [...mockReviews]

      if (itemId) {
        reviews = reviews.filter((r) => r.itemId === itemId)
      }
      if (itemIds) {
        const ids = itemIds.split(",").map((id) => id.trim())
        reviews = reviews.filter((r) => ids.includes(r.itemId))
      }
      if (sentiment && sentiment !== "all") {
        reviews = reviews.filter((r) => r.sentiment === sentiment)
      }

      const total = reviews.length
      reviews = reviews.slice(offset, offset + limit)

      return NextResponse.json({
        reviews: reviews.map((r) => {
          const item = mockItems.find((i) => i.id === r.itemId)
          return {
            id: r.id,
            item_id: r.itemId,
            author: r.author,
            rating: r.rating,
            content: r.content,
            images: [],
            date: r.date,
            sentiment: r.sentiment,
            crawled_at: r.date,
            items: item
              ? {
                  id: item.id,
                  product_name: item.productName,
                  platform: item.platform,
                  product_image: item.productImage,
                }
              : null,
          }
        }),
        total,
        limit,
        offset,
      })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    let query = supabase
      .from("reviews")
      .select(
        `
        *,
        items (id, product_name, platform, product_image)
      `,
        { count: "exact" }
      )
      .order("crawled_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (itemId) {
      query = query.eq("item_id", itemId)
    }
    if (itemIds) {
      const ids = itemIds.split(",").map((id) => id.trim())
      query = query.in("item_id", ids)
    }
    if (sentiment && sentiment !== "all") {
      query = query.eq("sentiment", sentiment)
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

// POST /api/reviews - 리뷰 통계 조회
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemIds, dateRange } = body

    if (!itemIds || itemIds.length === 0) {
      return NextResponse.json({ error: "itemIds required" }, { status: 400 })
    }

    // Mock 모드
    if (useMockData) {
      const stats = itemIds.map((itemId: string) => {
        const stat = mockReviewStats.find((s) => s.itemId === itemId)
        if (!stat) {
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

        const filteredDaily = filterDataByDateRange(stat.dailyReviews, (dateRange as DateRange) || "7d")

        return {
          itemId,
          totalReviews: stat.totalReviews,
          avgRating: stat.avgRating,
          positiveRate: stat.positiveRate,
          negativeRate: stat.negativeRate,
          neutralRate: stat.neutralRate,
          dailyReviews: filteredDaily,
        }
      })

      return NextResponse.json(stats)
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    // 기간 계산
    const now = new Date()
    const days =
      {
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

        const avgRating =
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length

        const positive = reviews.filter((r) => r.sentiment === "positive").length
        const negative = reviews.filter((r) => r.sentiment === "negative").length
        const neutral = reviews.length - positive - negative

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
