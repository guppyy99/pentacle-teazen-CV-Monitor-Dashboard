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
export function generateDates(days: number): string[] {
  const dates: string[] = []
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split("T")[0])
  }
  return dates
}

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
