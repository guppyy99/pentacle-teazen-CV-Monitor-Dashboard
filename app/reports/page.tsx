"use client"

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IconDownload, IconEye, IconFileText } from '@tabler/icons-react'

const reports = [
  {
    id: 1,
    title: "티젠 콤부차 11월 종합 리포트",
    description: "11월 한 달간의 브랜드 평판 및 소비자 반응 분석",
    date: "2024-11-30",
    type: "월간 리포트",
    status: "완료",
  },
  {
    id: 2,
    title: "경쟁사 비교 분석 리포트",
    description: "티젠 vs 동서 콤부차 비교 분석 결과",
    date: "2024-11-25",
    type: "비교 분석",
    status: "완료",
  },
  {
    id: 3,
    title: "인스타그램 캠페인 성과 리포트",
    description: "11월 인스타그램 마케팅 캠페인 효과 분석",
    date: "2024-11-20",
    type: "캠페인 리포트",
    status: "완료",
  },
]

export default function ReportsPage() {
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
                <h1 className="text-3xl font-bold mb-2">분석 리포트</h1>
                <p className="text-muted-foreground">
                  생성된 분석 리포트를 확인하고 다운로드합니다
                </p>
              </div>

              <div className="grid gap-4">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <IconFileText className="size-5 text-primary" />
                            <CardTitle>{report.title}</CardTitle>
                          </div>
                          <CardDescription>{report.description}</CardDescription>
                        </div>
                        <Badge>{report.type}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          생성일: {report.date} · 상태: {report.status}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <IconEye className="mr-2 size-4" />
                            보기
                          </Button>
                          <Button size="sm">
                            <IconDownload className="mr-2 size-4" />
                            다운로드
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>새 리포트 생성</CardTitle>
                  <CardDescription>
                    현재 수집된 데이터를 기반으로 새로운 분석 리포트를 생성합니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="lg" className="w-full">
                    새 리포트 생성하기
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

