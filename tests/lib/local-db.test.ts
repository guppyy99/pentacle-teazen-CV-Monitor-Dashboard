import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import fs from "fs"
import path from "path"

// Mock fs module
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}))

describe("local-db", () => {
  const mockDB = {
    categories: [],
    items: [],
    reviews: [],
    review_analysis: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockDB))
  })

  describe("categories", () => {
    it("should create a category", async () => {
      const { localCategories } = await import("@/lib/local-db")

      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ ...mockDB }))

      const category = await localCategories.create({ name: "테스트", color: "#FF0000" })

      expect(category.name).toBe("테스트")
      expect(category.color).toBe("#FF0000")
      expect(category.id).toBeDefined()
      expect(fs.writeFileSync).toHaveBeenCalled()
    })

    it("should get all categories", async () => {
      const { localCategories } = await import("@/lib/local-db")

      const mockCategories = [
        { id: "1", name: "카테고리1", color: "#000", created_at: "2024-01-01" },
        { id: "2", name: "카테고리2", color: "#FFF", created_at: "2024-01-02" },
      ]
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ ...mockDB, categories: mockCategories })
      )

      const categories = await localCategories.getAll()

      expect(categories).toHaveLength(2)
      expect(categories[0].name).toBe("카테고리1")
    })
  })

  describe("reviews", () => {
    it("should calculate keyword stats correctly", async () => {
      const { localReviews } = await import("@/lib/local-db")

      const mockReviews = [
        { id: "1", item_id: "item1", sentiment: "positive", keywords: ["맛있다", "신선"] },
        { id: "2", item_id: "item1", sentiment: "positive", keywords: ["맛있다", "배송빠름"] },
        { id: "3", item_id: "item1", sentiment: "negative", keywords: ["비싸다", "양적다"] },
      ]
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ ...mockDB, reviews: mockReviews })
      )

      const stats = await localReviews.getKeywordStats(["item1"])

      expect(stats.positive).toContainEqual({ word: "맛있다", count: 2 })
      expect(stats.positive).toContainEqual({ word: "신선", count: 1 })
      expect(stats.negative).toContainEqual({ word: "비싸다", count: 1 })
    })

    it("should return empty stats for items without keywords", async () => {
      const { localReviews } = await import("@/lib/local-db")

      const mockReviews = [
        { id: "1", item_id: "item1", sentiment: "positive", keywords: null },
        { id: "2", item_id: "item1", sentiment: "negative", keywords: [] },
      ]
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ ...mockDB, reviews: mockReviews })
      )

      const stats = await localReviews.getKeywordStats(["item1"])

      expect(stats.positive).toHaveLength(0)
      expect(stats.negative).toHaveLength(0)
    })

    it("should get review stats correctly", async () => {
      const { localReviews } = await import("@/lib/local-db")

      const mockReviews = [
        { id: "1", item_id: "item1", rating: 5, sentiment: "positive" },
        { id: "2", item_id: "item1", rating: 4, sentiment: "positive" },
        { id: "3", item_id: "item1", rating: 2, sentiment: "negative" },
        { id: "4", item_id: "item1", rating: 3, sentiment: "neutral" },
      ]
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ ...mockDB, reviews: mockReviews })
      )

      const stats = await localReviews.getStats("item1")

      expect(stats.total).toBe(4)
      expect(stats.positive).toBe(2)
      expect(stats.negative).toBe(1)
      expect(stats.neutral).toBe(1)
      expect(stats.avgRating).toBe(3.5)
    })
  })
})
