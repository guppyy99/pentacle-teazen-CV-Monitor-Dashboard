# 오픈마켓 리뷰 모니터링 대시보드 - 구현 계획

> **상태**: Phase 1-4 프론트엔드 완료 (2024-12-21)

## 📋 프로젝트 개요

**목적**: 오픈마켓 상품 리뷰 크롤링 + 데이터 시각화 서비스
**제거**: 유튜브, 인스타그램, 키워드 모니터링 등 불필요한 기능

---

## 🏗️ 새로운 페이지 구조

```
/                        → 홈 (대시보드 요약)
/items                   → 아이템 관리 페이지
/categories              → 카테고리별 데이터 조회
/reviews                 → 아이템별 리뷰 조회
/login                   → 로그인 (유지)
/admin                   → 관리자 (유지)
```

---

## 📄 Phase 1: 기존 코드 정리 ✅ 완료

### 삭제한 파일/폴더
- [x] `/app/brand-reputation/` - 키워드 분석 페이지
- [x] `/app/content-reputation/` - 콘텐츠 분석 페이지 (유튜브/인스타)
- [x] `/app/data/crawled/` - 기존 크롤링 데이터 페이지
- [x] `/app/product-review/` - 기존 리뷰 분석 페이지
- [x] `/app/reports/` - 리포트 페이지
- [x] `/components/brand-product-selector.tsx` - 기존 제품 선택기
- [x] `/components/mention-trend-chart.tsx` - 언급 트렌드 차트
- [x] `/components/sentiment-wordcloud.tsx` - 기존 워드클라우드

### 수정한 파일
- [x] `/components/app-sidebar.tsx` - 새 메뉴 구조로 변경
- [x] `/config/sidebar-menu.json` - 새 메뉴 설정
- [x] `/app/dashboard/page.tsx` - 새 홈 대시보드

---

## 📄 Phase 2: 아이템 관리 페이지 (`/app/items/page.tsx`) ✅ 완료

### 기능
1. **상품 링크 등록**
   - URL 입력 → 크롤링 API 호출
   - 자동 추출: 상품명, 이미지, 플랫폼(스마트스토어/쿠팡/11번가 등)
   - 대카테고리 선택/생성

2. **대카테고리 관리**
   - 카테고리 추가/수정/삭제 (콤부차, 애사비, 브이핏 등)
   - 색상 지정 가능

3. **아이템 목록**
   - 카드 형태로 표시 (이미지 + 상품명 + 플랫폼 + 카테고리)
   - 아이템 삭제, 카테고리 변경
   - 마지막 크롤링 일시 표시

### 데이터 구조
```typescript
interface Category {
  id: string
  name: string           // "콤부차", "애사비"
  color: string          // "#FF6B6B"
  itemCount: number
}

interface Item {
  id: string
  url: string            // 원본 링크
  platform: string       // "smartstore" | "coupang" | "11st" | "gmarket"
  productName: string    // 자동 추출
  productImage: string   // 자동 추출
  categoryId: string     // 소속 카테고리
  lastCrawledAt: Date
  reviewCount: number
  avgRating: number
  createdAt: Date
}
```

### UI 컴포넌트
- [ ] `ItemCard` - 아이템 카드 (이미지, 정보)
- [ ] `CategoryBadge` - 카테고리 뱃지
- [ ] `AddItemModal` - 아이템 추가 모달
- [ ] `CategoryManager` - 카테고리 관리 UI

---

## 📄 Phase 3: 카테고리별 조회 페이지 (`/app/categories/page.tsx`) ✅ 완료

### 기능
1. **카테고리 선택**
   - 단일 선택 또는 다중 선택 (일괄 비교)
   - 체크박스 방식

2. **통계 카드**
   - 평균 별점
   - 총 리뷰 수
   - 긍정/부정 비율 (도넛 차트)

3. **비교 차트**
   - 카테고리별 리뷰 수 막대 차트
   - 카테고리별 평균 별점 비교
   - 리뷰 발생 추이 (날짜별)

4. **AI 요약**
   - 선택한 카테고리의 리뷰 AI 요약
   - GPT API 활용

### UI 컴포넌트
- [ ] `CategorySelector` - 카테고리 다중 선택
- [ ] `StatCard` - 통계 카드
- [ ] `ComparisonChart` - 비교 차트
- [ ] `AISummary` - AI 요약 컴포넌트

---

## 📄 Phase 4: 아이템별 리뷰 조회 페이지 (`/app/reviews/page.tsx`) ✅ 완료

### 기능
1. **아이템 선택**
   - 좌측: 아이템 리스트 (이미지 + 이름)
   - 다중 선택 가능 (최대 4개)
   - 카테고리별 필터링

