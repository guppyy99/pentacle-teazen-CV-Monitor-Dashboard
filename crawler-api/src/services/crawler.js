const puppeteer = require('puppeteer');

// ============================================================
// 플랫폼별 셀렉터 설정 (Python 크롤러 기준)
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

    // Images - multiple strategies
    imageSelectors: [
      '.v9RFkJOz1K img',
      '.SQcogQRz7L',
    ],
    imageDataAttr: 'data-shp-contents-dtl', // JSON attribute with img_url

    // Pagination
    pageBtnClass: 'hyY6CXtbcn',
    nextBtnText: '다음',

    // Metadata selectors
    titleSelectors: [
      'h3.DCVBehA8ZB._copyable',
      'h3._22kDmrHVhY',
      'div._22kDmrHVhY h3',
      'h3.cp3c5B20ro',
      '._22kDmrHVhY',
    ],
    imageMetaSelectors: [
      'img.TgO1N1wWTm',
      '._23RpOU6x2z img',
      '._2FqB1p53uk img',
    ],
    priceSelector: '._1LY7DqCnwR',
  },
};

// ============================================================
// Helper: URL이 네이버 상품 URL인지 확인 (스마트스토어 + 브랜드스토어)
// ============================================================
function isNaverProductUrl(url) {
  return (
    url.includes('smartstore.naver.com') ||
    url.includes('brand.naver.com') ||
    url.includes('shopping.naver.com')
  );
}

// ============================================================
// Helper: URL 정리 (쿼리 파라미터 제거)
// ============================================================
function cleanUrl(url) {
  if (isNaverProductUrl(url) && url.includes('/products/')) {
    return url.split('?')[0];
  }
  return url;
}

