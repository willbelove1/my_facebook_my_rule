/**
 * Module: MutationObserver
 * Mục đích: Theo dõi động nội dung feed và tự động áp dụng bộ lọc khi có thay đổi
 */
(function() {
  'use strict';
  
  // Đảm bảo namespace FBCMF đã được khởi tạo
  window.FBCMF = window.FBCMF || {};
  
  FBCMF.registerModule('MutationObserver', async ({ DOMUtils, settings, FilterRegistry }) => {
    let observer = null;
    let lastProcessTime = 0;
    let processingQueue = false;
    const THROTTLE_TIME = 300; // ms
    
    // Hàm xử lý các bài viết mới
    const processNewPosts = () => {
      if (processingQueue) return;
      
      const now = Date.now();
      if (now - lastProcessTime < THROTTLE_TIME) {
        return;
      }
      
      processingQueue = true;
      lastProcessTime = now;
      
      try {
        // Tìm tất cả các bài viết chưa được xử lý
        const posts = DOMUtils.query('div[role="article"], div[role="feed"] > div').filter(
          post => !post.hasAttribute('data-fbcmf-processed')
        );
        
        if (posts.length === 0) {
          return;
        }
        
        // Đánh dấu đã xử lý
        posts.forEach(post => {
          post.setAttribute('data-fbcmf-processed', 'true');
          
          // Áp dụng các bộ lọc
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
    
    // Tìm container của bài viết để ẩn
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
    
    // Khởi tạo observer
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
      
      // Xử lý các bài viết hiện tại
      processNewPosts();
    };
    
    // Theo dõi thay đổi URL
    const setupURLChangeDetection = () => {
      let lastUrl = location.href;
      
      // Kiểm tra URL thay đổi mỗi 1s
      setInterval(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          
          if (settings.verbosity === 'verbose') {
            console.log('[MutationObserver] URL thay đổi, khởi tạo lại observer...');
          }
          
          // Đợi DOM cập nhật sau khi chuyển trang
          setTimeout(() => {
            initObserver();
          }, 1000);
        }
      }, 1000);
    };
    
    // Khởi tạo module
    const init = () => {
      // Đợi DOM load xong
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          initObserver();
          setupURLChangeDetection();
        });
      } else {
        initObserver();
        setupURLChangeDetection();
      }
      
      // Xử lý khi scroll để bắt các bài viết lazy-loaded
      window.addEventListener('scroll', () => {
        processNewPosts();
      }, { passive: true });
    };
    
    // Khởi chạy
    init();
    
    if (settings.verbosity === 'verbose') {
      console.log('[MutationObserver] Module đã được khởi tạo.');
    }
  });
})();
