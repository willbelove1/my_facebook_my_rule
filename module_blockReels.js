
/**
 * Module: blockReels
 * Mục đích: Ẩn các bài viết dạng video Reels hoặc có video ngắn
 */
FBCMF.registerModule('blockReels', async ({ DOMUtils, settings }) => {
  if (!settings.blockReels) return;

  const posts = DOMUtils.query('div[role="feed"] > div');
  let hiddenCount = 0;

  posts.forEach(post => {
    const hasVideo = DOMUtils.query('video, [data-video-id]', post).length > 0;
    if (hasVideo) {
      const container = post.closest('div');
      if (container) {
        DOMUtils.hideElement(container, 'Reels');
        hiddenCount++;
      }
    }
  });

  if (settings.verbosity === 'verbose') {
    console.log(`[blockReels] Đã ẩn ${hiddenCount} bài viết Reels/video.`);
  }
});
