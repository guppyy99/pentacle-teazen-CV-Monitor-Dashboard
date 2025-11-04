"use client"

import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// 티젠 콤부차 샘플 데이터 (최근 3개월)
const dailyData = [
  { date: "2024-11-01", mentions: 142 },
  { date: "2024-11-02", mentions: 158 },
  { date: "2024-11-03", mentions: 135 },
  { date: "2024-11-04", mentions: 189 },
  // ... 더 많은 일별 데이터 (생략)
]

const weeklyData = [
  { date: "10월 4주", mentions: 852 },
  { date: "11월 1주", mentions: 967 },
  { date: "11월 2주", mentions: 1124 },
  { date: "11월 3주", mentions: 1089 },
  { date: "11월 4주", mentions: 1256 },
  { date: "12월 1주", mentions: 1342 },
  { date: "12월 2주", mentions: 1425 },
  { date: "12월 3주", mentions: 1568 },
  { date: "12월 4주", mentions: 1634 },
]

const monthlyData = [
  { date: "2024-06", mentions: 3245 },
  { date: "2024-07", mentions: 3567 },
  { date: "2024-08", mentions: 3892 },
  { date: "2024-09", mentions: 4156 },
  { date: "2024-10", mentions: 4523 },
  { date: "2024-11", mentions: 4987 },
]

export function MentionTrendChart() {
  const [period, setPeriod] = useState("weekly")

  const getData = () => {
    switch (period) {
      case "daily":
        return dailyData
      case "weekly":
        return weeklyData
      case "monthly":
        return monthlyData
      default:
        return weeklyData
    }
  }

  const data = getData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>언급량 추이</CardTitle>
        <CardDescription>티젠 콤부차 온라인 언급 데이터</CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={period}
            onValueChange={(value) => value && setPeriod(value)}
            variant="outline"
          >
            <ToggleGroupItem value="daily">일별</ToggleGroupItem>
            <ToggleGroupItem value="weekly">주별</ToggleGroupItem>
            <ToggleGroupItem value="monthly">월별</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMentions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                if (period === "monthly") {
                  return value.split("-")[1] + "월"
                }
                return value
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-medium">{payload[0].payload.date}</p>
                      <p className="text-primary font-semibold">
                        {payload[0].value?.toLocaleString()} 건
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="mentions"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorMentions)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

