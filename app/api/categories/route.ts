import { NextRequest, NextResponse } from "next/server"
import { createServerClient, useMockData } from "@/lib/supabase"
import { mockCategories } from "@/lib/mock-data"

// GET /api/categories - 카테고리 목록 조회
export async function GET() {
  try {
    // Mock 모드
    if (useMockData) {
      return NextResponse.json(
        mockCategories.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          created_at: c.createdAt,
        }))
      )
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json(
        mockCategories.map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          created_at: c.createdAt,
        }))
      )
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Categories fetch error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Categories API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/categories - 카테고리 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, color } = body

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Mock 모드
    if (useMockData) {
      const newCategory = {
        id: `cat-${Date.now()}`,
        name,
        color: color || "#888888",
        created_at: new Date().toISOString(),
      }
      return NextResponse.json(newCategory, { status: 201 })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({ name, color })
      .select()
      .single()

    if (error) {
      console.error("Category create error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("Categories API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/categories - 카테고리 삭제 (body에 id)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    // Mock 모드
    if (useMockData) {
      return NextResponse.json({ success: true })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
    }

    const { error } = await supabase.from("categories").delete().eq("id", id)

    if (error) {
      console.error("Category delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Categories API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
