import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // 간단한 인증 (실제 프로덕션에서는 데이터베이스 확인 필요)
    if (username === "admin" && password === "admin") {
      // 세션 쿠키 설정
      cookies().set("auth-token", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7일
        path: "/",
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "아이디 또는 비밀번호가 올바르지 않습니다" },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "로그인 처리 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}

