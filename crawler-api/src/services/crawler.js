const puppeteer = require('puppeteer');

// ============================================================
// 플랫폼별 셀렉터 설정
// ============================================================
const PLATFORM_CONFIG = {
  naver: {
    // Buttons & Layout
    reviewTabSelector: 'a[href*="#REVIEW"]',
    sortLatestSelector: 'a.JBnM4aPJaH', // "최신순" button

    // Review Items
    reviewListSelector: 'ul.RR2FSL9wTc > li, .PxsZltB5tV',

    // Inside Review Item
    authorSelector: '.Db9Dtnf7gY strong.MX91DFZo2F',
    dateSelector: '.Db9Dtnf7gY span.MX91DFZo2F',
    ratingSelector: '.n6zq2yy0KA',
    contentSelector: '.HakaEZ240l',
    imageSelector: '.v9RFkJOz1K img',

    // Pagination
    pageBtnSelector: 'a.hyY6CXtbcn',
    nextBtnSelector: 'a.JY2WGJ4hXh',
  },
  coupang: {
    // TODO: 쿠팡 셀렉터 설정
    reviewTabSelector: '#li-review',
  },
};

// ============================================================
// Crawler Service
// ============================================================
class CrawlerService {
  constructor() {
    this.browser = null;
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  // ============================================================
  // 상품 메타데이터 추출
  // ============================================================
  async extractMetadata(url) {
    await this.init();
    const page = await this.browser.newPage();

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      let data = {
        name: null,
        image: null,
        price: null,
        platform: 'unknown',
      };

      // 네이버 스마트스토어
      if (url.includes('naver.com')) {
        data.platform = 'naver';

        // TODO: 실제 셀렉터로 교체
        data.name = await page.title();

        // 이미지 추출 시도
        try {
          data.image = await page.$eval('meta[property="og:image"]', (el) => el.content);
        } catch (e) {
          // 이미지 없음
        }

        // 가격 추출 시도
        try {
          const priceText = await page.$eval('._1LY7DqCnwR', (el) => el.innerText);
          data.price = parseInt(priceText.replace(/[^0-9]/g, ''));
        } catch (e) {
          // 가격 없음
        }
      }

      // 쿠팡
      else if (url.includes('coupang.com')) {
        data.platform = 'coupang';

        // TODO: 쿠팡 메타데이터 추출 로직
        data.name = await page.title();

        try {
          data.image = await page.$eval('meta[property="og:image"]', (el) => el.content);
        } catch (e) {}
      }

      return data;
    } catch (error) {
      console.error('[ExtractMetadata] Error:', error.message);
      throw error;
    } finally {
      await page.close();
    }
  }

  // ============================================================
  // 리뷰 크롤링
  // ============================================================
  async scrapeReviews(url, maxPages = 500) {
    // 쿠팡은 별도 처리 (Python 등)
    if (url.includes('coupang.com')) {
      console.log('[Crawl] Coupang detected - TODO: implement');
      // TODO: Python 크롤러 연동 또는 별도 로직
      return [];
    }

    // 네이버 스마트스토어
    if (url.includes('naver.com')) {
      return await this.scrapeNaverReviews(url, maxPages);
    }

    console.log('[Crawl] Unsupported platform');
    return [];
  }

  // ============================================================
  // 네이버 리뷰 크롤링
  // ============================================================
  async scrapeNaverReviews(url, maxPages) {
    await this.init();
    const page = await this.browser.newPage();
    const allReviews = [];
    const config = PLATFORM_CONFIG.naver;

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // 리뷰 탭으로 이동
      const targetUrl = url.includes('#REVIEW') ? url : `${url}#REVIEW`;
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(2000);

      // 최신순 정렬
      try {
        const reviewTab = await page.$(config.reviewTabSelector);
        if (reviewTab) {
          await reviewTab.click();
          await delay(1000);
        }

        const sortButtons = await page.$$(config.sortLatestSelector);
        for (const btn of sortButtons) {
          const text = await page.evaluate((el) => el.innerText, btn);
          if (text.includes('최신순')) {
            await btn.click();
            console.log('[Naver] Sorted by latest');
            await delay(1500);
            break;
          }
        }
      } catch (e) {
        console.warn('[Naver] Sort failed:', e.message);
      }

      // 페이지네이션 크롤링
      let currentPage = 1;

      for (let loop = 0; loop < maxPages; loop++) {
        const startPage = currentPage;

        // 10페이지 세트 처리
        for (let i = 0; i < 10; i++) {
          const targetPageNum = startPage + i;

          try {
            const btn = await page.$x(
              `//a[contains(@class, "hyY6CXtbcn") and text()="${targetPageNum}"]`
            );

            if (btn.length > 0) {
              const isCurrent = await page.evaluate(
                (el) => el.getAttribute('aria-current'),
                btn[0]
              );
              if (isCurrent !== 'true') {
                await btn[0].click();
                await delay(1500);
              }

              // 리뷰 추출
              const newReviews = await page.evaluate((config) => {
                const items = document.querySelectorAll(config.reviewListSelector);
                const extracted = [];

                items.forEach((item) => {
                  const content = item.querySelector(config.contentSelector)?.innerText || '';
                  const author = item.querySelector(config.authorSelector)?.innerText || 'Unknown';
                  const dateStr = item.querySelector(config.dateSelector)?.innerText || '';
                  const ratingStr = item.querySelector(config.ratingSelector)?.innerText;
                  const rating = ratingStr ? parseInt(ratingStr.replace(/[^0-9]/g, '')) : 5;

                  // 이미지 추출
                  let images = [];
                  const imgEls = item.querySelectorAll(config.imageSelector);
                  imgEls.forEach((img) => images.push(img.src));

                  if (content) {
                    extracted.push({
                      content: content.trim(),
                      author: author.trim(),
                      rating,
                      date: dateStr.replace(/\.$/, ''),
                      images: images.filter(Boolean),
                      platform: 'naver',
                    });
                  }
                });

                return extracted;
              }, config);

              console.log(`[Naver] Page ${targetPageNum}: ${newReviews.length} reviews`);
              allReviews.push(...newReviews);
              currentPage = targetPageNum + 1;
            } else if (i === 0 && loop > 0) {
              console.log('[Naver] No more pages');
              return allReviews;
            }
          } catch (err) {
            console.error(`[Naver] Error on page ${targetPageNum}:`, err.message);
          }
        }

        // 다음 페이지 세트
        const nextBtns = await page.$x('//a[text()="다음"]');
        let clickedNext = false;

        if (nextBtns.length > 0) {
          for (const btn of nextBtns) {
            const ariaHidden = await page.evaluate((el) => el.getAttribute('aria-hidden'), btn);
            if (ariaHidden === 'false') {
              console.log('[Naver] Clicking next page set');
              await btn.click();
              await delay(3000);
              clickedNext = true;
              break;
            }
          }
          if (!clickedNext) {
            console.log('[Naver] No more page sets');
            break;
          }
        } else {
          console.log('[Naver] End of reviews');
          break;
        }
      }

      return allReviews;
    } catch (error) {
      console.error('[Naver] Scrape error:', error.message);
      return allReviews;
    } finally {
      await page.close();
    }
  }
}

module.exports = new CrawlerService();
