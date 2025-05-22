/**
 * Module: MutationObserver
 * Mục đích: Theo dõi động nội dung feed và tự động áp dụng bộ lọc khi có thay đổi
 */
(function() {
  'use strict';
  if (!window.FBCMF) {
    console.error('[MutationObserver] FBCMF không được định nghĩa');
    return;
  }
  FBCMF.registerModule('MutationObserver', async ({ DOMUtils, settings, FilterRegistry }) => {
    let observer = null;
    let lastProcessTime = 0;
    let processingQueue = false;
    const THROTTLE_TIME = 300;
    const processNewPosts = () => {
      if (!FilterRegistry) {
        console.error('[MutationObserver] FilterRegistry không được khởi tạo');
        return;
      }
      if (processingQueue) return;
      const now = Date.now();
      if (now - lastProcessTime < THROTTLE_TIME) {
        return;
      }
      processingQueue = true;
      lastProcessTime = now;
      try {
        const posts = DOMUtils.query('div[role="article"], div[role="feed"] > div').filter(
          post => !post.hasAttribute('data-fbcmf-processed')
        );
        if (posts.length === 0) {
          return;
        }
        posts.forEach(post => {
          post.setAttribute('data-fbcmf-processed', 'true');
          const reason = FilterRegistry.apply(post, settings);
          if (reason) {
            const container = findPostContainer(post);
            if (container) {
              DOMUtils.hideElement(container, reason);
              if (settings.verbosity === 'verbose') {
                console.log(`[MutationObserver] Đã ẩn bài viết: ${reason}`);
              }
            }
          }
        });
        if (settings.verbosity === 'verbose' && posts.length > 0) {
          console.log(`[MutationObserver] Đã xử lý ${posts.length} bài viết mới.`);
        }
      } catch (e) {
        console.error('[MutationObserver] Lỗi khi xử lý bài viết:', e);
      } finally {
        processingQueue = false;
      }
    };
    const findPostContainer = (element) => {
      let current = element;
      let level = 0;
      const MAX_LEVELS = 10;
      while (current && level < MAX_LEVELS) {
        if (current.tagName === 'DIV' &&
            (current.getAttribute('role') === 'article' ||
             current.classList.contains('x1yztbdb') ||
             current.classList.contains('x1lliihq'))) {
          return current;
        }
        current = current.parentElement;
        level++;
      }
      return element;
    };
    const initObserver = () => {
      if (observer) {
        observer.disconnect();
      }
      const feedContainer = document.querySelector(
        'div[role="feed"], div[role="main"], .x1lliihq, .x6s0dn4, .x78zum5'
      );
      if (!feedContainer) {
        if (settings.verbosity === 'verbose') {
          console.warn('[MutationObserver] Không tìm thấy container feed, thử lại sau 2s...');
        }
        setTimeout(initObserver, 2000);
        return;
      }
      observer = new MutationObserver((mutations) => {
        if (mutations.some(m => m.addedNodes.length > 0 || m.type === 'attributes')) {
          processNewPosts();
        }
      });
      observer.observe(feedContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
      if (settings.verbosity === 'verbose') {
        console.log('[MutationObserver] Đã khởi tạo theo dõi feed.');
      }
      processNewPosts();
    };
    const setupURLChangeDetection = () => {
      let lastUrl = location.href;
      setInterval(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          if (settings.verbosity === 'verbose') {
            console.log('[MutationObserver] URL thay đổi, khởi tạo lại observer...');
          }
          setTimeout(() => {
            initObserver();
          }, 1000);
        }
      }, 1000);
    };
    const init = () => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          initObserver();
          setupURLChangeDetection();
        });
      } else {
        initObserver();
        setupURLChangeDetection();
      }
      window.addEventListener('scroll', () => {
        processNewPosts();
      }, { passive: true });
    };
    init();
    if (settings.verbosity === 'verbose') {
      console.log('[MutationObserver] Module đã được khởi tạo.');
    }
  });
})();
