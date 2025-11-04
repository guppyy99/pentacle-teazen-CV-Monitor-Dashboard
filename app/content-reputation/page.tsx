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
import { IconPlus, IconX, IconThumbUp, IconMessage, IconShare, IconEye, IconBrandYoutube, IconBrandInstagram, IconSparkles, IconLoader } from '@tabler/icons-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

// 샘플 콘텐츠 데이터
const sampleContents = [
  {
    id: 1,
    platform: "유튜브",
    title: "티젠 콤부차 한달 챌린지 결과 공개",
    link: "https://youtube.com/...",
    author: "다이어터킴",
    views: 128500,
    likes: 4250,
    comments: 387,
    shares: 145,
    date: "2024-11-22",
    sentiment: "positive",
    engagementRate: 3.6,
  },
  {
    id: 2,
    platform: "인스타그램",
    title: "아침 루틴 🌅 티젠 콤부차",
    link: "https://instagram.com/...",
    author: "@morning_ritual",
    views: 28700,
    likes: 2150,
    comments: 98,
    shares: 67,
    date: "2024-11-15",
    sentiment: "positive",
    engagementRate: 8.1,
  },
  {
    id: 3,
    platform: "유튜브",
    title: "경쟁사 B vs 티젠 콤부차 블라인드 테스트",
    link: "https://youtube.com/...",
    author: "푸드리뷰어",
    views: 95300,
    likes: 2890,
    comments: 542,
    shares: 234,
    date: "2024-11-10",
    sentiment: "neutral",
    engagementRate: 3.8,
  },
]

// 시간별 참여도 추이 데이터
const engagementTrendData = [
  { time: "1일", content1: 1200, content2: 850, content3: 950 },
  { time: "3일", content1: 3450, content2: 2100, content3: 2800 },
  { time: "7일", content1: 8750, content2: 5400, content3: 6900 },
  { time: "14일", content1: 15200, content2: 11800, content3: 13400 },
  { time: "30일", content1: 19100, content2: 16200, content3: 17850 },
]

