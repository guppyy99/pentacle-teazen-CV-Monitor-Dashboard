"use client"

import { useState } from "react"
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconPlus, IconX, IconStar, IconSparkles, IconLoader } from '@tabler/icons-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'

interface Product {
  id: number
  name: string
  link: string
  platform: string
  reviewCount: number
  avgRating: number
  positiveRate: number
  negativeRate: number
}

// 하드코딩된 제품 데이터 풀
const productPool: Product[] = [
  {
    id: 1,
    name: "티젠 콤부차 레몬",
    link: "https://smartstore.naver.com/teazen/kombucha-lemon",
    platform: "스마트스토어",
    reviewCount: 1247,
    avgRating: 4.6,
    positiveRate: 82.4,
    negativeRate: 17.6,
  },
  {
    id: 2,
    name: "동서 콤부차 오리지널",
    link: "https://www.coupang.com/dongsuh-kombucha",
    platform: "쿠팡",
    reviewCount: 892,
    avgRating: 4.3,
    positiveRate: 75.8,
    negativeRate: 24.2,
  },
  {
    id: 3,
    name: "설록차 콤부차",
    link: "https://oliveyoung.co.kr/sulloc-kombucha",
    platform: "올리브영",
    reviewCount: 634,
    avgRating: 4.5,
    positiveRate: 79.3,
    negativeRate: 20.7,
  },
  {
    id: 4,
    name: "티젠 콤부차 자몽",
    link: "https://smartstore.naver.com/teazen/kombucha-grapefruit",
    platform: "스마트스토어",
    reviewCount: 1089,
    avgRating: 4.7,
    positiveRate: 84.1,
    negativeRate: 15.9,
  },
  {
    id: 5,
    name: "곰표 콤부차",
    link: "https://gmarket.co.kr/gompyo-kombucha",
    platform: "G마켓",
    reviewCount: 456,
    avgRating: 4.2,
    positiveRate: 73.5,
    negativeRate: 26.5,
  },
  {
    id: 6,
    name: "CJ 콤부차 복숭아",
    link: "https://smartstore.naver.com/cj/kombucha-peach",
    platform: "스마트스토어",
    reviewCount: 723,
    avgRating: 4.4,
    positiveRate: 77.8,
    negativeRate: 22.2,
  },
  {
    id: 7,
    name: "풀무원 콤부차",
    link: "https://www.coupang.com/pulmuone-kombucha",
    platform: "쿠팡",
    reviewCount: 567,
    avgRating: 4.3,
    positiveRate: 76.2,
    negativeRate: 23.8,
  },
  {
    id: 8,
    name: "롯데 콤부차",
    link: "https://auction.co.kr/lotte-kombucha",
    platform: "옥션",
    reviewCount: 389,
    avgRating: 4.1,
    positiveRate: 72.1,
    negativeRate: 27.9,
  },
  {
    id: 9,
    name: "오설록 콤부차",
    link: "https://osulloc.com/kombucha",
    platform: "오설록몰",
    reviewCount: 812,
    avgRating: 4.6,
    positiveRate: 81.3,
    negativeRate: 18.7,
  },
  {
    id: 10,
    name: "일화 콤부차",
    link: "https://www.coupang.com/ilhwa-kombucha",
    platform: "쿠팡",
    reviewCount: 445,
    avgRating: 4.0,
    positiveRate: 69.8,
    negativeRate: 30.2,
  },
]

// 키워드 빈도 비교 데이터
const keywordComparisonData = [
  { keyword: "맛있다", teazen: 523, competitor: 342 },
  { keyword: "상쾌", teazen: 456, competitor: 287 },
  { keyword: "다이어트", teazen: 387, competitor: 421 },
  { keyword: "가격", teazen: 234, competitor: 567 },
  { keyword: "혈당", teazen: 298, competitor: 156 },
]

