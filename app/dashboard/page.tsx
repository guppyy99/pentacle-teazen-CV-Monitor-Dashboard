"use client"

import Link from "next/link"
import Image from "next/image"
import {
  IconPackage,
  IconMessage,
  IconStar,
  IconMoodHappy,
  IconArrowUpRight,
  IconPlus,
  IconCategory,
  IconRefresh,
} from "@tabler/icons-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import { mockCategories, mockItems, mockReviewStats } from "@/lib/mock-data"

export default function DashboardPage() {
  // 통계 계산
  const totalItems = mockItems.length
  const totalReviews = mockItems.reduce((sum, item) => sum + item.reviewCount, 0)
  const avgRating = mockItems.length > 0
    ? (mockItems.reduce((sum, item) => sum + item.avgRating, 0) / mockItems.length).toFixed(1)
    : "0"
  const avgPositiveRate = mockReviewStats.length > 0
    ? Math.round(mockReviewStats.reduce((sum, s) => sum + s.positiveRate, 0) / mockReviewStats.length)
    : 0

  // 최근 리뷰 추이 데이터
  const recentTrendData = [
    { date: "12/14", reviews: 38 },
    { date: "12/15", reviews: 53 },
    { date: "12/16", reviews: 47 },
    { date: "12/17", reviews: 78 },
    { date: "12/18", reviews: 65 },
    { date: "12/19", reviews: 87 },
    { date: "12/20", reviews: 70 },
  ]

  // 카테고리별 통계
  const categoryStats = mockCategories.map(cat => {
    const categoryItems = mockItems.filter(item => item.categoryId === cat.id)
    const totalReviews = categoryItems.reduce((sum, item) => sum + item.reviewCount, 0)
    const avgRating = categoryItems.length > 0
      ? categoryItems.reduce((sum, item) => sum + item.avgRating, 0) / categoryItems.length
      : 0
    return {
      ...cat,
      itemCount: categoryItems.length,
      reviewCount: totalReviews,
      avgRating: avgRating.toFixed(1),
    }
  })

  // 최근 크롤링 아이템
  const recentItems = [...mockItems]
    .sort((a, b) => new Date(b.lastCrawledAt || 0).getTime() - new Date(a.lastCrawledAt || 0).getTime())
    .slice(0, 4)

  return (
    <SidebarProvider
      className="h-full"
      style={
        {
          "--sidebar-width": "280px",
          "--header-height": "60px",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="flex flex-col h-full">
        <SiteHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6 p-6">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">대시보드</h1>
                <p className="text-muted-foreground">리뷰 모니터링 현황을 한눈에 확인하세요</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/items">
                    <IconPlus className="mr-2 h-4 w-4" />
                    아이템 추가
                  </Link>
                </Button>
              </div>
            </div>

            {/* 주요 지표 카드 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    등록된 아이템
                  </CardTitle>
                  <IconPackage className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalItems}개</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mockCategories.length}개 카테고리
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    수집된 리뷰
                  </CardTitle>
                  <IconMessage className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalReviews.toLocaleString()}건</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    오늘 +70건
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    평균 별점
                  </CardTitle>
                  <IconStar className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgRating}점</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    5점 만점
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    긍정률
                  </CardTitle>
                  <IconMoodHappy className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{avgPositiveRate}%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    전주 대비 +2.3%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 리뷰 추이 차트 + 카테고리 요약 */}
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>최근 7일 리뷰 추이</CardTitle>
                  <CardDescription>일별 신규 리뷰 발생 현황</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={recentTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="reviews"
                          stroke="#4ECDC4"
                          fill="#4ECDC4"
                          fillOpacity={0.3}
                          name="리뷰 수"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>카테고리별 현황</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/categories">
                        전체보기
                        <IconArrowUpRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryStats.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <div>
                            <p className="font-medium">{cat.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {cat.itemCount}개 아이템
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{cat.reviewCount.toLocaleString()}건</p>
                          <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            <IconStar className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {cat.avgRating}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 최근 크롤링 아이템 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>최근 크롤링 아이템</CardTitle>
                    <CardDescription>최근 데이터가 수집된 아이템</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/items">
                      전체보기
                      <IconArrowUpRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {recentItems.map((item) => {
                    const category = mockCategories.find(c => c.id === item.categoryId)
                    return (
                      <Link href="/reviews" key={item.id}>
                        <div className="group flex gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary">
                              {item.productName}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: category?.color }}
                              >
                                {category?.name}
                              </Badge>
                              <span>{item.reviewCount.toLocaleString()}건</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 빠른 액션 */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Link href="/items">
                <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                      <IconPackage className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">아이템 관리</p>
                      <p className="text-sm text-muted-foreground">상품 등록 및 관리</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/categories">
                <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                      <IconCategory className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">카테고리 분석</p>
                      <p className="text-sm text-muted-foreground">카테고리별 비교</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/reviews">
                <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                      <IconMessage className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">리뷰 조회</p>
                      <p className="text-sm text-muted-foreground">상세 리뷰 분석</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
