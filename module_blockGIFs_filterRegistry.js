/**
 * Module: blockGIFs (viết lại)
 * Mục đích: Đăng ký bộ lọc ảnh động .gif vào FilterRegistry
 */
FBCMF.registerModule('blockGIFs', async ({ DOMUtils, settings, FilterRegistry }) => {
  if (!settings.blockGIFs) return;

  FilterRegistry.register('blockGIFs', (post) => {
    const found = DOMUtils.query('img[src*=".gif"]', post).length > 0;
    return found ? 'GIF' : '';
  });

  if (settings.verbosity === 'verbose') {
    console.log('[blockGIFs] Bộ lọc đã được đăng ký.');
  }
});
