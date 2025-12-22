// Re-export database types
export * from "./database"

// 플랫폼 타입
export type Platform = "smartstore" | "coupang" | "naver" | "11st" | "gmarket" | "auction" | "wemakeprice" | "tmon"

// 감정 분석 타입
export type Sentiment = "positive" | "negative" | "neutral"

// 카테고리
export interface Category {
  id: string
  name: string // "콤부차", "애사비" 등
  color: string // "#FF6B6B"
  createdAt: string
}

// 아이템 (모니터링 대상 상품)
export interface Item {
  id: string
  url: string // 원본 링크
  platform: Platform
  platformName: string // 표시용 ("스마트스토어", "쿠팡" 등)
  productName: string // 자동 추출된 상품명
  productImage: string // 자동 추출된 이미지 URL
  categoryId: string // 소속 카테고리 ID
  lastCrawledAt: string | null
  reviewCount: number
  avgRating: number
  createdAt: string
}

// 개별 리뷰
export interface Review {
  id: string
  itemId: string
  rating: number // 1-5
  content: string
  author: string
  date: string
  sentiment: Sentiment
  keywords: string[] // GPT 추출 키워드
}

// 리뷰 통계
export interface ReviewStats {
  itemId: string
  totalReviews: number
  avgRating: number
  positiveRate: number // 0-100
  negativeRate: number // 0-100
  neutralRate: number // 0-100
  dailyReviews: DailyReviewCount[]
  topKeywords: KeywordCount[]
}

// 일별 리뷰 수
export interface DailyReviewCount {
  date: string // "2024-01-15"
  count: number
}

// 키워드 빈도
export interface KeywordCount {
  word: string
  count: number
  sentiment: Sentiment
}

// 카테고리 통계
export interface CategoryStats {
  categoryId: string
  categoryName: string
  itemCount: number
  totalReviews: number
  avgRating: number
  positiveRate: number
  negativeRate: number
  color?: string
}

// AI 요약 응답
export interface AISummary {
  summary: string
  positivePoints: string[]
  negativePoints: string[]
  recommendations: string[]
  generatedAt: string
}

// 플랫폼 정보 매핑
export const PLATFORM_INFO: Record<Platform, { name: string; color: string; icon: string }> = {
  smartstore: { name: "스마트스토어", color: "#03C75A", icon: "naver" },
  naver: { name: "네이버", color: "#03C75A", icon: "naver" },
  coupang: { name: "쿠팡", color: "#E31837", icon: "coupang" },
  "11st": { name: "11번가", color: "#FF5722", icon: "11st" },
  gmarket: { name: "G마켓", color: "#00A651", icon: "gmarket" },
  auction: { name: "옥션", color: "#FF6600", icon: "auction" },
  wemakeprice: { name: "위메프", color: "#FF3366", icon: "wemakeprice" },
  tmon: { name: "티몬", color: "#FF5454", icon: "tmon" },
}

// 플랫폼 감지 함수
export function detectPlatform(url: string): Platform | null {
  const urlLower = url.toLowerCase()
  if (urlLower.includes("smartstore.naver.com") || urlLower.includes("brand.naver.com")) {
    return "smartstore"
  }
  if (urlLower.includes("coupang.com")) {
    return "coupang"
  }
  if (urlLower.includes("11st.co.kr")) {
    return "11st"
  }
  if (urlLower.includes("gmarket.co.kr")) {
    return "gmarket"
  }
  if (urlLower.includes("auction.co.kr")) {
    return "auction"
  }
  if (urlLower.includes("wemakeprice.com")) {
    return "wemakeprice"
  }
  if (urlLower.includes("tmon.co.kr")) {
    return "tmon"
  }
  return null
}

// 카테고리 기본 색상 팔레트
export const CATEGORY_COLORS = [
  "#FF6B6B", // 빨강
  "#4ECDC4", // 청록
  "#45B7D1", // 하늘
  "#96CEB4", // 민트
  "#FFEAA7", // 노랑
  "#DDA0DD", // 자주
  "#98D8C8", // 연두
  "#F7DC6F", // 금색
  "#BB8FCE", // 보라
  "#85C1E9", // 파랑
]
