"use client"

import { useState } from "react"
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { IconSparkles, IconLoader, IconChartBar } from '@tabler/icons-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// 브랜드별 언급량 추이 데이터
const mentionTrendData = [
  { date: "11월 1주", 티젠: 967, 동서: 645 },
  { date: "11월 2주", 티젠: 1124, 동서: 723 },
  { date: "11월 3주", 티젠: 1089, 동서: 698 },
  { date: "11월 4주", 티젠: 1256, 동서: 834 },
  { date: "12월 1주", 티젠: 1342, 동서: 891 },
  { date: "12월 2주", 티젠: 1425, 동서: 945 },
  { date: "12월 3주", 티젠: 1568, 동서: 1023 },
  { date: "12월 4주", 티젠: 1634, 동서: 1087 },
]

// 채널별 분포
const channelDataTeazen = [
  { name: "인스타그램", value: 5342 },
  { name: "블로그", value: 3556 },
  { name: "카페", value: 2270 },
  { name: "유튜브", value: 750 },
  { name: "커뮤니티", value: 540 },
]

const channelDataDongsuh = [
  { name: "인스타그램", value: 2845 },
  { name: "블로그", value: 4123 },
  { name: "카페", value: 1876 },
  { name: "유튜브", value: 456 },
  { name: "커뮤니티", value: 678 },
]

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"]

