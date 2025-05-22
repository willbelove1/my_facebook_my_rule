/**
 * FBCMF - Facebook Cleaner Modular Framework (Core)
 * Kiến trúc mở rộng (Extensible Architecture) cho các module gắn thêm
 * Phiên bản: 1.1.1 (Fixed)
 */
(function () {
  'use strict';

  const FBCMF = {
    modules: new Map(),
    settings: {},
    context: {},

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

    saveSettings(newSettings) {
      try {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('fbcmf-settings', JSON.stringify(this.settings));
        if (this.context && this.context.settings) {
          this.context.settings = this.settings;
        }
        if (this.settings.verbosity === 'verbose') {
          console.log('[FBCMF] Đã lưu cài đặt:', this.settings);
        }
        document.dispatchEvent(new CustomEvent('fbcmf:settings-saved', { 
          detail: this.settings 
        }));
        return true;
      } catch (e) {
        console.error('[FBCMF] Lỗi khi lưu cài đặt:', e);
        return false;
      }
    },

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
          language: 'vi',
          theme: 'dark' // Thêm theme mặc định
        };
        this.settings = stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
        if (this.settings.verbosity === 'verbose') {
          console.log('[FBCMF] Đã tải cài đặt:', this.settings);
        }
        return this.settings;
      } catch (e) {
        console.error('[FBCMF] Lỗi khi tải cài đặt:', e);
        this.settings = {
          blockSponsored: true,
          blockSuggested: true,
          blockReels: true,
          blockGIFs: true,
          blockKeywords: false,
          expandNewsFeed: true,
          blockedKeywords: [],
          verbosity: 'normal',
          language: 'vi',
          theme: 'dark'
        };
        return this.settings;
      }
    },

    async init() {
      if (!document.head || !document.body) {
        console.warn('[FBCMF] DOM chưa sẵn sàng, thử lại sau 1s');
        setTimeout(() => this.init(), 1000);
        return;
      }
      console.log('[FBCMF] 🚀 Initializing Core Framework...');
      this.loadSettings();
      this.context = {
        DOMUtils: this.DOMUtils,
        settings: this.settings,
        saveSettings: this.saveSettings.bind(this),
        loadSettings: this.loadSettings.bind(this)
      };
      console.log('[FBCMF] Đã khởi tạo context:', Object.keys(this.context));
      const coreModules = ['FilterRegistry', 'SettingsManager', 'UIManager'];
      for (const coreName of coreModules) {
        if (this.modules.has(coreName)) {
          try {
            const result = await this.modules.get(coreName)(this.context);
            if (result && typeof result === 'object') {
              this.context[coreName] = result;
            }
            console.log(`[FBCMF] ✅ Core module "${coreName}" loaded.`);
          } catch (e) {
            console.error(`[FBCMF] ❌ Core module "${coreName}" failed:`, e);
          }
        }
      }
      for (const [name, moduleFn] of this.modules.entries()) {
        if (!coreModules.includes(name)) {
          try {
            const result = await moduleFn(this.context);
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

  window.FBCMF = FBCMF;

  if (!window.__FBCMF_SKIP_INIT__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => FBCMF.init());
    } else {
      setTimeout(() => FBCMF.init(), 100);
    }
  }
})();