// ============================================================
// Helper: data-shp-contents-dtl에서 이미지 URL 추출
// ============================================================
function parseImagesFromDataAttr(dtlStr) {
  const images = [];
  if (!dtlStr) return images;

  try {
    const data = JSON.parse(dtlStr);
    if (Array.isArray(data)) {
      data.forEach((entry) => {
        if (entry.key === 'img_url' && entry.value) {
          images.push(entry.value);
        }
      });
    }
  } catch (e) {
    // JSON 파싱 실패
  }

  return images;
}

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
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--disable-extensions',
          '--disable-popup-blocking',
          '--incognito',
        ],
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
    const cleanedUrl = cleanUrl(url);

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      await page.goto(cleanedUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      let data = {
        name: null,
        image: null,
        price: null,
        platform: 'unknown',
      };

      // 네이버 스마트스토어 / 브랜드스토어
      if (isNaverProductUrl(url)) {
        data.platform = 'naver';
        const config = PLATFORM_CONFIG.naver;

        // 상품명 추출 (여러 셀렉터 시도)
        for (const selector of config.titleSelectors) {
          try {
            const titleEl = await page.$(selector);
            if (titleEl) {
              data.name = await page.evaluate((el) => el.innerText.trim(), titleEl);
              console.log(`[Metadata] Title found with: ${selector}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }

        // Fallback: 페이지 타이틀
        if (!data.name) {
          data.name = await page.title();
          console.log('[Metadata] Using page title as fallback');
        }

        // 이미지 추출 (여러 셀렉터 시도)
        for (const selector of config.imageMetaSelectors) {
          try {
            const imgEl = await page.$(selector);
            if (imgEl) {
              data.image = await page.evaluate((el) => el.src, imgEl);
              console.log(`[Metadata] Image found with: ${selector}`);
              break;
            }
          } catch (e) {
            continue;
          }
        }

        // Fallback: og:image
        if (!data.image) {
          try {
            data.image = await page.$eval('meta[property="og:image"]', (el) => el.content);
            console.log('[Metadata] Using og:image as fallback');
          } catch (e) {}
        }

        // 가격 추출
        try {
          const priceText = await page.$eval(config.priceSelector, (el) => el.innerText);
          data.price = parseInt(priceText.replace(/[^0-9]/g, ''));
        } catch (e) {
          // 가격 없음
        }
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
    const cleanedUrl = cleanUrl(url);

    // 네이버 스마트스토어 / 브랜드스토어
    if (isNaverProductUrl(cleanedUrl)) {
      return await this.scrapeNaverReviews(cleanedUrl, maxPages);
    }

    console.log('[Crawl] Unsupported platform:', cleanedUrl);
    return [];
  }

  // ============================================================
  // 네이버 리뷰 크롤링 (스마트스토어 + 브랜드스토어 공통)
  // ============================================================
  async scrapeNaverReviews(url, maxPages) {
    await this.init();
    const page = await this.browser.newPage();
    const allReviews = [];
    const config = PLATFORM_CONFIG.naver;

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const randomDelay = () => delay(1000 + Math.random() * 1000); // 1~2초

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );

      // 리뷰 탭으로 이동
      const targetUrl = url.includes('#REVIEW') ? url : `${url}#REVIEW`;
      console.log(`[Naver] Navigating to: ${targetUrl}`);
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await delay(3000);

      // 리뷰 탭 클릭
      try {
        const reviewTab = await page.$(config.reviewTabSelector);
        if (reviewTab) {
          await reviewTab.click();
          console.log('[Naver] Clicked review tab');
          await delay(1000);
        }
      } catch (e) {
        console.warn('[Naver] Review tab click failed:', e.message);
      }

      // 최신순 정렬
      try {
        const sortButtons = await page.$$(config.sortLatestSelector);
        for (const btn of sortButtons) {
          const text = await page.evaluate((el) => el.innerText, btn);
          if (text.includes('최신순')) {
            await btn.click();
            console.log('[Naver] Sorted by latest');
            await delay(2000);
            break;
          }
        }
      } catch (e) {
        console.warn('[Naver] Sort failed:', e.message);
      }

      // 페이지네이션 크롤링
      let currentPage = 1;

      for (let loop = 0; loop < Math.ceil(maxPages / 10); loop++) {
        const startPage = currentPage;

        // 10페이지 세트 처리
        for (let i = 0; i < 10; i++) {
          const targetPageNum = startPage + i;

          try {
            // XPath로 페이지 버튼 찾기: //a[text()="1" and contains(@class, "hyY6CXtbcn")]
            const btn = await page.$x(
              `//a[text()="${targetPageNum}" and contains(@class, "${config.pageBtnClass}")]`
            );

            if (btn.length > 0) {
              const isCurrent = await page.evaluate(
                (el) => el.getAttribute('aria-current'),
                btn[0]
              );
              if (isCurrent !== 'true') {
                await btn[0].click();
                await randomDelay();
              }

              // 리뷰 추출
              const newReviews = await page.evaluate(
                (cfg, parseImgFn) => {
                  const items = document.querySelectorAll(cfg.reviewListSelector);
                  const extracted = [];

                  items.forEach((item) => {
                    const content = item.querySelector(cfg.contentSelector)?.innerText || '';
                    const author =
                      item.querySelector(cfg.authorSelector)?.innerText || 'Unknown';
                    const dateStr = item.querySelector(cfg.dateSelector)?.innerText || '';
                    const ratingStr = item.querySelector(cfg.ratingSelector)?.innerText;
                    const rating = ratingStr ? parseInt(ratingStr.replace(/[^0-9]/g, '')) : 5;

                    // 이미지 추출 (3가지 전략)
                    let images = [];

                    // 1. data-shp-contents-dtl 속성에서 추출
                    const dtlEl = item.querySelector('[data-shp-contents-dtl*="img_url"]');
                    if (dtlEl) {
                      const dtlStr = dtlEl.getAttribute('data-shp-contents-dtl');
                      try {
                        const data = JSON.parse(dtlStr);
                        if (Array.isArray(data)) {
                          data.forEach((entry) => {
                            if (entry.key === 'img_url' && entry.value) {
                              images.push(entry.value);
                            }
                          });
                        }
                      } catch (e) {}
                    }

                    // 2. 루트 요소의 data-shp-contents-dtl
                    if (images.length === 0 && item.hasAttribute('data-shp-contents-dtl')) {
                      const dtlStr = item.getAttribute('data-shp-contents-dtl');
                      try {
                        const data = JSON.parse(dtlStr);
                        if (Array.isArray(data)) {
                          data.forEach((entry) => {
                            if (entry.key === 'img_url' && entry.value) {
                              images.push(entry.value);
                            }
                          });
                        }
                      } catch (e) {}
                    }

                    // 3. Fallback: img 태그
                    if (images.length === 0) {
                      const imgEls = item.querySelectorAll('.v9RFkJOz1K img, .SQcogQRz7L');
                      imgEls.forEach((img) => {
                        if (img.src) images.push(img.src);
                      });
                    }

                    if (content) {
                      extracted.push({
                        content: content.trim(),
                        author: author.trim(),
                        rating,
                        date: dateStr.replace(/\./g, '-').replace(/-$/, ''),
                        images: images.filter(Boolean),
                        platform: 'naver',
                      });
                    }
                  });

                  return extracted;
                },
                config
              );

              console.log(`[Naver] Page ${targetPageNum}: ${newReviews.length} reviews`);
              allReviews.push(...newReviews);
              currentPage = targetPageNum + 1;
            } else if (i === 0 && loop > 0) {
              console.log('[Naver] No more pages found');
              return allReviews;
            }
          } catch (err) {
            console.error(`[Naver] Error on page ${targetPageNum}:`, err.message);
          }
        }

        // 다음 페이지 세트로 이동 (다음 버튼 클릭)
        try {
          const nextBtns = await page.$x(`//a[text()="${config.nextBtnText}"]`);
          let clickedNext = false;

          if (nextBtns.length > 0) {
            for (const btn of nextBtns) {
              const ariaHidden = await page.evaluate(
                (el) => el.getAttribute('aria-hidden'),
                btn
              );
              if (ariaHidden === 'false') {
                console.log('[Naver] Clicking next page set');
                await btn.click();
                await delay(3000);
                clickedNext = true;
                break;
              }
            }
          }

          if (!clickedNext) {
            console.log('[Naver] No more page sets (Next button hidden or not found)');
            break;
          }
        } catch (e) {
          console.error('[Naver] Error clicking next:', e.message);
          break;
        }
      }

      console.log(`[Naver] Total reviews collected: ${allReviews.length}`);
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
