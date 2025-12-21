import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { tagReviewsBatch, generateInsights, extractKeywords } from "@/lib/services/openai"

// POST /api/analyze - AI 분석 실행
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { itemIds, type, dateRange } = body

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
    }[dateRange || "1m"] || 30

    const fromDate = new Date(now)
    fromDate.setDate(fromDate.getDate() - days)
    const fromDateStr = fromDate.toISOString().split("T")[0]

    // 리뷰 가져오기
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("id, content, rating, sentiment, date")
      .in("item_id", itemIds)
      .gte("date", fromDateStr)
      .order("date", { ascending: false })
      .limit(200)

    if (error) {
      console.error("Reviews fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        message: "No reviews found for analysis",
        analysis: null,
      })
    }

    // 분석 타입에 따라 처리
    switch (type) {
      case "tag": {
        // 감정 미분류 리뷰만 태깅
        const untaggedReviews = reviews
          .filter((r) => !r.sentiment && r.content)
          .slice(0, 50)
          .map((r) => ({
            reviewId: r.id,
            content: r.content || "",
            rating: r.rating || 5,
          }))

        if (untaggedReviews.length === 0) {
          return NextResponse.json({ message: "No untagged reviews", tagged: 0 })
        }

        const tagResults = await tagReviewsBatch(untaggedReviews)

        // DB 업데이트
        for (const result of tagResults) {
          await supabase
            .from("reviews")
            .update({ sentiment: result.sentiment })
            .eq("id", result.reviewId)
        }

        return NextResponse.json({
          tagged: tagResults.length,
          results: tagResults,
        })
      }

      case "insights": {
        // 아이템 정보 가져오기
        const { data: items } = await supabase
          .from("items")
          .select("product_name")
          .in("id", itemIds)

        const productName = items?.map((i) => i.product_name).join(", ") || "상품"

        // 통계 계산
        const totalReviews = reviews.length
        const avgRating =
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
        const positiveCount = reviews.filter((r) => r.sentiment === "positive").length
        const negativeCount = reviews.filter((r) => r.sentiment === "negative").length

        // 샘플 리뷰
        const samples = reviews.slice(0, 20).map((r) => ({
          reviewId: r.id,
          sentiment: r.sentiment || "neutral",
          content: (r.content || "").slice(0, 200),
        }))

        const insights = await generateInsights({
          productName,
          window: `최근 ${days}일`,
          stats: {
            totalReviews,
            avgRating: Math.round(avgRating * 10) / 10,
            positiveRate: Math.round((positiveCount / totalReviews) * 100),
            negativeRate: Math.round((negativeCount / totalReviews) * 100),
          },
          samples,
        })

        // 분석 결과 캐싱
        for (const itemId of itemIds) {
          await supabase.from("review_analysis").upsert(
            {
              item_id: itemId,
              summary: insights.overview,
              positive_keywords: insights.pros,
              negative_keywords: insights.cons,
            },
            { onConflict: "item_id" }
          )
        }

        return NextResponse.json(insights)
      }

      case "keywords": {
        const reviewsForKeywords = reviews
          .filter((r) => r.content && r.sentiment)
          .map((r) => ({
            content: r.content || "",
            sentiment: r.sentiment || "neutral",
          }))

        const keywords = await extractKeywords(reviewsForKeywords)
        return NextResponse.json(keywords)
      }

      default:
        return NextResponse.json({ error: "Invalid analysis type" }, { status: 400 })
    }
  } catch (error) {
    console.error("Analyze API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/analyze - 캐시된 분석 결과 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")

    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("review_analysis")
      .select("*")
      .eq("item_id", itemId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ analysis: null })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Analyze GET API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
