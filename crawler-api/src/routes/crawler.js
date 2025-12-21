const express = require('express');
const router = express.Router();
const crawlerService = require('../services/crawler');

/**
 * POST /crawl/reviews
 * 리뷰 크롤링
 *
 * Request Body:
 * {
 *   url: string,        // 상품 URL
 *   platform: string,   // 'naver' | 'coupang' | ...
 *   itemId: string,     // DB 아이템 ID
 *   maxPages?: number   // 최대 페이지 수 (기본: 500)
 * }
 *
 * Response:
 * [
 *   {
 *     author: string,
 *     rating: number,
 *     content: string,
 *     date: string,
 *     sentiment?: string,
 *     images: string[]
 *   }
 * ]
 */
router.post('/crawl/reviews', async (req, res, next) => {
  try {
    const { url, platform, itemId, maxPages } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`[Crawl] Starting review crawl for ${url}`);
    const startTime = Date.now();

    const reviews = await crawlerService.scrapeReviews(url, maxPages || 500);

    console.log(`[Crawl] Completed: ${reviews.length} reviews in ${Date.now() - startTime}ms`);

    res.json(reviews);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /extract/metadata
 * 상품 메타데이터 추출
 *
 * Request Body:
 * {
 *   url: string  // 상품 URL
 * }
 *
 * Response:
 * {
 *   platform: string,
 *   name: string,
 *   image: string,
 *   price: number
 * }
 */
router.post('/extract/metadata', async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`[Extract] Extracting metadata from ${url}`);

    const metadata = await crawlerService.extractMetadata(url);

    res.json(metadata);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
