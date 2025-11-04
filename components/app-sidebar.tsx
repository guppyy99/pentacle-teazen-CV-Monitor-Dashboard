"use client"

import { useEffect, useState } from "react"
import type * as React from "react"
import Image from "next/image"
import {
  IconCamera,
  IconChartBar,
  IconChartLine,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconShoppingCart,
  IconVideo,
  IconTags,
  IconHome,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
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
const iconMap: any = {
  IconDashboard,
  IconListDetails,
  IconChartBar,
  IconChartLine,
  IconFolder,
  IconUsers,
  IconCamera,
  IconFileDescription,
  IconFileAi,
  IconSettings,
  IconHelp,
  IconSearch,
  IconDatabase,
  IconReport,
  IconFileWord,
  IconShoppingCart,
  IconVideo,
  IconTags,
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
      title: "키워드 분석",
      url: "/brand-reputation",
      icon: "IconChartLine",
    },
    {
      title: "리뷰 분석",
      url: "/product-review",
      icon: "IconShoppingCart",
    },
    {
      title: "콘텐츠 분석",
      url: "/content-reputation",
      icon: "IconVideo",
    },
  ],
  navClouds: [
    {
      title: "모니터링 프로젝트",
      icon: "IconFolder",
      isActive: true,
      url: "#",
      items: [
        {
          title: "티젠 콤부차",
          url: "/project/teazen",
        },
        {
          title: "경쟁사 분석",
          url: "/project/competitor",
        },
      ],
    },
    {
      title: "저장된 리포트",
      icon: "IconReport",
      url: "#",
      items: [
        {
          title: "최근 리포트",
          url: "/reports/recent",
        },
        {
          title: "보관됨",
          url: "/reports/archived",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "설정",
      url: "#",
      icon: "IconSettings",
    },
    {
      title: "도움말",
      url: "#",
      icon: "IconHelp",
    },
    {
      title: "검색",
      url: "#",
      icon: "IconSearch",
    },
  ],
  documents: [
    {
      name: "크롤링 데이터",
      url: "/data/crawled",
      icon: "IconDatabase",
    },
    {
      name: "분석 리포트",
      url: "/reports",
      icon: "IconReport",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [data, setData] = useState(defaultData)

  useEffect(() => {
    // 기본값으로 먼저 표시하고, 백그라운드에서 데이터 로드
    fetch("/api/config/sidebar")
      .then((res) => res.json())
      .then((config) => {
        setData(config)
      })
      .catch(() => {
        // 에러 시 기본값 유지 (이미 defaultData로 시작)
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
  const documentsWithIcons = convertIconsToComponents(data.documents)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-2">
              <a href="#" className="flex items-center gap-2">
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
        <NavDocuments items={documentsWithIcons} />
        <NavSecondary items={navSecondaryWithIcons} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
