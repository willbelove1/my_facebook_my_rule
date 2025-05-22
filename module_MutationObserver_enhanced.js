/**
 * Module: MutationObserver
 * Mục đích: Theo dõi động nội dung feed và tự động áp dụng bộ lọc khi có thay đổi
 * Phiên bản: 2.0.0 (Enhanced)
 */
(function() {
  'use strict';
  
  // Đảm bảo namespace FBCMF đã được khởi tạo
  if (!window.FBCMF) {
    console.error('[MutationObserver] FBCMF không được định nghĩa');
    return;
  }
  
  FBCMF.registerModule('MutationObserver', async (ctx) => {
    console.log('[MutationObserver] Khởi tạo với context:', Object.keys(ctx));
    
    const { DOMUtils, settings } = ctx;
    let observer = null;
    let lastProcessTime = 0;
    let processingQueue = false;
    const THROTTLE_TIME = 300;
    let processedCount = 0;
    let hiddenCount = 0;
    
    // Kiểm tra FilterRegistry
    const waitForFilterRegistry = (attempt = 0, maxAttempts = 10) => {
      return new Promise((resolve, reject) => {
        if (ctx.FilterRegistry) {
          console.log('[MutationObserver] FilterRegistry đã sẵn sàng');
          resolve(ctx.FilterRegistry);
          return;
        }
        
        if (attempt >= maxAttempts) {
          console.error('[MutationObserver] FilterRegistry không được khởi tạo sau nhiều lần thử');
          reject(new Error('FilterRegistry không được khởi tạo'));
          return;
        }
        
        console.warn(`[MutationObserver] Đang chờ FilterRegistry (lần thử ${attempt + 1}/${maxAttempts})`);
        setTimeout(() => {
          waitForFilterRegistry(attempt + 1, maxAttempts)
            .then(resolve)
            .catch(reject);
        }, 500);
      });
    };
    
    // Xử lý bài viết mới
    const processNewPosts = async () => {
      if (processingQueue) return;
      
      const now = Date.now();
      if (now - lastProcessTime < THROTTLE_TIME) {
        return;
      }
      
      processingQueue = true;
      lastProcessTime = now;
      
      try {
        // Đảm bảo FilterRegistry đã sẵn sàng
        const FilterRegistry = await waitForFilterRegistry().catch(err => {
          console.error('[MutationObserver]', err.message);
          return null;
        });
        
        if (!FilterRegistry) {
          console.error('[MutationObserver] Không thể xử lý bài viết: FilterRegistry không sẵn sàng');
          return;
        }
        
        // Tìm các bài viết chưa xử lý
        const posts = DOMUtils.query('div[role="article"], div[role="feed"] > div').filter(
          post => !post.hasAttribute('data-fbcmf-processed')
        );
        
        if (posts.length === 0) {
          return;
        }
        
        // Xử lý từng bài viết
        let newHiddenCount = 0;
        posts.forEach(post => {
          post.setAttribute('data-fbcmf-processed', 'true');
          processedCount++;
          
          const reason = FilterRegistry.apply(post, settings);
          if (reason) {
            const container = findPostContainer(post);
            if (container) {
              DOMUtils.hideElement(container, reason);
              newHiddenCount++;
              hiddenCount++;
              
              if (settings.verbosity === 'verbose') {
                console.log(`[MutationObserver] Đã ẩn bài viết: ${reason}`);
              }
            }
          }
        });
        
        if (settings.verbosity === 'verbose' && posts.length > 0) {
          console.log(`[MutationObserver] Đã xử lý ${posts.length} bài viết mới, ẩn ${newHiddenCount} bài.`);
        }
      } catch (e) {
        console.error('[MutationObserver] Lỗi khi xử lý bài viết:', e);
      } finally {
        processingQueue = false;
      }
    };
    
    // Tìm container của bài viết
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
      
      // Tìm container feed
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
      
      // Khởi tạo MutationObserver
      observer = new MutationObserver((mutations) => {
        if (mutations.some(m => m.addedNodes.length > 0 || m.type === 'attributes')) {
          processNewPosts();
        }
      });
      
      // Bắt đầu theo dõi
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
      
      setInterval(() => {
        if (location.href !== lastUrl) {
          lastUrl = location.href;
          
          if (settings.verbosity === 'verbose') {
            console.log('[MutationObserver] URL thay đổi, khởi tạo lại observer...');
          }
          
          // Reset các biến đếm
          processedCount = 0;
          hiddenCount = 0;
          
          // Khởi tạo lại observer sau khi URL thay đổi
          setTimeout(() => {
            initObserver();
          }, 1000);
        }
      }, 1000);
    };
    
    // Khởi tạo module
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
      
      // Xử lý bài viết khi cuộn trang
      window.addEventListener('scroll', () => {
        processNewPosts();
      }, { passive: true });
    };
    
    // Khởi tạo
    init();
    
    if (settings.verbosity === 'verbose') {
      console.log('[MutationObserver] Module đã được khởi tạo.');
    }
    
    // Trả về API cho context
    return {
      processNewPosts,
      getStats: () => ({ processedCount, hiddenCount }),
      reset: () => {
        processedCount = 0;
        hiddenCount = 0;
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        initObserver();
      }
    };
  });
})();
