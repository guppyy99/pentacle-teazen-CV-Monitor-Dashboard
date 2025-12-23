import fs from "fs"
import path from "path"
import { Category, Item, Review, ReviewAnalysis } from "@/types/database"

// ============================================================
// JSON 파일 기반 로컬 데이터베이스
// Supabase 없이 로컬에서 테스트할 때 사용
// ============================================================

const DATA_DIR = path.join(process.cwd(), ".data")
const DB_FILE = path.join(DATA_DIR, "db.json")

// DB 스키마
interface LocalDB {
  categories: Category[]
  items: (Item & { categories?: Category })[]
  reviews: (Review & { items?: Partial<Item> })[]
  review_analysis: ReviewAnalysis[]
}

// 초기 데이터
const initialData: LocalDB = {
  categories: [],
  items: [],
  reviews: [],
  review_analysis: [],
}

// ============================================================
// 파일 I/O
// ============================================================
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function readDB(): LocalDB {
  ensureDataDir()
  if (!fs.existsSync(DB_FILE)) {
    writeDB(initialData)
    return initialData
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8")
    return JSON.parse(data)
  } catch (e) {
    console.error("[LocalDB] Error reading DB:", e)
    return initialData
  }
}

function writeDB(data: LocalDB) {
  ensureDataDir()
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8")
}

// ============================================================
// UUID 생성
// ============================================================
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================
// Categories CRUD
// ============================================================
export const localCategories = {
  async getAll(): Promise<Category[]> {
    const db = readDB()
    return db.categories
  },

  async getById(id: string): Promise<Category | null> {
    const db = readDB()
    return db.categories.find((c) => c.id === id) || null
  },

  async create(data: { name: string; color?: string }): Promise<Category> {
    const db = readDB()
    const newCategory: Category = {
      id: generateId(),
      name: data.name,
      color: data.color || "#4ECDC4",
      created_at: new Date().toISOString(),
    }
    db.categories.push(newCategory)
    writeDB(db)
    return newCategory
  },

  async update(id: string, data: Partial<Category>): Promise<Category | null> {
    const db = readDB()
    const index = db.categories.findIndex((c) => c.id === id)
    if (index === -1) return null
    db.categories[index] = { ...db.categories[index], ...data }
    writeDB(db)
    return db.categories[index]
  },

  async delete(id: string): Promise<boolean> {
    const db = readDB()
    const index = db.categories.findIndex((c) => c.id === id)
    if (index === -1) return false
    db.categories.splice(index, 1)
    // 연관된 아이템의 category_id를 null로 설정
    db.items.forEach((item) => {
      if (item.category_id === id) {
        item.category_id = null
      }
    })
    writeDB(db)
    return true
  },
}

// ============================================================
// Items CRUD
// ============================================================
export const localItems = {
  async getAll(): Promise<(Item & { categories?: Category; review_count?: number; avg_rating?: number })[]> {
    const db = readDB()
    return db.items.map((item) => {
      const category = db.categories.find((c) => c.id === item.category_id)
      const itemReviews = db.reviews.filter((r) => r.item_id === item.id)
      const avgRating =
        itemReviews.length > 0
          ? itemReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / itemReviews.length
          : 0
      return {
        ...item,
        categories: category,
        review_count: itemReviews.length,
        avg_rating: Math.round(avgRating * 10) / 10,
      }
    })
  },

  async getById(id: string): Promise<Item | null> {
    const db = readDB()
    return db.items.find((i) => i.id === id) || null
  },

  async create(data: {
    url: string
    platform: string
    category_id?: string
    product_name?: string
    product_image?: string
    price?: number
  }): Promise<Item> {
    const db = readDB()
    const newItem: Item = {
      id: generateId(),
      category_id: data.category_id || null,
      url: data.url,
      platform: data.platform,
      product_name: data.product_name || null,
      product_image: data.product_image || null,
      price: data.price || null,
      last_crawled_at: null,
      created_at: new Date().toISOString(),
    }
    db.items.push(newItem)
    writeDB(db)
    return newItem
  },

  async update(id: string, data: Partial<Item>): Promise<Item | null> {
    const db = readDB()
    const index = db.items.findIndex((i) => i.id === id)
    if (index === -1) return null
    db.items[index] = { ...db.items[index], ...data }
    writeDB(db)
    return db.items[index]
  },

  async delete(id: string): Promise<boolean> {
    const db = readDB()
    const index = db.items.findIndex((i) => i.id === id)
    if (index === -1) return false
    db.items.splice(index, 1)
    // 연관된 리뷰 삭제
    db.reviews = db.reviews.filter((r) => r.item_id !== id)
    writeDB(db)
    return true
  },

  async updateLastCrawled(id: string): Promise<void> {
    const db = readDB()
    const index = db.items.findIndex((i) => i.id === id)
    if (index !== -1) {
      db.items[index].last_crawled_at = new Date().toISOString()
      writeDB(db)
    }
  },
}

