import { AppSidebar } from '@/components/app-sidebar'
import { SectionCards } from '@/components/section-cards'
import { SiteHeader } from '@/components/site-header'
import { BrandProductSelector } from '@/components/brand-product-selector'
import { MentionTrendChart } from '@/components/mention-trend-chart'
import { TopContentCards } from '@/components/top-content-cards'
import { ChannelDistribution } from '@/components/channel-distribution'
import { SentimentWordCloud } from '@/components/sentiment-wordcloud'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'

export default function Page() {
  return (
    <SidebarProvider
      className="h-full"
      style={
        {
          "--sidebar-width": "280px",
          "--header-height": "60px",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="flex flex-col h-full">
        <SiteHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="@container/main h-full">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 lg:gap-8 lg:p-8">
              {/* 브랜드/제품 선택 */}
              <BrandProductSelector />
              
              {/* 주요 지표 카드 */}
              <SectionCards />
              
              {/* 언급량 추이 차트 */}
              <MentionTrendChart />
              
              {/* Top 콘텐츠와 채널 분포 */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <TopContentCards />
                <ChannelDistribution />
              </div>
              
              {/* 워드클라우드 */}
              <SentimentWordCloud />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
