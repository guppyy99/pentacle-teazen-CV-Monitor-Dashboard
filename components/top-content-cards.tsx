"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconThumbUp, IconMessage, IconEye } from "@tabler/icons-react"

// 인터랙션이 많은 콘텐츠 Top 5 (콘텐츠 지수 기준)
const topContents = [
  {
    id: 1,
    platform: "인스타그램",
    title: "티젠 콤부차 한달 챌린지 후기",
    author: "@healthylife_jane",
    views: 45200,
    likes: 3840,
    comments: 256,
    score: 4567,
    sentiment: "positive",
    date: "2024-11-25",
  },
  {
    id: 2,
    platform: "유튜브",
    title: "콤부차 다이어트 효과 있을까? 1개월 솔직 리뷰",
    author: "다이어터킴",
    views: 128500,
    likes: 4250,
    comments: 387,
    score: 4128,
    sentiment: "positive",
    date: "2024-11-22",
  },
  {
    id: 3,
    platform: "네이버 블로그",
    title: "티젠 콤부차 맛 총정리 (레몬/자몽/복숭아)",
    author: "푸드리뷰어",
    views: 18900,
    likes: 892,
    comments: 143,
    score: 3245,
    sentiment: "positive",
    date: "2024-11-20",
  },
  {
    id: 4,
    platform: "더쿠",
    title: "[후기] 콤부차 혈당 실험 결과 공유",
    author: "익명",
    views: 32400,
    likes: 1256,
    comments: 342,
    score: 2987,
    sentiment: "neutral",
    date: "2024-11-18",
  },
  {
    id: 5,
    platform: "인스타그램",
    title: "아침 루틴 🌅 티젠 콤부차로 상쾌하게",
    author: "@morning_ritual",
    views: 28700,
    likes: 2150,
    comments: 98,
    score: 2756,
    sentiment: "positive",
    date: "2024-11-15",
  },
]

export function TopContentCards() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>인터랙션 Top 5</CardTitle>
        <CardDescription>콘텐츠 지수 기준 상위 콘텐츠</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topContents.map((content, index) => (
          <div
            key={content.id}
            className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold shrink-0">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  {content.platform}
                </Badge>
                <Badge
                  variant={content.sentiment === "positive" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {content.sentiment === "positive" ? "긍정" : "중립"}
                </Badge>
              </div>
              <h4 className="font-semibold text-sm mb-1 truncate">{content.title}</h4>
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
                  {content.comments.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">지수</p>
              <p className="text-lg font-bold text-primary">{content.score}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

