"use client"

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { IconSearch, IconDownload, IconBrandInstagram, IconBrandYoutube } from '@tabler/icons-react'

// 샘플 크롤링 데이터
const crawledData = [
  {
    id: 1,
    platform: "인스타그램",
    content: "티젠 콤부차 한달 챌린지 성공! 정말 효과 있어요",
    author: "@healthylife_jane",
    date: "2024-11-28",
    likes: 3840,
    comments: 256,
    sentiment: "positive"
  },
  {
    id: 2,
    platform: "유튜브",
    content: "콤부차 다이어트 효과 있을까? 1개월 솔직 리뷰",
    author: "다이어터킴",
    date: "2024-11-27",
    likes: 4250,
    comments: 387,
    sentiment: "positive"
  },
  {
    id: 3,
    platform: "네이버 블로그",
    content: "티젠 콤부차 맛 총정리 (레몬/자몽/복숭아)",
    author: "푸드리뷰어",
    date: "2024-11-26",
    likes: 892,
    comments: 143,
    sentiment: "positive"
  },
  // 더 많은 데이터...
]

export default function CrawledDataPage() {
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
                <h1 className="text-3xl font-bold mb-2">크롤링 데이터</h1>
                <p className="text-muted-foreground">
                  수집된 온라인 데이터를 확인하고 관리합니다
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>데이터 검색</CardTitle>
                  <CardDescription>키워드, 플랫폼, 날짜로 필터링</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input placeholder="검색어를 입력하세요..." className="flex-1" />
                    <Button>
                      <IconSearch className="mr-2" />
                      검색
                    </Button>
                    <Button variant="outline">
                      <IconDownload className="mr-2" />
                      내보내기
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>수집된 데이터</CardTitle>
                      <CardDescription>총 12,458건의 데이터</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>플랫폼</TableHead>
                        <TableHead>콘텐츠</TableHead>
                        <TableHead>작성자</TableHead>
                        <TableHead>날짜</TableHead>
                        <TableHead className="text-right">참여도</TableHead>
                        <TableHead>감정</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {crawledData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              {item.platform === "인스타그램" && <IconBrandInstagram className="size-3" />}
                              {item.platform === "유튜브" && <IconBrandYoutube className="size-3" />}
                              {item.platform}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md truncate">{item.content}</TableCell>
                          <TableCell>{item.author}</TableCell>
                          <TableCell>{item.date}</TableCell>
                          <TableCell className="text-right">
                            <div className="text-sm">
                              <div>❤️ {item.likes.toLocaleString()}</div>
                              <div>💬 {item.comments}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={item.sentiment === "positive" ? "default" : "secondary"}>
                              {item.sentiment === "positive" ? "긍정" : "중립"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

