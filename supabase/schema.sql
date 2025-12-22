-- ============================================================
-- Review Crawling Dashboard - Supabase Schema
-- ============================================================
-- Supabase SQL Editor에서 실행하세요.

-- 1. 카테고리 테이블
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#4ECDC4',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 아이템 (상품) 테이블
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'naver', -- 'naver', 'coupang' 등
  product_name TEXT,
  product_image TEXT,
  price INTEGER,
  last_crawled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 리뷰 테이블
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  author TEXT NOT NULL DEFAULT 'Unknown',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  date DATE,
  sentiment TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  crawled_at TIMESTAMPTZ DEFAULT NOW(),

  -- 중복 방지를 위한 유니크 제약조건
  CONSTRAINT unique_review UNIQUE (item_id, author, date, content)
);

-- 4. 리뷰 분석 결과 테이블
CREATE TABLE IF NOT EXISTS review_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  analysis_type TEXT NOT NULL, -- 'summary', 'keywords', 'sentiment'
  result JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_reviews_item ON reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(date);
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON reviews(sentiment);
CREATE INDEX IF NOT EXISTS idx_review_analysis_item ON review_analysis(item_id);

-- ============================================================
-- RLS (Row Level Security) 정책
-- ============================================================
-- 기본적으로 모든 테이블에 RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_analysis ENABLE ROW LEVEL SECURITY;

-- anon 사용자에게 읽기/쓰기 권한 부여 (개발용)
-- 프로덕션에서는 인증된 사용자만 허용하도록 수정 필요
CREATE POLICY "Allow all for anon" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON review_analysis FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 샘플 데이터 (선택사항)
-- ============================================================
-- INSERT INTO categories (name, color) VALUES
--   ('콤부차', '#4ECDC4'),
--   ('애사비', '#FF6B6B'),
--   ('브이핏', '#45B7D1');
