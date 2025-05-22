/**
 * FBCMF - Facebook Cleaner Modular Framework (Core)
 * Kiến trúc mở rộng (Extensible Architecture) cho các module gắn thêm
 * Phiên bản: 1.1.0 (Fixed)
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
      if (this.settings.verbosity === 'verbose') {
        console.log(`[FBCMF] Module "${name}" đã đăng ký.`);
      }
    },

    // Lưu cài đặt vào localStorage
    saveSettings(newSettings) {
      try {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('fbcmf-settings', JSON.stringify(this.settings));
        
        // Cập nhật context với settings mới
        if (this.context && this.context.settings) {
          this.context.settings = this.settings;
        }
        
        if (this.settings.verbosity === 'verbose') {
          console.log('[FBCMF] Đã lưu cài đặt:', this.settings);
        }
        
        // Kích hoạt sự kiện settings-saved để các module có thể lắng nghe
        document.dispatchEvent(new CustomEvent('fbcmf:settings-saved', { 
          detail: this.settings 
        }));
        
        return true;
      } catch (e) {
        console.error('[FBCMF] Lỗi khi lưu cài đặt:', e);
        return false;
      }
    },

    // Tải cài đặt từ localStorage
    loadSettings() {
      try {
        const stored = localStorage.getItem('fbcmf-settings');
        const defaultSettings = {
          blockSponsored: true,
          blockSuggested: true,
          blockReels: true,
          blockGIFs: true,
          blockKeywords: false,
          expandNewsFeed: true,
          blockedKeywords: [],
          verbosity: 'normal',
          language: 'vi'
        };
        
        this.settings = stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
        
        if (this.settings.verbosity === 'verbose') {
          console.log('[FBCMF] Đã tải cài đặt:', this.settings);
        }
        
        return this.settings;
      } catch (e) {
        console.error('[FBCMF] Lỗi khi tải cài đặt:', e);
        // Fallback về cài đặt mặc định nếu có lỗi
        this.settings = {
          blockSponsored: true,
          blockSuggested: true,
          blockReels: true,
          blockGIFs: true,
          blockKeywords: false,
          expandNewsFeed: true,
          blockedKeywords: [],
          verbosity: 'normal',
          language: 'vi'
        };
        return this.settings;
      }
    },

    // Khởi tạo framework chính
    async init() {
      console.log('[FBCMF] 🚀 Initializing Core Framework...');

      // 1. Tải cài đặt
      this.loadSettings();

      // 2. Khởi tạo ngữ cảnh chung
      this.context = {
        DOMUtils: this.DOMUtils,
        settings: this.settings,
        saveSettings: this.saveSettings.bind(this),
        loadSettings: this.loadSettings.bind(this)
      };
      console.log('[FBCMF] Đã khởi tạo context:', Object.keys(this.context));
      // 3. Chạy từng mô-đun đã đăng ký theo thứ tự
      // Ưu tiên các module core trước
      const coreModules = ['FilterRegistry', 'SettingsManager', 'UIManager'];
      
      // Chạy các module core trước
      for (const coreName of coreModules) {
        if (this.modules.has(coreName)) {
          try {
            const result = await this.modules.get(coreName)(this.context);
            // Cập nhật context với kết quả trả về từ module (nếu có)
            if (result && typeof result === 'object') {
              this.context[coreName] = result;
            }
            console.log(`[FBCMF] ✅ Core module "${coreName}" loaded.`);
          } catch (e) {
            console.error(`[FBCMF] ❌ Core module "${coreName}" failed:`, e);
          }
        }
      }
      
      // Sau đó chạy các module còn lại
      for (const [name, moduleFn] of this.modules.entries()) {
        if (!coreModules.includes(name)) {
          try {
            const result = await moduleFn(this.context);
            // Cập nhật context với kết quả trả về từ module (nếu có)
            if (result && typeof result === 'object') {
              this.context[name] = result;
            }
            console.log(`[FBCMF] ✅ Module "${name}" loaded.`);
          } catch (e) {
            console.error(`[FBCMF] ❌ Module "${name}" failed:`, e);
          }
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
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => FBCMF.init());
    } else {
      // Nếu DOM đã load xong, khởi tạo ngay
      setTimeout(() => FBCMF.init(), 0);
    }
  }

})();
