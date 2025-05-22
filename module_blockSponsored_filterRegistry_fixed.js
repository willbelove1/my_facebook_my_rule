/**
 * Module: blockSponsored
 * Mục đích: Đăng ký bộ lọc "Được tài trợ" vào FilterRegistry
 */
FBCMF.registerModule('blockSponsored', async ({ DOMUtils, settings, FilterRegistry }) => {
  if (!FilterRegistry) {
    console.error('[blockSponsored] FilterRegistry không được khởi tạo');
    return;
  }
  if (!settings.blockSponsored) return;

  FilterRegistry.register('blockSponsored', (post) => {
    const spans = DOMUtils.query('span', post);
    const found = spans.find(span =>
      /sponsored|được tài trợ/i.test(span.textContent)
    );
    return found ? 'Sponsored' : '';
  });

  if (settings.verbosity === 'verbose') {
    console.log('[blockSponsored] Bộ lọc đã được đăng ký.');
  }
});
