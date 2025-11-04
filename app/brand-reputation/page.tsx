"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { IconSearch, IconSparkles, IconPlus, IconX, IconLoader } from '@tabler/icons-react'
import { toast } from 'sonner'

interface BrandProduct {
  id: string
  brand: string
  product: string
  keywords: string[]
}

// AI 추천 키워드 (하드코딩)
const keywordRecommendations: Record<string, string[]> = {
  "티젠_콤부차": [
    "티젠 콤부차 레몬맛",
    "티젠 콤부차 자몽맛",
    "티젠 콤부차 맛있나요",
    "티젠 콤부차",
    "콤부차 추천 티젠",
    "티젠 콤부차 더쿠",
    "티젠 콤부차 혈당",
    "티젠 콤부차 다이어트"
  ],
  "동서_콤부차": [
    "동서 콤부차",
    "동서 콤부차 후기",
    "동서 콤부차 맛",
    "콤부차 동서",
    "동서식품 콤부차",
    "동서 콤부차 가격",
    "동서 콤부차 효능",
    "동서 콤부차 리뷰"
  ]
}

export default function BrandReputationPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [brands, setBrands] = useState<BrandProduct[]>([
    {
      id: "1",
      brand: "티젠",
      product: "콤부차",
      keywords: []
    }
  ])
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false)
  const [isLoadingCrawl, setIsLoadingCrawl] = useState(false)

  const addBrand = () => {
    const newId = (brands.length + 1).toString()
    setBrands([...brands, {
      id: newId,
      brand: "",
      product: "",
      keywords: []
    }])
  }

  const removeBrand = (id: string) => {
    if (brands.length === 1) {
      toast.error("최소 1개 이상의 브랜드가 필요합니다")
      return
    }
    setBrands(brands.filter(b => b.id !== id))
  }

  const updateBrand = (id: string, field: keyof BrandProduct, value: string) => {
    setBrands(brands.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ))
  }

  const handleGetKeywords = async () => {
    // 유효성 검사
    const hasEmpty = brands.some(b => !b.brand || !b.product)
    if (hasEmpty) {
      toast.error("모든 브랜드와 제품을 입력해주세요")
      return
    }

    setIsLoadingKeywords(true)
    
    // 로딩 시뮬레이션 (1.5초)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // AI 키워드 추천
    const updatedBrands = brands.map(b => ({
      ...b,
      keywords: keywordRecommendations[`${b.brand}_${b.product}`] || [
        `${b.brand} ${b.product}`,
        `${b.brand} ${b.product} 후기`,
        `${b.brand} ${b.product} 맛`,
        `${b.product} ${b.brand}`,
      ]
    }))

    setBrands(updatedBrands)
    setIsLoadingKeywords(false)
    setStep(2)
    toast.success("키워드 추천이 완료되었습니다")
  }

  const handleStartCrawling = async () => {
    setIsLoadingCrawl(true)
    
    // 크롤링 시뮬레이션 (2초)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoadingCrawl(false)
    toast.success("크롤링이 완료되었습니다")
    
    // 결과 페이지로 이동
    router.push("/brand-reputation/results")
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
                <h1 className="text-3xl font-bold mb-2">브랜드 평판 분석</h1>
                <p className="text-muted-foreground">
                  온라인에서의 브랜드 및 제품 평판을 모니터링하고 비교 분석합니다
                </p>
              </div>

              {/* Step 1: 브랜드/제품 입력 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                      1
                    </span>
                    브랜드 제품 입력
                  </CardTitle>
                  <CardDescription>비교 분석할 브랜드 제품을 추가하세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {brands.map((brand, index) => (
                    <div key={brand.id} className="p-4 border rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">브랜드/제품 {index + 1}</h4>
                        {brands.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBrand(brand.id)}
                          >
                            <IconX />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>브랜드명</Label>
                          <Input
                            value={brand.brand}
                            onChange={(e) => updateBrand(brand.id, "brand", e.target.value)}
                            placeholder="예: 티젠"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>제품명</Label>
                          <Input
                            value={brand.product}
                            onChange={(e) => updateBrand(brand.id, "product", e.target.value)}
                            placeholder="예: 콤부차"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>모니터링 범위</Label>
                          <Select defaultValue="6">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">최근 1개월</SelectItem>
                              <SelectItem value="3">최근 3개월</SelectItem>
                              <SelectItem value="6">최근 6개월</SelectItem>
                              <SelectItem value="12">최근 1년</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={addBrand} className="flex-1">
                      <IconPlus className="mr-2" />
                      브랜드/제품 추가
                    </Button>
                    {step === 1 && (
                      <Button 
                        onClick={handleGetKeywords} 
                        className="flex-1"
                        disabled={isLoadingKeywords}
                      >
                        {isLoadingKeywords ? (
                          <>
                            <IconLoader className="mr-2 animate-spin" />
                            AI 분석 중...
                          </>
                        ) : (
                          <>
                            <IconSparkles className="mr-2" />
                            키워드 추천 받기
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: AI 키워드 추천 */}
              {step >= 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                        2
                      </span>
                      AI 키워드 추천
                    </CardTitle>
                    <CardDescription>
                      각 브랜드별로 최적화된 검색 키워드입니다
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {brands.map((brand, index) => (
                      <div key={brand.id} className="space-y-3">
                        <h4 className="font-semibold text-sm">
                          {brand.brand} {brand.product}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {brand.keywords.map((keyword, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-sm py-1 px-3"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                        이전
                      </Button>
                      <Button 
                        onClick={handleStartCrawling} 
                        className="flex-1"
                        disabled={isLoadingCrawl}
                      >
                        {isLoadingCrawl ? (
                          <>
                            <IconLoader className="mr-2 animate-spin" />
                            크롤링 중...
                          </>
                        ) : (
                          <>
                            <IconSearch className="mr-2" />
                            크롤링 시작
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
