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
      title: "대시보드",
      url: "#",
      icon: "IconDashboard",
    },
    {
      title: "리스트업",
      url: "#",
      icon: "IconListDetails",
    },
    {
      title: "분석",
      url: "#",
      icon: "IconChartBar",
    },
    {
      title: "프로젝트",
      url: "#",
      icon: "IconFolder",
    },
    {
      title: "팀",
      url: "#",
      icon: "IconUsers",
    },
  ],
  navClouds: [
    {
      title: "캡처",
      icon: "IconCamera",
      isActive: true,
      url: "#",
      items: [
        {
          title: "활성 제안서",
          url: "#",
        },
        {
          title: "보관됨",
          url: "#",
        },
      ],
    },
    {
      title: "제안서",
      icon: "IconFileDescription",
      url: "#",
      items: [
        {
          title: "활성 제안서",
          url: "#",
        },
        {
          title: "보관됨",
          url: "#",
        },
      ],
    },
    {
      title: "프롬프트",
      icon: "IconFileAi",
      url: "#",
      items: [
        {
          title: "활성 제안서",
          url: "#",
        },
        {
          title: "보관됨",
          url: "#",
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
      name: "데이터 라이브러리",
      url: "#",
      icon: "IconDatabase",
    },
    {
      name: "보고서",
      url: "#",
      icon: "IconReport",
    },
    {
      name: "문서 도우미",
      url: "#",
      icon: "IconFileWord",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [data, setData] = useState(defaultData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/config/sidebar")
      .then((res) => res.json())
      .then((config) => {
        setData(config)
        setLoading(false)
      })
      .catch(() => {
        setData(defaultData)
        setLoading(false)
      })
  }, [])

  // 아이콘 문자열을 실제 컴포넌트로 변환
  const convertIconsToComponents = (items: any[]) => {
    return items.map((item) => ({
      ...item,
      icon: iconMap[item.icon] || IconDashboard,
    }))
  }

  if (loading) {
    return (
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarContent>
          <div className="p-4 text-center">로딩 중...</div>
        </SidebarContent>
      </Sidebar>
    )
  }

  const navMainWithIcons = convertIconsToComponents(data.navMain)
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
        <NavMain items={navMainWithIcons} />
        <NavDocuments items={documentsWithIcons} />
        <NavSecondary items={navSecondaryWithIcons} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
