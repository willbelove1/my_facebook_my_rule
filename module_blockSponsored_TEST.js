/**
 * Module: blockSponsored (nâng cấp từ CMF's detection logic)
 * Mục đích: Lọc bài đăng được tài trợ/quảng cáo trên Facebook bằng kỹ thuật DOM nối chuỗi và phân tích nhãn
 */
FBCMF.registerModule('blockSponsored', async ({ DOMUtils, settings, FilterRegistry }) => {
  if (!FilterRegistry) {
    console.error('[blockSponsored] FilterRegistry không được khởi tạo');
    return;
  }
  if (!settings.blockSponsored) return;

  function isSponsored(post) {
    // 1. Lấy toàn bộ text từ các span liên tiếp và nối lại
    const textContent = Array.from(post.querySelectorAll('span'))
      .map(span => span.textContent)
      .join('')
      .replace(/\s+/g, '')
      .toLowerCase();

    if (textContent.includes('đượctàitrợ') || textContent.includes('sponsored') || textContent.includes('paidpartnership')) {
      return true;
    }

    // 2. Kiểm tra các thuộc tính aria-label hoặc tooltip
    const ariaMatch = post.querySelector('[aria-label*="Sponsored"], [aria-label*="Được tài trợ"]');
    if (ariaMatch) return true;

    // 3. Kiểm tra các tooltip liên quan quảng cáo
    const buttons = post.querySelectorAll('[role="button"]');
    for (const btn of buttons) {
      const label = btn.getAttribute('aria-label')?.toLowerCase() || '';
      if (
        label.includes('quảng cáo') ||
        label.includes('tại sao') && label.includes('quảng') ||
        label.includes('why am i seeing this ad')
      ) {
        return true;
      }
    }

    return false;
  }

  FilterRegistry.register('blockSponsored', (post) => {
    return isSponsored(post) ? 'Sponsored' : '';
  });

  if (settings.verbosity === 'verbose') {
    console.log('[blockSponsored] Bộ lọc nâng cao đã được đăng ký.');
  }
});
