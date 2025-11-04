"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

// 긍정 키워드 (크기별로 정렬)
const positiveKeywords = [
  { text: "맛있다", size: 48, count: 2847 },
  { text: "상쾌", size: 42, count: 2156 },
  { text: "건강", size: 40, count: 1987 },
  { text: "다이어트", size: 38, count: 1823 },
  { text: "추천", size: 36, count: 1654 },
  { text: "효과", size: 32, count: 1432 },
  { text: "레몬맛", size: 30, count: 1287 },
  { text: "혈당", size: 28, count: 1156 },
  { text: "저칼로리", size: 26, count: 987 },
  { text: "프로바이오틱스", size: 24, count: 876 },
  { text: "소화", size: 22, count: 745 },
  { text: "부담없이", size: 20, count: 654 },
  { text: "달콤", size: 18, count: 543 },
  { text: "자몽맛", size: 18, count: 521 },
]

// 부정 키워드
const negativeKeywords = [
  { text: "비싸다", size: 36, count: 1245 },
  { text: "단맛", size: 32, count: 987 },
  { text: "인공적", size: 28, count: 756 },
  { text: "탄산", size: 26, count: 654 },
  { text: "당분", size: 24, count: 543 },
  { text: "가격", size: 22, count: 487 },
  { text: "과장광고", size: 20, count: 345 },
  { text: "속쓰림", size: 18, count: 267 },
]

export function SentimentWordCloud() {
  const [sentiment, setSentiment] = useState<"positive" | "negative">("positive")

  const keywords = sentiment === "positive" ? positiveKeywords : negativeKeywords

  return (
    <Card>
      <CardHeader>
        <CardTitle>키워드 분석</CardTitle>
        <CardDescription>긍정/부정 주요 키워드</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={sentiment} onValueChange={(v) => setSentiment(v as "positive" | "negative")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="positive">
              긍정 키워드
              <Badge variant="secondary" className="ml-2">78.4%</Badge>
            </TabsTrigger>
            <TabsTrigger value="negative">
              부정 키워드
              <Badge variant="secondary" className="ml-2">21.6%</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="positive" className="m-0">
            <div className="flex flex-wrap gap-3 justify-center items-center min-h-[300px] p-8 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20 rounded-lg">
              {positiveKeywords.map((keyword) => (
                <button
                  key={keyword.text}
                  className="hover:scale-110 transition-transform cursor-pointer text-green-600 dark:text-green-400 font-semibold"
                  style={{ fontSize: `${keyword.size}px` }}
                  title={`${keyword.count.toLocaleString()} 회 언급`}
                >
                  {keyword.text}
                </button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="negative" className="m-0">
            <div className="flex flex-wrap gap-3 justify-center items-center min-h-[300px] p-8 bg-gradient-to-br from-red-50/50 to-orange-50/50 dark:from-red-950/20 dark:to-orange-950/20 rounded-lg">
              {negativeKeywords.map((keyword) => (
                <button
                  key={keyword.text}
                  className="hover:scale-110 transition-transform cursor-pointer text-red-600 dark:text-red-400 font-semibold"
                  style={{ fontSize: `${keyword.size}px` }}
                  title={`${keyword.count.toLocaleString()} 회 언급`}
                >
                  {keyword.text}
                </button>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* LLM 총평 (하드코딩) */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <span className="text-primary">AI 총평</span>
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            티젠 콤부차는 전반적으로 <strong className="text-green-600 dark:text-green-400">긍정적인 평가(78.4%)</strong>를 받고 있습니다. 
            소비자들은 특히 '맛', '상쾌함', '건강' 측면에서 높이 평가하고 있으며, 다이어트 효과에 대한 관심도가 높습니다. 
            레몬맛과 저칼로리 특성이 주요 강점으로 부각되고 있습니다. 다만, 가격 대비 가성비와 단맛에 대한 개선 요구가 있으며, 
            일부 소비자는 과장 광고에 대한 우려를 표현하고 있습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

