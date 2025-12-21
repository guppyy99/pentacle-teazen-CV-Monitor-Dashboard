# Crawler API

리뷰 크롤링 API 서버

## Setup

```bash
cd crawler-api
npm install
```

## Run

```bash
# Development
npm run dev

# Production
npm start
```

## Endpoints

### POST /crawl/reviews

리뷰 크롤링

```json
// Request
{
  "url": "https://smartstore.naver.com/...",
  "platform": "naver",
  "itemId": "item-123",
  "maxPages": 100
}

// Response
[
  {
    "author": "구매자",
    "rating": 5,
    "content": "좋아요!",
    "date": "2024-12-20",
    "images": [],
    "platform": "naver"
  }
]
```

### POST /extract/metadata

상품 메타데이터 추출

```json
// Request
{
  "url": "https://smartstore.naver.com/..."
}

// Response
{
  "platform": "naver",
  "name": "상품명",
  "image": "https://...",
  "price": 15900
}
```

## 지원 플랫폼

- [x] 네이버 스마트스토어
- [ ] 쿠팡 (TODO)
- [ ] 11번가 (TODO)
- [ ] G마켓 (TODO)

## TODO

- [ ] 쿠팡 크롤러 구현 (Python 브릿지)
- [ ] 에러 핸들링 강화
- [ ] Rate limiting
- [ ] 캐싱
