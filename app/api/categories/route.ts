import { NextRequest, NextResponse } from "next/server"
import { createServerClient, useLocalDB } from "@/lib/supabase"
import { localDB } from "@/lib/local-db"

// GET /api/categories - 카테고리 목록 조회
export async function GET() {
  try {
    // 로컬 DB 모드
    if (useLocalDB) {
      const categories = await localDB.categories.getAll()
      return NextResponse.json(categories)
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 })
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

    // 로컬 DB 모드
    if (useLocalDB) {
      const newCategory = await localDB.categories.create({ name, color })
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

// DELETE /api/categories - 카테고리 삭제 (query param id)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 })
    }

    // 로컬 DB 모드
    if (useLocalDB) {
      await localDB.categories.delete(id)
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
