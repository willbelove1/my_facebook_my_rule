/**
 * Module: blockSponsored (tối ưu hoá)
 * Mục đích: Nhận diện bài đăng được tài trợ với độ chính xác và hiệu suất cao hơn
 */
FBCMF.registerModule('blockSponsored', async ({ DOMUtils, settings, FilterRegistry }) => {
  if (!FilterRegistry) {
    console.error('[blockSponsored] FilterRegistry không được khởi tạo');
    return;
  }
  if (!settings.blockSponsored) return;

  function isSponsored(post) {
    // 1. Ưu tiên quét vùng thông tin meta
    const metaZone = post.querySelector('[id][aria-labelledby]');
    const spanTexts = metaZone
      ? Array.from(metaZone.querySelectorAll('span'))
      : Array.from(post.querySelectorAll('span'));

    const textContent = spanTexts
      .map(span => span.textContent)
      .join('')
      .replace(/\s+/g, '')
      .toLowerCase();

    const sponsoredPatterns = [
      'đượctàitrợ',
      'sponsored',
      'paidpartnership',
      'đanghợp táctrảtiền'
    ];
    if (sponsoredPatterns.some(p => textContent.includes(p))) return true;

    // 2. Quét theo aria-label có chứa từ khóa gợi ý quảng cáo
    const ariaTargets = [
      '[aria-label*="Sponsored"]',
      '[aria-label*="Được tài trợ"]',
      '[aria-label*="quảng cáo"]',
      '[aria-label*="Why am I seeing this ad"]'
    ];
    for (const sel of ariaTargets) {
      if (post.querySelector(sel)) return true;
    }

    // 3. Kiểm tra nút bấm chứa label gợi ý
    const buttons = post.querySelectorAll('[role="button"]');
    for (const btn of buttons) {
      const label = btn.getAttribute('aria-label')?.toLowerCase() || '';
      if (/(tại sao.*quảng cáo|why.*ad|sponsored)/.test(label)) {
        return true;
      }
    }

    return false;
  }

  FilterRegistry.register('blockSponsored', (post) => {
    return isSponsored(post) ? 'Sponsored' : '';
  });

  if (settings.verbosity === 'verbose') {
    console.log('[blockSponsored] Bộ lọc tối ưu đã được đăng ký.');
  }
});
