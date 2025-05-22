/**
 * Module: FilterRegistry
 * Mục đích: Cấu trúc dễ mở rộng để đăng ký và áp dụng các bộ lọc bài viết
 */
(function() {
  'use strict';
  if (!window.FBCMF) {
    console.error('[FilterRegistry] FBCMF không được định nghĩa');
    return;
  }
  window.FBCMF.registerModule('FilterRegistry', async (ctx) => {
    console.log('[FilterRegistry] Bắt đầu khởi tạo...');
    const filters = new Map();
    const register = (name, filterFn) => {
      if (typeof filterFn === 'function') {
        filters.set(name, filterFn);
        console.log(`[FilterRegistry] Đã đăng ký bộ lọc: ${name}`);
      } else {
        console.warn(`[FilterRegistry] ❌ Bộ lọc "${name}" không hợp lệ.`);
      }
    };
    const apply = (post, settings) => {
      for (const [name, fn] of filters.entries()) {
        if (settings[name]) {
          const reason = fn(post, settings);
          if (reason) return reason;
        }
      }
      return '';
    };
    ctx.FilterRegistry = {
      register,
      apply,
      list: () => Array.from(filters.keys())
    };
    window.FilterRegistry = ctx.FilterRegistry; // Đảm bảo global access
    console.log('[FilterRegistry] ✅ Đã sẵn sàng.');
  });
})();
