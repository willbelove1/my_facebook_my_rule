/**
 * Module: ReelVideoControls
 * Mục đích: Thêm điều khiển cho video Reels trên Facebook
 * Phiên bản: 1.0.0
 */
(function() {
  'use strict';
  
  // Đảm bảo namespace FBCMF đã được khởi tạo
  if (!window.FBCMF) {
    console.error('[ReelVideoControls] FBCMF không được định nghĩa');
    return;
  }
  
  FBCMF.registerModule('ReelVideoControls', async (ctx) => {
    console.log('[ReelVideoControls] Khởi tạo với context:', Object.keys(ctx));
    
    const { settings } = ctx;
    let resizeObserver = null;
    let cssAdded = false;
    
    // Thêm CSS cần thiết
    function addCSS() {
      if (cssAdded) return;
      
      const style = document.createElement('style');
      style.textContent = `
        .frvc-div-might-empty:empty {
          display: none;
        }
        .frvc-cursor-passthrough {
          pointer-events: none;
        }
        .frvc-cursor-passthrough [role], .frvc-cursor-passthrough [tabindex] {
          pointer-events: initial;
        }
      `;
      
      document.head.appendChild(style);
      cssAdded = true;
      
      if (settings.verbosity === 'verbose') {
        console.log('[ReelVideoControls] Đã thêm CSS.');
      }
    }
    
    // Xử lý sự kiện khi video bắt đầu phát
    function handlePlayEvent(evt) {
      const target = (evt || 0).target;
      
      if (!(target instanceof HTMLVideoElement)) return;
      if (target.hasAttribute('controls')) return;
      if (location.href.indexOf('reel') < 0) return;
      
      const buttonLayer = target.closest('div[class][role="button"][tabindex], div[role="main"]');
      if (!buttonLayer) return;
      
      target.setAttribute('controls', '');
      addCSS();
      
      setTimeout(() => {
        Object.assign(target.style, {
          'position': 'relative',
          'zIndex': 999,
          'pointerEvents': 'all',
          'height': 'calc(100% - var(--frvc-reel-control-height))'
        });
        
        let arr = [...buttonLayer.querySelectorAll('.x10l6tqk.x13vifvy:not(.x1m3v4wt)')].filter(elm => !elm.contains(target));
        
        const clickable = buttonLayer.querySelectorAll('a[role="link"][href]');
        const clickableHolder = [...new Set([...clickable].map(e => {
          do {
            if (arr.includes(e.parentNode)) return e;
          } while ((e = e.parentNode) instanceof HTMLElement);
          return null;
        }))].filter(e => !!e);
        
        for (const s of arr) {
          Object.assign(s.style, {
            'pointerEvents': 'none'
          });
          s.classList.add('frvc-cursor-passthrough');
        }
        
        for (const s of clickable) {
          Object.assign(s.style, {
            'pointerEvents': 'initial'
          });
        }
        
        const videoElmBRect = target.getBoundingClientRect();
        let p = null;
        for (const s of clickableHolder) {
          const clickableHolderBRect = s.getBoundingClientRect();
          if (p === null && 
              clickableHolderBRect.bottom === clickableHolderBRect.bottom && 
              clickableHolderBRect.top > videoElmBRect.top && 
              clickableHolderBRect.left === clickableHolderBRect.left && 
              clickableHolderBRect.right === clickableHolderBRect.right) {
            p = s;
          }
          
          Object.assign(s.style, {
            'pointerEvents': 'initial',
            'height': 'auto',
            'boxSizing': 'border-box',
            'paddingTop': '16px'
          });
        }
        
        if (p) {
          addCSS();
          for (const s of p.querySelectorAll('div[class]:empty')) {
            s.classList.add('frvc-div-might-empty');
          }
          
          if (resizeObserver) {
            resizeObserver.disconnect();
          }
          
          resizeObserver.observe(p);
        }
      }, 1);
    }
    
    // Khởi tạo module
    function init() {
      // Khởi tạo ResizeObserver
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.height > 0) {
            document.documentElement.style.setProperty('--frvc-reel-control-height', entry.contentRect.height + 'px');
          }
        }
      });
      
      // Đăng ký event listener
      document.addEventListener('play', handlePlayEvent, true);
      
      if (settings.verbosity === 'verbose') {
        console.log('[ReelVideoControls] Đã khởi tạo module.');
      }
    }
    
    // Hủy module
    function destroy() {
      // Hủy đăng ký event listener
      document.removeEventListener('play', handlePlayEvent, true);
      
      // Hủy ResizeObserver
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      
      if (settings.verbosity === 'verbose') {
        console.log('[ReelVideoControls] Đã hủy module.');
      }
    }
    
    // Khởi tạo
    init();
    
    // Trả về API cho context
    return {
      init,
      destroy
    };
  });
})();
