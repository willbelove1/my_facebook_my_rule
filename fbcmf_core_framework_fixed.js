/**
 * FBCMF - Facebook Cleaner Modular Framework (Core)
 * Kiến trúc mở rộng (Extensible Architecture) cho các module gắn thêm
 */
(function () {
  'use strict';

  const FBCMF = {
    modules: new Map(),
    settings: {},

    // Đăng ký mô-đun mới
    registerModule(name, moduleFn) {
      if (typeof moduleFn !== 'function') {
        console.warn(`[FBCMF] Module "${name}" không hợp lệ.`);
        return;
      }
      this.modules.set(name, moduleFn);
      console.log(`[FBCMF] Module "${name}" đã được đăng ký.`);
    },

    // Lưu cài đặt vào localStorage
    saveSettings(newSettings) {
      try {
        const currentSettings = this.settings || {};
        const updatedSettings = { ...currentSettings, ...newSettings };
        localStorage.setItem('fbcmf-settings', JSON.stringify(updatedSettings));
        this.settings = updatedSettings;
        console.log('[FBCMF] Đã lưu cài đặt:', updatedSettings);
      } catch (e) {
        console.error('[FBCMF] Lỗi khi lưu cài đặt:', e);
      }
    },

    // Khởi tạo framework chính
    async init() {
      console.log('[FBCMF] 🚀 Initializing Core Framework...');

      // 1. Load settings từ localStorage
      try {
        const stored = localStorage.getItem('fbcmf-settings');
        this.settings = stored ? JSON.parse(stored) : {
          blockSponsored: true,
          blockSuggested: false,
          blockReels: false,
          blockGIFs: false,
          blockKeywords: false,
          blockedKeywords: [],
          expandNewsFeed: true,
          language: 'vi',
          verbosity: 'normal'
        };
        console.log('[FBCMF] Đã tải cài đặt:', this.settings);
      } catch (e) {
        console.error('[FBCMF] Lỗi khi tải cài đặt:', e);
        this.settings = {
          blockSponsored: true,
          blockSuggested: false,
          blockReels: false,
          blockGIFs: false,
          blockKeywords: false,
          blockedKeywords: [],
          expandNewsFeed: true,
          language: 'vi',
          verbosity: 'normal'
        };
      }

      // 2. Khởi tạo ngữ cảnh chung
      const ctx = {
        DOMUtils: this.DOMUtils,
        settings: this.settings,
        saveSettings: this.saveSettings.bind(this)
      };

      // 3. Chạy từng mô-đun đã đăng ký
      for (const [name, moduleFn] of this.modules.entries()) {
        try {
          await moduleFn(ctx);
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

  // Tự khởi chạy khi DOM sẵn sàng
  if (!window.__FBCMF_SKIP_INIT__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => FBCMF.init());
    } else {
      FBCMF.init();
    }
  }

})();
