
/**
 * Module: blockKeywords
 * Mục đích: Ẩn bài viết chứa các từ khóa do người dùng chỉ định
 */
FBCMF.registerModule('blockKeywords', async ({ DOMUtils, settings }) => {
  if (!settings.blockKeywords || !Array.isArray(settings.blockedKeywords)) return;

  const keywords = settings.blockedKeywords.map(k => k.toLowerCase());
  const posts = DOMUtils.query('div[role="feed"] > div');
  let hiddenCount = 0;

  posts.forEach(post => {
    const text = post.textContent.toLowerCase();
    const matched = keywords.find(k => k && text.includes(k));
    if (matched) {
      const container = post.closest('div');
      if (container) {
        DOMUtils.hideElement(container, `Keyword: ${matched}`);
        hiddenCount++;
      }
    }
  });

  if (settings.verbosity === 'verbose') {
    console.log(`[blockKeywords] Đã ẩn ${hiddenCount} bài viết chứa từ khóa.`);
  }
});
