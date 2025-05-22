
/**
 * Module: blockGIFs
 * Mục đích: Ẩn các bài viết chứa ảnh động .gif
 */
FBCMF.registerModule('blockGIFs', async ({ DOMUtils, settings }) => {
  if (!settings.blockGIFs) return;

  const posts = DOMUtils.query('div[role="feed"] > div');
  let hiddenCount = 0;

  posts.forEach(post => {
    const hasGIF = DOMUtils.query('img[src*=".gif"]', post).length > 0;
    if (hasGIF) {
      const container = post.closest('div');
      if (container) {
        DOMUtils.hideElement(container, 'GIF');
        hiddenCount++;
      }
    }
  });

  if (settings.verbosity === 'verbose') {
    console.log(`[blockGIFs] Đã ẩn ${hiddenCount} bài viết chứa ảnh GIF.`);
  }
});
