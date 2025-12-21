import type { Category, Item, Review, ReviewStats } from "@/types"

// 기간 타입
export type DateRange = "7d" | "1m" | "3m" | "6m" | "1y"

// 기간 옵션
export const DATE_RANGE_OPTIONS: { value: DateRange; label: string; days: number }[] = [
  { value: "7d", label: "7일", days: 7 },
  { value: "1m", label: "1개월", days: 30 },
  { value: "3m", label: "3개월", days: 90 },
  { value: "6m", label: "6개월", days: 180 },
  { value: "1y", label: "1년", days: 365 },
]

// 날짜 생성 헬퍼
function generateDates(days: number): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split("T")[0])
  }
  return dates
}

// 일별 리뷰 데이터 생성
function generateDailyReviews(days: number, baseCount: number = 30): { date: string; count: number }[] {
  return generateDates(days).map(date => ({
    date,
    count: Math.floor(baseCount + Math.random() * baseCount * 0.8 - baseCount * 0.4)
  }))
}

// 목업 카테고리
export const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "콤부차",
    color: "#4ECDC4",
    createdAt: "2024-01-01",
  },
  {
    id: "cat-2",
    name: "애사비",
    color: "#FF6B6B",
    createdAt: "2024-01-05",
  },
  {
    id: "cat-3",
    name: "브이핏",
    color: "#45B7D1",
    createdAt: "2024-01-10",
  },
]

// 목업 아이템
export const mockItems: Item[] = [
  {
    id: "item-1",
    url: "https://smartstore.naver.com/teazen/products/123456",
    platform: "smartstore",
    platformName: "스마트스토어",
    productName: "티젠 콤부차 레몬 5g x 30개입",
    productImage: "https://shopping-phinf.pstatic.net/main_3246633/32466338621.20220527055831.jpg",
    categoryId: "cat-1",
    lastCrawledAt: "2024-12-20T10:30:00",
    reviewCount: 1247,
    avgRating: 4.6,
    createdAt: "2024-01-15",
  },
  {
    id: "item-2",
    url: "https://www.coupang.com/vp/products/456789",
    platform: "coupang",
    platformName: "쿠팡",
    productName: "티젠 콤부차 자몽 5g x 30개입",
    productImage: "https://thumbnail8.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/sample.jpg",
    categoryId: "cat-1",
    lastCrawledAt: "2024-12-20T10:30:00",
    reviewCount: 892,
    avgRating: 4.5,
    createdAt: "2024-01-16",
  },
  {
    id: "item-3",
    url: "https://smartstore.naver.com/competitor/products/789012",
    platform: "smartstore",
    platformName: "스마트스토어",
    productName: "동서 콤부차 복숭아 30개입",
    productImage: "https://shopping-phinf.pstatic.net/main_3246633/32466338622.jpg",
    categoryId: "cat-1",
    lastCrawledAt: "2024-12-19T15:00:00",
    reviewCount: 654,
    avgRating: 4.3,
    createdAt: "2024-01-17",
  },
  {
    id: "item-4",
    url: "https://smartstore.naver.com/teazen/products/111222",
    platform: "smartstore",
    platformName: "스마트스토어",
    productName: "티젠 애사비 레몬 10개입",
    productImage: "https://shopping-phinf.pstatic.net/main_3246633/32466338623.jpg",
    categoryId: "cat-2",
    lastCrawledAt: "2024-12-20T09:00:00",
    reviewCount: 423,
    avgRating: 4.7,
    createdAt: "2024-02-01",
  },
  {
    id: "item-5",
    url: "https://www.coupang.com/vp/products/333444",
    platform: "coupang",
    platformName: "쿠팡",
    productName: "티젠 브이핏 레드 30포",
    productImage: "https://thumbnail8.coupangcdn.com/thumbnails/remote/230x230ex/image/retail/images/vfit.jpg",
    categoryId: "cat-3",
    lastCrawledAt: "2024-12-18T14:00:00",
    reviewCount: 312,
    avgRating: 4.4,
    createdAt: "2024-02-10",
  },
]

// 목업 리뷰
export const mockReviews: Review[] = [
  {
    id: "rev-1",
    itemId: "item-1",
    rating: 5,
    content: "맛있고 탄산감이 좋아요! 매일 아침 마시고 있습니다. 다이어트에도 도움되는 것 같아요.",
    author: "건강맘",
    date: "2024-12-20",
    sentiment: "positive",
    keywords: ["맛있다", "탄산", "다이어트"],
  },
  {
    id: "rev-2",
    itemId: "item-1",
    rating: 4,
    content: "레몬맛이 상쾌해요. 가격이 조금 비싼 편이지만 품질은 좋습니다.",
    author: "직장인A",
    date: "2024-12-19",
    sentiment: "positive",
    keywords: ["레몬", "상쾌", "가격"],
  },
  {
    id: "rev-3",
    itemId: "item-1",
    rating: 3,
    content: "그냥 그래요. 기대한 만큼은 아닌 것 같습니다.",
    author: "솔직리뷰어",
    date: "2024-12-18",
    sentiment: "neutral",
    keywords: ["기대", "보통"],
  },
  {
    id: "rev-4",
    itemId: "item-1",
    rating: 2,
    content: "너무 달아요. 인공적인 맛이 나서 별로입니다.",
    author: "까다로운구매자",
    date: "2024-12-17",
    sentiment: "negative",
    keywords: ["달다", "인공적"],
  },
  {
    id: "rev-5",
    itemId: "item-2",
    rating: 5,
    content: "자몽맛 최고! 새콤달콤하고 시원하게 마시기 좋아요.",
    author: "과일러버",
    date: "2024-12-20",
    sentiment: "positive",
    keywords: ["자몽", "새콤달콤", "시원"],
  },
]

