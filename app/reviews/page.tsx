"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import {
  IconStar,
  IconMessage,
  IconMoodHappy,
  IconMoodSad,
  IconMoodEmpty,
  IconSparkles,
  IconLoader2,
  IconCheck,
  IconX,
  IconCalendar,
  IconUser,
} from "@tabler/icons-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { DATE_RANGE_OPTIONS, type DateRange } from "@/lib/constants"
import {
  getCategories,
  getItems,
  getReviews,
  getKeywordStats,
  analyzeReviews,
  type CategoryData,
  type ItemData,
  type ReviewData,
  type KeywordStats,
} from "@/lib/api"

// 워드클라우드 동적 import (SSR 비활성화)
const ReactWordcloud = dynamic(() => import("react-wordcloud"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[200px] items-center justify-center text-muted-foreground">
      로딩 중...
    </div>
  ),
})

const MAX_SELECTION = 4

export default function ReviewsPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "positive" | "negative">("all")
  const [dateRange, setDateRange] = useState<DateRange>("7d")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)

  // API 데이터 상태
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [items, setItems] = useState<ItemData[]>([])
  const [reviews, setReviews] = useState<ReviewData[]>([])
  const [keywordStats, setKeywordStats] = useState<KeywordStats>({ positive: [], negative: [] })
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

  // 카테고리로 필터링된 아이템
  const filteredItems = useMemo(() => {
    if (categoryFilter === "all") return items
    return items.filter(item => item.category_id === categoryFilter)
  }, [categoryFilter, items])

  // 아이템 선택 토글
  const toggleItem = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId)
      }
      if (prev.length >= MAX_SELECTION) {
        return prev
      }
      return [...prev, itemId]
    })
    setAiSummary(null)
  }

  // 선택된 아이템 정보
  const selectedItemsData = items.filter(item => selectedItems.includes(item.id))

  // 선택된 아이템의 리뷰
  const selectedReviews = useMemo(() => {
    return reviews.filter(review => selectedItems.includes(review.item_id))
  }, [reviews, selectedItems])

  // 감정 필터링된 리뷰
  const filteredReviews = useMemo(() => {
    if (sentimentFilter === "all") return selectedReviews
    return selectedReviews.filter(review => review.sentiment === sentimentFilter)
  }, [selectedReviews, sentimentFilter])

  // 선택된 아이템의 통계 계산
  const selectedStats = useMemo(() => {
    return selectedItems.map(itemId => {
      const itemReviews = reviews.filter(r => r.item_id === itemId)
      const total = itemReviews.length
      const positive = itemReviews.filter(r => r.sentiment === "positive").length
      const negative = itemReviews.filter(r => r.sentiment === "negative").length
      const avgRating = total > 0
        ? itemReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / total
        : 0

      return {
        itemId,
        totalReviews: total,
        avgRating: Math.round(avgRating * 10) / 10,
        positiveRate: total > 0 ? Math.round((positive / total) * 100) : 0,
        negativeRate: total > 0 ? Math.round((negative / total) * 100) : 0,
      }
    })
  }, [selectedItems, reviews])

  // 리뷰 추이 차트 데이터
  const trendChartData = useMemo(() => {
    if (selectedItems.length === 0) return []

    const days = dateRange === "7d" ? 7 : dateRange === "1m" ? 30 : 90
    const now = new Date()
    const dates: string[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split("T")[0])
    }

    return dates.map(date => {
      const dataPoint: Record<string, any> = { date: date.substring(5) }

      selectedItems.forEach((itemId) => {
        const item = items.find(i => i.id === itemId)
        const dayReviews = reviews.filter(r =>
          r.item_id === itemId && r.date?.startsWith(date)
        )
        dataPoint[item?.product_name?.substring(0, 10) || itemId] = dayReviews.length
      })

      return dataPoint
    })
  }, [selectedItems, dateRange, items, reviews])

  // 워드클라우드 데이터 (긍정/부정)
  const keywordData = useMemo(() => {
    const positive: Record<string, number> = {}
    const negative: Record<string, number> = {}

    // 선택된 아이템의 리뷰에서 키워드 집계
    selectedReviews.forEach(review => {
      if (!review.keywords || review.keywords.length === 0) return

      const target = review.sentiment === "positive"
        ? positive
        : review.sentiment === "negative"
        ? negative
        : null

      if (target) {
        review.keywords.forEach(kw => {
          target[kw] = (target[kw] || 0) + 1
        })
      }
    })

    // API에서 가져온 키워드 통계도 병합
    keywordStats.positive.forEach(kw => {
      positive[kw.word] = (positive[kw.word] || 0) + kw.count
    })
    keywordStats.negative.forEach(kw => {
      negative[kw.word] = (negative[kw.word] || 0) + kw.count
    })

    const positiveList = Object.entries(positive)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)

    const negativeList = Object.entries(negative)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)

    // 워드클라우드용 데이터 (text, value 형식)
    const positiveCloud = positiveList.map(kw => ({ text: kw.word, value: kw.count }))
    const negativeCloud = negativeList.map(kw => ({ text: kw.word, value: kw.count }))

    return {
      positive: positiveList,
      negative: negativeList,
      positiveCloud,
      negativeCloud,
    }
  }, [selectedReviews, keywordStats])

  // 키워드 통계 로드
  useEffect(() => {
    if (selectedItems.length === 0) {
      setKeywordStats({ positive: [], negative: [] })
      return
    }

    const loadKeywords = async () => {
      try {
        const stats = await getKeywordStats(selectedItems, dateRange)
        setKeywordStats(stats)
      } catch (error) {
        console.error("Failed to load keyword stats:", error)
      }
    }

    loadKeywords()
  }, [selectedItems, dateRange])

  // 워드클라우드 옵션 - 긍정 (녹색 계열)
  const positiveWordcloudOptions = useMemo(() => ({
    colors: ["#22c55e", "#16a34a", "#15803d", "#166534", "#14532d", "#4ade80", "#86efac"],
    enableTooltip: true,
    deterministic: true,
    fontFamily: "Pretendard, sans-serif",
    fontSizes: [24, 64] as [number, number],
    fontStyle: "normal",
    fontWeight: "bold",
    padding: 4,
    rotations: 2,
    rotationAngles: [0, 0] as [number, number],
    scale: "sqrt" as const,
    spiral: "archimedean" as const,
    transitionDuration: 500,
  }), [])

  // 워드클라우드 옵션 - 부정 (빨간 계열)
  const negativeWordcloudOptions = useMemo(() => ({
    colors: ["#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d", "#f87171", "#fca5a5"],
    enableTooltip: true,
    deterministic: true,
    fontFamily: "Pretendard, sans-serif",
    fontSizes: [24, 64] as [number, number],
    fontStyle: "normal",
    fontWeight: "bold",
    padding: 4,
    rotations: 2,
    rotationAngles: [0, 0] as [number, number],
    scale: "sqrt" as const,
    spiral: "archimedean" as const,
    transitionDuration: 500,
  }), [])

  // 비교 차트 데이터
  const comparisonData = selectedItemsData.map(item => {
    const stat = selectedStats.find(s => s.itemId === item.id)
    const category = categories.find(c => c.id === item.category_id)
    return {
      name: (item.product_name || "").substring(0, 15) + "...",
      fullName: item.product_name,
      리뷰수: item.review_count || stat?.totalReviews || 0,
      평균별점: item.avg_rating || stat?.avgRating || 0,
      긍정률: stat?.positiveRate || 0,
      color: category?.color || "#888",
    }
  })

  // AI 요약 생성
  const handleGenerateAI = async () => {
    if (selectedItems.length === 0) return

    setIsGeneratingAI(true)
    setAiSummary(null)

    try {
      const result = await analyzeReviews({
        itemIds: selectedItems,
        type: "insights",
        dateRange,
      })

      if ("overview" in result) {
        const itemNames = selectedItemsData.map(i => i.product_name).join(", ")
        const totalReviews = selectedStats.reduce((sum, s) => sum + s.totalReviews, 0)
        const avgRating = selectedStats.length > 0
          ? (selectedStats.reduce((sum, s) => sum + s.avgRating, 0) / selectedStats.length).toFixed(1)
          : "0"

        const summary = `## 리뷰 분석 요약

### 분석 대상
${selectedItemsData.map(i => `- ${i.product_name}`).join("\n")}

### 개요
${result.overview}

### 핵심 지표
- **총 리뷰 수**: ${totalReviews.toLocaleString()}건
- **평균 별점**: ${avgRating}점
- **주요 긍정 키워드**: ${keywordData.positive.slice(0, 3).map(k => k.word).join(", ") || "분석 중"}
- **주요 개선점**: ${keywordData.negative.slice(0, 3).map(k => k.word).join(", ") || "분석 중"}

### 긍정적 반응
${result.pros.map(p => `- ${p}`).join("\n")}

### 개선 필요 사항
${result.cons.map(c => `- ${c}`).join("\n")}

### 권장 조치사항
${result.actions.map(a => `- **${a.title}** (${a.priority}): ${a.detail}`).join("\n")}
`
        setAiSummary(summary)
      }
    } catch (error) {
      console.error("AI analysis failed:", error)

      // Fallback
      const totalReviews = selectedStats.reduce((sum, s) => sum + s.totalReviews, 0)
      const avgRating = selectedStats.length > 0
        ? (selectedStats.reduce((sum, s) => sum + s.avgRating, 0) / selectedStats.length).toFixed(1)
        : "0"

      const fallbackSummary = `## 리뷰 분석 요약

### 분석 대상
${selectedItemsData.map(i => `- ${i.product_name}`).join("\n")}

### 핵심 지표
- **총 리뷰 수**: ${totalReviews.toLocaleString()}건
- **평균 별점**: ${avgRating}점
- **평균 긍정률**: ${selectedStats.length > 0 ? Math.round(selectedStats.reduce((sum, s) => sum + s.positiveRate, 0) / selectedStats.length) : 0}%

*참고: AI 분석 서비스에 연결할 수 없어 기본 통계만 표시됩니다.*
`
      setAiSummary(fallbackSummary)
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // 감정 아이콘
  const SentimentIcon = ({ sentiment }: { sentiment: string | null }) => {
    switch (sentiment) {
      case "positive":
        return <IconMoodHappy className="h-4 w-4 text-green-500" />
      case "negative":
        return <IconMoodSad className="h-4 w-4 text-red-500" />
      default:
        return <IconMoodEmpty className="h-4 w-4 text-gray-400" />
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
            <h1 className="text-2xl font-bold">리뷰 조회</h1>
            <p className="text-muted-foreground">아이템별 리뷰 데이터를 조회하고 비교 분석합니다 (최대 {MAX_SELECTION}개 선택)</p>
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

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        {/* 좌측: 아이템 선택 */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">아이템 선택</CardTitle>
              <Badge variant="outline">
                {selectedItems.length}/{MAX_SELECTION}
              </Badge>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="카테고리 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: cat.color || "#888" }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {filteredItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    등록된 아이템이 없습니다
                  </p>
                ) : (
                  filteredItems.map((item) => {
                    const isSelected = selectedItems.includes(item.id)
                    const category = categories.find(c => c.id === item.category_id)
                    const isDisabled = !isSelected && selectedItems.length >= MAX_SELECTION

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                          isSelected ? "border-primary bg-muted/30" : ""
                        } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50"}`}
                        onClick={() => !isDisabled && toggleItem(item.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          className="mt-1"
                        />
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                          {item.product_image && (
                            <Image
                              src={item.product_image}
                              alt={item.product_name || ""}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{item.product_name}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                            {category && (
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: category.color || undefined }}
                              >
                                {category.name}
                              </Badge>
                            )}
                            <span className="flex items-center gap-0.5">
                              <IconStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {item.avg_rating || 0}
                            </span>
                            <span>{(item.review_count || 0).toLocaleString()}건</span>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>

            {selectedItems.length > 0 && (
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
                    AI 리뷰 요약
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 우측: 데이터 표시 */}
        <div className="space-y-6">
          {selectedItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">아이템을 선택하여 리뷰 데이터를 확인하세요</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* 선택된 아이템 요약 */}
              <div className="flex flex-wrap gap-2">
                {selectedItemsData.map((item) => {
                  const category = categories.find(c => c.id === item.category_id)
                  return (
                    <Badge
                      key={item.id}
                      variant="secondary"
                      className="flex items-center gap-2 py-1.5 pl-1.5"
                      style={{ borderLeft: `3px solid ${category?.color || "#888"}` }}
                    >
                      <div className="relative h-6 w-6 overflow-hidden rounded">
                        {item.product_image && (
                          <Image
                            src={item.product_image}
                            alt={item.product_name || ""}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        )}
                      </div>
                      <span className="max-w-[150px] truncate">{item.product_name}</span>
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <IconX className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>

              {/* 통계 카드 */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      선택된 아이템
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedItems.length}개</div>
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

              {/* 탭: 차트, 키워드, 리뷰 */}
              <Tabs defaultValue="trend" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="trend">리뷰 추이</TabsTrigger>
                  <TabsTrigger value="compare">비교 분석</TabsTrigger>
                  <TabsTrigger value="keywords">키워드</TabsTrigger>
                  <TabsTrigger value="reviews">리뷰 데이터</TabsTrigger>
                </TabsList>

                {/* 리뷰 추이 탭 */}
                <TabsContent value="trend">
                  <Card>
                    <CardHeader>
                      <CardTitle>일별 리뷰 발생 추이</CardTitle>
                      <CardDescription>
                        {DATE_RANGE_OPTIONS.find(opt => opt.value === dateRange)?.label} 기준 리뷰 발생 현황
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
                            {selectedItemsData.map((item, index) => (
                              <Area
                                key={item.id}
                                type="monotone"
                                dataKey={(item.product_name || "").substring(0, 10)}
                                stackId="1"
                                stroke={chartColors[index % chartColors.length]}
                                fill={chartColors[index % chartColors.length]}
                                fillOpacity={0.6}
                              />
                            ))}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 비교 분석 탭 */}
                <TabsContent value="compare">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>리뷰 수 비교</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="name" width={120} />
                              <Tooltip
                                formatter={(value, name, props) => [value, props.payload.fullName]}
                              />
                              <Bar dataKey="리뷰수" radius={[0, 4, 4, 0]}>
                                {comparisonData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>평균 별점 비교</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" domain={[0, 5]} />
                              <YAxis type="category" dataKey="name" width={120} />
                              <Tooltip
                                formatter={(value, name, props) => [value, props.payload.fullName]}
                              />
                              <Bar dataKey="평균별점" radius={[0, 4, 4, 0]}>
                                {comparisonData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* 키워드 탭 */}
                <TabsContent value="keywords">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconMoodHappy className="h-5 w-5 text-green-500" />
                          긍정 키워드
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 워드클라우드 */}
                        {keywordData.positiveCloud.length > 0 && (
                          <div className="h-[200px] w-full rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-2">
                            <ReactWordcloud
                              words={keywordData.positiveCloud}
                              options={positiveWordcloudOptions}
                            />
                          </div>
                        )}
                        {/* 키워드 배지 */}
                        <div className="flex flex-wrap gap-2">
                          {keywordData.positive.map((kw, index) => (
                            <Badge
                              key={kw.word}
                              variant="outline"
                              className="border-green-200 bg-green-50 text-green-700"
                              style={{
                                fontSize: `${Math.max(0.75, 1 - index * 0.03)}rem`,
                                padding: `${Math.max(4, 8 - index)}px ${Math.max(8, 12 - index)}px`,
                              }}
                            >
                              {kw.word} ({kw.count})
                            </Badge>
                          ))}
                          {keywordData.positive.length === 0 && (
                            <p className="text-sm text-muted-foreground">키워드 데이터가 없습니다. AI 분석을 실행해주세요.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconMoodSad className="h-5 w-5 text-red-500" />
                          부정 키워드
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* 워드클라우드 */}
                        {keywordData.negativeCloud.length > 0 && (
                          <div className="h-[200px] w-full rounded-lg border bg-gradient-to-br from-red-50 to-rose-50 p-2">
                            <ReactWordcloud
                              words={keywordData.negativeCloud}
                              options={negativeWordcloudOptions}
                            />
                          </div>
                        )}
                        {/* 키워드 배지 */}
                        <div className="flex flex-wrap gap-2">
                          {keywordData.negative.map((kw, index) => (
                            <Badge
                              key={kw.word}
                              variant="outline"
                              className="border-red-200 bg-red-50 text-red-700"
                              style={{
                                fontSize: `${Math.max(0.75, 1 - index * 0.03)}rem`,
                                padding: `${Math.max(4, 8 - index)}px ${Math.max(8, 12 - index)}px`,
                              }}
                            >
                              {kw.word} ({kw.count})
                            </Badge>
                          ))}
                          {keywordData.negative.length === 0 && (
                            <p className="text-sm text-muted-foreground">키워드 데이터가 없습니다. AI 분석을 실행해주세요.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* 리뷰 데이터 탭 */}
                <TabsContent value="reviews">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>리뷰 로우 데이터</CardTitle>
                        <Select value={sentimentFilter} onValueChange={(v: any) => setSentimentFilter(v)}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="positive">긍정</SelectItem>
                            <SelectItem value="negative">부정</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[100px]">날짜</TableHead>
                              <TableHead className="w-[80px]">별점</TableHead>
                              <TableHead>내용</TableHead>
                              <TableHead className="w-[100px]">작성자</TableHead>
                              <TableHead className="w-[80px]">감정</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredReviews.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                  리뷰 데이터가 없습니다
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredReviews.slice(0, 50).map((review) => (
                                <TableRow key={review.id}>
                                  <TableCell className="text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <IconCalendar className="h-3 w-3" />
                                      {review.date || "-"}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <IconStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      {review.rating || "-"}
                                    </div>
                                  </TableCell>
                                  <TableCell className="max-w-md">
                                    <p className="line-clamp-2">{review.content || "-"}</p>
                                    {review.keywords && review.keywords.length > 0 && (
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {review.keywords.slice(0, 3).map((kw) => (
                                          <Badge key={kw} variant="secondary" className="text-xs">
                                            {kw}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1 text-sm">
                                      <IconUser className="h-3 w-3" />
                                      {review.author || "-"}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <SentimentIcon sentiment={review.sentiment} />
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
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
                      AI 리뷰 분석
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
                        if (line.match(/^\d+\./)) {
                          return <li key={i} className="ml-4">{line.replace(/^\d+\.\s*/, "")}</li>
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
