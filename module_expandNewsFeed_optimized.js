/**
 * Module: expandNewsFeed
 * Mục đích: Mở rộng các bài viết trong feed toàn khung (full width)
 * Phiên bản: 2.0.0
 */
(function() {
  'use strict';
  
  // Đảm bảo namespace FBCMF đã được khởi tạo
  if (!window.FBCMF) {
    console.error('[expandNewsFeed] FBCMF không được định nghĩa');
    return;
  }
  
  FBCMF.registerModule('expandNewsFeed', async (ctx) => {
    console.log('[expandNewsFeed] Khởi tạo với context:', Object.keys(ctx));
    
    const { settings, DOMUtils } = ctx;
    let mutationObserver = null;
    let timer = null;
    let expandedCount = 0;
    let isActive = false;
    
    // Danh sách các class selector cần kiểm tra (để tương thích với các phiên bản Facebook khác nhau)
    const selectors = [
      '.x193iq5w',                  // Class mới nhất
      'div[role="article"]',        // Selector theo role
      '.xq8finb',                   // Class thay thế có thể
      '.x1qjc9v5',                  // Class thay thế có thể
      '.xb57i2i'                    // Class thay thế có thể
    ];
    
    // Danh sách các container selector
    const containerSelectors = [
      '.xxzkxad',                   // Container mới nhất
      'div[role="feed"]',           // Feed container
      'div[role="main"]',           // Main container
      '.x1lliihq'                   // Container thay thế có thể
    ];
    
    // Hàm mở rộng các mục trong news feed
    function expandNewsFeed() {
      if (!settings.expandNewsFeed) return;
      
      try {
        // Tạo selector tổng hợp từ danh sách
        const combinedSelector = selectors.join(', ');
        
        // Sử dụng DOMUtils nếu có, nếu không thì dùng querySelector trực tiếp
        const feedItems = DOMUtils ? 
          DOMUtils.query(combinedSelector) : 
          document.querySelectorAll(combinedSelector);
        
        let newExpandedCount = 0;
        feedItems.forEach(item => {
          // Kiểm tra nếu chưa được mở rộng hoặc width khác 100%
          if (!item.hasAttribute('data-fbcmf-expanded') || item.style.width !== '100%') {
            item.style.width = '100%';
            item.setAttribute('data-fbcmf-expanded', 'true');
            newExpandedCount++;
          }
        });
        
        // Cập nhật tổng số đã mở rộng
        expandedCount += newExpandedCount;
        
        // Log nếu có mở rộng mới và verbosity là verbose
        if (newExpandedCount > 0 && settings.verbosity === 'verbose') {
          console.log(`[expandNewsFeed] Đã mở rộng ${newExpandedCount} bài viết mới (tổng: ${expandedCount}).`);
        }
        
        return newExpandedCount;
      } catch (error) {
        console.error('[expandNewsFeed] Lỗi khi mở rộng feed:', error);
        return 0;
      }
    }
    
    // Tìm container phù hợp
    function findContainer() {
      for (const selector of containerSelectors) {
        const container = document.querySelector(selector);
        if (container) return container;
      }
      return null;
    }
    
    // Thiết lập MutationObserver
    function setupObserver() {
      if (mutationObserver) return; // Tránh tạo nhiều observer
      
      const container = findContainer();
      if (!container) {
        if (settings.verbosity === 'verbose') {
          console.warn('[expandNewsFeed] Không tìm thấy container, sẽ thử lại sau.');
        }
        
        // Thử lại sau 2 giây nếu không tìm thấy container
        if (!timer) {
          timer = setTimeout(() => {
            timer = null;
            setupObserver();
          }, 2000);
        }
        return;
      }
      
      // Tạo và thiết lập observer
      mutationObserver = new MutationObserver((mutations) => {
        // Chỉ mở rộng khi có thay đổi trong DOM
        if (mutations.some(mutation => mutation.addedNodes.length > 0)) {
          expandNewsFeed();
        }
      });
      
      // Bắt đầu theo dõi
      mutationObserver.observe(container, { childList: true, subtree: true });
      
      if (settings.verbosity === 'verbose') {
        console.log('[expandNewsFeed] Đã thiết lập MutationObserver cho container:', container);
      }
    }
    
    // Khởi tạo module
    function init() {
      if (!settings.expandNewsFeed) return;
      isActive = true;
      
      // Thử mở rộng ngay lập tức
      const expandedNow = expandNewsFeed();
      
      // Thiết lập observer sau 1 giây để đảm bảo DOM đã load
      timer = setTimeout(() => {
        timer = null;
        setupObserver();
        
        // Thử mở rộng lần nữa sau khi thiết lập observer
        expandNewsFeed();
      }, 1000);
      
      if (settings.verbosity === 'verbose') {
        console.log('[expandNewsFeed] Đã khởi tạo module, mở rộng ban đầu:', expandedNow);
      }
    }
    
    // Hủy module
    function destroy() {
      isActive = false;
      
      // Hủy observer
      if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
      }
      
      // Hủy timer
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      
      if (settings.verbosity === 'verbose') {
        console.log('[expandNewsFeed] Đã hủy module, tổng số đã mở rộng:', expandedCount);
      }
    }
    
    // Làm mới module (hủy và khởi tạo lại)
    function refresh() {
      destroy();
      expandedCount = 0;
      init();
      
      if (settings.verbosity === 'verbose') {
        console.log('[expandNewsFeed] Đã làm mới module.');
      }
    }
    
    // Khởi tạo
    init();
    
    // Trả về API cho context
    return {
      init,
      destroy,
      refresh,
      expandNewsFeed
    };
  });
})();