// ============================================================
// Reviews CRUD
// ============================================================
export const localReviews = {
  async getAll(filters?: {
    itemId?: string
    sentiment?: string
    startDate?: string
    endDate?: string
  }): Promise<(Review & { items?: Partial<Item> })[]> {
    const db = readDB()
    let reviews = db.reviews

    if (filters?.itemId) {
      reviews = reviews.filter((r) => r.item_id === filters.itemId)
    }
    if (filters?.sentiment) {
      reviews = reviews.filter((r) => r.sentiment === filters.sentiment)
    }
    if (filters?.startDate) {
      reviews = reviews.filter((r) => r.date && r.date >= filters.startDate!)
    }
    if (filters?.endDate) {
      reviews = reviews.filter((r) => r.date && r.date <= filters.endDate!)
    }

    // 아이템 정보 조인
    return reviews.map((review) => {
      const item = db.items.find((i) => i.id === review.item_id)
      return {
        ...review,
        items: item
          ? {
              id: item.id,
              product_name: item.product_name,
              platform: item.platform,
              product_image: item.product_image,
            }
          : undefined,
      }
    })
  },

  async getByItemId(itemId: string): Promise<Review[]> {
    const db = readDB()
    return db.reviews.filter((r) => r.item_id === itemId)
  },

  async upsert(data: {
    item_id: string
    author: string
    rating?: number
    content: string
    images?: string[]
    date?: string
    sentiment?: string
    keywords?: string[]
  }): Promise<{ inserted: boolean; review: Review }> {
    const db = readDB()

    // 중복 체크 (item_id + author + date + content)
    const existing = db.reviews.find(
      (r) =>
        r.item_id === data.item_id &&
        r.author === data.author &&
        r.date === data.date &&
        r.content === data.content
    )

    if (existing) {
      return { inserted: false, review: existing }
    }

    const newReview: Review = {
      id: generateId(),
      item_id: data.item_id,
      author: data.author || "Unknown",
      rating: data.rating || 5,
      content: data.content,
      images: data.images || [],
      date: data.date || null,
      sentiment: data.sentiment as "positive" | "negative" | "neutral" | null || null,
      keywords: data.keywords || null,
      crawled_at: new Date().toISOString(),
    }
    db.reviews.push(newReview)
    writeDB(db)
    return { inserted: true, review: newReview }
  },

  async bulkUpsert(
    itemId: string,
    reviews: Array<{
      author: string
      rating?: number
      content: string
      images?: string[]
      date?: string
      sentiment?: string
      keywords?: string[]
    }>
  ): Promise<{ inserted: number; skipped: number }> {
    let inserted = 0
    let skipped = 0

    for (const review of reviews) {
      const result = await this.upsert({
        item_id: itemId,
        ...review,
      })
      if (result.inserted) {
        inserted++
      } else {
        skipped++
      }
    }

    return { inserted, skipped }
  },

  async getStats(itemId?: string): Promise<{
    total: number
    positive: number
    negative: number
    neutral: number
    avgRating: number
  }> {
    const db = readDB()
    let reviews = db.reviews
    if (itemId) {
      reviews = reviews.filter((r) => r.item_id === itemId)
    }

    const total = reviews.length
    const positive = reviews.filter((r) => r.sentiment === "positive").length
    const negative = reviews.filter((r) => r.sentiment === "negative").length
    const neutral = reviews.filter((r) => r.sentiment === "neutral").length
    const avgRating =
      total > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total : 0

    return {
      total,
      positive,
      negative,
      neutral,
      avgRating: Math.round(avgRating * 10) / 10,
    }
  },

  async updateSentiment(reviewId: string, sentiment: "positive" | "negative" | "neutral"): Promise<boolean> {
    const db = readDB()
    const index = db.reviews.findIndex((r) => r.id === reviewId)
    if (index === -1) return false
    db.reviews[index].sentiment = sentiment
    writeDB(db)
    return true
  },

  async bulkUpdateSentiment(updates: Array<{ id: string; sentiment: "positive" | "negative" | "neutral" }>): Promise<number> {
    const db = readDB()
    let updated = 0
    for (const { id, sentiment } of updates) {
      const index = db.reviews.findIndex((r) => r.id === id)
      if (index !== -1) {
        db.reviews[index].sentiment = sentiment
        updated++
      }
    }
    writeDB(db)
    return updated
  },

  async updateKeywords(reviewId: string, keywords: string[]): Promise<boolean> {
    const db = readDB()
    const index = db.reviews.findIndex((r) => r.id === reviewId)
    if (index === -1) return false
    db.reviews[index].keywords = keywords
    writeDB(db)
    return true
  },

  async bulkUpdateAnalysis(updates: Array<{ id: string; sentiment: "positive" | "negative" | "neutral"; keywords: string[] }>): Promise<number> {
    const db = readDB()
    let updated = 0
    for (const { id, sentiment, keywords } of updates) {
      const index = db.reviews.findIndex((r) => r.id === id)
      if (index !== -1) {
        db.reviews[index].sentiment = sentiment
        db.reviews[index].keywords = keywords
        updated++
      }
    }
    writeDB(db)
    return updated
  },

  async getKeywordStats(itemIds?: string[]): Promise<{ positive: { word: string; count: number }[]; negative: { word: string; count: number }[] }> {
    const db = readDB()
    let reviews = db.reviews

    if (itemIds && itemIds.length > 0) {
      reviews = reviews.filter(r => itemIds.includes(r.item_id))
    }

    const positiveKeywords: Record<string, number> = {}
    const negativeKeywords: Record<string, number> = {}

    reviews.forEach(review => {
      if (!review.keywords || review.keywords.length === 0) return

      const target = review.sentiment === "positive"
        ? positiveKeywords
        : review.sentiment === "negative"
        ? negativeKeywords
        : null

      if (target) {
        review.keywords.forEach(kw => {
          target[kw] = (target[kw] || 0) + 1
        })
      }
    })

    const toSortedList = (obj: Record<string, number>) =>
      Object.entries(obj)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count)

    return {
      positive: toSortedList(positiveKeywords),
      negative: toSortedList(negativeKeywords),
    }
  },
}

