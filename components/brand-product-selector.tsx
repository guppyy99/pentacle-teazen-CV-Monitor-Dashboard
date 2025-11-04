"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { IconSwitchHorizontal, IconRefresh, IconShoppingCart, IconBrandInstagram, IconBrandYoutube, IconWorld, IconArticle } from "@tabler/icons-react"
import { toast } from "sonner"

const products = [
  "콤부차",
  "애사비",
  "브이핏",
  "단백질쉐이크",
  "젤리&액상",
  "아이스티&밀크티",
  "티백",
  "기타차"
]

const socialChannels = [
  { name: "네이버", icon: IconWorld, url: "https://search.naver.com", color: "text-green-600" },
  { name: "자사몰", icon: IconShoppingCart, url: "#", color: "text-blue-600" },
  { name: "인스타그램", icon: IconBrandInstagram, url: "#", color: "text-pink-600" },
  { name: "유튜브", icon: IconBrandYoutube, url: "#", color: "text-red-600" },
  { name: "블로그", icon: IconArticle, url: "#", color: "text-orange-600" },
]

export function BrandProductSelector() {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState("콤부차")
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    toast.info("데이터를 업데이트하는 중...")
    
    // 새로고침 시뮬레이션 (2초)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setLastUpdated(new Date())
    setIsRefreshing(false)
    toast.success("데이터가 업데이트되었습니다")
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${month}월 ${day}일 ${hours}:${minutes}`
  }

  return (
    <Card className="border-2 shadow-sm">
      <CardContent className="pt-6 pb-6">
        <div className="space-y-4">
          {/* 상단 영역: 로고 + 제품 선택 + 브랜드 변경 */}
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
            {/* 티젠 로고 */}
            <div className="flex items-center justify-center shrink-0">
              <Image
                src="/teazen_main_logo.png"
                alt="Teazen Logo"
                width={100}
                height={28}
                className="h-7 w-auto"
                priority
              />
            </div>

            {/* 구분선 */}
            <div className="h-7 w-px bg-border hidden lg:block" />

            {/* 제품 선택 */}
            <div className="flex items-center gap-3 flex-1">
              <Label className="text-sm font-medium whitespace-nowrap text-muted-foreground">
                모니터링 제품:
              </Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-[200px] font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 브랜드 변경 버튼 */}
            <Button 
              variant="destructive" 
              className="shrink-0"
              onClick={() => router.push("/brand-reputation")}
            >
              <IconSwitchHorizontal className="mr-2" />
              브랜드 변경
            </Button>
          </div>

          {/* 하단 영역: 채널 링크 + 최신화 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            {/* 자사 채널 링크 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground mr-2">자사 채널:</span>
              <div className="flex items-center gap-1">
                {socialChannels.map((channel) => (
                  <Button
                    key={channel.name}
                    variant="ghost"
                    size="icon"
                    className="size-8 hover:bg-muted"
                    onClick={() => window.open(channel.url, '_blank')}
                    title={channel.name}
                  >
                    <channel.icon className={`size-5 ${channel.color}`} />
                  </Button>
                ))}
              </div>
            </div>

            {/* 최신화 정보 */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                최신화: {formatTime(lastUpdated)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <IconRefresh className={`mr-2 size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? '업데이트 중...' : '최신화'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

