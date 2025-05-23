/**
 * Module: FeedExpander
 * Mục đích: Mở rộng các mục trong news feed của Facebook (width: 100%)
 * Phiên bản: 1.0.0
 * Tích hợp: FBCMF framework, kiểm tra ctx.settings.expandNewsFeed
 */
(function() {
  'use strict';

  // Đảm bảo namespace FBCMF đã được khởi tạo
  window.FBCMF = window.FBCMF || {};

  FBCMF.registerModule = FBCMF.registerModule || function(name, initFn) {
    if (!FBCMF.modules) FBCMF.modules = {};
    FBCMF.modules[name] = initFn;
  };

  FBCMF.registerModule('FeedExpander', async (ctx) => {
    let mutationObserver = null;
    let timer = null;
    let expandedCount = 0;

    // Tối ưu log dựa trên verbosity
    function log(message, level = 'verbose') {
      if (ctx.settings?.verbosity === 'verbose' || level === 'error') {
        console[level === 'error' ? 'error' : 'log'](`[FeedExpander] ${message}`);
      }
    }

    log('Khởi tạo với context: ' + Object.keys(ctx).join(', '));

    // Hàm mở rộng các mục trong news feed
    function expandNewsFeed() {
      if (!ctx.settings?.expandNewsFeed) {
        log('Tính năng mở rộng news feed bị tắt, bỏ qua');
        return;
      }

      const feedItems = document.querySelectorAll('.x193iq5w');
      feedItems.forEach(item => {
        if (item.style.width !== '100%') {
          item.style.width = '100%';
          expandedCount++;
          log(`Đã mở rộng mục news feed (tổng: ${expandedCount})`);
        }
      });

      if (expandedCount > 0) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
          log('Đã dọn dẹp timer');
        }
        if (mutationObserver) {
          mutationObserver.disconnect();
          mutationObserver = null;
          log('Đã dọn dẹp MutationObserver');
        }
      }
    }

    // Thiết lập MutationObserver cho container
    function setupObserver(retryCount = 0, maxRetries = 5) {
      if (!ctx.settings?.expandNewsFeed) {
        log('Tính năng mở rộng news feed bị tắt, không thiết lập observer');
        return;
      }

      const feedContainer = document.querySelector('.xxzkxad');
      if (feedContainer) {
        mutationObserver = new MutationObserver(() => {
          expandNewsFeed();
        });
        mutationObserver.observe(feedContainer, { childList: true, subtree: true });
        log('Đã thiết lập MutationObserver cho container .xxzkxad');
      } else {
        if (retryCount < maxRetries) {
          log(`Không tìm thấy container .xxzkxad, thử lại lần ${retryCount + 1} sau 1s`);
          timer = setTimeout(() => setupObserver(retryCount + 1, maxRetries), 1000);
        } else {
          log('Không tìm thấy container .xxzkxad sau nhiều lần thử', 'error');
        }
      }
    }

    // Khởi tạo module
    function init() {
      // Chỉ chạy nếu đúng trang chủ Facebook
      if (location.hostname !== 'www.facebook.com' || location.pathname !== '/') {
        log('Không phải trang chủ Facebook, không khởi tạo FeedExpander');
        return;
      }

      if (!document.body) {
        log('DOM chưa sẵn sàng, thử lại sau 1s');
        setTimeout(init, 1000);
        return;
      }

      if (!ctx.settings?.expandNewsFeed) {
        log('Tính năng mở rộng news feed bị tắt, không khởi tạo');
        return;
      }

      expandNewsFeed();
      timer = setTimeout(() => {
        setupObserver();
      }, 3000);
      log('✅ Đã khởi tạo FeedExpander');
    }

    // Hủy module
    function destroy() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
        log('Đã dọn dẹp timer');
      }

      if (mutationObserver) {
        mutationObserver.disconnect();
        mutationObserver = null;
        log('Đã dọn dẹp MutationObserver');
      }

      // Khôi phục style gốc (tùy chọn, nếu cần)
      const feedItems = document.querySelectorAll('.x193iq5w');
      feedItems.forEach(item => {
        if (item.style.width === '100%') {
          item.style.width = '';
        }
      });

      expandedCount = 0;
      log('Đã hủy FeedExpander');
    }

    // Mở rộng ngay lập tức
    function expandNow() {
      expandNewsFeed();
      log('Đã chạy mở rộng news feed theo yêu cầu');
    }

    // Khởi tạo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }

    // Trả về API cho context
    return {
      init,
      destroy,
      expandNow
    };
  });
})();