// ============================================================
// Review Analysis
// ============================================================
export const localAnalysis = {
  async get(itemId: string, analysisType: string): Promise<ReviewAnalysis | null> {
    const db = readDB()
    return (
      db.review_analysis.find(
        (a) => a.item_id === itemId && a.analysis_type === analysisType
      ) || null
    )
  },

  async save(data: {
    item_id: string
    analysis_type: string
    result: Record<string, unknown>
  }): Promise<ReviewAnalysis> {
    const db = readDB()

    // 기존 분석 결과 덮어쓰기
    const existingIndex = db.review_analysis.findIndex(
      (a) => a.item_id === data.item_id && a.analysis_type === data.analysis_type
    )

    const analysis: ReviewAnalysis = {
      id: existingIndex >= 0 ? db.review_analysis[existingIndex].id : generateId(),
      item_id: data.item_id,
      analysis_type: data.analysis_type,
      result: data.result,
      created_at: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      db.review_analysis[existingIndex] = analysis
    } else {
      db.review_analysis.push(analysis)
    }

    writeDB(db)
    return analysis
  },
}

// ============================================================
// Export
// ============================================================
export const localDB = {
  categories: localCategories,
  items: localItems,
  reviews: localReviews,
  analysis: localAnalysis,
}

export default localDB
