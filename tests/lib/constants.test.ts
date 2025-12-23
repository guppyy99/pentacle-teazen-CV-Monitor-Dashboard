import { describe, it, expect } from "vitest"
import {
  DATE_RANGE_OPTIONS,
  generateDates,
  filterDataByDateRange,
  type DateRange,
} from "@/lib/constants"

describe("constants", () => {
  describe("DATE_RANGE_OPTIONS", () => {
    it("should have correct options", () => {
      expect(DATE_RANGE_OPTIONS).toHaveLength(5)
      expect(DATE_RANGE_OPTIONS.map(o => o.value)).toEqual(["7d", "1m", "3m", "6m", "1y"])
    })

    it("should have correct days for each option", () => {
      const daysMap: Record<DateRange, number> = {
        "7d": 7,
        "1m": 30,
        "3m": 90,
        "6m": 180,
        "1y": 365,
      }

      DATE_RANGE_OPTIONS.forEach(opt => {
        expect(opt.days).toBe(daysMap[opt.value])
      })
    })
  })

  describe("generateDates", () => {
    it("should generate correct number of dates", () => {
      const dates = generateDates(7)
      expect(dates).toHaveLength(7)
    })

    it("should generate dates in ascending order", () => {
      const dates = generateDates(5)
      for (let i = 1; i < dates.length; i++) {
        expect(new Date(dates[i]).getTime()).toBeGreaterThan(new Date(dates[i - 1]).getTime())
      }
    })

    it("should include today as last date", () => {
      const dates = generateDates(1)
      const today = new Date().toISOString().split("T")[0]
      expect(dates[0]).toBe(today)
    })
  })

  describe("filterDataByDateRange", () => {
    it("should filter data within 7 days", () => {
      const today = new Date()
      const data = [
        { date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], count: 10 },
        { date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], count: 20 },
        { date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], count: 30 },
      ]

      const filtered = filterDataByDateRange(data, "7d")
      expect(filtered).toHaveLength(2)
    })

    it("should return all data for 1 year range", () => {
      const today = new Date()
      const data = [
        { date: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], count: 10 },
        { date: new Date(today.getTime() - 100 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], count: 20 },
        { date: new Date(today.getTime() - 300 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], count: 30 },
      ]

      const filtered = filterDataByDateRange(data, "1y")
      expect(filtered).toHaveLength(3)
    })
  })
})