// 목업 리뷰 통계 (365일 데이터 포함)
export const mockReviewStats: ReviewStats[] = [
  {
    itemId: "item-1",
    totalReviews: 1247,
    avgRating: 4.6,
    positiveRate: 72,
    negativeRate: 12,
    neutralRate: 16,
    dailyReviews: generateDailyReviews(365, 35),
    topKeywords: [
      { word: "맛있다", count: 523, sentiment: "positive" },
      { word: "상쾌하다", count: 312, sentiment: "positive" },
      { word: "다이어트", count: 287, sentiment: "positive" },
      { word: "가격", count: 156, sentiment: "neutral" },
      { word: "달다", count: 89, sentiment: "negative" },
      { word: "탄산", count: 234, sentiment: "positive" },
      { word: "레몬", count: 198, sentiment: "positive" },
      { word: "건강", count: 176, sentiment: "positive" },
      { word: "시원하다", count: 145, sentiment: "positive" },
      { word: "재구매", count: 134, sentiment: "positive" },
      { word: "비싸다", count: 78, sentiment: "negative" },
      { word: "인공적", count: 45, sentiment: "negative" },
    ],
  },
  {
    itemId: "item-2",
    totalReviews: 892,
    avgRating: 4.5,
    positiveRate: 68,
    negativeRate: 15,
    neutralRate: 17,
    dailyReviews: generateDailyReviews(365, 25),
    topKeywords: [
      { word: "자몽", count: 412, sentiment: "positive" },
      { word: "새콤달콤", count: 287, sentiment: "positive" },
      { word: "시원하다", count: 198, sentiment: "positive" },
      { word: "향", count: 145, sentiment: "positive" },
      { word: "비싸다", count: 67, sentiment: "negative" },
      { word: "상쾌", count: 134, sentiment: "positive" },
      { word: "맛있다", count: 298, sentiment: "positive" },
      { word: "탄산", count: 112, sentiment: "positive" },
    ],
  },
  {
    itemId: "item-3",
    totalReviews: 654,
    avgRating: 4.3,
    positiveRate: 65,
    negativeRate: 18,
    neutralRate: 17,
    dailyReviews: generateDailyReviews(365, 18),
    topKeywords: [
      { word: "복숭아", count: 345, sentiment: "positive" },
      { word: "달콤", count: 234, sentiment: "positive" },
      { word: "가격", count: 167, sentiment: "neutral" },
      { word: "맛있다", count: 189, sentiment: "positive" },
      { word: "달다", count: 98, sentiment: "negative" },
    ],
  },
  {
    itemId: "item-4",
    totalReviews: 423,
    avgRating: 4.7,
    positiveRate: 78,
    negativeRate: 8,
    neutralRate: 14,
    dailyReviews: generateDailyReviews(365, 12),
    topKeywords: [
      { word: "식초", count: 234, sentiment: "positive" },
      { word: "건강", count: 198, sentiment: "positive" },
      { word: "다이어트", count: 167, sentiment: "positive" },
      { word: "맛있다", count: 145, sentiment: "positive" },
      { word: "시다", count: 56, sentiment: "negative" },
    ],
  },
  {
    itemId: "item-5",
    totalReviews: 312,
    avgRating: 4.4,
    positiveRate: 70,
    negativeRate: 12,
    neutralRate: 18,
    dailyReviews: generateDailyReviews(365, 9),
    topKeywords: [
      { word: "포만감", count: 178, sentiment: "positive" },
      { word: "다이어트", count: 156, sentiment: "positive" },
      { word: "맛있다", count: 134, sentiment: "positive" },
      { word: "가격", count: 89, sentiment: "neutral" },
      { word: "효과없다", count: 34, sentiment: "negative" },
    ],
  },
]

// 기간별 데이터 필터링 함수
export function filterDataByDateRange(
  data: { date: string; count: number }[],
  range: DateRange
): { date: string; count: number }[] {
  const days = DATE_RANGE_OPTIONS.find(opt => opt.value === range)?.days || 7
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  return data.filter(item => new Date(item.date) >= cutoffDate)
}

// 카테고리별 일별 리뷰 데이터 생성
export function getCategoryDailyReviews(
  categoryId: string,
  range: DateRange
): { date: string; count: number }[] {
  const categoryItems = mockItems.filter(item => item.categoryId === categoryId)
  const itemIds = categoryItems.map(item => item.id)
  const stats = mockReviewStats.filter(s => itemIds.includes(s.itemId))

  if (stats.length === 0) return []

  const days = DATE_RANGE_OPTIONS.find(opt => opt.value === range)?.days || 7
  const dates = generateDates(days)

  return dates.map(date => {
    const totalCount = stats.reduce((sum, stat) => {
      const dayData = stat.dailyReviews.find(d => d.date === date)
      return sum + (dayData?.count || 0)
    }, 0)
    return { date, count: totalCount }
  })
}
