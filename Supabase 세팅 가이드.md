# Supabase 세팅 가이드

> CV Monitor Dashboard를 위한 Supabase 데이터베이스 설정 가이드

## 목차
1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [데이터베이스 스키마 생성 (SQL)](#2-데이터베이스-스키마-생성-sql)
3. [환경변수 설정](#3-환경변수-설정)
4. [Row Level Security (RLS) 설정](#4-row-level-security-rls-설정)
5. [인덱스 및 성능 최적화](#5-인덱스-및-성능-최적화)
6. [타입 자동 생성](#6-타입-자동-생성)
7. [프론트엔드/백엔드 연동](#7-프론트엔드백엔드-연동)
8. [마이그레이션 전략](#8-마이그레이션-전략)

---

## 1. Supabase 프로젝트 생성

### 1.1 계정 생성
1. [https://supabase.com](https://supabase.com) 접속
2. **Start your project** 클릭
3. GitHub 계정으로 로그인

### 1.2 새 프로젝트 생성
1. **New Project** 클릭
2. 프로젝트 정보 입력:
   - **Name**: `cv-monitor-dashboard`
   - **Database Password**: 강력한 비밀번호 설정 (저장 필수!)
   - **Region**: `Northeast Asia (Seoul)` 권장
   - **Pricing Plan**: Free tier로 시작 가능

3. 프로젝트 생성 완료까지 약 2분 대기

---

## 2. 데이터베이스 스키마 생성 (SQL)

Supabase Dashboard → **SQL Editor** → **New query**에서 실행

### 2.1 테이블 생성

```sql
-- ============================================================
-- 1. Categories 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20) DEFAULT '#4ECDC4',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE categories IS '상품 카테고리';
COMMENT ON COLUMN categories.name IS '카테고리 이름';
COMMENT ON COLUMN categories.color IS '대시보드 표시 색상 (HEX)';

-- ============================================================
-- 2. Items 테이블 (모니터링 대상 상품)
-- ============================================================
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  platform VARCHAR(50) NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  price INTEGER,
  last_crawled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- URL 중복 방지
  CONSTRAINT items_url_unique UNIQUE (url)
);

COMMENT ON TABLE items IS '모니터링 대상 상품';
COMMENT ON COLUMN items.platform IS '플랫폼 (naver_smartstore, naver_brandstore 등)';
COMMENT ON COLUMN items.last_crawled_at IS '마지막 크롤링 시간';

-- ============================================================
-- 3. Reviews 테이블
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  author VARCHAR(100),
  rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  images TEXT[],
  date DATE,
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  keywords TEXT[],
  crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 중복 리뷰 방지 (같은 상품, 작성자, 날짜, 내용)
  CONSTRAINT reviews_unique UNIQUE (item_id, author, date, content)
);

COMMENT ON TABLE reviews IS '크롤링된 리뷰';
COMMENT ON COLUMN reviews.sentiment IS 'AI 분석 감정 (positive/negative/neutral)';
COMMENT ON COLUMN reviews.keywords IS 'AI 추출 키워드';

-- ============================================================
-- 4. Review Analysis 테이블 (AI 분석 결과 캐싱)
-- ============================================================
CREATE TABLE IF NOT EXISTS review_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  analysis_type VARCHAR(50) NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 상품별 분석 타입당 하나만
  CONSTRAINT analysis_unique UNIQUE (item_id, analysis_type)
);

COMMENT ON TABLE review_analysis IS 'AI 분석 결과 캐싱';
COMMENT ON COLUMN review_analysis.analysis_type IS '분석 유형 (insights, summary 등)';
COMMENT ON COLUMN review_analysis.result IS '분석 결과 JSON';
```

### 2.2 인덱스 생성

```sql
-- ============================================================
-- 성능 최적화를 위한 인덱스
-- ============================================================

-- Reviews: 상품별 리뷰 조회 최적화
CREATE INDEX IF NOT EXISTS idx_reviews_item_id ON reviews(item_id);

-- Reviews: 날짜별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(date DESC);

-- Reviews: 감정별 필터링 최적화
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON reviews(sentiment);

-- Reviews: 복합 인덱스 (상품 + 날짜)
CREATE INDEX IF NOT EXISTS idx_reviews_item_date ON reviews(item_id, date DESC);

-- Items: 카테고리별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);

-- Items: 플랫폼별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_items_platform ON items(platform);

-- Review Analysis: 상품별 분석 조회
CREATE INDEX IF NOT EXISTS idx_analysis_item_id ON review_analysis(item_id);
```

---

## 3. 환경변수 설정

### 3.1 API 키 확인
Supabase Dashboard → **Settings** → **API**

필요한 값:
- **Project URL**: `https://[project-id].supabase.co`
- **anon/public key**: 프론트엔드용 (공개 가능)
- **service_role key**: 백엔드용 (절대 노출 금지!)

### 3.2 .env.local 설정

```bash
# .env.local

# ============================================================
# Supabase 설정
# ============================================================

# Project URL (공개 가능)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijkl.supabase.co

# Anon Key - 프론트엔드용 (공개 가능하지만 RLS로 보호됨)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key - 백엔드 전용 (절대 노출 금지!)
# API Routes에서 사용, RLS 우회 가능
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================
# OpenAI (AI 분석용)
# ============================================================
OPENAI_API_KEY=sk-...

# ============================================================
# Crawler API
# ============================================================
CRAWLER_API_URL=http://localhost:3001

# ============================================================
# 개발 모드 (로컬 JSON DB 사용)
# ============================================================
# USE_MOCK_DATA=true  # Supabase 대신 로컬 DB 사용시 활성화
```

---

## 4. Row Level Security (RLS) 설정

> RLS는 데이터베이스 수준에서 접근 제어를 제공합니다.

### 4.1 기본 RLS 정책 (공개 읽기)

```sql
-- ============================================================
-- RLS 활성화
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_analysis ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 공개 읽기 정책 (누구나 읽기 가능)
-- ============================================================
CREATE POLICY "Public read access" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON items
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Public read access" ON review_analysis
  FOR SELECT USING (true);

-- ============================================================
-- 서비스 역할만 쓰기 가능 (API Routes에서만 가능)
-- ============================================================
-- service_role은 RLS를 우회하므로 별도 정책 불필요
```

### 4.2 인증 기반 RLS (선택사항)

나중에 사용자 인증을 추가할 경우:

```sql
-- 인증된 사용자만 쓰기 가능
CREATE POLICY "Authenticated insert" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated update" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated delete" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');
```

---

## 5. 인덱스 및 성능 최적화

### 5.1 대용량 데이터 최적화

```sql
-- 파티셔닝 (선택사항 - 리뷰가 100만건 이상일 때)
-- 월별 파티셔닝 예시
CREATE TABLE reviews_partitioned (
  LIKE reviews INCLUDING ALL
) PARTITION BY RANGE (date);

-- 2024년 월별 파티션 생성
CREATE TABLE reviews_2024_01 PARTITION OF reviews_partitioned
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE reviews_2024_02 PARTITION OF reviews_partitioned
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... 계속
```

### 5.2 통계 뷰 생성

```sql
-- 상품별 리뷰 통계 뷰
CREATE OR REPLACE VIEW item_stats AS
SELECT
  i.id,
  i.product_name,
  i.platform,
  COUNT(r.id) as review_count,
  ROUND(AVG(r.rating), 1) as avg_rating,
  COUNT(CASE WHEN r.sentiment = 'positive' THEN 1 END) as positive_count,
  COUNT(CASE WHEN r.sentiment = 'negative' THEN 1 END) as negative_count,
  COUNT(CASE WHEN r.sentiment = 'neutral' THEN 1 END) as neutral_count,
  ROUND(
    COUNT(CASE WHEN r.sentiment = 'positive' THEN 1 END)::NUMERIC /
    NULLIF(COUNT(r.id), 0) * 100, 1
  ) as positive_rate
FROM items i
LEFT JOIN reviews r ON i.id = r.item_id
GROUP BY i.id, i.product_name, i.platform;
```

---

## 6. 타입 자동 생성

### 6.1 Supabase CLI 설치

```bash
# npm
npm install supabase --save-dev

# pnpm
pnpm add -D supabase
```

### 6.2 타입 생성 스크립트 추가

`package.json`:
```json
{
  "scripts": {
    "db:types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts"
  }
}
```

### 6.3 타입 생성 실행

```bash
# Supabase 로그인
npx supabase login

# 타입 생성
pnpm db:types
```

---

## 7. 프론트엔드/백엔드 연동

### 7.1 클라이언트 사용법 (프론트엔드)

```typescript
// lib/supabase.ts에서 이미 설정됨
import { supabase } from "@/lib/supabase"

// 사용 예시 (Client Component)
async function fetchCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name")

  if (error) throw error
  return data
}
```

### 7.2 서버 클라이언트 사용법 (API Routes)

```typescript
// app/api/example/route.ts
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  const supabase = createServerClient()

  if (!supabase) {
    return Response.json({ error: "DB not configured" }, { status: 503 })
  }

  const { data, error } = await supabase
    .from("items")
    .select(`
      *,
      categories (*),
      reviews (count)
    `)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json(data)
}
```

### 7.3 Realtime 구독 (선택사항)

```typescript
// 실시간 리뷰 업데이트 구독
useEffect(() => {
  const channel = supabase
    .channel("reviews-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reviews" },
      (payload) => {
        console.log("Review changed:", payload)
        // 상태 업데이트
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

---

## 8. 마이그레이션 전략

### 8.1 로컬 DB → Supabase 마이그레이션

로컬 JSON 데이터를 Supabase로 이전:

```typescript
// scripts/migrate-to-supabase.ts
import { readFileSync } from "fs"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function migrate() {
  const localData = JSON.parse(readFileSync(".data/db.json", "utf-8"))

  // 1. Categories 마이그레이션
  if (localData.categories.length > 0) {
    const { error: catError } = await supabase
      .from("categories")
      .upsert(localData.categories, { onConflict: "id" })

    if (catError) console.error("Categories error:", catError)
    else console.log(`✓ ${localData.categories.length} categories migrated`)
  }

  // 2. Items 마이그레이션
  if (localData.items.length > 0) {
    const items = localData.items.map(({ categories, ...item }) => item)
    const { error: itemError } = await supabase
      .from("items")
      .upsert(items, { onConflict: "id" })

    if (itemError) console.error("Items error:", itemError)
    else console.log(`✓ ${items.length} items migrated`)
  }

  // 3. Reviews 마이그레이션 (배치 처리)
  if (localData.reviews.length > 0) {
    const reviews = localData.reviews.map(({ items, ...review }) => review)
    const batchSize = 500

    for (let i = 0; i < reviews.length; i += batchSize) {
      const batch = reviews.slice(i, i + batchSize)
      const { error } = await supabase
        .from("reviews")
        .upsert(batch, { onConflict: "id" })

      if (error) console.error(`Reviews batch ${i / batchSize} error:`, error)
      else console.log(`✓ Reviews batch ${i / batchSize + 1} migrated`)
    }
  }

  console.log("Migration complete!")
}

migrate().catch(console.error)
```

실행:
```bash
npx tsx scripts/migrate-to-supabase.ts
```

### 8.2 환경별 분기

프로젝트는 이미 자동 분기를 지원합니다:

```typescript
// lib/supabase.ts
export const useLocalDB =
  process.env.USE_MOCK_DATA === "true" || !isSupabaseConfigured

// API Routes에서 자동 분기
if (useLocalDB) {
  // 로컬 JSON DB 사용
  const data = await localDB.items.getAll()
} else {
  // Supabase 사용
  const { data } = await supabase.from("items").select("*")
}
```

---

## 체크리스트

### Supabase 설정 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] SQL로 테이블 생성 완료
- [ ] 인덱스 생성 완료
- [ ] RLS 정책 설정 완료
- [ ] `.env.local`에 API 키 설정
- [ ] `USE_MOCK_DATA` 주석 처리 또는 삭제
- [ ] 로컬 데이터 마이그레이션 (필요시)
- [ ] 연동 테스트 완료

### 환경변수 확인

```bash
# 설정 확인 (터미널에서)
echo $NEXT_PUBLIC_SUPABASE_URL
# 출력: https://xxx.supabase.co

# 앱에서 확인
# 브라우저 콘솔에서
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

---

## 트러블슈팅

### Q: "Database not configured" 에러

**원인**: 환경변수가 설정되지 않음

**해결**:
1. `.env.local` 파일 확인
2. 서버 재시작: `pnpm dev`

### Q: RLS 정책으로 데이터 접근 불가

**원인**: anon key로는 쓰기 권한 없음

**해결**:
1. API Routes에서 `createServerClient()` 사용 (service_role key)
2. 또는 RLS 정책에 쓰기 권한 추가

### Q: 타입 에러 발생

**원인**: 스키마 변경 후 타입 미갱신

**해결**:
```bash
pnpm db:types
```

---

## 참고 링크

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Next.js + Supabase 가이드](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
