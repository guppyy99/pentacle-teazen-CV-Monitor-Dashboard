import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")
  const { pathname } = request.nextUrl

  // 로그인 페이지는 항상 접근 가능
  if (pathname === "/login") {
    // 이미 로그인한 경우 대시보드로 리다이렉트
    if (token?.value === "authenticated") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    return NextResponse.next()
  }

  // 루트 경로는 항상 접근 가능 (리다이렉트 처리)
  if (pathname === "/") {
    return NextResponse.next()
  }

  // 보호된 경로 확인
  const protectedPaths = ["/dashboard", "/admin"]
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  )

  if (isProtectedPath) {
    if (!token || token.value !== "authenticated") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png).*)"],
}