export default function BrandReputationResultsPage() {
  const [selectedBrands, setSelectedBrands] = useState({ 티젠: true, 동서: true })
  const [selectedChannelBrand, setSelectedChannelBrand] = useState("티젠")
  const [showAI, setShowAI] = useState(false)
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  const handleShowAI = async () => {
    setIsLoadingAI(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoadingAI(false)
    setShowAI(true)
  }

  const channelData = selectedChannelBrand === "티젠" ? channelDataTeazen : channelDataDongsuh

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
              
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">모니터링 결과</h1>
                  <p className="text-muted-foreground">
                    총 22,436건의 데이터를 수집했습니다
                  </p>
                </div>
                <Button onClick={() => window.location.href = "/brand-reputation"} variant="outline">
                  새 분석 시작
                </Button>
              </div>

              {/* AI 리뷰 (최상단) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconSparkles className="text-primary" />
                    AI 종합 분석
                  </CardTitle>
                  <CardDescription>
                    {!showAI && "AI가 분석한 종합 리포트를 확인하세요"}
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
                          AI 요약 보기
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <IconChartBar className="text-primary" />
                          비교 분석 결과
                        </h4>
                        <p className="text-sm leading-relaxed mb-3">
                          <strong className="text-primary">티젠 콤부차</strong>는 총 12,458건의 언급으로 
                          <strong className="text-primary"> 동서 콤부차(9,978건)</strong> 대비 
                          <strong className="text-green-600"> 24.8% 높은</strong> 온라인 활동성을 보입니다.
                        </p>
                        <p className="text-sm leading-relaxed mb-3">
                          긍정 평가는 티젠이 <strong className="text-green-600">78.4%</strong>로 
                          동서의 <strong>71.2%</strong>보다 우위에 있으며, 특히 '맛', '상쾌함', '다이어트 효과' 
                          키워드에서 높은 평가를 받고 있습니다.
                        </p>
                        <p className="text-sm leading-relaxed">
                          채널 분포에서 티젠은 <strong className="text-blue-600">인스타그램(42.8%)</strong>에서 강세를 보이는 반면, 
                          동서는 <strong className="text-orange-600">블로그(41.3%)</strong> 중심의 분포를 나타냅니다. 
                          젊은 층 공략에는 티젠이, 신뢰도 중심의 마케팅에는 동서가 유리한 위치에 있습니다.
                        </p>
                      </div>
                      
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">핵심 인사이트</h4>
                        <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                          <li>티젠은 소셜 미디어 중심의 바이럴 마케팅에 강점</li>
                          <li>동서는 블로그 기반의 신뢰도 높은 후기가 많음</li>
                          <li>티젠의 '레몬맛' 제품이 특히 높은 호응</li>
                          <li>가격 대비 효과는 양사 모두 개선 포인트로 지적됨</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 통계 비교 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>티젠 콤부차</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">총 언급량</span>
                      <span className="font-semibold">12,458건</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">긍정 평가</span>
                      <span className="font-semibold text-green-600">78.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">평균 참여도</span>
                      <span className="font-semibold">2,847</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">주요 채널</span>
                      <span className="font-semibold">인스타그램 42.8%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>동서 콤부차</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">총 언급량</span>
                      <span className="font-semibold">9,978건</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">긍정 평가</span>
                      <span className="font-semibold text-green-600">71.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">평균 참여도</span>
                      <span className="font-semibold">1,956</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">주요 채널</span>
                      <span className="font-semibold">블로그 41.3%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 언급량 추이 (브랜드 선택) */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>언급량 추이 비교</CardTitle>
                      <CardDescription>주별 언급량 변화</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="check-teazen"
                          checked={selectedBrands.티젠}
                          onCheckedChange={(checked) => 
                            setSelectedBrands({...selectedBrands, 티젠: !!checked})
                          }
                        />
                        <Label htmlFor="check-teazen" className="cursor-pointer">
                          티젠 콤부차
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="check-dongsuh"
                          checked={selectedBrands.동서}
                          onCheckedChange={(checked) => 
                            setSelectedBrands({...selectedBrands, 동서: !!checked})
                          }
                        />
                        <Label htmlFor="check-dongsuh" className="cursor-pointer">
                          동서 콤부차
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={mentionTrendData}>
                      <defs>
                        <linearGradient id="colorTeazen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="colorDongsuh" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      {selectedBrands.티젠 && (
                        <Area
                          type="monotone"
                          dataKey="티젠"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorTeazen)"
                        />
                      )}
                      {selectedBrands.동서 && (
                        <Area
                          type="monotone"
                          dataKey="동서"
                          stroke="#82ca9d"
                          fillOpacity={1}
                          fill="url(#colorDongsuh)"
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 채널별 분포 비교 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>채널별 분포</CardTitle>
                      <CardDescription>플랫폼별 언급량 비율</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="channel-teazen"
                          checked={selectedChannelBrand === "티젠"}
                          onCheckedChange={(checked) => 
                            checked && setSelectedChannelBrand("티젠")
                          }
                        />
                        <Label htmlFor="channel-teazen" className="cursor-pointer">
                          티젠 콤부차
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="channel-dongsuh"
                          checked={selectedChannelBrand === "동서"}
                          onCheckedChange={(checked) => 
                            checked && setSelectedChannelBrand("동서")
                          }
                        />
                        <Label htmlFor="channel-dongsuh" className="cursor-pointer">
                          동서 콤부차
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${((value / channelData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {channelData.map((channel, index) => (
                      <div key={channel.name} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{channel.name}: {channel.value.toLocaleString()}건</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 키워드 분석 (브랜드별 긍부정 지수) */}
              <Card>
                <CardHeader>
                  <CardTitle>키워드 분석</CardTitle>
                  <CardDescription>브랜드별 긍정/부정 키워드 비교</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="teazen">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="teazen">
                        티젠 콤부차
                        <Badge variant="secondary" className="ml-2">78.4%</Badge>
                      </TabsTrigger>
                      <TabsTrigger value="dongsuh">
                        동서 콤부차
                        <Badge variant="secondary" className="ml-2">71.2%</Badge>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="teazen" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <h5 className="font-semibold mb-3 text-green-700 dark:text-green-400">
                            긍정 키워드 (78.4%)
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {["맛있다", "상쾌", "건강", "다이어트", "추천"].map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-green-600">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                          <h5 className="font-semibold mb-3 text-red-700 dark:text-red-400">
                            부정 키워드 (21.6%)
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {["비싸다", "단맛", "가격"].map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-red-600">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="dongsuh" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                          <h5 className="font-semibold mb-3 text-green-700 dark:text-green-400">
                            긍정 키워드 (71.2%)
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {["신뢰", "브랜드", "익숙", "안정적"].map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-green-600">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                          <h5 className="font-semibold mb-3 text-red-700 dark:text-red-400">
                            부정 키워드 (28.8%)
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {["평범", "특색없음", "효과미미"].map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-red-600">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

