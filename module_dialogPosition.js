/**
 * Module: dialogPosition
 * Mục đích: Tùy chọn vị trí popup (trái/phải)
 */
(function() {
  'use strict';
  
  // Đảm bảo namespace FBCMF đã được khởi tạo
  window.FBCMF = window.FBCMF || {};
  
  FBCMF.registerModule('dialogPosition', async ({ settings }) => {
    // Mặc định vị trí bên phải nếu không có cài đặt
    const position = settings.dialogPosition || 'right';
    
    // Hàm áp dụng vị trí cho popup
    const applyPosition = () => {
      const popup = document.getElementById('fbcmf-settings-popup');
      const button = document.getElementById('fbcmf-clean-btn');
      
      if (!popup || !button) {
        // Nếu chưa có popup, thử lại sau
        setTimeout(applyPosition, 500);
        return;
      }
      
      // Thiết lập vị trí popup
      if (position === 'left') {
        popup.style.left = '20px';
        popup.style.right = 'auto';
        
        // Di chuyển nút sang trái
        button.style.left = '20px';
        button.style.right = 'auto';
      } else {
        popup.style.right = '20px';
        popup.style.left = 'auto';
        
        // Di chuyển nút sang phải
        button.style.right = '20px';
        button.style.left = 'auto';
      }
      
      if (settings.verbosity === 'verbose') {
        console.log(`[dialogPosition] Đã áp dụng vị trí: ${position}`);
      }
    };
    
    // Lắng nghe sự kiện thay đổi cài đặt
    const listenForSettingsChange = () => {
      // Tạo một MutationObserver để theo dõi thay đổi DOM
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && 
              mutation.addedNodes.length > 0 &&
              Array.from(mutation.addedNodes).some(node => 
                node.id === 'fbcmf-settings-popup' || node.id === 'fbcmf-clean-btn'
              )) {
            applyPosition();
          }
        });
      });
      
      // Bắt đầu theo dõi thay đổi trong body
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Lắng nghe sự kiện lưu cài đặt
      document.addEventListener('fbcmf:settings-saved', (e) => {
        const newSettings = e.detail;
        if (newSettings && newSettings.dialogPosition) {
          // Cập nhật vị trí nếu có thay đổi
          if (newSettings.dialogPosition !== position) {
            applyPosition();
          }
        }
      });
    };
    
    // Khởi tạo module
    const init = () => {
      // Đợi DOM load xong
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          applyPosition();
          listenForSettingsChange();
        });
      } else {
        applyPosition();
        listenForSettingsChange();
      }
    };
    
    // Khởi chạy
    init();
    
    if (settings.verbosity === 'verbose') {
      console.log(`[dialogPosition] Module đã được khởi tạo với vị trí: ${position}`);
    }
  });
})();
