import { NextRequest, NextResponse } from "next/server"

// Mock 리뷰 데이터 생성
function generateMockReviews(count: number = 20) {
  const authors = ["구매자A", "건강맘", "직장인B", "다이어터", "리뷰어", "구매고객"]
  const positiveContents = [
    "맛있어요! 다시 구매할게요",
    "탄산감이 좋고 상쾌해요",
    "다이어트에 도움되는 것 같아요",
    "가격대비 만족스럽습니다",
    "배송도 빠르고 포장도 꼼꼼해요",
    "레몬향이 상쾌하고 좋아요",
    "콤부차 중에서 이게 제일 맛있어요",
    "건강에 좋은 것 같아서 꾸준히 먹고 있어요",
  ]
  const negativeContents = [
    "너무 달아요",
    "기대한 것보다 별로에요",
    "가격이 좀 비싼 편이에요",
    "탄산이 금방 빠져요",
    "맛이 좀 이상해요",
  ]
  const neutralContents = [
    "그냥 그래요",
    "보통이에요",
    "괜찮은 편이에요",
    "나쁘지 않아요",
  ]

  const reviews = []
  const today = new Date()

  for (let i = 0; i < count; i++) {
    const rating = Math.random() > 0.3 ? (Math.random() > 0.5 ? 5 : 4) : (Math.random() > 0.5 ? 3 : 2)
    const sentiment = rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral"

    const contents = sentiment === "positive"
      ? positiveContents
      : sentiment === "negative"
        ? negativeContents
        : neutralContents

    const reviewDate = new Date(today)
    reviewDate.setDate(reviewDate.getDate() - Math.floor(Math.random() * 30))

    reviews.push({
      author: authors[Math.floor(Math.random() * authors.length)] + (i + 1),
      rating,
      content: contents[Math.floor(Math.random() * contents.length)],
      date: reviewDate.toISOString().split("T")[0],
      sentiment,
      images: Math.random() > 0.7 ? ["https://via.placeholder.com/100"] : [],
      platform: "naver",
    })
  }

  return reviews
}

// POST /api/mock/crawler/crawl/reviews - Mock 리뷰 크롤링
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[Mock Crawler] Crawl request received:", body)

    // 딜레이 추가 (실제 크롤링 시간 시뮬레이션)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const reviewCount = Math.floor(Math.random() * 15) + 10
    const reviews = generateMockReviews(reviewCount)

    console.log(`[Mock Crawler] Generated ${reviews.length} mock reviews`)

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("[Mock Crawler] Error:", error)
    return NextResponse.json({ error: "Mock crawler error" }, { status: 500 })
  }
}
