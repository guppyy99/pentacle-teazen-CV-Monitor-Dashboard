# Pentacle Dashboard 프로젝트 구조

## 📋 목차
1. [사이드바 메뉴](#사이드바-메뉴)
2. [사용자 정보](#사용자-정보)
3. [대시보드 카드](#대시보드-카드)
4. [데이터 테이블](#데이터-테이블)
5. [차트 설정](#차트-설정)

---

## 🎯 사이드바 메뉴

### 메인 네비게이션 (navMain)
주요 기능 메뉴

| 순서 | 제목 | 아이콘 | URL | 설명 |
|------|------|--------|-----|------|
| 1 | 대시보드 | IconDashboard | # | 메인 대시보드 페이지 |
| 2 | 라이프사이클 | IconListDetails | # | 프로젝트 라이프사이클 관리 |
| 3 | 분석 | IconChartBar | # | 데이터 분석 및 리포트 |
| 4 | 프로젝트 | IconFolder | # | 프로젝트 관리 |
| 5 | 팀 | IconUsers | # | 팀 멤버 관리 |

**수정 위치**: `components/app-sidebar.tsx` → `data.navMain`

---

### 클라우드 메뉴 (navClouds)
확장 가능한 서브메뉴

#### 1. 캡처
- **아이콘**: IconCamera
- **상태**: 활성 (isActive: true)
- **서브메뉴**:
  - 활성 제안서
  - 보관됨

#### 2. 제안서
- **아이콘**: IconFileDescription
- **서브메뉴**:
  - 활성 제안서
  - 보관됨

#### 3. 프롬프트
- **아이콘**: IconFileAi
- **서브메뉴**:
  - 활성 제안서
  - 보관됨

**수정 위치**: `components/app-sidebar.tsx` → `data.navClouds`

---

### 보조 네비게이션 (navSecondary)
사이드바 하단 유틸리티 메뉴

| 제목 | 아이콘 | URL |
|------|--------|-----|
| 설정 | IconSettings | # |
| 도움말 | IconHelp | # |
| 검색 | IconSearch | # |

**수정 위치**: `components/app-sidebar.tsx` → `data.navSecondary`

---

### 문서 메뉴 (documents)
문서 관련 메뉴

| 이름 | 아이콘 | URL |
|------|--------|-----|
| 데이터 라이브러리 | IconDatabase | # |
| 보고서 | IconReport | # |
| 문서 도우미 | IconFileWord | # |

**수정 위치**: `components/app-sidebar.tsx` → `data.documents`

---

## 👤 사용자 정보

현재 로그인한 사용자 정보 (사이드바 하단 표시)

- **이름**: 홍길동
- **이메일**: hong@example.com
- **아바타**: /avatars/shadcn.jpg

**수정 위치**: `components/app-sidebar.tsx` → `data.user`

---

## 📊 대시보드 카드

메인 대시보드 상단에 표시되는 4개의 통계 카드

### 카드 1: 총 수익
- **값**: $1,250.00
- **트렌드**: +12.5% ▲
- **설명**: 이번 달 상승 추세
- **부제**: 최근 6개월 방문자 수

### 카드 2: 신규 고객
- **값**: 1,234
- **트렌드**: -20% ▼
- **설명**: 이번 기간 20% 감소
- **부제**: 고객 확보에 주의 필요

### 카드 3: 활성 계정
- **값**: 45,678
- **트렌드**: +12.5% ▲
- **설명**: 강력한 사용자 유지율
- **부제**: 참여도가 목표 초과

### 카드 4: 성장률
- **값**: 4.5%
- **트렌드**: +4.5% ▲
- **설명**: 꾸준한 성과 향상
- **부제**: 성장 예측 달성

**수정 위치**: `components/section-cards.tsx`

**반응형 레이아웃**:
- 모바일: 1열
- 태블릿(sm): 2열
- 데스크톱(lg): 4열

---

## 📋 데이터 테이블

### 탭 구성

| 탭 이름 | 설명 | 배지 |
|---------|------|------|
| 개요 | 전체 항목 목록 | - |
| 과거 실적 | 과거 프로젝트 실적 | 3 |
| 핵심 인력 | 팀 멤버 정보 | 2 |
| 주요 문서 | 중요 문서 목록 | - |

### 테이블 컬럼

1. **드래그 핸들** - 행 순서 변경
2. **선택** - 체크박스
3. **제목** (header) - 항목 제목 (클릭 시 상세 보기)
4. **섹션 유형** (type) - 문서 타입
5. **상태** (status) - 진행 상태
   - Done (완료)
   - In Process (진행 중)
6. **목표** (target) - 목표 수치 (편집 가능)
7. **제한** (limit) - 제한 수치 (편집 가능)
8. **검토자** (reviewer) - 담당 검토자
9. **액션** - 편집/복사/즐겨찾기/삭제

### 페이지네이션
- 페이지당 행 수: 10, 20, 30, 40, 50
- 기본값: 10개

**데이터 위치**: `app/dashboard/data.json`

---

## 📈 차트 설정

### 총 방문자 차트 (ChartAreaInteractive)

**기간 필터**:
- 최근 7일
- 최근 30일
- 최근 3개월 (기본값)

**데이터 시리즈**:
- 데스크톱 (파란색)
- 모바일 (파란색, 투명도 낮음)

**날짜 범위**: 2024-04-01 ~ 2024-06-30 (총 90일)

**수정 위치**: `components/chart-area-interactive.tsx` → `chartData`

---

## 🎨 아이콘 매핑

현재 사용 중인 Tabler Icons:

| 기능 | 아이콘 컴포넌트 |
|------|----------------|
| 대시보드 | IconDashboard |
| 라이프사이클 | IconListDetails |
| 분석 | IconChartBar |
| 프로젝트 | IconFolder |
| 팀 | IconUsers |
| 캡처 | IconCamera |
| 제안서 | IconFileDescription |
| 프롬프트 | IconFileAi |
| 설정 | IconSettings |
| 도움말 | IconHelp |
| 검색 | IconSearch |
| 데이터베이스 | IconDatabase |
| 보고서 | IconReport |
| 문서 | IconFileWord |
| 상승 | IconTrendingUp |
| 하락 | IconTrendingDown |
| 완료 | IconCircleCheckFilled |
| 로딩 | IconLoader |

**아이콘 변경 시**: `@tabler/icons-react` 패키지에서 원하는 아이콘을 import

---

## 📁 주요 파일 위치

```
/Teazen-Dashboard/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx          # 대시보드 메인 페이지
│   │   └── data.json          # 테이블 데이터
│   ├── layout.tsx             # 전역 레이아웃
│   ├── page.tsx               # 홈 페이지 (리다이렉트)
│   ├── globals.css            # 전역 스타일
│   ├── icon.svg               # 파비콘
│   └── apple-icon.svg         # Apple 아이콘
├── components/
│   ├── app-sidebar.tsx        # 사이드바 (메뉴 데이터 포함)
│   ├── section-cards.tsx      # 대시보드 카드
│   ├── chart-area-interactive.tsx  # 차트
│   ├── data-table.tsx         # 데이터 테이블
│   ├── site-header.tsx        # 헤더
│   └── nav-*.tsx              # 네비게이션 컴포넌트들
├── public/
│   ├── pentacle-with-name.svg # 로고 (텍스트 포함)
│   └── 펜타클-아이콘.svg       # 아이콘만
└── PROJECT_STRUCTURE.md       # 이 문서
```

---

## 🔧 수정 가이드

### 메뉴 항목 추가하기

1. `components/app-sidebar.tsx` 열기
2. 해당 메뉴 배열 찾기 (navMain, navClouds, navSecondary, documents)
3. 새 항목 추가:
```typescript
{
  title: "새 메뉴",
  url: "#",
  icon: IconName,
}
```

### 카드 내용 수정하기

1. `components/section-cards.tsx` 열기
2. 각 `<Card>` 컴포넌트의 내용 수정
3. 값, 트렌드, 설명 텍스트 변경

### 테이블 데이터 수정하기

1. `app/dashboard/data.json` 열기
2. JSON 형식으로 데이터 추가/수정/삭제
3. 필드: id, header, type, status, target, limit, reviewer

### 차트 데이터 수정하기

1. `components/chart-area-interactive.tsx` 열기
2. `chartData` 배열 수정
3. 날짜(date), 데스크톱(desktop), 모바일(mobile) 값 변경

---

## 📱 반응형 브레이크포인트

| 크기 | Tailwind | 최소 너비 |
|------|----------|-----------|
| 모바일 | (기본) | < 640px |
| 태블릿 | sm: | ≥ 640px |
| 데스크톱 | md: | ≥ 768px |
| 대형 데스크톱 | lg: | ≥ 1024px |
| XL | xl: | ≥ 1280px |

---

## 🎨 브랜딩

- **로고**: Pentacle
- **파비콘**: 펜타클 별 아이콘 (5색 그라데이션)
- **컬러**: 기본 모노톤 + Primary 액센트
- **폰트**: Pretendard Variable

---

**작성일**: 2025-11-04  
**프로젝트**: Pentacle Dashboard  
**버전**: 1.0