// 최근 리뷰 샘플
const recentReviews = [
  {
    id: 1,
    product: "티젠 콤부차 레몬",
    author: "네이버 사용자",
    rating: 5,
    date: "2024-11-28",
    content: "레몬 향이 진짜 상쾌하고 좋아요! 아침에 마시면 속이 편해지는 느낌이에요. 다이어트 중인데 달콤한 거 먹고 싶을 때 딱 좋습니다",
    sentiment: "positive",
  },
  {
    id: 2,
    product: "동서 콤부차",
    author: "쿠팡 사용자",
    rating: 4,
    date: "2024-11-27",
    content: "맛은 괜찮은데 가격이 조금 비싼 것 같아요. 프로모션할 때 사는 게 나을 듯",
    sentiment: "neutral",
  },
  {
    id: 3,
    product: "티젠 콤부차 레몬",
    author: "스마트스토어 구매자",
    rating: 5,
    date: "2024-11-26",
    content: "맛도 좋고 당이 적어서 혈당 걱정 없이 마실 수 있어 좋네요. 재구매 의사 100%",
    sentiment: "positive",
  },
]

export default function ProductReviewPage() {
  const [products, setProducts] = useState<Product[]>([productPool[0], productPool[1]])
  const [newProductLink, setNewProductLink] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  const isValidURL = (url: string) => {
    if (!url) return false
    try {
      new URL(url)
      return url.startsWith('http://') || url.startsWith('https://')
    } catch {
      return false
    }
  }

  const handleAddProduct = async () => {
    // URL 검증
    if (!newProductLink.trim()) {
      toast.error("URL을 입력해주세요", {
        className: "animate-shake"
      })
      return
    }

    if (!isValidURL(newProductLink)) {
      toast.error("올바른 URL 형식이 아닙니다", {
        className: "animate-shake"
      })
      return
    }

    setIsLoading(true)
    
    // 로딩 시뮬레이션 (1.5초)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 하드코딩된 데이터에서 랜덤하게 가져오기
    const unusedProducts = productPool.filter(p => !products.find(prod => prod.id === p.id))
    if (unusedProducts.length > 0) {
      const randomProduct = unusedProducts[Math.floor(Math.random() * unusedProducts.length)]
      setProducts([...products, randomProduct])
      toast.success(`${randomProduct.name} 리뷰를 분석했습니다`)
    } else {
      // 풀이 비어있으면 첫 번째 제품 재사용
      toast.success("제품이 추가되었습니다")
    }

    setNewProductLink("")
    setIsLoading(false)
  }

  const removeProduct = (id: number) => {
    if (products.length === 1) {
      toast.error("최소 1개 이상의 제품이 필요합니다")
      return
    }
    setProducts(products.filter(p => p.id !== id))
    toast.success("제품이 삭제되었습니다")
  }

  const handleShowAI = async () => {
    setIsLoadingAI(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoadingAI(false)
    setShowAI(true)
  }
  
  return (
    <SidebarProvider
      className="h-full"
      style={{
        "--sidebar-width": "280px",
        "--header-height": "60px",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="flex flex-col h-full">
        <SiteHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="@container/main h-full">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 lg:gap-8 lg:p-8">
              
              <div>
                <h1 className="text-3xl font-bold mb-2">리뷰 분석</h1>
                <p className="text-muted-foreground">
                  여러 제품의 리뷰를 수집하고 비교 분석합니다
                </p>
              </div>

              {/* AI 인사이트 (최상단) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconSparkles className="text-primary" />
                    AI 인사이트
                  </CardTitle>
                  <CardDescription>
                    {!showAI && "전체 제품에 대한 AI 분석 결과를 확인하세요"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showAI ? (
                    <Button 
                      onClick={handleShowAI} 
                      className="w-full"
                      disabled={isLoadingAI}
                    >
                      {isLoadingAI ? (
                        <>
                          <IconLoader className="mr-2 animate-spin" />
                          AI 분석 중...
                        </>
                      ) : (
                        <>
                          <IconSparkles className="mr-2" />
                          AI 인사이트 보기
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                        <p className="text-sm leading-relaxed">
                          <strong className="text-primary">티젠 콤부차</strong>가 평균 평점 
                          <strong className="text-green-600"> 4.6점</strong>으로 가장 높은 만족도를 보이고 있으며, 
                          긍정 리뷰 비율도 <strong>82.4%</strong>로 우수합니다. 
                          소비자들은 특히 '레몬맛'의 상쾌함과 저칼로리 특성을 높이 평가하고 있습니다. 
                          경쟁 제품 대비 다이어트 효과 언급이 많으며, 재구매율이 높게 나타났습니다.
                        </p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg text-sm">
                        <strong>개선 포인트:</strong> 가격 대비 용량에 대한 불만이 일부 존재하며, 
                        프로모션 시 구매율이 증가하는 패턴을 보입니다.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 제품 추가 */}
              <Card>
                <CardHeader>
                  <CardTitle>제품 링크 추가</CardTitle>
                  <CardDescription>
                    스마트스토어, 쿠팡, 지마켓, 올리브영 등의 제품 링크를 추가하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://... (제품 상세 페이지 URL)"
                      value={newProductLink}
                      onChange={(e) => setNewProductLink(e.target.value)}
                      disabled={isLoading}
                    />
                    <Button onClick={handleAddProduct} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <IconLoader className="mr-2 animate-spin" />
                          분석중
                        </>
                      ) : (
                        <>
                          <IconPlus className="mr-2" />
                          추가
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 등록된 제품 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle>등록된 제품 ({products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{product.name}</h4>
                            <Badge variant="secondary">{product.platform}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mb-2">
                            {product.link}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <IconStar className="size-4 fill-yellow-400 text-yellow-400" />
                              {product.avgRating}
                            </span>
                            <span>{product.reviewCount.toLocaleString()}개 리뷰</span>
                            <span className="text-green-600">긍정 {product.positiveRate}%</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeProduct(product.id)}>
                          <IconX />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 비교 분석 탭 */}
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">개요</TabsTrigger>
                  <TabsTrigger value="sentiment">감정 분석</TabsTrigger>
                  <TabsTrigger value="keywords">키워드 비교</TabsTrigger>
                  <TabsTrigger value="reviews">리뷰 보기</TabsTrigger>
                </TabsList>

                {/* 개요 탭 */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id}>
                        <CardHeader>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription>{product.platform}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">평균 평점</span>
                            <span className="font-semibold flex items-center gap-1">
                              <IconStar className="size-4 fill-yellow-400 text-yellow-400" />
                              {product.avgRating}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">총 리뷰 수</span>
                            <span className="font-semibold">{product.reviewCount.toLocaleString()}개</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">긍정 비율</span>
                            <span className="font-semibold text-green-600">{product.positiveRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">부정 비율</span>
                            <span className="font-semibold text-red-600">{product.negativeRate}%</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* 감정 분석 탭 */}
                <TabsContent value="sentiment" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>감정 분석 비교</CardTitle>
                      <CardDescription>긍정/부정 리뷰 비율 비교</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={products.map(p => ({
                            name: p.name,
                            긍정: p.positiveRate,
                            부정: p.negativeRate,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={10} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="긍정" fill="#22c55e" />
                          <Bar dataKey="부정" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 키워드 비교 탭 */}
                <TabsContent value="keywords" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>키워드 빈도 비교</CardTitle>
                      <CardDescription>주요 키워드 언급 빈도</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={keywordComparisonData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="keyword" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="teazen" name="티젠 콤부차" fill="#8884d8" />
                          <Bar dataKey="competitor" name="경쟁사" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 리뷰 보기 탭 */}
                <TabsContent value="reviews" className="space-y-4">
                  {recentReviews.map((review) => (
                    <Card key={review.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{review.product}</CardTitle>
                            <CardDescription>
                              {review.author} · {review.date}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <IconStar
                                key={i}
                                className={`size-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-2">{review.content}</p>
                        <Badge
                          variant={review.sentiment === "positive" ? "default" : "secondary"}
                        >
                          {review.sentiment === "positive" ? "긍정" : "중립"}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>

            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
