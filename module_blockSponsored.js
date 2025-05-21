
/**
 * Module: blockSponsored
 * Mục đích: Ẩn các bài viết được tài trợ (Sponsored / Được tài trợ)
 */
FBCMF.registerModule('blockSponsored', async ({ DOMUtils, settings }) => {
  if (!settings.blockSponsored) return;

  const posts = DOMUtils.query('div[role="feed"] > div');
  let hiddenCount = 0;

  posts.forEach(post => {
    const spans = DOMUtils.query('span', post);
    const found = spans.find(span =>
      /sponsored|được tài trợ/i.test(span.textContent)
    );
    if (found) {
      const container = post.closest('div');
      if (container) {
        DOMUtils.hideElement(container, 'Sponsored');
        hiddenCount++;
      }
    }
  });

  if (settings.verbosity === 'verbose') {
    console.log(`[blockSponsored] Đã ẩn ${hiddenCount} bài viết tài trợ.`);
  }
});
