import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { detectPlatform, PLATFORM_INFO } from "@/types"

// GET /api/items - 아이템 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("categoryId")

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
    const supabase = createServerClient()
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
