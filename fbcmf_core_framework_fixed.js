/**
 * FBCMF Core Framework
 * Mục đích: Khởi tạo namespace và các tiện ích cơ bản
 */
(function() {
  'use strict';
  window.FBCMF = window.FBCMF || {};
  FBCMF.modules = new Map();
  FBCMF.registerModule = async (name, moduleFn) => {
    try {
      const ctx = {
        DOMUtils: {
          query: (selector, context = document) => Array.from(context.querySelectorAll(selector)),
          hideElement: (el, reason) => {
            el.style.display = 'none';
            el.dataset.fbcmfReason = reason;
          }
        },
        settings: FBCMF.settings || {},
        saveSettings: FBCMF.saveSettings || (() => {})
      };
      await moduleFn(ctx);
      FBCMF.modules.set(name, moduleFn);
      console.log(`[FBCMF] ✅ Module "${name}" loaded.`);
    } catch (e) {
      console.error(`[FBCMF] ❌ Module "${name}" failed:`, e);
    }
  };
  console.log('[FBCMF] Core framework initialized.');
})();