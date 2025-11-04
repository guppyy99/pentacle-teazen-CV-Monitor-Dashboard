# 🌟 Pentacle Dashboard

Pentacle 프로젝트를 위한 관리 대시보드 웹 애플리케이션

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

---

## 📋 목차

- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [시작하기](#시작하기)
- [문서](#문서)
- [프로젝트 구조](#프로젝트-구조)
- [기술 스택](#기술-스택)

---

## 🎯 프로젝트 소개

Pentacle Dashboard는 팀 협업과 프로젝트 관리를 위한 모던 웹 대시보드입니다.

### 특징
- ✨ 모던하고 깔끔한 UI/UX
- 📱 완벽한 반응형 디자인 (모바일/태블릿/데스크톱)
- 🎨 다크모드 지원
- 📊 인터랙티브 차트 및 데이터 시각화
- 🔍 강력한 데이터 테이블 기능 (정렬, 필터링, 페이지네이션)
- 🚀 빠른 성능 (Next.js 14)
- ♿ 접근성 준수

---

## 🚀 주요 기능

### 1. 대시보드
- 4가지 핵심 지표 카드 (수익, 고객, 계정, 성장률)
- 실시간 트렌드 표시 (상승/하락)
- 반응형 그리드 레이아웃

### 2. 데이터 분석
- 인터랙티브 면적 차트
- 기간 필터 (7일/30일/3개월)
- 데스크톱/모바일 데이터 비교

### 3. 프로젝트 관리
- 드래그 앤 드롭으로 순서 변경
- 다중 선택 및 일괄 작업
- 상태 관리 (완료/진행 중)
- 검토자 할당

### 4. 네비게이션
- 접을 수 있는 사이드바
- 계층적 메뉴 구조
- 빠른 검색 및 설정

---

## 🏁 시작하기

### 필수 요구사항
- Node.js 18+ 
- pnpm (또는 npm)

### 설치 및 실행

#### 방법 1: 퀵 스타트 스크립트
```bash
# 실행 권한이 있다면
./start.sh

# 또는 Finder에서
start.command 더블클릭
```

#### 방법 2: 수동 실행
```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드
```bash
# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

---

## 📚 문서

프로젝트를 수정하기 위한 상세 문서를 제공합니다:

### 📖 [EDITING_GUIDE.md](./EDITING_GUIDE.md)
**개발 지식 없이** 대시보드 내용을 수정하는 방법
- 사이드바 메뉴 변경
- 대시보드 카드 값 수정
- 테이블 데이터 편집
- 사용자 정보 변경

👉 **초보자 추천**: 이 문서부터 읽어보세요!

### 📖 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
프로젝트 전체 구조 및 상세 설명
- 모든 컴포넌트 구조
- 파일 위치 및 역할
- 아이콘 매핑
- 반응형 브레이크포인트

👉 **전체 이해**: 프로젝트 구조를 파악하고 싶다면

---

## 📁 프로젝트 구조

```
/Teazen-Dashboard/
│
├── 📄 문서 (수정 가이드)
│   ├── README.md                  ← 이 파일
│   ├── EDITING_GUIDE.md          ← 수정 가이드 (추천)
│   └── PROJECT_STRUCTURE.md      ← 프로젝트 구조
│
├── ⚙️ 설정 파일 (JSON - 쉽게 수정)
│   └── config/
│       ├── sidebar-menu.json      ← 메뉴 설정
│       └── dashboard-cards.json   ← 카드 설정
│
├── 🎨 앱 소스
│   ├── app/                       ← Next.js 페이지
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── data.json          ← 테이블 데이터
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── icon.svg               ← 파비콘
│   │   └── apple-icon.svg
│   │
│   ├── components/                ← React 컴포넌트
│   │   ├── app-sidebar.tsx        ← 사이드바
│   │   ├── section-cards.tsx      ← 대시보드 카드
│   │   ├── chart-area-interactive.tsx  ← 차트
│   │   ├── data-table.tsx         ← 데이터 테이블
│   │   ├── site-header.tsx
│   │   └── ui/                    ← UI 컴포넌트
│   │
│   ├── hooks/                     ← React Hooks
│   ├── lib/                       ← 유틸리티
│   └── styles/                    ← 스타일
│
├── 🖼️ 에셋
│   └── public/
│       ├── pentacle-with-name.svg ← 로고 (텍스트)
│       └── 펜타클-아이콘.svg       ← 아이콘만
│
├── 🔧 설정
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.mjs
│
└── 🚀 실행 스크립트
    ├── start.sh
    └── start.command
```

---

## 🛠️ 기술 스택

### 프론트엔드
- **Next.js 14** - React 프레임워크
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Tailwind CSS** - 유틸리티 CSS
- **shadcn/ui** - UI 컴포넌트 라이브러리

### 데이터 시각화
- **Recharts** - 차트 라이브러리
- **TanStack Table** - 강력한 테이블

### 아이콘 & UI
- **Tabler Icons** - 아이콘 세트
- **Radix UI** - 무장애 UI 기반

### 개발 도구
- **ESLint** - 코드 품질
- **PostCSS** - CSS 처리
- **pnpm** - 패키지 매니저

---

## 🎨 디자인 시스템

### 컬러
- Primary: 검정/흰색 기반 모노톤
- Accent: 브랜드 컬러
- Success: 녹색
- Destructive: 빨강

### 타이포그래피
- **폰트**: Pretendard Variable
- **크기**: 반응형 (text-sm ~ text-3xl)

### 간격
- 기본 spacing: 4의 배수 (4px, 8px, 16px, 24px, 32px)
- Container: 반응형 padding

---

## 📱 반응형 디자인

| 디바이스 | 브레이크포인트 | 레이아웃 |
|----------|----------------|----------|
| 모바일 | < 640px | 1열 |
| 태블릿 | 640px ~ 1024px | 2열 |
| 데스크톱 | ≥ 1024px | 4열 |

### 주요 반응형 기능
- ✅ 사이드바: 모바일에서 오버레이
- ✅ 카드 그리드: 1열 → 2열 → 4열
- ✅ 테이블: 가로 스크롤
- ✅ 차트: 자동 크기 조정

---

## 🔒 보안

- XSS 방지
- CSRF 토큰 (프로덕션)
- 환경 변수 관리

---

## 🚀 배포

### Vercel (권장)
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### 다른 플랫폼
- Docker 지원
- 정적 내보내기 가능 (`next export`)

---

## 📝 라이선스

이 프로젝트는 Pentacle을 위한 맞춤 개발 프로젝트입니다.

---

## 👥 팀

**개발**: Cursor AI + dynk  
**디자인**: shadcn/ui 기반  
**날짜**: 2025년 11월 4일

---

## 📞 지원

문제가 발생하거나 질문이 있으면:
1. [EDITING_GUIDE.md](./EDITING_GUIDE.md)의 FAQ 확인
2. [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) 참조
3. 개발팀에 문의

---

## 🎉 감사합니다!

Pentacle Dashboard를 사용해 주셔서 감사합니다.

