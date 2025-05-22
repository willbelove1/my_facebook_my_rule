/**
 * Module: CommentsHelper
 * Mục đích: Tự động chuyển sang chế độ xem tất cả bình luận
 * Phiên bản: 1.0.0
 */
(function() {
  'use strict';
  
  // Đảm bảo namespace FBCMF đã được khởi tạo
  if (!window.FBCMF) {
    console.error('[CommentsHelper] FBCMF không được định nghĩa');
    return;
  }
  
  FBCMF.registerModule('CommentsHelper', async (ctx) => {
    console.log('[CommentsHelper] Khởi tạo với context:', Object.keys(ctx));
    
    const { settings } = ctx;
    let observer = null;
    let notifyingTimeout = null;
    
    // Chuỗi ngôn ngữ
    const langs = {
      en: ["Top comments", "Most relevant", "Most applicable", "Most recent", "Newest", "All comments"],
      vi: ["Bình luận hàng đầu", "Liên quan nhất", "Phù hợp nhất", "Mới nhất", "Mới nhất", "Tất cả bình luận"],
    };
    
    // Chuỗi thông báo
    const notificationStr = {
      en: ["Switch to All Comments!", "Switch to Latest Comments!"],
      vi: ["Chuyển sang Tất cả bình luận!", "Chuyển sang Bình luận mới nhất!"],
    };
    
    // Phát hiện ngôn ngữ
    function detectLang() {
      const langAttribute = document.getElementById("facebook")?.getAttribute("lang");
      if (langAttribute === 'vi') {
        return 'vi';
      }
      return 'en'; // Mặc định là tiếng Anh
    }
    
    // Lấy XPath cho nút menu bình luận
    function getMenuButtonXPath() {
      const lang = langs[detectLang()] || langs.en;
      return `//span[not(@style) and (text()='${lang[0]}' or text()='${lang[1]}' or text()='${lang[2]}' or text()='${lang[3]}' or text()='${lang[4]}' or text()='${lang[5]}')]`;
    }
    
    // Đợi phần tử xuất hiện trong DOM
    function waitForElement(xpath, callback, timeout = 3000, intervalTime = 100) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (element) {
          clearInterval(interval);
          callback(element);
        } else if (Date.now() - startTime > timeout) {
          clearInterval(interval);
          if (settings.verbosity === 'verbose') {
            console.warn("[CommentsHelper] Timeout: Element not found for XPath", xpath);
          }
        }
      }, intervalTime);
    }
    
    // Click an phần tử an toàn
    function safeClick(element) {
      try {
        element.click();
      } catch (err) {
        console.error("[CommentsHelper] Error clicking element:", err);
      }
    }
    
    // Hiển thị thông báo cho người dùng
    function notifyUser(reverse = false) {
      if (!settings.notifyComments) return;
      
      const notification = document.createElement("div");
      notification.setAttribute("id", "FBAllCommentsHelperNotification");
      notification.style.position = "fixed";
      notification.style.bottom = "20px";
      notification.style.left = "20px";
      notification.style.backgroundColor = "rgba(0,0,0,1)";
      notification.style.color = "white";
      notification.style.padding = "10px";
      notification.style.borderRadius = "5px";
      notification.style.zIndex = "9999";
      
      const lang = detectLang();
      const notifStrings = notificationStr[lang] || notificationStr.en;
      notification.textContent = reverse ? notifStrings[settings.showAllComments ? 1 : 0] : notifStrings[settings.showAllComments ? 0 : 1];
      
      document.body.appendChild(notification);
      
      if (notifyingTimeout) {
        clearTimeout(notifyingTimeout);
        const existingNotification = document.getElementById("FBAllCommentsHelperNotification");
        if (existingNotification) {
          existingNotification.remove();
        }
      }
      
      notifyingTimeout = setTimeout(() => {
        notification.remove();
        notifyingTimeout = null;
      }, 3000);
    }
    
    // Hiển thị tất cả bình luận
    function showAllComment(reverse = false) {
      waitForElement(
        getMenuButtonXPath(),
        (menuButton) => {
          if (settings.scrollComments) {
            menuButton.scrollIntoView({ behavior: settings.scrollBehavior || "smooth", block: "center" });
          }
          setTimeout(() => {
            safeClick(menuButton);
          }, 100);
          waitForElement(
            "//*[@role='menuitem']",
            (menuItem) => {
              const menuItems = document.querySelectorAll('*[role="menuitem"]');
              if (menuItems.length > 1) {
                safeClick(menuItems[menuItems.length - 1]); // Click "All Comments" (last item)
                notifyUser(reverse);
              }
            }
          );
        }
      );
    }
    
    // Hiển thị bình luận mới nhất
    function showLatestComment(reverse = false) {
      waitForElement(
        getMenuButtonXPath(),
        (menuButton) => {
          if (settings.scrollComments) {
            menuButton.scrollIntoView({ behavior: settings.scrollBehavior || "smooth", block: "center" });
          }
          setTimeout(() => {
            safeClick(menuButton);
          }, 100);
          waitForElement(
            "//*[@role='menuitem']",
            (menuItem) => {
              const menuItems = document.querySelectorAll('*[role="menuitem"]');
              if (menuItems.length > 1) {
                safeClick(menuItems[menuItems.length - 2]); // Click "Latest Comments" (second to last item)
                notifyUser(reverse);
              }
            }
          );
        }
      );
    }
    
    // Xử lý sự kiện click bên ngoài
    function handleClickOutside() {
      if (settings.showAllComments) {
        showAllComment();
      } else {
        showLatestComment();
      }
    }
    
    // Xử lý các hành động người dùng
    function actionParser(e) {
      const actionMap = {
        "dblclick": () => settings.showAllComments ? showAllComment() : showLatestComment(),
        "ctrl+dblclick": (reverse) => !settings.showAllComments ? showAllComment(reverse) : showLatestComment(reverse),
        "Insert": () => settings.showAllComments ? showAllComment() : showLatestComment(),
        "ctrl+Insert": (reverse) => !settings.showAllComments ? showAllComment(reverse) : showLatestComment(reverse),
      };
      
      let action = null;
      if (e.type === "dblclick") {
        action = e.ctrlKey ? "ctrl+dblclick" : "dblclick";
      } else if (e.code === "Insert") {
        action = e.ctrlKey ? "ctrl+Insert" : "Insert";
      }
      
      if (action) {
        const handler = actionMap[action];
        if (handler) {
          handler(action === "ctrl+dblclick" || action === "ctrl+Insert" ? true : false);
        }
      }
    }
    
    // Gắn sự kiện cho các nút bình luận
    function bindCommentButtons() {
      const commentRightBottomBtn = document.querySelectorAll("div[role='button'][tabindex='0'][id^=':']");
      const commentBtn = document.querySelectorAll("span[data-ad-rendering-role='comment_button']");
      
      commentRightBottomBtn.forEach((btn) => {
        btn.addEventListener("click", handleClickOutside);
      });
      commentBtn.forEach((btn) => {
        btn.parentElement.parentElement.parentElement.addEventListener("click", handleClickOutside);
      });
    }
    
    // Hủy sự kiện cho các nút bình luận
    function unbindCommentButtons() {
      const commentRightBottomBtn = document.querySelectorAll("div[role='button'][tabindex='0'][id^=':']");
      const commentBtn = document.querySelectorAll("span[data-ad-rendering-role='comment_button']");
      
      commentRightBottomBtn.forEach((btn) => {
        btn.removeEventListener("click", handleClickOutside);
      });
      commentBtn.forEach((btn) => {
        btn.parentElement.parentElement.parentElement.removeEventListener("click", handleClickOutside);
      });
    }
    
    // Theo dõi thay đổi DOM
    function observeDOM(callback) {
      observer = new MutationObserver((mutations) => {
        mutations.forEach(() => callback());
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // Khởi tạo module
    function init() {
      // Đăng ký các event listener
      document.addEventListener("dblclick", actionParser);
      document.addEventListener("keydown", actionParser);
      
      // Gắn sự kiện cho các nút bình luận
      unbindCommentButtons(); // Hủy các listener hiện có trước để tránh trùng lặp
      if (settings.autoDetectComments) {
        bindCommentButtons();
        observeDOM(bindCommentButtons);
      }
      
      if (settings.verbosity === 'verbose') {
        console.log('[CommentsHelper] Đã khởi tạo module.');
      }
    }
    
    // Hủy module
    function destroy() {
      // Hủy đăng ký các event listener
      document.removeEventListener("dblclick", actionParser);
      document.removeEventListener("keydown", actionParser);
      
      // Hủy sự kiện cho các nút bình luận
      unbindCommentButtons();
      
      // Hủy observer
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      
      if (settings.verbosity === 'verbose') {
        console.log('[CommentsHelper] Đã hủy module.');
      }
    }
    
    // Mở rộng settings mặc định
    const defaultSettings = {
      showAllComments: true,
      autoDetectComments: true,
      notifyComments: true,
      scrollComments: false,
      scrollBehavior: "smooth"
    };
    
    // Cập nhật settings với giá trị mặc định nếu chưa có
    Object.keys(defaultSettings).forEach(key => {
      if (settings[key] === undefined) {
        settings[key] = defaultSettings[key];
      }
    });
    
    // Khởi tạo
    init();
    
    // Trả về API cho context
    return {
      init,
      destroy,
      showAllComment,
      showLatestComment
    };
  });
})();
