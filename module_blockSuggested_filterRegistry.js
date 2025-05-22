/**
 * Module: blockSuggested (viết lại)
 * Mục đích: Đăng ký bộ lọc "Gợi ý cho bạn" vào FilterRegistry
 */
FBCMF.registerModule('blockSuggested', async ({ DOMUtils, settings, FilterRegistry }) => {
  if (!settings.blockSuggested) return;

  FilterRegistry.register('blockSuggested', (post) => {
    const spans = DOMUtils.query('span', post);
    const found = spans.find(span =>
      /gợi ý cho bạn|suggested for you/i.test(span.textContent)
    );
    return found ? 'Suggested' : '';
  });

  if (settings.verbosity === 'verbose') {
    console.log('[blockSuggested] Bộ lọc đã được đăng ký.');
  }
});
