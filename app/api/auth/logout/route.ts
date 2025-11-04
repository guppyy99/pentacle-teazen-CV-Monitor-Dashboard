import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    // 세션 쿠키 삭제
    cookies().delete("auth-token")

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "로그아웃 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

