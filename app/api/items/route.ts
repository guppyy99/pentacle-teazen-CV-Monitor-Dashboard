import { NextRequest, NextResponse } from "next/server"
import { createServerClient, useMockData } from "@/lib/supabase"
import { detectPlatform, PLATFORM_INFO } from "@/types"
import { mockItems, mockCategories } from "@/lib/mock-data"

// GET /api/items - 아이템 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")

    // Mock 모드
    if (useMockData) {
      let items = mockItems
      if (categoryId && categoryId !== "all") {
        items = items.filter((item) => item.categoryId === categoryId)
      }

      return NextResponse.json(
        items.map((item) => {
          const category = mockCategories.find((c) => c.id === item.categoryId)
          return {
            id: item.id,
            category_id: item.categoryId,
            url: item.url,
            platform: item.platform,
            product_name: item.productName,
            product_image: item.productImage,
            price: null,
            last_crawled_at: item.lastCrawledAt,
            created_at: item.createdAt,
            categories: category
              ? { id: category.id, name: category.name, color: category.color }
              : null,
            review_count: item.reviewCount,
            avg_rating: item.avgRating,
          }
        })
      )
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    let query = supabase
      .from("items")
      .select(`
        *,
        categories (id, name, color)
      `)
      .order("created_at", { ascending: false })

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Items fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 각 아이템의 리뷰 통계도 가져오기
    const itemsWithStats = await Promise.all(
      (data || []).map(async (item) => {
        const { count, data: reviews } = await supabase
          .from("reviews")
          .select("rating", { count: "exact" })
          .eq("item_id", item.id)

        const avgRating =
          reviews && reviews.length > 0
            ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
            : 0

        return {
          ...item,
          review_count: count || 0,
          avg_rating: Math.round(avgRating * 10) / 10,
        }
      })
    )

    return NextResponse.json(itemsWithStats)
  } catch (error) {
    console.error("Items API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/items - 아이템 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, product_name, product_image, category_id, price } = body

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // 플랫폼 감지
    const platform = detectPlatform(url)
    if (!platform) {
      return NextResponse.json({ error: "Unsupported platform" }, { status: 400 })
    }

    // Mock 모드
    if (useMockData) {
      const category = mockCategories.find((c) => c.id === category_id)
      const newItem = {
        id: `item-${Date.now()}`,
        category_id,
        url,
        platform,
        product_name: product_name || "상품명 없음",
        product_image,
        price,
        last_crawled_at: null,
        created_at: new Date().toISOString(),
        categories: category
          ? { id: category.id, name: category.name, color: category.color }
          : null,
        review_count: 0,
        avg_rating: 0,
      }
      return NextResponse.json(newItem, { status: 201 })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { data, error } = await supabase
      .from("items")
      .insert({
        url,
        platform,
        product_name: product_name || "상품명 없음",
        product_image,
        category_id,
        price,
      })
      .select(`
        *,
        categories (id, name, color)
      `)
      .single()

    if (error) {
      console.error("Item create error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Items API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
