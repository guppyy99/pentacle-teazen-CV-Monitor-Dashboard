"use client"

import { useState } from "react"
import Image from "next/image"
import {
  IconPlus,
  IconTrash,
  IconExternalLink,
  IconRefresh,
  IconTag,
  IconX,
  IconLoader2,
  IconStar,
  IconMessage,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { PageLayout } from "@/components/page-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import type { Category, Item } from "@/types"
import { detectPlatform, PLATFORM_INFO, CATEGORY_COLORS } from "@/types"
import { mockCategories, mockItems } from "@/lib/mock-data"

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>(mockItems)
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // 아이템 추가 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newItemUrl, setNewItemUrl] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [extractedInfo, setExtractedInfo] = useState<{
    productName: string
    productImage: string
    platform: string
  } | null>(null)

  // 카테고리 추가 모달 상태
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  // URL에서 상품 정보 추출 (목업)
  const handleExtractInfo = async () => {
    if (!newItemUrl) {
      toast.error("URL을 입력해주세요")
      return
    }

    const platform = detectPlatform(newItemUrl)
    if (!platform) {
      toast.error("지원하지 않는 플랫폼입니다")
      return
    }

    setIsLoading(true)

    // 크롤링 API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 목업 데이터 반환
    setExtractedInfo({
      productName: `[추출됨] 티젠 콤부차 레몬 5g x 30개입`,
      productImage: "https://shopping-phinf.pstatic.net/main_3246633/32466338621.20220527055831.jpg",
      platform: platform,
    })

    setIsLoading(false)
    toast.success("상품 정보를 추출했습니다")
  }

  // 아이템 추가
  const handleAddItem = () => {
    if (!extractedInfo || !newItemCategory) {
      toast.error("카테고리를 선택해주세요")
      return
    }

    const platform = detectPlatform(newItemUrl)
    if (!platform) return

    const newItem: Item = {
      id: `item-${Date.now()}`,
      url: newItemUrl,
      platform: platform,
      platformName: PLATFORM_INFO[platform].name,
      productName: extractedInfo.productName,
      productImage: extractedInfo.productImage,
      categoryId: newItemCategory,
      lastCrawledAt: null,
      reviewCount: 0,
      avgRating: 0,
      createdAt: new Date().toISOString(),
    }

    setItems([...items, newItem])
    setIsAddModalOpen(false)
    setNewItemUrl("")
    setNewItemCategory("")
    setExtractedInfo(null)
    toast.success("아이템이 추가되었습니다")
  }

  // 아이템 삭제
  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId))
    toast.success("아이템이 삭제되었습니다")
  }

  // 카테고리 추가
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error("카테고리 이름을 입력해주세요")
      return
    }

    const colorIndex = categories.length % CATEGORY_COLORS.length
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName.trim(),
      color: CATEGORY_COLORS[colorIndex],
      createdAt: new Date().toISOString(),
    }

    setCategories([...categories, newCategory])
    setIsCategoryModalOpen(false)
    setNewCategoryName("")
    toast.success("카테고리가 추가되었습니다")
  }

  // 카테고리 삭제
  const handleDeleteCategory = (categoryId: string) => {
    // 해당 카테고리의 아이템도 함께 삭제
    setItems(items.filter(item => item.categoryId !== categoryId))
    setCategories(categories.filter(cat => cat.id !== categoryId))
    toast.success("카테고리가 삭제되었습니다")
  }

  // 필터링된 아이템
  const filteredItems = selectedCategory === "all"
    ? items
    : items.filter(item => item.categoryId === selectedCategory)

  // 카테고리별 아이템 수
  const getCategoryItemCount = (categoryId: string) => {
    return items.filter(item => item.categoryId === categoryId).length
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">아이템 관리</h1>
          <p className="text-muted-foreground">모니터링할 오픈마켓 상품을 등록하고 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <IconTag className="mr-2 h-4 w-4" />
                카테고리 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>카테고리 추가</DialogTitle>
                <DialogDescription>
                  새로운 카테고리를 추가합니다. 콤부차, 애사비 등 제품군을 구분하세요.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="category-name">카테고리 이름</Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="예: 콤부차"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleAddCategory}>추가</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <IconPlus className="mr-2 h-4 w-4" />
                아이템 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>아이템 추가</DialogTitle>
                <DialogDescription>
                  오픈마켓 상품 링크를 입력하면 상품명과 이미지를 자동으로 추출합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="item-url">상품 URL</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="item-url"
                      value={newItemUrl}
                      onChange={(e) => setNewItemUrl(e.target.value)}
                      placeholder="https://smartstore.naver.com/..."
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      onClick={handleExtractInfo}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "추출"
                      )}
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    스마트스토어, 쿠팡, 11번가, G마켓 등 지원
                  </p>
                </div>

                {extractedInfo && (
                  <div className="rounded-lg border p-4">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                        <Image
                          src={extractedInfo.productImage}
                          alt={extractedInfo.productName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{extractedInfo.productName}</p>
                        <Badge variant="secondary" className="mt-1">
                          {PLATFORM_INFO[extractedInfo.platform as keyof typeof PLATFORM_INFO]?.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label htmlFor="item-category">카테고리</Label>
                  <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddModalOpen(false)
                  setNewItemUrl("")
                  setExtractedInfo(null)
                  setNewItemCategory("")
                }}>
                  취소
                </Button>
                <Button onClick={handleAddItem} disabled={!extractedInfo || !newItemCategory}>
                  추가
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 카테고리 필터 및 관리 */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          전체 ({items.length})
        </Button>
        {categories.map((cat) => (
          <div key={cat.id} className="group relative">
            <Button
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="pr-8"
              style={{
                borderColor: selectedCategory === cat.id ? undefined : cat.color,
                backgroundColor: selectedCategory === cat.id ? cat.color : undefined,
              }}
            >
              <div
                className="mr-2 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: selectedCategory === cat.id ? "white" : cat.color
                }}
              />
              {cat.name} ({getCategoryItemCount(cat.id)})
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 transition-opacity hover:bg-destructive/20 group-hover:opacity-100"
                >
                  <IconX className="h-3 w-3" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>카테고리 삭제</AlertDialogTitle>
                  <AlertDialogDescription>
                    &apos;{cat.name}&apos; 카테고리를 삭제하시겠습니까?
                    이 카테고리에 속한 모든 아이템도 함께 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    삭제
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>

      {/* 아이템 그리드 */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">등록된 아이템이 없습니다</p>
          <Button
            variant="link"
            className="mt-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            첫 번째 아이템 추가하기
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => {
            const category = categories.find(c => c.id === item.categoryId)
            return (
              <Card key={item.id} className="group overflow-hidden">
                <div className="relative aspect-square bg-muted">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute left-2 top-2">
                    <Badge
                      style={{ backgroundColor: category?.color }}
                      className="text-white"
                    >
                      {category?.name}
                    </Badge>
                  </div>
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => window.open(item.url, "_blank")}
                    >
                      <IconExternalLink className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-8 w-8"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>아이템 삭제</AlertDialogTitle>
                          <AlertDialogDescription>
                            이 아이템을 삭제하시겠습니까? 수집된 리뷰 데이터도 함께 삭제됩니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>취소</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteItem(item.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            삭제
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="line-clamp-2 text-sm font-medium">
                    {item.productName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {item.platformName}
                    </Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{item.avgRating || "-"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconMessage className="h-4 w-4" />
                      <span>{item.reviewCount.toLocaleString()}건</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-4 py-2 text-xs text-muted-foreground">
                  {item.lastCrawledAt ? (
                    <>마지막 수집: {new Date(item.lastCrawledAt).toLocaleDateString()}</>
                  ) : (
                    "아직 수집된 데이터 없음"
                  )}
                </CardFooter>
              </Card>
            )
          })}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
