// API Helper Functions for Frontend

const BASE_URL = ""
const DEFAULT_TIMEOUT = 30000 // 30초

// Generic fetch wrapper with error handling and timeout
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit & { timeout?: number }
): Promise<T> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options || {}

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout")
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

// ============ Categories ============

export interface CategoryData {
  id: string
  name: string
  color: string | null
  created_at: string
}

export async function getCategories(): Promise<CategoryData[]> {
  return fetchAPI("/api/categories")
}

export async function createCategory(data: { name: string; color?: string }): Promise<CategoryData> {
  return fetchAPI("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function deleteCategory(id: string): Promise<void> {
  await fetchAPI(`/api/categories?id=${id}`, { method: "DELETE" })
}

// ============ Items ============

export interface ItemData {
  id: string
  category_id: string | null
  url: string
  platform: string
  product_name: string
  product_image: string | null
  price: number | null
  last_crawled_at: string | null
  created_at: string
  categories: CategoryData | null
  review_count?: number
  avg_rating?: number
}

export async function getItems(categoryId?: string): Promise<ItemData[]> {
  const params = categoryId && categoryId !== "all" ? `?categoryId=${categoryId}` : ""
  return fetchAPI(`/api/items${params}`)
}

export async function getItem(id: string): Promise<ItemData> {
  return fetchAPI(`/api/items/${id}`)
}

export async function createItem(data: {
  url: string
  product_name?: string
  product_image?: string
  category_id?: string
  price?: number
}): Promise<ItemData> {
  return fetchAPI("/api/items", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateItem(
  id: string,
  data: {
    product_name?: string
    category_id?: string
    product_image?: string
    price?: number
  }
): Promise<ItemData> {
  return fetchAPI(`/api/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteItem(id: string): Promise<void> {
  await fetchAPI(`/api/items/${id}`, { method: "DELETE" })
}

export interface ExtractedMetadata {
  platform: string
  product_name: string | null
  product_image: string | null
  price: number | null
}

export async function extractMetadata(url: string): Promise<ExtractedMetadata> {
  return fetchAPI("/api/items/extract", {
    method: "POST",
    body: JSON.stringify({ url }),
  })
}

// ============ Crawling ============

export interface CrawlResult {
  success: boolean
  crawled: number
  inserted: number
  skipped: number
}

export async function triggerCrawl(itemId: string): Promise<CrawlResult> {
  return fetchAPI(`/api/items/${itemId}/crawl`, { method: "POST" })
}

export async function getCrawlStatus(itemId: string): Promise<{
  last_crawled_at: string | null
  review_count: number
}> {
  return fetchAPI(`/api/items/${itemId}/crawl`)
}

// ============ Reviews ============

export interface ReviewData {
  id: string
  item_id: string
  author: string | null
  rating: number | null
  content: string | null
  images: string[] | null
  date: string | null
  sentiment: string | null
  keywords: string[] | null
  crawled_at: string
  items?: {
    id: string
    product_name: string
    platform: string
    product_image: string | null
  }
}

export interface ReviewsResponse {
  reviews: ReviewData[]
  total: number
  limit: number
  offset: number
}

export async function getReviews(params: {
  itemId?: string
  itemIds?: string[]
  sentiment?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
  offset?: number
}): Promise<ReviewsResponse> {
  const searchParams = new URLSearchParams()
  if (params.itemId) searchParams.set("itemId", params.itemId)
  if (params.itemIds) searchParams.set("itemIds", params.itemIds.join(","))
  if (params.sentiment) searchParams.set("sentiment", params.sentiment)
  if (params.dateFrom) searchParams.set("dateFrom", params.dateFrom)
  if (params.dateTo) searchParams.set("dateTo", params.dateTo)
  if (params.limit) searchParams.set("limit", params.limit.toString())
  if (params.offset) searchParams.set("offset", params.offset.toString())

  return fetchAPI(`/api/reviews?${searchParams.toString()}`)
}

export interface ReviewStats {
  itemId: string
  totalReviews: number
  avgRating: number
  positiveRate: number
  negativeRate: number
  neutralRate: number
  dailyReviews: { date: string; count: number }[]
}

export async function getReviewStats(
  itemIds: string[],
  dateRange?: string
): Promise<ReviewStats[]> {
  return fetchAPI("/api/reviews", {
    method: "POST",
    body: JSON.stringify({ itemIds, dateRange }),
  })
}

// ============ AI Analysis ============

export interface AnalysisInsights {
  overview: string
  pros: string[]
  cons: string[]
  actions: {
    title: string
    detail: string
    owner_hint: string
    priority: string
  }[]
  risks: string[]
  evidence: {
    reviewId: string
    why_relevant: string
  }[]
}

export async function analyzeReviews(params: {
  itemIds: string[]
  type: "tag" | "insights" | "keywords"
  dateRange?: string
}): Promise<AnalysisInsights | { tagged: number } | { positive: any[]; negative: any[] }> {
  return fetchAPI("/api/analyze", {
    method: "POST",
    body: JSON.stringify(params),
  })
}

export interface CachedAnalysis {
  id: string
  item_id: string
  summary: string | null
  positive_keywords: string[] | null
  negative_keywords: string[] | null
  created_at: string
}

export async function getCachedAnalysis(itemId: string): Promise<CachedAnalysis | null> {
  const result = await fetchAPI<{ analysis: CachedAnalysis | null } | CachedAnalysis>(
    `/api/analyze?itemId=${itemId}`
  )
  return "analysis" in result ? result.analysis : result
}

// 키워드 통계 조회
export interface KeywordStats {
  positive: { word: string; count: number }[]
  negative: { word: string; count: number }[]
}

export async function getKeywordStats(itemIds: string[], dateRange?: string): Promise<KeywordStats> {
  return fetchAPI("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ itemIds, type: "keywords", dateRange }),
  })
}
