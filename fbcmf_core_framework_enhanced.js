/**
 * FBCMF - Facebook Cleaner Modular Framework (Core)
 * Kiến trúc mở rộng (Extensible Architecture) cho các module gắn thêm
 * Phiên bản: 1.2.0 (Fixed & Enhanced)
 */
(function () {
  'use strict';

  // Khởi tạo namespace global
  window.FBCMF = window.FBCMF || {};
  
  // Đảm bảo các thuộc tính cơ bản tồn tại
  window.FBCMF.modules = window.FBCMF.modules || new Map();
  window.FBCMF.settings = window.FBCMF.settings || {};
  window.FBCMF.context = window.FBCMF.context || {};
  window.FBCMF.initialized = window.FBCMF.initialized || false;

  // Mở rộng namespace
  Object.assign(window.FBCMF, {
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
        console.log('[FBCMF] Đang lưu cài đặt:', newSettings);
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
          language: 'vi',
          theme: 'dark' // Thêm cài đặt theme mặc định
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
          language: 'vi',
          theme: 'dark'
        };
        return this.settings;
      }
    },

    // Khởi tạo framework chính
    async init() {
      // Kiểm tra DOM đã sẵn sàng chưa
      if (!document.head || !document.body) {
        console.warn('[FBCMF] DOM chưa sẵn sàng, thử lại sau 1s');
        setTimeout(() => this.init(), 1000);
        return;
      }
      
      // Kiểm tra đã khởi tạo chưa để tránh khởi tạo nhiều lần
      if (this.initialized) {
        console.log('[FBCMF] Framework đã được khởi tạo trước đó.');
        return;
      }
      
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
            console.log(`[FBCMF] Đang khởi tạo core module "${coreName}"...`);
            const result = await this.modules.get(coreName)(this.context);
            // Cập nhật context với kết quả trả về từ module (nếu có)
            if (result && typeof result === 'object') {
              this.context[coreName] = result;
              console.log(`[FBCMF] Đã thêm ${coreName} vào context`);
            }
            console.log(`[FBCMF] ✅ Core module "${coreName}" loaded.`);
          } catch (e) {
            console.error(`[FBCMF] ❌ Core module "${coreName}" failed:`, e);
          }
        } else {
          console.warn(`[FBCMF] Core module "${coreName}" không được tìm thấy.`);
        }
      }
      
      // Sau đó chạy các module còn lại
      for (const [name, moduleFn] of this.modules.entries()) {
        if (!coreModules.includes(name)) {
          try {
            console.log(`[FBCMF] Đang khởi tạo module "${name}"...`);
            const result = await moduleFn(this.context);
            // Cập nhật context với kết quả trả về từ module (nếu có)
            if (result && typeof result === 'object') {
              this.context[name] = result;
              console.log(`[FBCMF] Đã thêm ${name} vào context`);
            }
            console.log(`[FBCMF] ✅ Module "${name}" loaded.`);
          } catch (e) {
            console.error(`[FBCMF] ❌ Module "${name}" failed:`, e);
          }
        }
      }

      // Đánh dấu đã khởi tạo
      this.initialized = true;
      console.log('[FBCMF] ✅ All modules initialized.');
      
      // Kích hoạt sự kiện framework-initialized
      document.dispatchEvent(new CustomEvent('fbcmf:framework-initialized'));
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
      },
      // Thêm các tiện ích DOM mới
      createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        // Thiết lập các thuộc tính
        for (const [key, value] of Object.entries(attributes)) {
          if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
          } else if (key === 'className') {
            element.className = value;
          } else if (key === 'innerHTML') {
            element.innerHTML = value;
          } else if (key === 'textContent') {
            element.textContent = value;
          } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.substring(2).toLowerCase(), value);
          } else {
            element.setAttribute(key, value);
          }
        }
        
        // Thêm các phần tử con
        for (const child of children) {
          if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
          } else if (child instanceof Node) {
            element.appendChild(child);
          }
        }
        
        return element;
      }
    },
    
    // Hàm dọn dẹp feed
    cleanFeed() {
      console.log('[FBCMF] Đang dọn dẹp feed...');
      
      // Kiểm tra MutationObserver đã được khởi tạo chưa
      if (this.context && this.context.MutationObserver && typeof this.context.MutationObserver.processNewPosts === 'function') {
        console.log('[FBCMF] Sử dụng MutationObserver.processNewPosts()');
        this.context.MutationObserver.processNewPosts();
        return true;
      }
      
      // Fallback nếu không có MutationObserver
      if (this.context && this.context.FilterRegistry) {
        console.log('[FBCMF] Fallback: Dọn dẹp thủ công với FilterRegistry');
        const posts = this.DOMUtils.query('div[role="article"], div[role="feed"] > div');
        let hiddenCount = 0;
        
        posts.forEach(post => {
          const reason = this.context.FilterRegistry.apply(post, this.settings);
          if (reason) {
            this.DOMUtils.hideElement(post, reason);
            hiddenCount++;
          }
        });
        
        console.log(`[FBCMF] Đã ẩn ${hiddenCount} bài viết.`);
        return hiddenCount > 0;
      }
      
      console.warn('[FBCMF] Không thể dọn dẹp feed: FilterRegistry không được khởi tạo');
      return false;
    }
  });

  // Tự khởi chạy nếu không phải module riêng lẻ
  if (!window.__FBCMF_SKIP_INIT__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => window.FBCMF.init());
    } else {
      // Nếu DOM đã load xong, khởi tạo ngay
      setTimeout(() => window.FBCMF.init(), 100);
    }
  }

})();
