import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/items/[id] - 단일 아이템 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("items")
      .select(`
        *,
        categories (id, name, color)
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }
      console.error("Item fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 리뷰 통계
    const { count, data: reviews } = await supabase
      .from("reviews")
      .select("rating, sentiment", { count: "exact" })
      .eq("item_id", id)

    const avgRating =
      reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0

    const positiveCount = reviews?.filter((r) => r.sentiment === "positive").length || 0
    const negativeCount = reviews?.filter((r) => r.sentiment === "negative").length || 0
    const totalReviews = count || 0

    return NextResponse.json({
      ...data,
      review_count: totalReviews,
      avg_rating: Math.round(avgRating * 10) / 10,
      positive_rate: totalReviews > 0 ? Math.round((positiveCount / totalReviews) * 100) : 0,
      negative_rate: totalReviews > 0 ? Math.round((negativeCount / totalReviews) * 100) : 0,
    })
  } catch (error) {
    console.error("Item API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/items/[id] - 아이템 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()
    const body = await request.json()

    const { product_name, category_id, product_image, price } = body

    const updateData: Record<string, any> = {}
    if (product_name !== undefined) updateData.product_name = product_name
    if (category_id !== undefined) updateData.category_id = category_id
    if (product_image !== undefined) updateData.product_image = product_image
    if (price !== undefined) updateData.price = price

    const { data, error } = await supabase
      .from("items")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        categories (id, name, color)
      `)
      .single()

    if (error) {
      console.error("Item update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Item API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/items/[id] - 아이템 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    const { error } = await supabase.from("items").delete().eq("id", id)

    if (error) {
      console.error("Item delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Item API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
