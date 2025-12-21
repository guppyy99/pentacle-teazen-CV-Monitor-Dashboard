"use client"

import { useState, useMemo } from "react"
import {
  IconStar,
  IconMessage,
  IconMoodHappy,
  IconMoodSad,
  IconSparkles,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from "recharts"

import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { Category, CategoryStats } from "@/types"
import { mockCategories, mockItems, mockReviewStats } from "@/lib/mock-data"

export default function CategoriesPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)

  // 카테고리별 통계 계산
  const categoryStats: CategoryStats[] = useMemo(() => {
    return mockCategories.map((category) => {
      const categoryItems = mockItems.filter(item => item.categoryId === category.id)
      const itemIds = categoryItems.map(item => item.id)
      const stats = mockReviewStats.filter(s => itemIds.includes(s.itemId))

      const totalReviews = categoryItems.reduce((sum, item) => sum + item.reviewCount, 0)
      const avgRating = categoryItems.length > 0
        ? categoryItems.reduce((sum, item) => sum + item.avgRating, 0) / categoryItems.length
        : 0

      const avgPositive = stats.length > 0
        ? stats.reduce((sum, s) => sum + s.positiveRate, 0) / stats.length
        : 70
      const avgNegative = stats.length > 0
        ? stats.reduce((sum, s) => sum + s.negativeRate, 0) / stats.length
        : 15

      return {
        categoryId: category.id,
        categoryName: category.name,
        itemCount: categoryItems.length,
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        positiveRate: Math.round(avgPositive),
        negativeRate: Math.round(avgNegative),
      }
    })
  }, [])

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
    if (selectedCategories.length === mockCategories.length) {
      setSelectedCategories([])
    } else {
      setSelectedCategories(mockCategories.map(c => c.id))
    }
    setAiSummary(null)
  }

  // 선택된 카테고리 통계
  const selectedStats = categoryStats.filter(s =>
    selectedCategories.includes(s.categoryId)
  )

  // 비교 차트 데이터
  const comparisonChartData = selectedStats.map(stat => {
    const category = mockCategories.find(c => c.id === stat.categoryId)
    return {
      name: stat.categoryName,
      리뷰수: stat.totalReviews,
      평균별점: stat.avgRating,
      color: category?.color || "#888",
    }
  })

  // 감정 비율 차트 데이터
  const sentimentChartData = selectedStats.map(stat => {
    const category = mockCategories.find(c => c.id === stat.categoryId)
    return {
      name: stat.categoryName,
      긍정: stat.positiveRate,
      부정: stat.negativeRate,
      중립: 100 - stat.positiveRate - stat.negativeRate,
      color: category?.color || "#888",
    }
  })

  // AI 요약 생성
  const handleGenerateAI = async () => {
    if (selectedCategories.length === 0) return

    setIsGeneratingAI(true)
    setAiSummary(null)

    // AI API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000))

    const selectedNames = selectedStats.map(s => s.categoryName).join(", ")
    const mockSummary = `## ${selectedNames} 카테고리 리뷰 분석 요약

### 주요 인사이트
${selectedStats.map(s => `- **${s.categoryName}**: 총 ${s.totalReviews.toLocaleString()}건의 리뷰, 평균 ${s.avgRating}점, 긍정률 ${s.positiveRate}%`).join("\n")}

### 긍정적 반응
- 맛과 품질에 대한 만족도가 높음
- 가격 대비 성능이 우수하다는 평가
- 재구매 의향이 높은 편

### 개선 필요 사항
- 일부 제품의 포장 상태 개선 필요
- 배송 속도에 대한 불만 일부 존재
- 맛 선호도 다양화 요청

### 경쟁사 대비 포지션
${selectedStats.length > 1 ? `가장 높은 평점: ${selectedStats.reduce((a, b) => a.avgRating > b.avgRating ? a : b).categoryName} (${selectedStats.reduce((a, b) => a.avgRating > b.avgRating ? a : b).avgRating}점)` : "다른 카테고리와 비교하려면 여러 카테고리를 선택하세요."}
`

    setAiSummary(mockSummary)
    setIsGeneratingAI(false)
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-2xl font-bold">카테고리별 조회</h1>
        <p className="text-muted-foreground">카테고리 단위로 리뷰 데이터를 비교하고 분석합니다</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
        {/* 좌측: 카테고리 선택 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">카테고리 선택</CardTitle>
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {selectedCategories.length === mockCategories.length ? "전체 해제" : "전체 선택"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockCategories.map((category) => {
                const stat = categoryStats.find(s => s.categoryId === category.id)
                const isSelected = selectedCategories.includes(category.id)

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
                          style={{ backgroundColor: category.color }}
                        />
                        <Label htmlFor={category.id} className="font-medium cursor-pointer">
                          {category.name}
                        </Label>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>아이템 {stat?.itemCount}개</span>
                        <span>리뷰 {stat?.totalReviews.toLocaleString()}건</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

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
                      {(selectedStats.reduce((sum, s) => sum + s.avgRating, 0) / selectedStats.length).toFixed(1)}점
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
                      {Math.round(selectedStats.reduce((sum, s) => sum + s.positiveRate, 0) / selectedStats.length)}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 차트 탭 */}
              <Tabs defaultValue="reviews" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="reviews">리뷰 수 비교</TabsTrigger>
                  <TabsTrigger value="rating">평균 별점</TabsTrigger>
                  <TabsTrigger value="sentiment">감정 분석</TabsTrigger>
                </TabsList>

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
