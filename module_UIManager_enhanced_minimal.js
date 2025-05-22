/**
 * Module: UIManager
 * Mục đích: Giao diện popup cài đặt bằng tiếng Việt hoặc tiếng Anh
 * Phiên bản: 1.1.0 (Thêm light mode và bật/tắt tất cả)
 */
(function() {
  'use strict';
  if (!window.FBCMF) {
    console.error('[UIManager] FBCMF không được định nghĩa');
    return;
  }
  window.FBCMF.registerModule('UIManager', async ({ settings, saveSettings }) => {
    console.log('[UIManager] Khởi tạo với settings:', settings);
    if (!saveSettings) {
      console.error('[UIManager] saveSettings không được định nghĩa');
      return;
    }
    const lang = settings.language || 'vi';
    const theme = settings.theme || 'dark'; // Thêm theme mặc định
    
    // Bổ sung các chuỗi dịch cho tính năng mới
    const i18n = {
      en: {
        cleanButton: 'Clean My Feed',
        settingsTitle: 'Cleaner Settings',
        save: 'Save Settings',
        cleanNow: 'Clean Now',
        blockSponsored: 'Block Sponsored Posts',
        blockSuggested: 'Block Suggested Posts',
        blockReels: 'Block Reels',
        blockGIFs: 'Block GIFs',
        blockKeywords: 'Block Posts by Keyword',
        keywordPlaceholder: 'e.g. crypto, scam, game',
        expandNewsFeed: 'Expand News Feed Full Width',
        language: 'Language',
        verbosity: 'Log Level',
        // Thêm các chuỗi dịch mới
        theme: 'Theme',
        themeDark: 'Dark',
        themeLight: 'Light',
        toggleAll: 'Toggle All Features',
        enableAll: 'Enable All',
        disableAll: 'Disable All'
      },
      vi: {
        cleanButton: 'Dọn dẹp bảng tin',
        settingsTitle: 'Cài đặt bộ lọc',
        save: 'Lưu cài đặt',
        cleanNow: 'Dọn ngay',
        blockSponsored: 'Chặn bài tài trợ',
        blockSuggested: 'Chặn bài gợi ý',
        blockReels: 'Chặn video Reels',
        blockGIFs: 'Chặn ảnh động GIF',
        blockKeywords: 'Chặn từ khóa',
        keywordPlaceholder: 'vd: crypto, quảng cáo, game',
        expandNewsFeed: 'Mở rộng bài viết toàn khung',
        language: 'Ngôn ngữ',
        verbosity: 'Chi tiết ghi log',
        // Thêm các chuỗi dịch mới
        theme: 'Giao diện',
        themeDark: 'Tối',
        themeLight: 'Sáng',
        toggleAll: 'Bật/tắt tất cả tính năng',
        enableAll: 'Bật tất cả',
        disableAll: 'Tắt tất cả'
      }
    }[lang];
    
    const cleanContent = (content) => {
      return content.replace(/[-\u001F\u007F-\u009F]/g, '').trim();
    };
    
    // Tạo CSS dựa trên theme
    const createStyles = (currentTheme) => {
      // CSS chung cho cả hai theme
      const commonCSS = `
        #fbcmf-clean-btn {
          position: fixed; bottom: 20px; right: 20px; z-index: 9999;
          padding: 10px 16px; border-radius: 50px; cursor: pointer;
          font-size: 14px; transition: all 0.3s ease;
        }
        #fbcmf-clean-btn:hover {
          transform: translateY(-2px);
        }
        #fbcmf-settings-popup {
          display: none; position: fixed; bottom: 70px; right: 20px; z-index: 10000;
          padding: 20px; border-radius: 12px; font-family: sans-serif;
          max-width: 320px; transition: all 0.3s ease;
        }
        #fbcmf-settings-popup h3 {
          margin-top: 0; margin-bottom: 15px; font-size: 18px;
          padding-bottom: 10px;
        }
        #fbcmf-settings-popup input[type="text"],
        #fbcmf-settings-popup select {
          width: 100%; padding: 6px; margin-top: 4px;
          border-radius: 6px;
        }
        #fbcmf-settings-popup label {
          display: block; margin: 8px 0;
        }
        #fbcmf-save-btn, #fbcmf-clean-now-btn, .fbcmf-toggle-btn {
          margin-top: 12px; padding: 8px 12px;
          border: none; border-radius: 6px;
          cursor: pointer; font-weight: bold;
          margin-right: 8px;
          transition: all 0.2s ease;
        }
        #fbcmf-save-btn:hover, #fbcmf-clean-now-btn:hover, .fbcmf-toggle-btn:hover {
          transform: translateY(-2px);
        }
        .fbcmf-toggle-group {
          margin: 15px 0;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
        }
        .fbcmf-button-group {
          display: flex;
          gap: 8px;
          margin-top: 10px;
        }
      `;
      
      // CSS cho dark theme
      const darkCSS = `
        #fbcmf-clean-btn {
          background: #1c1e21; color: white; border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }
        #fbcmf-clean-btn:hover {
          background: #2d88ff;
        }
        #fbcmf-settings-popup {
          background: #242526; color: white;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        #fbcmf-settings-popup h3 {
          border-bottom: 1px solid #3a3b3c;
        }
        #fbcmf-settings-popup input[type="text"],
        #fbcmf-settings-popup select {
          border: none; background: #3a3b3c; color: white;
        }
        #fbcmf-save-btn, #fbcmf-clean-now-btn, .fbcmf-toggle-btn {
          background: #2d88ff; color: white;
        }
        #fbcmf-save-btn:hover, #fbcmf-clean-now-btn:hover, .fbcmf-toggle-btn:hover {
          background: #1b74e4;
        }
        .fbcmf-toggle-btn.disable {
          background: #e41e3f;
        }
        .fbcmf-toggle-btn.disable:hover {
          background: #c01131;
        }
        .fbcmf-toggle-group {
          background: #3a3b3c;
        }
      `;
      
      // CSS cho light theme
      const lightCSS = `
        #fbcmf-clean-btn {
          background: #f0f2f5; color: #1c1e21; border: 1px solid #dadde1;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        #fbcmf-clean-btn:hover {
          background: #e4e6eb;
        }
        #fbcmf-settings-popup {
          background: #ffffff; color: #1c1e21;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border: 1px solid #dadde1;
        }
        #fbcmf-settings-popup h3 {
          border-bottom: 1px solid #dadde1;
        }
        #fbcmf-settings-popup input[type="text"],
        #fbcmf-settings-popup select {
          border: 1px solid #dadde1; background: #f0f2f5; color: #1c1e21;
        }
        #fbcmf-save-btn, #fbcmf-clean-now-btn, .fbcmf-toggle-btn {
          background: #1877f2; color: white;
        }
        #fbcmf-save-btn:hover, #fbcmf-clean-now-btn:hover, .fbcmf-toggle-btn:hover {
          background: #166fe5;
        }
        .fbcmf-toggle-btn.disable {
          background: #e41e3f;
        }
        .fbcmf-toggle-btn.disable:hover {
          background: #c01131;
        }
        .fbcmf-toggle-group {
          background: #f0f2f5;
        }
      `;
      
      return commonCSS + (currentTheme === 'dark' ? darkCSS : lightCSS);
    };
    
    const initUI = async () => {
      if (!document.head || !document.body) {
        console.warn('[UIManager] DOM chưa sẵn sàng, thử lại sau 1s');
        setTimeout(initUI, 1000);
        return;
      }
      try {
        // Thêm style với ID để có thể cập nhật sau này
        const style = document.createElement('style');
        style.id = 'fbcmf-styles';
        style.textContent = cleanContent(createStyles(theme));
        document.head.appendChild(style);
        console.log('[UIManager] Đã thêm style vào head');

        const btn = document.createElement('button');
        btn.id = 'fbcmf-clean-btn';
        btn.innerText = i18n.cleanButton;
        document.body.appendChild(btn);
        console.log('[UIManager] Đã thêm nút clean-btn');

        const popup = document.createElement('div');
        popup.id = 'fbcmf-settings-popup';
        
        // Tạo HTML cho popup với các tính năng mới
        popup.innerHTML = cleanContent(`
          <h3>${i18n.settingsTitle}</h3>
          
          <!-- Thêm phần bật/tắt tất cả tính năng -->
          <div class="fbcmf-toggle-group">
            <div>${i18n.toggleAll}</div>
            <div class="fbcmf-button-group">
              <button id="fbcmf-enable-all" class="fbcmf-toggle-btn">${i18n.enableAll}</button>
              <button id="fbcmf-disable-all" class="fbcmf-toggle-btn disable">${i18n.disableAll}</button>
            </div>
          </div>
          
          <label><input type="checkbox" id="fbcmf-blockSponsored"> ${i18n.blockSponsored}</label>
          <label><input type="checkbox" id="fbcmf-blockSuggested"> ${i18n.blockSuggested}</label>
          <label><input type="checkbox" id="fbcmf-blockReels"> ${i18n.blockReels}</label>
          <label><input type="checkbox" id="fbcmf-blockGIFs"> ${i18n.blockGIFs}</label>
          <label><input type="checkbox" id="fbcmf-blockKeywords"> ${i18n.blockKeywords}</label>
          <label><input type="text" id="fbcmf-keywordInput" placeholder="${i18n.keywordPlaceholder}"></label>
          <label><input type="checkbox" id="fbcmf-expandNewsFeed"> ${i18n.expandNewsFeed}</label>
          <label>${i18n.language}:
            <select id="fbcmf-language">
              <option value="vi" ${lang === 'vi' ? 'selected' : ''}>Tiếng Việt</option>
              <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
            </select>
          </label>
          
          <!-- Thêm tùy chọn theme -->
          <label>${i18n.theme}:
            <select id="fbcmf-theme">
              <option value="dark" ${theme === 'dark' ? 'selected' : ''}>${i18n.themeDark}</option>
              <option value="light" ${theme === 'light' ? 'selected' : ''}>${i18n.themeLight}</option>
            </select>
          </label>
          
          <label>${i18n.verbosity}:
            <select id="fbcmf-verbosity">
              <option value="normal">Normal</option>
              <option value="verbose">Verbose</option>
            </select>
          </label>
          <button id="fbcmf-save-btn">${i18n.save}</button>
          <button id="fbcmf-clean-now-btn">${i18n.cleanNow}</button>
        `);
        document.body.appendChild(popup);
        console.log('[UIManager] Đã thêm popup');

        try {
          const inputs = {
            'fbcmf-blockSponsored': settings.blockSponsored,
            'fbcmf-blockSuggested': settings.blockSuggested,
            'fbcmf-blockReels': settings.blockReels,
            'fbcmf-blockGIFs': settings.blockGIFs,
            'fbcmf-blockKeywords': settings.blockKeywords,
            'fbcmf-expandNewsFeed': settings.expandNewsFeed,
            'fbcmf-language': settings.language || 'vi',
            'fbcmf-verbosity': settings.verbosity || 'normal',
            'fbcmf-keywordInput': (settings.blockedKeywords || []).join(', '),
            'fbcmf-theme': settings.theme || 'dark' // Thêm theme vào inputs
          };
          for (const [id, value] of Object.entries(inputs)) {
            const el = document.getElementById(id);
            if (!el) {
              console.warn(`[UIManager] Không tìm thấy phần tử ${id}`);
              continue;
            }
            if (el.type === 'checkbox') {
              el.checked = !!value;
            } else {
              el.value = value;
            }
          }
          console.log('[UIManager] Đã tải cài đặt vào giao diện');
        } catch (e) {
          console.error('[UIManager] Lỗi khi tải cài đặt vào giao diện:', e);
        }

        const attachEvents = async (attempt = 1, maxAttempts = 10) => {
          try {
            const cleanBtn = document.getElementById('fbcmf-clean-btn');
            const saveBtn = document.getElementById('fbcmf-save-btn');
            const cleanNowBtn = document.getElementById('fbcmf-clean-now-btn');
            // Thêm các phần tử mới
            const enableAllBtn = document.getElementById('fbcmf-enable-all');
            const disableAllBtn = document.getElementById('fbcmf-disable-all');
            const themeSelect = document.getElementById('fbcmf-theme');

            if (!cleanBtn || !saveBtn || !cleanNowBtn || !enableAllBtn || !disableAllBtn || !themeSelect) {
              if (attempt >= maxAttempts) {
                console.error('[UIManager] Không tìm thấy các phần tử sau nhiều lần thử:', {
                  cleanBtn: !!cleanBtn,
                  saveBtn: !!saveBtn,
                  cleanNowBtn: !!cleanNowBtn,
                  enableAllBtn: !!enableAllBtn,
                  disableAllBtn: !!disableAllBtn,
                  themeSelect: !!themeSelect
                });
                return;
              }
              console.warn(`[UIManager] Một số phần tử chưa sẵn sàng, thử lại lần ${attempt + 1}`);
              setTimeout(() => attachEvents(attempt + 1, maxAttempts), 500);
              return;
            }

            cleanBtn.addEventListener('click', () => {
              console.log('[UIManager] Nút clean-btn được nhấn');
              popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
            });

            saveBtn.addEventListener('click', () => {
              console.log('[UIManager] Nút save-btn được nhấn');
              try {
                const newSettings = {
                  blockSponsored: document.getElementById('fbcmf-blockSponsored')?.checked ?? false,
                  blockSuggested: document.getElementById('fbcmf-blockSuggested')?.checked ?? false,
                  blockReels: document.getElementById('fbcmf-blockReels')?.checked ?? false,
                  blockGIFs: document.getElementById('fbcmf-blockGIFs')?.checked ?? false,
                  blockKeywords: document.getElementById('fbcmf-blockKeywords')?.checked ?? false,
                  blockedKeywords: document.getElementById('fbcmf-keywordInput')?.value
                    ?.split(',')
                    .map(k => k.trim())
                    .filter(Boolean) ?? [],
                  expandNewsFeed: document.getElementById('fbcmf-expandNewsFeed')?.checked ?? false,
                  language: document.getElementById('fbcmf-language')?.value ?? 'vi',
                  verbosity: document.getElementById('fbcmf-verbosity')?.value ?? 'normal',
                  theme: document.getElementById('fbcmf-theme')?.value ?? 'dark' // Thêm theme vào settings
                };
                console.log('[UIManager] Cài đặt mới:', newSettings);
                const saved = saveSettings(newSettings);
                if (saved) {
                  console.log('[UIManager] Đã lưu cài đặt:', newSettings);
                  alert('✅ Cài đặt đã được lưu. Vui lòng tải lại trang để áp dụng.');
                  location.reload();
                } else {
                  console.error('[UIManager] Lưu cài đặt thất bại');
                  alert('❌ Lỗi khi lưu cài đặt');
                }
              } catch (e) {
                console.error('[UIManager] Lỗi khi lưu cài đặt:', e);
                alert('❌ Lỗi khi lưu cài đặt: ' + e.message);
              }
            });

            cleanNowBtn.addEventListener('click', () => {
              console.log('[UIManager] Nút clean-now-btn được nhấn');
              try {
                // Sử dụng cleanFeed nếu có, nếu không thì reload
                if (window.FBCMF && typeof window.FBCMF.cleanFeed === 'function') {
                  const result = window.FBCMF.cleanFeed();
                  if (result) {
                    alert('✅ Đã dọn dẹp bảng tin thành công!');
                  } else {
                    console.log('[UIManager] Làm mới trang để áp dụng bộ lọc');
                    location.reload();
                  }
                } else {
                  console.log('[UIManager] Làm mới trang để áp dụng bộ lọc');
                  location.reload();
                }
              } catch (e) {
                console.error('[UIManager] Lỗi khi làm mới trang:', e);
                alert('❌ Lỗi khi làm mới trang: ' + e.message);
              }
            });
            
            // Thêm sự kiện cho nút bật tất cả
            enableAllBtn.addEventListener('click', () => {
              console.log('[UIManager] Nút enable-all được nhấn');
              const featureCheckboxes = [
                'fbcmf-blockSponsored',
                'fbcmf-blockSuggested',
                'fbcmf-blockReels',
                'fbcmf-blockGIFs',
                'fbcmf-blockKeywords',
                'fbcmf-expandNewsFeed'
              ];
              
              featureCheckboxes.forEach(id => {
                const checkbox = document.getElementById(id);
                if (checkbox) {
                  checkbox.checked = true;
                }
              });
            });
            
            // Thêm sự kiện cho nút tắt tất cả
            disableAllBtn.addEventListener('click', () => {
              console.log('[UIManager] Nút disable-all được nhấn');
              const featureCheckboxes = [
                'fbcmf-blockSponsored',
                'fbcmf-blockSuggested',
                'fbcmf-blockReels',
                'fbcmf-blockGIFs',
                'fbcmf-blockKeywords',
                'fbcmf-expandNewsFeed'
              ];
              
              featureCheckboxes.forEach(id => {
                const checkbox = document.getElementById(id);
                if (checkbox) {
                  checkbox.checked = false;
                }
              });
            });
            
            // Thêm sự kiện cho thay đổi theme
            themeSelect.addEventListener('change', () => {
              console.log('[UIManager] Theme được thay đổi');
              const newTheme = themeSelect.value;
              const styleEl = document.getElementById('fbcmf-styles');
              
              if (styleEl) {
                // Cập nhật style theo theme mới
                styleEl.textContent = cleanContent(createStyles(newTheme));
              }
            });

            console.log('[UIManager] Đã gắn sự kiện cho các nút');
          } catch (e) {
            console.error('[UIManager] Lỗi khi gắn sự kiện:', e);
          }
        };

        await attachEvents();
      } catch (e) {
        console.error('[UIManager] Lỗi khi khởi tạo giao diện:', e);
      }
      console.log('[UIManager] ✅ Đã khởi tạo UIManager.');
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initUI);
    } else {
      setTimeout(initUI, 200);
    }
  });
})();
