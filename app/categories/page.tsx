"use client"

import { useState, useMemo, useEffect } from "react"
import {
  IconStar,
  IconMessage,
  IconMoodHappy,
  IconSparkles,
  IconLoader2,
} from "@tabler/icons-react"
import {
  Bar,
  BarChart,
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts"

import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { CategoryStats } from "@/types"
import { DATE_RANGE_OPTIONS, type DateRange } from "@/lib/constants"
import {
  getCategories,
  getItems,
  getReviews,
  analyzeReviews,
  type CategoryData,
  type ItemData,
  type ReviewData,
} from "@/lib/api"

// 기본 색상 팔레트
const DEFAULT_COLORS = ["#4ECDC4", "#FF6B6B", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"]

export default function CategoriesPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)

  // API 데이터 상태
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [items, setItems] = useState<ItemData[]>([])
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [categoriesData, itemsData, reviewsData] = await Promise.all([
          getCategories(),
          getItems(),
          getReviews({ limit: 1000 }),
        ])

        setCategories(categoriesData)
        setItems(itemsData)
        setReviews(reviewsData.reviews)
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 카테고리별 통계 계산
  const categoryStats: CategoryStats[] = useMemo(() => {
    return categories.map((category, index) => {
      const categoryItems = items.filter(item => item.category_id === category.id)
      const itemIds = categoryItems.map(item => item.id)
      const categoryReviews = reviews.filter(r => itemIds.includes(r.item_id))

      const totalReviews = categoryReviews.length
      const avgRating = categoryReviews.length > 0
        ? categoryReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / categoryReviews.length
        : 0

      const positiveCount = categoryReviews.filter(r => r.sentiment === "positive").length
      const negativeCount = categoryReviews.filter(r => r.sentiment === "negative").length
      const neutralCount = categoryReviews.filter(r => r.sentiment === "neutral").length
      const analyzedCount = positiveCount + negativeCount + neutralCount

      const positiveRate = analyzedCount > 0 ? Math.round((positiveCount / analyzedCount) * 100) : 0
      const negativeRate = analyzedCount > 0 ? Math.round((negativeCount / analyzedCount) * 100) : 0

      return {
        categoryId: category.id,
        categoryName: category.name,
        itemCount: categoryItems.length,
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        positiveRate,
        negativeRate,
        color: category.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      }
    })
  }, [categories, items, reviews])

  // 카테고리 선택 토글
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
    setAiSummary(null)
  }

  // 전체 선택/해제
  const toggleAll = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(categories.map(c => c.id))
    }
    setAiSummary(null)
  }

  // 선택된 카테고리 통계
  const selectedStats = categoryStats.filter(s =>
    selectedCategories.includes(s.categoryId)
  )

  // 비교 차트 데이터
  const comparisonChartData = selectedStats.map(stat => ({
    name: stat.categoryName,
    리뷰수: stat.totalReviews,
    평균별점: stat.avgRating,
    color: stat.color,
  }))

  // 감정 비율 차트 데이터
  const sentimentChartData = selectedStats.map(stat => ({
    name: stat.categoryName,
    긍정: stat.positiveRate,
    부정: stat.negativeRate,
    중립: 100 - stat.positiveRate - stat.negativeRate,
    color: stat.color,
  }))

  // 리뷰 추이 데이터 (날짜 범위에 따른 일별 리뷰 수)
  const trendChartData = useMemo(() => {
    if (selectedCategories.length === 0) return []

    const days = dateRange === "7d" ? 7 : dateRange === "1m" ? 30 : 90
    const now = new Date()
    const dates: string[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split("T")[0])
    }

    return dates.map(date => {
      const dataPoint: Record<string, any> = {
        date: date.substring(5), // MM-DD
      }

      selectedCategories.forEach(catId => {
        const category = categories.find(c => c.id === catId)
        const categoryItems = items.filter(item => item.category_id === catId)
        const itemIds = categoryItems.map(item => item.id)
        const dayReviews = reviews.filter(r =>
          itemIds.includes(r.item_id) && r.date?.startsWith(date)
        )
        dataPoint[category?.name || catId] = dayReviews.length
      })

      return dataPoint
    })
  }, [selectedCategories, dateRange, categories, items, reviews])

  // AI 요약 생성
  const handleGenerateAI = async () => {
    if (selectedCategories.length === 0) return

    setIsGeneratingAI(true)
    setAiSummary(null)

    try {
      // 선택된 카테고리의 아이템 ID들 수집
      const selectedItemIds: string[] = []
      selectedCategories.forEach(catId => {
        const categoryItems = items.filter(item => item.category_id === catId)
        selectedItemIds.push(...categoryItems.map(item => item.id))
      })

      if (selectedItemIds.length === 0) {
        setAiSummary("선택된 카테고리에 아이템이 없습니다.")
        return
      }

      // AI 분석 API 호출
      const result = await analyzeReviews({
        itemIds: selectedItemIds,
        type: "insights",
        dateRange,
      })

      if ("overview" in result) {
        const selectedNames = selectedStats.map(s => s.categoryName).join(", ")
        const summary = `## ${selectedNames} 카테고리 리뷰 분석 요약

### 개요
${result.overview}

### 주요 통계
${selectedStats.map(s => `- **${s.categoryName}**: 총 ${s.totalReviews.toLocaleString()}건의 리뷰, 평균 ${s.avgRating}점, 긍정률 ${s.positiveRate}%`).join("\n")}

### 긍정적 반응
${result.pros.map(p => `- ${p}`).join("\n")}

### 개선 필요 사항
${result.cons.map(c => `- ${c}`).join("\n")}

### 권장 조치사항
${result.actions.map(a => `- **${a.title}** (${a.priority}): ${a.detail}`).join("\n")}

### 리스크 요인
${result.risks.map(r => `- ${r}`).join("\n")}
`
        setAiSummary(summary)
      }
    } catch (error) {
      console.error("AI analysis failed:", error)

      // Fallback: 기본 통계 기반 요약
      const selectedNames = selectedStats.map(s => s.categoryName).join(", ")
      const fallbackSummary = `## ${selectedNames} 카테고리 리뷰 분석 요약

### 주요 통계
${selectedStats.map(s => `- **${s.categoryName}**: 총 ${s.totalReviews.toLocaleString()}건의 리뷰, 평균 ${s.avgRating}점, 긍정률 ${s.positiveRate}%`).join("\n")}

### 분석 결과
${selectedStats.length > 1
  ? `가장 높은 평점: ${selectedStats.reduce((a, b) => a.avgRating > b.avgRating ? a : b).categoryName} (${selectedStats.reduce((a, b) => a.avgRating > b.avgRating ? a : b).avgRating}점)
가장 높은 긍정률: ${selectedStats.reduce((a, b) => a.positiveRate > b.positiveRate ? a : b).categoryName} (${selectedStats.reduce((a, b) => a.positiveRate > b.positiveRate ? a : b).positiveRate}%)`
  : "다른 카테고리와 비교하려면 여러 카테고리를 선택하세요."}

*참고: AI 분석 서비스에 연결할 수 없어 기본 통계만 표시됩니다.*
`
      setAiSummary(fallbackSummary)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const chartColors = ["#4ECDC4", "#FF6B6B", "#45B7D1", "#96CEB4"]

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">카테고리별 조회</h1>
            <p className="text-muted-foreground">카테고리 단위로 리뷰 데이터를 비교하고 분석합니다</p>
          </div>
          <Select value={dateRange} onValueChange={(v: DateRange) => setDateRange(v)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DATE_RANGE_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
          {/* 좌측: 카테고리 선택 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">카테고리 선택</CardTitle>
                <Button variant="ghost" size="sm" onClick={toggleAll}>
                  {selectedCategories.length === categories.length ? "전체 해제" : "전체 선택"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  등록된 카테고리가 없습니다
                </p>
              ) : (
                <div className="space-y-3">
                  {categories.map((category, index) => {
                    const stat = categoryStats.find(s => s.categoryId === category.id)
                    const isSelected = selectedCategories.includes(category.id)
                    const color = category.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]

                    return (
                      <div
                        key={category.id}
                        className={`flex items-start gap-3 rounded-lg border p-3 transition-colors cursor-pointer hover:bg-muted/50 ${
                          isSelected ? "border-primary bg-muted/30" : ""
                        }`}
                        onClick={() => toggleCategory(category.id)}
                      >
                        <Checkbox
                          id={category.id}
                          checked={isSelected}
                          className="mt-0.5"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <Label htmlFor={category.id} className="font-medium cursor-pointer">
                              {category.name}
                            </Label>
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span>아이템 {stat?.itemCount || 0}개</span>
                            <span>리뷰 {(stat?.totalReviews || 0).toLocaleString()}건</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {selectedCategories.length > 0 && (
                <Button
                  className="mt-4 w-full"
                  onClick={handleGenerateAI}
                  disabled={isGeneratingAI}
                >
                  {isGeneratingAI ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI 분석 중...
                    </>
                  ) : (
                    <>
                      <IconSparkles className="mr-2 h-4 w-4" />
                      AI 요약 생성
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 우측: 통계 및 차트 */}
          <div className="space-y-6">
            {selectedCategories.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">카테고리를 선택하여 통계를 확인하세요</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* 통계 카드 */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        선택된 카테고리
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedCategories.length}개</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <IconMessage className="h-4 w-4" />
                          총 리뷰 수
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedStats.reduce((sum, s) => sum + s.totalReviews, 0).toLocaleString()}건
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <IconStar className="h-4 w-4" />
                          평균 별점
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedStats.length > 0
                          ? (selectedStats.reduce((sum, s) => sum + s.avgRating, 0) / selectedStats.length).toFixed(1)
                          : "0.0"}점
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <IconMoodHappy className="h-4 w-4" />
                          평균 긍정률
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {selectedStats.length > 0
                          ? Math.round(selectedStats.reduce((sum, s) => sum + s.positiveRate, 0) / selectedStats.length)
                          : 0}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 차트 탭 */}
                <Tabs defaultValue="trend" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="trend">발행량 추이</TabsTrigger>
                    <TabsTrigger value="reviews">리뷰 수 비교</TabsTrigger>
                    <TabsTrigger value="rating">평균 별점</TabsTrigger>
                    <TabsTrigger value="sentiment">감정 분석</TabsTrigger>
                  </TabsList>

                  <TabsContent value="trend">
                    <Card>
                      <CardHeader>
                        <CardTitle>리뷰 발행량 추이</CardTitle>
                        <CardDescription>
                          {DATE_RANGE_OPTIONS.find(opt => opt.value === dateRange)?.label} 기준 일별 리뷰 발생 현황
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                interval={dateRange === "7d" ? 0 : dateRange === "1m" ? 4 : "preserveStartEnd"}
                              />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              {selectedCategories.map((catId, index) => {
                                const category = categories.find(c => c.id === catId)
                                return (
                                  <Area
                                    key={catId}
                                    type="monotone"
                                    dataKey={category?.name || catId}
                                    stroke={chartColors[index % chartColors.length]}
                                    fill={chartColors[index % chartColors.length]}
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                  />
                                )
                              })}
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="reviews">
                    <Card>
                      <CardHeader>
                        <CardTitle>카테고리별 리뷰 수</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="리뷰수" radius={[4, 4, 0, 0]}>
                                {comparisonChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="rating">
                    <Card>
                      <CardHeader>
                        <CardTitle>카테고리별 평균 별점</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonChartData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis domain={[0, 5]} />
                              <Tooltip />
                              <Bar dataKey="평균별점" radius={[4, 4, 0, 0]}>
                                {comparisonChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="sentiment">
                    <Card>
                      <CardHeader>
                        <CardTitle>카테고리별 감정 분포</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sentimentChartData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" domain={[0, 100]} />
                              <YAxis type="category" dataKey="name" width={80} />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="긍정" stackId="a" fill="#22c55e" />
                              <Bar dataKey="중립" stackId="a" fill="#94a3b8" />
                              <Bar dataKey="부정" stackId="a" fill="#ef4444" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* AI 요약 */}
                {aiSummary && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconSparkles className="h-5 w-5 text-purple-500" />
                        AI 분석 요약
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        {aiSummary.split("\n").map((line, i) => {
                          if (line.startsWith("##")) {
                            return <h2 key={i} className="text-lg font-bold mt-4 first:mt-0">{line.replace(/##\s*/, "")}</h2>
                          }
                          if (line.startsWith("###")) {
                            return <h3 key={i} className="text-base font-semibold mt-3">{line.replace(/###\s*/, "")}</h3>
                          }
                          if (line.startsWith("- ")) {
                            return <li key={i} className="ml-4">{line.replace(/^-\s*/, "").replace(/\*\*(.*?)\*\*/g, "$1")}</li>
                          }
                          if (line.startsWith("*")) {
                            return <p key={i} className="text-muted-foreground italic">{line.replace(/^\*/, "").replace(/\*$/, "")}</p>
                          }
                          return line ? <p key={i}>{line}</p> : null
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