2. **단일 선택 시**
   - 기본 통계 (별점, 리뷰수, 긍부정)
   - 날짜별 리뷰 발생 차트 (Area Chart)
   - 키워드 워드클라우드 (긍정/부정 탭)
   - 리뷰 로우데이터 테이블 (페이지네이션)
   - AI 리뷰 요약

3. **다중 선택 시 (최대 4개)**
   - 비교 통계 카드
   - 비교 차트 (리뷰수, 별점)
   - 각 아이템별 탭으로 상세 조회 가능
   - 종합 AI 리뷰

### 데이터 구조
```typescript
interface Review {
  id: string
  itemId: string
  rating: number         // 1-5
  content: string
  author: string
  date: Date
  sentiment: "positive" | "negative" | "neutral"
  keywords: string[]     // GPT 추출
}

interface ReviewStats {
  itemId: string
  totalReviews: number
  avgRating: number
  positiveRate: number
  negativeRate: number
  neutralRate: number
  dailyReviews: { date: string; count: number }[]
  topKeywords: { word: string; count: number; sentiment: string }[]
}
```

### UI 컴포넌트
- [ ] `ItemSelector` - 아이템 다중 선택 (이미지 포함)
- [ ] `ReviewStatsCard` - 리뷰 통계 카드
- [ ] `ReviewTrendChart` - 리뷰 추이 차트
- [ ] `KeywordCloud` - 워드클라우드 (긍정/부정 탭)
- [ ] `ReviewTable` - 리뷰 로우데이터 테이블
- [ ] `CompareView` - 다중 비교 뷰
- [ ] `AIReviewSummary` - AI 리뷰 요약

---

## 📄 Phase 5: API 구조

### 프론트엔드 API Routes (Next.js)
```
POST /api/items              → 아이템 등록
GET  /api/items              → 아이템 목록
DELETE /api/items/:id        → 아이템 삭제
PATCH /api/items/:id         → 아이템 수정

POST /api/categories         → 카테고리 생성
GET  /api/categories         → 카테고리 목록
DELETE /api/categories/:id   → 카테고리 삭제
PATCH /api/categories/:id    → 카테고리 수정

GET  /api/reviews            → 리뷰 데이터 조회 (아이템ID 필터)
GET  /api/reviews/stats      → 리뷰 통계
POST /api/reviews/ai-summary → AI 요약 생성
```

### 외부 크롤링 API (App Runner)
```
POST /crawl/extract          → URL에서 상품정보 추출 (이름, 이미지)
POST /crawl/reviews          → 리뷰 크롤링 실행
GET  /crawl/status/:jobId    → 크롤링 상태 확인
```

---

## 📄 Phase 6: 홈 대시보드 수정 (`/app/page.tsx`)

### 표시 내용
- 전체 등록 아이템 수
- 전체 수집된 리뷰 수
- 카테고리별 요약 카드
- 최근 리뷰 활동 차트
- 빠른 액션 버튼 (아이템 추가, 리뷰 조회)

---

## 🔧 기술 스택

### 프론트엔드 (현재 유지)
- Next.js 14 + React 19 + TypeScript
- Tailwind CSS + Radix UI
- Recharts (차트)
- TanStack Table (테이블)

### 추가 필요
- **워드클라우드**: `react-wordcloud` 또는 `d3-cloud`
- **상태관리**: Zustand 또는 React Context (아이템/카테고리 상태)

### 외부 서비스
- **크롤링 API**: AWS App Runner (Python FastAPI + Playwright)
- **AI 분석**: OpenAI GPT API
- **DB**: Supabase 또는 MongoDB Atlas

---

## 📅 구현 순서

### Step 1: 기존 코드 정리
1. 불필요한 페이지/컴포넌트 삭제
2. 사이드바 메뉴 업데이트
3. 기본 라우팅 설정

### Step 2: 데이터 구조 및 목업
1. 타입 정의 (`/types/index.ts`)
2. 목업 데이터 생성
3. Context/Store 설정

### Step 3: 아이템 관리 페이지
1. 아이템 목록 UI
2. 아이템 추가 모달
3. 카테고리 관리

### Step 4: 카테고리별 조회 페이지
1. 카테고리 선택 UI
2. 통계 카드
3. 비교 차트

### Step 5: 리뷰 조회 페이지
1. 아이템 선택 UI
2. 단일 조회 뷰
3. 다중 비교 뷰
4. 워드클라우드

### Step 6: API 연동 준비
1. API Routes 스켈레톤
2. 크롤링 API 인터페이스 정의

---

## ❓ 확인 필요 사항

1. **DB 선택**: Supabase vs MongoDB vs 로컬 JSON (프로토타입)?
2. **크롤링 API**: 별도 레포로 분리? 이 프로젝트 내 구현?
3. **인증**: 현재 로그인 시스템 유지?
4. **AI 요약**: OpenAI API 키 직접 사용? 프록시?

---

이 계획대로 진행할까요?
