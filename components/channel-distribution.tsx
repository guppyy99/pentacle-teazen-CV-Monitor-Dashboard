"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// 채널별 언급량 데이터
const channelData = [
  { name: "인스타그램", value: 5342, percentage: 42.8 },
  { name: "네이버 블로그", value: 3556, percentage: 28.5 },
  { name: "네이버 카페", value: 2270, percentage: 18.2 },
  { name: "유튜브", value: 750, percentage: 6.0 },
  { name: "커뮤니티", value: 540, percentage: 4.3 },
  { name: "기타", value: 25, percentage: 0.2 },
]

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0d0d0"]

export function ChannelDistribution() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>채널별 분포</CardTitle>
        <CardDescription>플랫폼별 언급량 비율</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={channelData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {channelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-lg p-3 shadow-lg">
                      <p className="font-medium">{payload[0].name}</p>
                      <p className="text-primary font-semibold">
                        {payload[0].value?.toLocaleString()} 건
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {channelData[payload[0].payload.name]?.percentage || 0}%
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* 채널별 상세 리스트 */}
        <div className="mt-4 space-y-2">
          {channelData.map((channel, index) => (
            <div key={channel.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span>{channel.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium">{channel.value.toLocaleString()}건</span>
                <span className="text-muted-foreground">{channel.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

