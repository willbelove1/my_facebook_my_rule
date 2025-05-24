/**
 * Module: blockSponsored (nâng cấp)
 * Mục đích: Đăng ký bộ lọc "Được tài trợ"/"Sponsored" với khả năng nhận diện nâng cao
 */
FBCMF.registerModule('blockSponsored', async ({ DOMUtils, settings, FilterRegistry }) => {
  if (!FilterRegistry) {
    console.error('[blockSponsored] FilterRegistry không được khởi tạo');
    return;
  }
  if (!settings.blockSponsored) return;

  function isSponsored(post) {
    // 1. Ghép toàn bộ textContent từ các span liên tiếp
    const spans = DOMUtils.query('span', post);
    const fullText = spans.map(s => s.textContent).join('').toLowerCase();

    if (fullText.includes('được tài trợ') || fullText.includes('sponsored')) {
      return true;
    }

    // 2. Kiểm tra aria-label hoặc role bất thường
    const potential = post.querySelector('[aria-label*="Sponsored"], [aria-label*="Được tài trợ"]');
    if (potential) return true;

    // 3. Kiểm tra tooltip hoặc nhãn liên quan đến quảng cáo
    const tooltips = DOMUtils.query('[role="button"]', post);
    for (const el of tooltips) {
      const label = el.getAttribute('aria-label') || '';
      if (/quảng cáo|tại sao.*quảng cáo/i.test(label)) {
        return true;
      }
    }

    return false;
  }

  FilterRegistry.register('blockSponsored', (post) => {
    return isSponsored(post) ? 'Sponsored' : '';
  });

  if (settings.verbosity === 'verbose') {
    console.log('[blockSponsored] Đã đăng ký bộ lọc với cải tiến nhận diện nâng cao.');
  }
});
