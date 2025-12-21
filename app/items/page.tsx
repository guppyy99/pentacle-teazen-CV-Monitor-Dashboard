"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  IconPlus,
  IconTrash,
  IconExternalLink,
  IconTag,
  IconX,
  IconLoader2,
  IconStar,
  IconMessage,
  IconPencil,
  IconRefresh,
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

import { detectPlatform, PLATFORM_INFO, CATEGORY_COLORS } from "@/types"
import {
  getCategories,
  getItems,
  createCategory,
  deleteCategory,
  createItem,
  updateItem,
  deleteItem,
  extractMetadata,
  triggerCrawl,
  type CategoryData,
  type ItemData,
} from "@/lib/api"

export default function ItemsPage() {
  const [items, setItems] = useState<ItemData[]>([])
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isPageLoading, setIsPageLoading] = useState(true)

  // 아이템 추가 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newItemUrl, setNewItemUrl] = useState("")
  const [newItemName, setNewItemName] = useState("")
  const [newItemCategory, setNewItemCategory] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [extractedInfo, setExtractedInfo] = useState<{
    product_name: string
    product_image: string
    platform: string
  } | null>(null)

  // 아이템 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ItemData | null>(null)
  const [editItemName, setEditItemName] = useState("")
  const [editItemCategory, setEditItemCategory] = useState("")

  // 카테고리 추가 모달 상태
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  // 크롤링 상태
  const [crawlingItemId, setCrawlingItemId] = useState<string | null>(null)

  // 데이터 로드
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsPageLoading(true)
      const [categoriesData, itemsData] = await Promise.all([
        getCategories(),
        getItems(),
      ])
      setCategories(categoriesData)
      setItems(itemsData)
    } catch (error) {
      console.error("Failed to load data:", error)
      toast.error("데이터 로드 실패")
    } finally {
      setIsPageLoading(false)
    }
  }

  // URL에서 상품 정보 추출
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

    try {
      const metadata = await extractMetadata(newItemUrl)
      setExtractedInfo({
        product_name: metadata.product_name || "상품명을 입력해주세요",
        product_image: metadata.product_image || "",
        platform: metadata.platform,
      })
      setNewItemName(metadata.product_name || "")
      toast.success("상품 정보를 추출했습니다")
    } catch (error) {
      console.error("Extract error:", error)
      // Fallback - 플랫폼만 설정
      setExtractedInfo({
        product_name: "",
        product_image: "",
        platform,
      })
      toast.info("메타데이터 추출 실패 - 수동 입력해주세요")
    } finally {
      setIsLoading(false)
    }
  }

  // 아이템 추가
  const handleAddItem = async () => {
    if (!newItemCategory) {
      toast.error("카테고리를 선택해주세요")
      return
    }

    try {
      const newItem = await createItem({
        url: newItemUrl,
        product_name: newItemName || extractedInfo?.product_name || "상품명 없음",
        product_image: extractedInfo?.product_image,
        category_id: newItemCategory,
      })

      setItems([newItem, ...items])
      setIsAddModalOpen(false)
      setNewItemUrl("")
      setNewItemName("")
      setNewItemCategory("")
      setExtractedInfo(null)
      toast.success("아이템이 추가되었습니다")
    } catch (error) {
      console.error("Create item error:", error)
      toast.error("아이템 추가 실패")
    }
  }

  // 아이템 수정 모달 열기
  const handleOpenEditModal = (item: ItemData) => {
    setEditingItem(item)
    setEditItemName(item.product_name)
    setEditItemCategory(item.category_id || "")
    setIsEditModalOpen(true)
  }

  // 아이템 수정
  const handleUpdateItem = async () => {
    if (!editingItem) return

    try {
      const updated = await updateItem(editingItem.id, {
        product_name: editItemName,
        category_id: editItemCategory,
      })

      setItems(items.map((item) => (item.id === editingItem.id ? updated : item)))
      setIsEditModalOpen(false)
      setEditingItem(null)
      toast.success("아이템이 수정되었습니다")
    } catch (error) {
      console.error("Update item error:", error)
      toast.error("아이템 수정 실패")
    }
  }

  // 아이템 삭제
  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId)
      setItems(items.filter((item) => item.id !== itemId))
      toast.success("아이템이 삭제되었습니다")
    } catch (error) {
      console.error("Delete item error:", error)
      toast.error("아이템 삭제 실패")
    }
  }

  // 카테고리 추가
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("카테고리 이름을 입력해주세요")
      return
    }

    try {
      const colorIndex = categories.length % CATEGORY_COLORS.length
      const newCategory = await createCategory({
        name: newCategoryName.trim(),
        color: CATEGORY_COLORS[colorIndex],
      })

      setCategories([...categories, newCategory])
      setIsCategoryModalOpen(false)
      setNewCategoryName("")
      toast.success("카테고리가 추가되었습니다")
    } catch (error) {
      console.error("Create category error:", error)
      toast.error("카테고리 추가 실패")
    }
  }

  // 카테고리 삭제
  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId)
      setItems(items.filter((item) => item.category_id !== categoryId))
      setCategories(categories.filter((cat) => cat.id !== categoryId))
      toast.success("카테고리가 삭제되었습니다")
    } catch (error) {
      console.error("Delete category error:", error)
      toast.error("카테고리 삭제 실패")
    }
  }

  // 크롤링 실행
  const handleCrawl = async (itemId: string) => {
    setCrawlingItemId(itemId)
    try {
      const result = await triggerCrawl(itemId)
      toast.success(`크롤링 완료: ${result.crawled}건 수집, ${result.inserted}건 저장`)
      // 아이템 목록 새로고침
      const updatedItems = await getItems()
      setItems(updatedItems)
    } catch (error) {
      console.error("Crawl error:", error)
      toast.error("크롤링 실패")
    } finally {
      setCrawlingItemId(null)
    }
  }

  // 필터링된 아이템
  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.category_id === selectedCategory)

  // 카테고리별 아이템 수
  const getCategoryItemCount = (categoryId: string) => {
    return items.filter((item) => item.category_id === categoryId).length
  }

  if (isPageLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-6 p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">아이템 관리</h1>
            <p className="text-muted-foreground">
              모니터링할 오픈마켓 상품을 등록하고 관리합니다
            </p>
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
                  <Button
                    variant="outline"
                    onClick={() => setIsCategoryModalOpen(false)}
                  >
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
                    <>
                      <div className="rounded-lg border p-4">
                        <div className="flex gap-4">
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                            {extractedInfo.product_image ? (
                              <Image
                                src={extractedInfo.product_image}
                                alt="상품 이미지"
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <Badge variant="secondary">
                              {PLATFORM_INFO[
                                extractedInfo.platform as keyof typeof PLATFORM_INFO
                              ]?.name || extractedInfo.platform}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="item-name">상품명 (수정 가능)</Label>
                        <Input
                          id="item-name"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="상품명을 입력하세요"
                          className="mt-2"
                        />
                      </div>
                    </>
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
                                style={{ backgroundColor: cat.color || "#888" }}
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddModalOpen(false)
                      setNewItemUrl("")
                      setNewItemName("")
                      setExtractedInfo(null)
                      setNewItemCategory("")
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleAddItem}
                    disabled={!extractedInfo || !newItemCategory}
                  >
                    추가
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 아이템 수정 모달 */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>아이템 수정</DialogTitle>
              <DialogDescription>아이템 정보를 수정합니다.</DialogDescription>
            </DialogHeader>
            {editingItem && (
              <div className="grid gap-4 py-4">
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    {editingItem.product_image ? (
                      <Image
                        src={editingItem.product_image}
                        alt={editingItem.product_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Badge variant="secondary">
                      {PLATFORM_INFO[editingItem.platform as keyof typeof PLATFORM_INFO]
                        ?.name || editingItem.platform}
                    </Badge>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      {editingItem.url}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-item-name">상품명</Label>
                  <Input
                    id="edit-item-name"
                    value={editItemName}
                    onChange={(e) => setEditItemName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-item-category">카테고리</Label>
                  <Select value={editItemCategory} onValueChange={setEditItemCategory}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: cat.color || "#888" }}
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                취소
              </Button>
              <Button onClick={handleUpdateItem}>저장</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                  borderColor: selectedCategory === cat.id ? undefined : cat.color || undefined,
                  backgroundColor: selectedCategory === cat.id ? cat.color || undefined : undefined,
                }}
              >
                <div
                  className="mr-2 h-2 w-2 rounded-full"
                  style={{
                    backgroundColor:
                      selectedCategory === cat.id ? "white" : cat.color || "#888",
                  }}
                />
                {cat.name} ({getCategoryItemCount(cat.id)})
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 opacity-0 transition-opacity hover:bg-destructive/20 group-hover:opacity-100">
                    <IconX className="h-3 w-3" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>카테고리 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      &apos;{cat.name}&apos; 카테고리를 삭제하시겠습니까? 이 카테고리에
                      속한 모든 아이템도 함께 삭제됩니다.
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
              const category = categories.find((c) => c.id === item.category_id)
              const isCrawling = crawlingItemId === item.id
              return (
                <Card key={item.id} className="group overflow-hidden">
                  <div className="relative aspect-square bg-muted">
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                    <div className="absolute left-2 top-2">
                      <Badge
                        style={{ backgroundColor: category?.color || "#888" }}
                        className="text-white"
                      >
                        {category?.name || "미분류"}
                      </Badge>
                    </div>
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => handleCrawl(item.id)}
                        disabled={isCrawling}
                      >
                        {isCrawling ? (
                          <IconLoader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <IconRefresh className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8"
                        onClick={() => handleOpenEditModal(item)}
                      >
                        <IconPencil className="h-4 w-4" />
                      </Button>
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
                          <Button size="icon" variant="destructive" className="h-8 w-8">
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>아이템 삭제</AlertDialogTitle>
                            <AlertDialogDescription>
                              이 아이템을 삭제하시겠습니까? 수집된 리뷰 데이터도 함께
                              삭제됩니다.
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
                      {item.product_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {PLATFORM_INFO[item.platform as keyof typeof PLATFORM_INFO]?.name ||
                          item.platform}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <IconStar className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{item.avg_rating || "-"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconMessage className="h-4 w-4" />
                        <span>{(item.review_count || 0).toLocaleString()}건</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-4 py-2 text-xs text-muted-foreground">
                    {item.last_crawled_at ? (
                      <>마지막 수집: {new Date(item.last_crawled_at).toLocaleDateString()}</>
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
