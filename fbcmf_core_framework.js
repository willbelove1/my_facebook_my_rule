
/**
 * FBCMF - Facebook Cleaner Modular Framework (Core)
 * Kiến trúc mở rộng (Extensible Architecture) cho các module gắn thêm
 */
(function () {
  'use strict';

  const FBCMF = {
    modules: new Map(),
    settings: {},
    context: {},

    // Đăng ký mô-đun mới
    registerModule(name, moduleFn) {
      if (typeof moduleFn !== 'function') {
        console.warn(`[FBCMF] Module "${name}" không hợp lệ.`);
        return;
      }
      this.modules.set(name, moduleFn);
    },

    // Khởi tạo framework chính
    async init() {
      console.log('[FBCMF] 🚀 Initializing Core Framework...');

      // 1. Load settings (simple localStorage layer)
      const stored = localStorage.getItem('fbcmf-settings');
      this.settings = stored ? JSON.parse(stored) : {
        blockSponsored: true,
        expandNewsFeed: true,
        blockedKeywords: [],
        verbosity: 'normal'
      };

      // 2. Khởi tạo ngữ cảnh chung
      this.context = {
        DOMUtils: this.DOMUtils,
        settings: this.settings
      };

      // 3. Chạy từng mô-đun đã đăng ký
      for (const [name, moduleFn] of this.modules.entries()) {
        try {
          await moduleFn(this.context);
          console.log(`[FBCMF] ✅ Module "${name}" loaded.`);
        } catch (e) {
          console.error(`[FBCMF] ❌ Module "${name}" failed:`, e);
        }
      }

      console.log('[FBCMF] ✅ All modules initialized.');
    },

    // Tiện ích DOM
    DOMUtils: {
      query(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
      },
      hideElement(el, reason = 'hidden') {
        if (!el || el.dataset.fbcmfHidden) return;
        el.dataset.fbcmfHidden = reason;
        el.style.transition = 'opacity 0.3s';
        el.style.opacity = '0.2';
        setTimeout(() => { el.style.display = 'none'; }, 300);
      }
    }
  };

  // Xuất ra global
  window.FBCMF = FBCMF;

  // Tự khởi chạy nếu không phải module riêng lẻ
  if (!window.__FBCMF_SKIP_INIT__) {
    window.addEventListener('load', () => FBCMF.init());
  }

})();
