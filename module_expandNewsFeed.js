/**
 * Module: expandNewsFeed
 * Mục đích: Mở rộng các bài viết trong feed toàn khung (full width)
 */
FBCMF.registerModule('expandNewsFeed', async ({ DOMUtils, settings }) => {
  if (!settings.expandNewsFeed) return;

  let expandedCount = 0;
  const items = DOMUtils.query('div[role="article"], .x193iq5w');

  items.forEach(item => {
    if (item.style.width !== '100%') {
      item.style.width = '100%';
      expandedCount++;
    }
  });

  if (settings.verbosity === 'verbose') {
    console.log(`[expandNewsFeed] Đã mở rộng ${expandedCount} bài viết.`);
  }

  // Theo dõi động
  const container = document.querySelector('.xxzkxad, div[role="feed"], div[role="main"]');
  if (container) {
    const observer = new MutationObserver(() => {
      const newItems = DOMUtils.query('div[role="article"], .x193iq5w');
      newItems.forEach(item => {
        if (item.style.width !== '100%') {
          item.style.width = '100%';
        }
      });
    });
    observer.observe(container, { childList: true, subtree: true });
  }
});
