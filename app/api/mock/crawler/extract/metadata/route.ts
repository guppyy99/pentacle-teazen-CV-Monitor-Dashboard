import { NextRequest, NextResponse } from "next/server"

// POST /api/mock/crawler/extract/metadata - Mock 메타데이터 추출
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url } = body

    console.log("[Mock Crawler] Metadata extraction request:", url)

    // 딜레이 추가
    await new Promise((resolve) => setTimeout(resolve, 500))

    const isNaver = url?.includes("naver")
    const isCoupang = url?.includes("coupang")

    // 예시 URL에 맞는 메타데이터 반환
    if (url?.includes("sanofit") || url?.includes("5686164269")) {
      return NextResponse.json({
        platform: "naver",
        name: "티젠 콤부차 레몬 5g x 30개입",
        image: "https://shopping-phinf.pstatic.net/main_3246633/32466338621.20220527055831.jpg",
        price: 15900,
      })
    }

    // 일반적인 mock 메타데이터
    return NextResponse.json({
      platform: isNaver ? "naver" : isCoupang ? "coupang" : "unknown",
      name: "상품명 (Mock)",
      image: "https://via.placeholder.com/200",
      price: Math.floor(Math.random() * 50000) + 10000,
    })
  } catch (error) {
    console.error("[Mock Crawler] Metadata error:", error)
    return NextResponse.json({ error: "Mock metadata error" }, { status: 500 })
  }
}
