"use client"

import { useEffect, useState } from "react"
import type * as React from "react"
import Image from "next/image"
import {
  IconCategory,
  IconDashboard,
  IconHelp,
  IconHome,
  IconMessageCircle,
  IconPackage,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavMonitoring } from "@/components/nav-monitoring"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// 아이콘 매핑
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  IconDashboard,
  IconPackage,
  IconCategory,
  IconMessageCircle,
  IconSettings,
  IconHelp,
  IconHome,
}

const defaultData = {
  user: {
    name: "김도윤",
    email: "dynk@mz.co.kr",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "아이템 관리",
      url: "/items",
      icon: "IconPackage",
    },
    {
      title: "카테고리별 조회",
      url: "/categories",
      icon: "IconCategory",
    },
    {
      title: "리뷰 조회",
      url: "/reviews",
      icon: "IconMessageCircle",
    },
  ],
  navSecondary: [
    {
      title: "설정",
      url: "/settings",
      icon: "IconSettings",
    },
    {
      title: "도움말",
      url: "#",
      icon: "IconHelp",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [data, setData] = useState(defaultData)

  useEffect(() => {
    fetch("/api/config/sidebar")
      .then((res) => res.json())
      .then((config) => {
        setData(config)
      })
      .catch(() => {
        // 에러 시 기본값 유지
      })
  }, [])

  // 아이콘 문자열을 실제 컴포넌트로 변환
  const convertIconsToComponents = (items: any[]) => {
    return items.map((item) => ({
      ...item,
      icon: iconMap[item.icon] || IconDashboard,
    }))
  }

  const navMonitoringWithIcons = convertIconsToComponents(data.navMain)
  const navSecondaryWithIcons = convertIconsToComponents(data.navSecondary)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-2">
              <a href="/" className="flex items-center gap-2">
                <Image
                  src="/pentacle-with-name.svg"
                  alt="Pentacle Logo"
                  width={120}
                  height={17}
                  className="h-5 w-auto"
                  priority
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavMonitoring items={navMonitoringWithIcons} />
        <NavSecondary items={navSecondaryWithIcons} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
