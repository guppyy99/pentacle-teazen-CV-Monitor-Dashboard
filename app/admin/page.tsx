"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react"

export default function AdminPage() {
  const router = useRouter()
  const [sidebarConfig, setSidebarConfig] = useState<any>(null)
  const [cardsConfig, setCardsConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfigs()
  }, [])

  const loadConfigs = async () => {
    try {
      const [sidebarRes, cardsRes] = await Promise.all([
        fetch("/api/config/sidebar"),
        fetch("/api/config/cards"),
      ])

      if (sidebarRes.ok && cardsRes.ok) {
        setSidebarConfig(await sidebarRes.json())
        setCardsConfig(await cardsRes.json())
      }
    } catch (error) {
      toast.error("설정을 불러오는데 실패했습니다")
    } finally {
      setLoading(false)
    }
  }

  const saveSidebarConfig = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/config/sidebar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sidebarConfig),
      })

      if (response.ok) {
        toast.success("사이드바 설정이 저장되었습니다")
      } else {
        toast.error("저장에 실패했습니다")
      }
    } catch (error) {
      toast.error("저장 중 오류가 발생했습니다")
    } finally {
      setSaving(false)
    }
  }

  const saveCardsConfig = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/config/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardsConfig),
      })

      if (response.ok) {
        toast.success("카드 설정이 저장되었습니다")
      } else {
        toast.error("저장에 실패했습니다")
      }
    } catch (error) {
      toast.error("저장 중 오류가 발생했습니다")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
              <IconArrowLeft className="mr-2" />
              대시보드로 돌아가기
            </Button>
            <h1 className="text-3xl font-bold">관리자 설정</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>

        <Tabs defaultValue="sidebar" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sidebar">사이드바 메뉴</TabsTrigger>
            <TabsTrigger value="cards">대시보드 카드</TabsTrigger>
            <TabsTrigger value="user">사용자 정보</TabsTrigger>
          </TabsList>

          {/* 사이드바 메뉴 설정 */}
          <TabsContent value="sidebar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>메인 네비게이션</CardTitle>
                <CardDescription>주요 메뉴 항목을 수정할 수 있습니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sidebarConfig?.navMain?.map((item: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>메뉴 제목</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const newConfig = { ...sidebarConfig }
                          newConfig.navMain[index].title = e.target.value
                          setSidebarConfig(newConfig)
                        }}
                      />
                    </div>
                    <div>
                      <Label>아이콘</Label>
                      <Input
                        value={item.icon}
                        onChange={(e) => {
                          const newConfig = { ...sidebarConfig }
                          newConfig.navMain[index].icon = e.target.value
                          setSidebarConfig(newConfig)
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button onClick={saveSidebarConfig} disabled={saving} className="w-full">
                  <IconDeviceFloppy className="mr-2" />
                  {saving ? "저장 중..." : "저장하기"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>보조 메뉴</CardTitle>
                <CardDescription>설정, 도움말 등 보조 메뉴</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {sidebarConfig?.navSecondary?.map((item: any, index: number) => (
                  <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>메뉴 제목</Label>
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const newConfig = { ...sidebarConfig }
                          newConfig.navSecondary[index].title = e.target.value
                          setSidebarConfig(newConfig)
                        }}
                      />
                    </div>
                    <div>
                      <Label>아이콘</Label>
                      <Input
                        value={item.icon}
                        onChange={(e) => {
                          const newConfig = { ...sidebarConfig }
                          newConfig.navSecondary[index].icon = e.target.value
                          setSidebarConfig(newConfig)
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Button onClick={saveSidebarConfig} disabled={saving} className="w-full">
                  <IconDeviceFloppy className="mr-2" />
                  {saving ? "저장 중..." : "저장하기"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 대시보드 카드 설정 */}
          <TabsContent value="cards" className="space-y-4">
            {cardsConfig?.cards?.map((card: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>카드 {index + 1}: {card.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>카드 제목</Label>
                      <Input
                        value={card.title}
                        onChange={(e) => {
                          const newConfig = { ...cardsConfig }
                          newConfig.cards[index].title = e.target.value
                          setCardsConfig(newConfig)
                        }}
                      />
                    </div>
                    <div>
                      <Label>값</Label>
                      <Input
                        value={card.value}
                        onChange={(e) => {
                          const newConfig = { ...cardsConfig }
                          newConfig.cards[index].value = e.target.value
                          setCardsConfig(newConfig)
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>트렌드 값</Label>
                      <Input
                        value={card.trend.value}
                        onChange={(e) => {
                          const newConfig = { ...cardsConfig }
                          newConfig.cards[index].trend.value = e.target.value
                          setCardsConfig(newConfig)
                        }}
                      />
                    </div>
                    <div>
                      <Label>트렌드 방향 (up/down)</Label>
                      <Input
                        value={card.trend.direction}
                        onChange={(e) => {
                          const newConfig = { ...cardsConfig }
                          newConfig.cards[index].trend.direction = e.target.value
                          setCardsConfig(newConfig)
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>설명</Label>
                    <Input
                      value={card.description}
                      onChange={(e) => {
                        const newConfig = { ...cardsConfig }
                        newConfig.cards[index].description = e.target.value
                        setCardsConfig(newConfig)
                      }}
                    />
                  </div>
                  <div>
                    <Label>부제목</Label>
                    <Input
                      value={card.subtitle}
                      onChange={(e) => {
                        const newConfig = { ...cardsConfig }
                        newConfig.cards[index].subtitle = e.target.value
                        setCardsConfig(newConfig)
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={saveCardsConfig} disabled={saving} className="w-full">
              <IconDeviceFloppy className="mr-2" />
              {saving ? "저장 중..." : "모든 카드 저장하기"}
            </Button>
          </TabsContent>

          {/* 사용자 정보 설정 */}
          <TabsContent value="user" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>사용자 프로필</CardTitle>
                <CardDescription>사이드바에 표시되는 사용자 정보</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>이름</Label>
                  <Input
                    value={sidebarConfig?.user?.name || ""}
                    onChange={(e) => {
                      const newConfig = { ...sidebarConfig }
                      newConfig.user.name = e.target.value
                      setSidebarConfig(newConfig)
                    }}
                  />
                </div>
                <div>
                  <Label>이메일</Label>
                  <Input
                    value={sidebarConfig?.user?.email || ""}
                    onChange={(e) => {
                      const newConfig = { ...sidebarConfig }
                      newConfig.user.email = e.target.value
                      setSidebarConfig(newConfig)
                    }}
                  />
                </div>
                <div>
                  <Label>아바타 경로</Label>
                  <Input
                    value={sidebarConfig?.user?.avatar || ""}
                    onChange={(e) => {
                      const newConfig = { ...sidebarConfig }
                      newConfig.user.avatar = e.target.value
                      setSidebarConfig(newConfig)
                    }}
                  />
                </div>
                <Button onClick={saveSidebarConfig} disabled={saving} className="w-full">
                  <IconDeviceFloppy className="mr-2" />
                  {saving ? "저장 중..." : "저장하기"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

