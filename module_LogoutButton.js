/**
 * Module: LogoutButton
 * Mục đích: Thêm nút đăng xuất nhanh vào giao diện Facebook
 * Phiên bản: 1.0.0
 */
(function() {
  'use strict';
  
  // Đảm bảo namespace FBCMF đã được khởi tạo
  if (!window.FBCMF) {
    console.error('[LogoutButton] FBCMF không được định nghĩa');
    return;
  }
  
  FBCMF.registerModule('LogoutButton', async (ctx) => {
    console.log('[LogoutButton] Khởi tạo với context:', Object.keys(ctx));
    
    const { settings } = ctx;
    let logoutButton = null;
    
    // Thêm nút đăng xuất vào thanh điều hướng
    function addLogoutButton() {
      try {
        if (settings.verbosity === 'verbose') {
          console.log('[LogoutButton] Đang kiểm tra điểm chèn nút đăng xuất...');
        }
        
        // Kiểm tra sự tồn tại của thanh điều hướng
        const navBars = document.querySelectorAll('div[role="banner"] div[role="navigation"]');
        if (navBars.length !== 2) {
          if (settings.verbosity === 'verbose') {
            console.warn('[LogoutButton] Không tìm thấy điểm chèn phù hợp cho nút đăng xuất.');
          }
          return;
        }
        
        // Kiểm tra xem nút đăng xuất đã tồn tại chưa
        if (document.getElementById('fbpLogoutLink')) {
          if (settings.verbosity === 'verbose') {
            console.log('[LogoutButton] Nút đăng xuất đã tồn tại, bỏ qua.');
          }
          return;
        }
        
        // Tạo phần tử nút đăng xuất
        logoutButton = document.createElement('a');
        logoutButton.id = 'fbpLogoutLink';
        logoutButton.title = 'Đăng xuất';
        logoutButton.innerHTML = 'Đăng<br/>xuất';
        logoutButton.href = '#'; // Sử dụng href="#" để tránh lỗi liên kết
        logoutButton.style.cssText = `
          text-decoration: none;
          margin-left: 7px;
          color: var(--primary-text, #ffffff);
          background-color: var(--secondary-button-background, #4e4f50);
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 50%;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        `;
        
        // Chèn nút vào thanh điều hướng
        const targetNav = navBars[1].firstChild?.parentNode;
        if (!targetNav) {
          if (settings.verbosity === 'verbose') {
            console.warn('[LogoutButton] Không tìm thấy parentNode để chèn nút.');
          }
          return;
        }
        
        targetNav.insertBefore(logoutButton, navBars[1].firstChild);
        
        if (settings.verbosity === 'verbose') {
          console.log('[LogoutButton] Đã chèn nút đăng xuất vào thanh điều hướng.');
        }
        
        // Thêm sự kiện click để xử lý đăng xuất
        logoutButton.addEventListener('click', handleLogoutClick, false);
      } catch (error) {
        console.error('[LogoutButton] Lỗi khi thêm nút đăng xuất:', error);
      }
    }
    
    // Xử lý sự kiện click nút đăng xuất
    function handleLogoutClick(e) {
      try {
        e.preventDefault();
        const logoutForm = document.querySelector('form[action^="/logout.php?"]');
        if (logoutForm) {
          // Hiển thị hình ảnh loading
          logoutButton.innerHTML = '<img src="https://www.facebook.com/images/loaders/indicator_blue_small.gif" alt="Đang đăng xuất..." style="width: 16px; height: 16px;" />';
          logoutForm.submit();
          
          if (settings.verbosity === 'verbose') {
            console.log('[LogoutButton] Đã gửi yêu cầu đăng xuất.');
          }
        } else {
          console.warn('[LogoutButton] Không tìm thấy biểu mẫu đăng xuất.');
          logoutButton.innerHTML = 'Lỗi';
        }
      } catch (error) {
        console.error('[LogoutButton] Lỗi khi xử lý sự kiện đăng xuất:', error);
        logoutButton.innerHTML = 'Lỗi';
      }
    }
    
    // Khởi tạo module
    function init() {
      // Thêm nút đăng xuất khi DOM sẵn sàng
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          addLogoutButton();
          // Thử lại sau 7 giây để đảm bảo DOM đã sẵn sàng
          setTimeout(addLogoutButton, 7000);
        });
      } else {
        addLogoutButton();
        // Thử lại sau 7 giây để đảm bảo DOM đã sẵn sàng
        setTimeout(addLogoutButton, 7000);
      }
      
      if (settings.verbosity === 'verbose') {
        console.log('[LogoutButton] Đã khởi tạo module.');
      }
    }
    
    // Hủy module
    function destroy() {
      // Xóa nút đăng xuất
      if (logoutButton) {
        logoutButton.removeEventListener('click', handleLogoutClick, false);
        logoutButton.remove();
        logoutButton = null;
      }
      
      if (settings.verbosity === 'verbose') {
        console.log('[LogoutButton] Đã hủy module.');
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
