import OpenAI from "openai"

const OPENAI_TIMEOUT = 60000 // 60초

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: OPENAI_TIMEOUT,
  maxRetries: 2,
})

// 리뷰 1건 감정 분석 및 태깅
export async function tagReview(review: {
  reviewId: string
  content: string
  rating: number
  createdAt?: string
  source?: string
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `너는 한국어 이커머스 리뷰를 구조화 태깅하는 분석기다.
반드시 JSON 형식으로만 출력하라. 추측 금지.

출력 형식:
{
  "reviewId": "string",
  "sentiment": "positive" | "negative" | "neutral",
  "keywords": ["키워드1", "키워드2", ...],  // 최대 12개
  "aspects": ["배송", "포장", "품질", "가격", "맛/향", "효과/체감", "사용성", "고객응대", "기타"],  // 해당되는 것만
  "issues": ["파손", "누락", "지연", "불량", "오배송", "환불/교환", "과장광고의심", "없음"],  // 해당되는 것만
  "summary_1line": "한 줄 요약"
}`,
        },
        {
          role: "user",
          content: JSON.stringify(review),
        },
      ],
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0].message.content
    if (!content) throw new Error("No response from OpenAI")

    return JSON.parse(content)
  } catch (error) {
    console.error("OpenAI tagReview Error:", error)
    return {
      reviewId: review.reviewId,
      sentiment: "neutral",
      keywords: [],
      aspects: ["기타"],
      issues: ["없음"],
      summary_1line: "",
    }
  }
}

// 여러 리뷰 배치 태깅
export async function tagReviewsBatch(reviews: Array<{
  reviewId: string
  content: string
  rating: number
}>) {
  // 병렬 처리 (최대 5개씩)
  const batchSize = 5
  const results = []

  for (let i = 0; i < reviews.length; i += batchSize) {
    const batch = reviews.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(tagReview))
    results.push(...batchResults)
  }

  return results
}

// 제품/기간 단위 인사이트 생성
export async function generateInsights(params: {
  productName: string
  window: string // e.g. "최근 30일"
  stats: {
    totalReviews: number
    avgRating: number
    positiveRate: number
    negativeRate: number
    topKeywords?: { word: string; count: number; sentiment: string }[]
    aspectCounts?: Record<string, number>
  }
  samples: Array<{
    reviewId: string
    sentiment: string
    content: string
  }>
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        {
          role: "system",
          content: `너는 소비자 보이스(CV) 대시보드 분석가다.
입력된 통계/샘플 범위 내에서만 결론을 내리고, 숫자는 절대 창작하지 마라.
대시보드에 바로 붙일 수 있게 간결하게 작성하라.

출력 형식 (JSON):
{
  "overview": "전체 요약 (2-3문장)",
  "pros": ["긍정 포인트1", ...],  // 최대 5개
  "cons": ["부정 포인트1", ...],  // 최대 5개
  "actions": [
    {
      "title": "액션 제목",
      "detail": "상세 설명",
      "owner_hint": "상품/MD" | "CS" | "물류" | "마케팅" | "기타",
      "priority": "P0" | "P1" | "P2"
    }
  ],  // 최대 6개
  "risks": ["리스크1", ...],  // 최대 4개
  "evidence": [
    { "reviewId": "id", "why_relevant": "이유" }
  ]  // 최대 6개
}`,
        },
        {
          role: "user",
          content: JSON.stringify(params),
        },
      ],
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0].message.content
    if (!content) throw new Error("No response from OpenAI")

    return JSON.parse(content)
  } catch (error) {
    console.error("OpenAI generateInsights Error:", error)
    return {
      overview: "분석 실패",
      pros: [],
      cons: [],
      actions: [],
      risks: [],
      evidence: [],
    }
  }
}

// 키워드 추출
export async function extractKeywords(reviews: Array<{ content: string; sentiment: string }>) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0,
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: `리뷰 목록에서 주요 키워드를 추출하라.
감정별로 분류하여 빈도순으로 정렬하라.

출력 형식 (JSON):
{
  "positive": [{"word": "키워드", "count": 10}, ...],
  "negative": [{"word": "키워드", "count": 5}, ...],
  "neutral": [{"word": "키워드", "count": 3}, ...]
}`,
        },
        {
          role: "user",
          content: JSON.stringify(reviews.slice(0, 50)), // 최대 50개만
        },
      ],
      response_format: { type: "json_object" },
    })

    const content = completion.choices[0].message.content
    if (!content) throw new Error("No response from OpenAI")

    return JSON.parse(content)
  } catch (error) {
    console.error("OpenAI extractKeywords Error:", error)
    return { positive: [], negative: [], neutral: [] }
  }
}
