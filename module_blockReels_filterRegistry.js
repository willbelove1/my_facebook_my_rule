/**
 * Module: blockReels (Filter Registry)
 * Mục đích: Đăng ký bộ lọc video Reels vào FilterRegistry
 */
(function() {
  'use strict';
  
  // Đảm bảo namespace FBCMF đã được khởi tạo
  window.FBCMF = window.FBCMF || {};
  
  FBCMF.registerModule('blockReels', async ({ DOMUtils, settings, FilterRegistry }) => {
    if (!settings.blockReels) return;
  
    FilterRegistry.register('blockReels', (post) => {
      // Kiểm tra có thẻ video
      const hasVideo = DOMUtils.query('video', post).length > 0;
      
      // Kiểm tra thuộc tính data-video-id
      const hasVideoId = post.querySelector('[data-video-id]') !== null;
      
      // Kiểm tra URL chứa /reel/ hoặc /reels/
      const hasReelUrl = post.innerHTML.includes('/reel/') || post.innerHTML.includes('/reels/');
      
      // Kiểm tra text chứa "Reels"
      const spans = DOMUtils.query('span', post);
      const hasReelText = spans.some(span => 
        /\breels\b/i.test(span.textContent)
      );
      
      if (hasVideo || hasVideoId || hasReelUrl || hasReelText) {
        return 'Reels';
      }
      
      return '';
    });
  
    if (settings.verbosity === 'verbose') {
      console.log('[blockReels] Bộ lọc đã được đăng ký.');
    }
  });
})();
