"use client"

import { useEffect, useState } from "react"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface CardData {
  id: string
  title: string
  value: string
  trend: {
    value: string
    direction: "up" | "down"
  }
  description: string
  subtitle: string
}

const defaultCards: CardData[] = [
  {
    id: "revenue",
    title: "총 수익",
    value: "$1,250.00",
    trend: { value: "+12.5%", direction: "up" },
    description: "이번 달 상승 추세",
    subtitle: "최근 6개월 방문자 수",
  },
  {
    id: "new-customers",
    title: "신규 고객",
    value: "1,234",
    trend: { value: "-20%", direction: "down" },
    description: "이번 기간 20% 감소",
    subtitle: "고객 확보에 주의 필요",
  },
  {
    id: "active-accounts",
    title: "활성 계정",
    value: "45,678",
    trend: { value: "+12.5%", direction: "up" },
    description: "강력한 사용자 유지율",
    subtitle: "참여도가 목표 초과",
  },
  {
    id: "growth-rate",
    title: "성장률",
    value: "4.5%",
    trend: { value: "+4.5%", direction: "up" },
    description: "꾸준한 성과 향상",
    subtitle: "성장 예측 달성",
  },
]

export function SectionCards() {
  const [cards, setCards] = useState<CardData[]>(defaultCards)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/config/cards")
      .then((res) => res.json())
      .then((data) => {
        if (data.cards) {
          setCards(data.cards)
        }
        setLoading(false)
      })
      .catch(() => {
        setCards(defaultCards)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-20"></div>
              <div className="h-8 bg-muted rounded w-32 mt-2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.id} className="@container/card">
          <CardHeader>
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {card.trend.direction === "up" ? <IconTrendingUp /> : <IconTrendingDown />}
                {card.trend.value}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.description}{" "}
              {card.trend.direction === "up" ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">{card.subtitle}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
