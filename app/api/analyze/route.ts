import { NextRequest, NextResponse } from "next/server"
import { createServerClient, useLocalDB } from "@/lib/supabase"
import { localDB } from "@/lib/local-db"
import { tagReviewsBatch, generateInsights, extractKeywords } from "@/lib/services/openai"

// OpenAI API 키 확인
const isOpenAIConfigured = Boolean(
  process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your-")
)

// POST /api/analyze - AI 분석 실행
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemIds, type, dateRange } = body

    if (!itemIds || itemIds.length === 0) {
      return NextResponse.json({ error: "itemIds required" }, { status: 400 })
    }

    if (!isOpenAIConfigured) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 503 })
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
    let reviews: Array<{
      id: string
      content: string
      rating: number
      sentiment: string | null
      date: string | null
    }> = []

    if (useLocalDB) {
      const allReviews = await Promise.all(
        itemIds.map((itemId: string) => localDB.reviews.getByItemId(itemId))
      )
      reviews = allReviews.flat()
        .filter(r => r.date && r.date >= fromDateStr)
        .slice(0, 200)
    } else {
      const supabase = createServerClient()
      if (!supabase) {
        return NextResponse.json({ error: "Database not configured" }, { status: 503 })
      }

      const { data, error } = await supabase
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
      reviews = data || []
    }

    if (reviews.length === 0) {
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

        console.log(`[Analyze] Tagging ${untaggedReviews.length} reviews...`)
        const tagResults = await tagReviewsBatch(untaggedReviews)

        // DB 업데이트 (sentiment + keywords)
        if (useLocalDB) {
          const updates = tagResults.map((result) => ({
            id: result.reviewId,
            sentiment: result.sentiment as "positive" | "negative" | "neutral",
            keywords: result.keywords || [],
          }))
          const updated = await localDB.reviews.bulkUpdateAnalysis(updates)
          console.log(`[Analyze] Tagged and saved ${updated} reviews to local DB`)
        } else {
          const supabase = createServerClient()
          if (supabase) {
            for (const result of tagResults) {
              await supabase
                .from("reviews")
                .update({
                  sentiment: result.sentiment,
                  keywords: result.keywords || [],
                })
                .eq("id", result.reviewId)
            }
          }
        }

        return NextResponse.json({
          tagged: tagResults.length,
          results: tagResults,
        })
      }

      case "insights": {
        // 아이템 정보 가져오기
        let productName = "상품"

        if (useLocalDB) {
          const items = await Promise.all(
            itemIds.map((id: string) => localDB.items.getById(id))
          )
          productName = items.filter(Boolean).map(i => i!.product_name).join(", ") || "상품"
        } else {
          const supabase = createServerClient()
          if (supabase) {
            const { data: items } = await supabase
              .from("items")
              .select("product_name")
              .in("id", itemIds)
            productName = items?.map((i) => i.product_name).join(", ") || "상품"
          }
        }

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
        if (useLocalDB) {
          for (const itemId of itemIds) {
            await localDB.analysis.save({
              item_id: itemId,
              analysis_type: "insights",
              result: insights,
            })
          }
        } else {
          const supabase = createServerClient()
          if (supabase) {
            for (const itemId of itemIds) {
              await supabase.from("review_analysis").upsert(
                {
                  item_id: itemId,
                  analysis_type: "insights",
                  result: insights,
                },
                { onConflict: "item_id,analysis_type" }
              )
            }
          }
        }

        return NextResponse.json(insights)
      }

      case "keywords": {
        // 먼저 DB에 저장된 키워드 통계 확인
        if (useLocalDB) {
          const stats = await localDB.reviews.getKeywordStats(itemIds)
          if (stats.positive.length > 0 || stats.negative.length > 0) {
            return NextResponse.json(stats)
          }
        }

        // DB에 키워드가 없으면 GPT로 추출
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
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")

    if (!itemId) {
      return NextResponse.json({ error: "itemId required" }, { status: 400 })
    }

    if (useLocalDB) {
      const analysis = await localDB.analysis.get(itemId, "insights")
      return NextResponse.json(analysis || { analysis: null })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
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