export default function ContentReputationPage() {
  const [contents, setContents] = useState(sampleContents)
  const [newLink, setNewLink] = useState("")
  const [showAI, setShowAI] = useState(false)
  const [isLoadingAI, setIsLoadingAI] = useState(false)

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
              
              {/* 페이지 헤더 */}
              <div>
                <h1 className="text-3xl font-bold mb-2">콘텐츠 평판 분석</h1>
                <p className="text-muted-foreground">
                  유튜브, 인스타그램 콘텐츠의 인사이트를 수집하고 비교합니다
                </p>
              </div>

              {/* AI 인사이트 (최상단) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconSparkles className="text-primary" />
                    AI 종합 분석
                  </CardTitle>
                  <CardDescription>
                    {!showAI && "전체 콘텐츠에 대한 AI 분석 결과를 확인하세요"}
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
                          AI 종합 분석 보기
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg">
                        <h4 className="font-semibold mb-2">📊 정량적 성과</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          총 3개의 콘텐츠가 평균 <strong>84,166회 조회수</strong>를 기록했으며, 
                          평균 참여율은 <strong>5.2%</strong>로 업계 평균(3.5%)을 상회합니다. 
                          유튜브 콘텐츠가 인스타그램 대비 약 3.5배 높은 조회수를 기록했으나, 
                          참여율은 인스타그램이 8.1%로 더 높게 나타났습니다.
                        </p>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">💭 정성적 평가</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          전반적으로 <strong className="text-green-600">긍정적인 반응(77.8%)</strong>이 우세합니다. 
                          소비자들은 '다이어트 효과', '맛', '건강함'에 높은 관심을 보이며, 
                          특히 실제 사용 후기를 담은 콘텐츠에서 참여도가 높게 나타났습니다.
                        </p>
                      </div>

                      <div className="p-4 border-l-4 border-primary bg-primary/5 rounded">
                        <h4 className="font-semibold mb-2">💡 개선 제안</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>장기 사용 후기 콘텐츠 확대 (신뢰도 향상)</li>
                          <li>인스타그램의 높은 참여율을 활용한 마케팅 강화</li>
                          <li>비교 콘텐츠에서 명확한 차별점 강조 필요</li>
                          <li>가격 대비 효과에 대한 구체적인 데이터 제시</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 콘텐츠 추가 */}
              <Card>
                <CardHeader>
                  <CardTitle>콘텐츠 링크 추가</CardTitle>
                  <CardDescription>
                    유튜브 또는 인스타그램 콘텐츠 링크를 추가하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://youtube.com/... 또는 https://instagram.com/..."
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                    />
                    <Button>
                      <IconPlus className="mr-2" />
                      추가
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* 등록된 콘텐츠 목록 */}
              <Card>
                <CardHeader>
                  <CardTitle>등록된 콘텐츠 ({contents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contents.map((content) => (
                      <div
                        key={content.id}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 shrink-0">
                          {content.platform === "유튜브" ? (
                            <IconBrandYoutube className="size-6 text-red-600" />
                          ) : (
                            <IconBrandInstagram className="size-6 text-pink-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{content.title}</h4>
                            <Badge variant="secondary">{content.platform}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {content.author} · {content.date}
                          </p>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <IconEye className="size-3" />
                              {content.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <IconThumbUp className="size-3" />
                              {content.likes.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <IconMessage className="size-3" />
                              {content.comments}
                            </span>
                            <span className="flex items-center gap-1">
                              <IconShare className="size-3" />
                              {content.shares}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground">참여율</p>
                          <p className="text-lg font-bold text-primary">{content.engagementRate}%</p>
                        </div>
                        <Button variant="ghost" size="icon">
                          <IconX />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 분석 탭 */}
              <Tabs defaultValue="quantitative" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="quantitative">정량 분석</TabsTrigger>
                  <TabsTrigger value="qualitative">정성 분석</TabsTrigger>
                </TabsList>

                {/* 정량 분석 */}
                <TabsContent value="quantitative" className="space-y-4">
                  {/* 인사이트 비교 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>인사이트 비교</CardTitle>
                      <CardDescription>조회수, 좋아요, 댓글, 공유 수</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart
                          data={contents.map(c => ({
                            name: c.title.substring(0, 20) + "...",
                            조회수: c.views / 1000,
                            좋아요: c.likes,
                            댓글: c.comments,
                            공유: c.shares,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" fontSize={10} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="조회수" fill="#8884d8" name="조회수 (천)" />
                          <Bar dataKey="좋아요" fill="#82ca9d" />
                          <Bar dataKey="댓글" fill="#ffc658" />
                          <Bar dataKey="공유" fill="#ff8042" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* 참여도 추이 */}
                  <Card>
                    <CardHeader>
                      <CardTitle>참여도 추이</CardTitle>
                      <CardDescription>시간별 누적 참여도 변화</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={engagementTrendData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="content1" stroke="#8884d8" name="콘텐츠 1" />
                          <Line type="monotone" dataKey="content2" stroke="#82ca9d" name="콘텐츠 2" />
                          <Line type="monotone" dataKey="content3" stroke="#ffc658" name="콘텐츠 3" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* 정성 분석 */}
                <TabsContent value="qualitative" className="space-y-4">
                  {contents.map((content) => (
                    <Card key={content.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              {content.platform === "유튜브" ? (
                                <IconBrandYoutube className="size-5 text-red-600" />
                              ) : (
                                <IconBrandInstagram className="size-5 text-pink-600" />
                              )}
                              {content.title}
                            </CardTitle>
                            <CardDescription>{content.author}</CardDescription>
                          </div>
                          <Badge
                            variant={content.sentiment === "positive" ? "default" : "secondary"}
                          >
                            {content.sentiment === "positive" ? "긍정" : "중립"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">감정 분석</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-green-600">
                                긍정 {content.sentiment === "positive" ? "87.2%" : "64.5%"}
                              </Badge>
                              <Badge variant="outline" className="text-red-600">
                                부정 {content.sentiment === "positive" ? "12.8%" : "35.5%"}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">주요 반응</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Badge variant="secondary" className="text-xs">효과있음</Badge>
                              <Badge variant="secondary" className="text-xs">맛있음</Badge>
                              <Badge variant="secondary" className="text-xs">추천</Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-muted/50 rounded text-sm">
                          <p className="font-medium mb-1">대표 댓글:</p>
                          <p className="text-muted-foreground">
                            "정말 효과가 있네요! 저도 따라해봐야겠어요" (좋아요 234개)
                          </p>
                        </div>
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

