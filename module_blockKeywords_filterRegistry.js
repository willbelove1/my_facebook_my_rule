/**
 * Module: blockKeywords (viết lại)
 * Mục đích: Đăng ký bộ lọc theo từ khóa người dùng chỉ định vào FilterRegistry
 */
FBCMF.registerModule('blockKeywords', async ({ DOMUtils, settings, FilterRegistry }) => {
  if (!settings.blockKeywords || !Array.isArray(settings.blockedKeywords)) return;

  const keywords = settings.blockedKeywords
    .map(k => k.toLowerCase())
    .filter(k => k.trim() !== '');

  FilterRegistry.register('blockKeywords', (post) => {
    const text = post.textContent.toLowerCase();
    const matched = keywords.find(k => text.includes(k));
    return matched ? `Keyword: ${matched}` : '';
  });

  if (settings.verbosity === 'verbose') {
    console.log('[blockKeywords] Bộ lọc đã được đăng ký với', keywords.length, 'từ khóa.');
  }
});
