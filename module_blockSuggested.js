
/**
 * Module: blockSuggested
 * Mục đích: Ẩn các bài viết dạng "Gợi ý cho bạn" / "Suggested for you"
 */
FBCMF.registerModule('blockSuggested', async ({ DOMUtils, settings }) => {
  if (!settings.blockSuggested) return;

  const posts = DOMUtils.query('div[role="feed"] > div');
  let hiddenCount = 0;

  posts.forEach(post => {
    const spans = DOMUtils.query('span', post);
    const found = spans.find(span =>
      /gợi ý cho bạn|suggested for you/i.test(span.textContent)
    );
    if (found) {
      const container = post.closest('div');
      if (container) {
        DOMUtils.hideElement(container, 'Suggested');
        hiddenCount++;
      }
    }
  });

  if (settings.verbosity === 'verbose') {
    console.log(`[blockSuggested] Đã ẩn ${hiddenCount} bài viết gợi ý.`);
  }
});
