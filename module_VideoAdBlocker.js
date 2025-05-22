/**
 * Module: VideoAdBlocker
 * Mục đích: Chặn quảng cáo video trên Facebook
 * Phiên bản: 1.0.0
 */
(function() {
  'use strict';
  
  // Đảm bảo namespace FBCMF đã được khởi tạo
  if (!window.FBCMF) {
    console.error('[VideoAdBlocker] FBCMF không được định nghĩa');
    return;
  }
  
  FBCMF.registerModule('VideoAdBlocker', async (ctx) => {
    console.log('[VideoAdBlocker] Khởi tạo với context:', Object.keys(ctx));
    
    const { settings } = ctx;
    
    // Xử lý sự kiện khi video bắt đầu phát
    function handlePlayingEvent(event) {
      try {
        // Ngăn sự kiện lan truyền để tránh xung đột với các hàm xử lý khác
        event.stopImmediatePropagation();

        // Tìm phần tử cần ẩn (lớp phủ quảng cáo hoặc tương tự)
        const overlayElement = findOverlayElement(event.target);
        if (overlayElement) {
          overlayElement.setAttribute('hidden', 'hidden');
          if (settings.verbosity === 'verbose') {
            console.log('[VideoAdBlocker] Đã ẩn lớp phủ quảng cáo khi video phát.');
          }
        } else if (settings.verbosity === 'verbose') {
          console.warn('[VideoAdBlocker] Không tìm thấy phần tử lớp phủ để ẩn.');
        }
      } catch (error) {
        console.error('[VideoAdBlocker] Lỗi khi xử lý sự kiện "playing":', error);
      }
    }
    
    // Xử lý sự kiện khi video kết thúc
    function handleEndedEvent(event) {
      try {
        // Ngăn sự kiện lan truyền để tránh xung đột
        event.stopImmediatePropagation();

        // Tìm phần tử lớp phủ để khôi phục
        const overlayElement = findOverlayElement(event.target);
        if (overlayElement) {
          overlayElement.removeAttribute('hidden');
          if (settings.verbosity === 'verbose') {
            console.log('[VideoAdBlocker] Đã khôi phục lớp phủ video khi video kết thúc.');
          }
        } else if (settings.verbosity === 'verbose') {
          console.warn('[VideoAdBlocker] Không tìm thấy phần tử lớp phủ để khôi phục.');
        }
      } catch (error) {
        console.error('[VideoAdBlocker] Lỗi khi xử lý sự kiện "ended":', error);
      }
    }
    
    // Tìm phần tử lớp phủ từ phần tử video
    function findOverlayElement(videoElement) {
      try {
        // Duyệt qua các cấp parent để tìm phần tử lớp phủ
        let currentElement = videoElement;
        for (let i = 0; i < 8; i++) {
          if (!currentElement.parentNode) return null;
          currentElement = currentElement.parentNode;
        }
        // Truy cập vào phần tử con cụ thể chứa lớp phủ
        return currentElement.childNodes[1]?.childNodes[0]?.childNodes[0] || null;
      } catch (error) {
        console.error('[VideoAdBlocker] Lỗi khi tìm phần tử lớp phủ:', error);
        return null;
      }
    }
    
    // Khởi tạo module
    function init() {
      // Đăng ký các event listener
      window.addEventListener('playing', handlePlayingEvent, true);
      window.addEventListener('ended', handleEndedEvent, true);
      
      if (settings.verbosity === 'verbose') {
        console.log('[VideoAdBlocker] Đã đăng ký các event listener.');
      }
    }
    
    // Hủy module
    function destroy() {
      // Hủy đăng ký các event listener
      window.removeEventListener('playing', handlePlayingEvent, true);
      window.removeEventListener('ended', handleEndedEvent, true);
      
      if (settings.verbosity === 'verbose') {
        console.log('[VideoAdBlocker] Đã hủy đăng ký các event listener.');
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
