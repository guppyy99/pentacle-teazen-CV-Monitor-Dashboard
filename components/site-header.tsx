"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { IconLogout, IconSettings } from "@tabler/icons-react"
import { toast } from "sonner"

export function SiteHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      toast.success("로그아웃되었습니다")
      router.push("/login")
    } catch (error) {
      toast.error("로그아웃 중 오류가 발생했습니다")
    }
  }

  return (
    <header className="flex h-[--header-height] shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-[--header-height]">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">Brand Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/admin")}
            className="hidden sm:flex"
          >
            <IconSettings className="mr-2 size-4" />
            관리자
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
          >
            <IconLogout className="mr-2 size-4" />
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  )
}
