/**
 * Module: UIManager
 * Mục đích: Giao diện popup cài đặt bằng tiếng Việt hoặc tiếng Anh
 * Phiên bản: 2.0.1 (Fixed for stability)
 */
(function() {
  'use strict';
  
  if (!window.FBCMF) {
    console.error('[UIManager] FBCMF không được định nghĩa');
    return;
  }
  
  window.FBCMF.registerModule('UIManager', async (ctx) => {
    console.log('[UIManager] Khởi tạo với context:', Object.keys(ctx));
    
    const { settings, saveSettings, DOMUtils } = ctx;
    
    if (!saveSettings) {
      console.error('[UIManager] saveSettings không được định nghĩa trong context');
      return;
    }
    
    const lang = settings.language || 'vi';
    const theme = settings.theme || 'dark';
    
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
        theme: 'Theme',
        themeDark: 'Dark',
        themeLight: 'Light',
        toggleAll: 'Toggle All Features',
        enableAll: 'Enable All',
        disableAll: 'Disable All',
        saveSuccess: '✅ Settings saved. Reloading...',
        saveError: '❌ Error saving settings: ',
        cleanSuccess: '✅ Feed cleaned successfully!',
        cleanError: '❌ Error cleaning feed: '
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
        theme: 'Giao diện',
        themeDark: 'Tối',
        themeLight: 'Sáng',
        toggleAll: 'Bật/tắt tất cả tính năng',
        enableAll: 'Bật tất cả',
        disableAll: 'Tắt tất cả',
        saveSuccess: '✅ Đã lưu cài đặt. Đang tải lại...',
        saveError: '❌ Lỗi khi lưu cài đặt: ',
        cleanSuccess: '✅ Đã dọn dẹp bảng tin thành công!',
        cleanError: '❌ Lỗi khi dọn dẹp bảng tin: '
      }
    }[lang];
    
    const cleanContent = (content) => {
      return content.replace(/[-\u001F\u007F-\u009F]/g, '').trim();
    };
    
    const createStyles = (selectedTheme = theme) => {
      const darkTheme = `
        #fbcmf-clean-btn {
          position: fixed; bottom: 20px; right: 20px; z-index: 9999;
          background: #1c1e21; color: white; border: none;
          padding: 10px 16px; border-radius: 50px; cursor: pointer;
          font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          transition: all 0.3s ease;
        }
        #fbcmf-clean-btn:hover {
          background: #2d88ff;
          transform: translateY(-2px);
        }
        #fbcmf-settings-popup {
          display: none; position: fixed; bottom: 70px; right: 20px; z-index: 10000;
          background: #242526; color: white; padding: 20px; border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5); font-family: sans-serif;
          max-width: 320px; transition: all 0.3s ease;
        }
        #fbcmf-settings-popup h3 {
          margin-top: 0; margin-bottom: 15px; font-size: 18px;
          border-bottom: 1px solid #3a3b3c; padding-bottom: 10px;
        }
        #fbcmf-settings-popup input[type="text"],
        #fbcmf-settings-popup select {
          width: 100%; padding: 8px; margin-top: 4px;
          border: none; border-radius: 6px;
          background: #3a3b3c; color: white;
          transition: all 0.2s ease;
        }
        #fbcmf-settings-popup input[type="text"]:focus,
        #fbcmf-settings-popup select:focus {
          background: #4a4b4c;
          outline: none;
          box-shadow: 0 0 0 2px rgba(45, 136, 255, 0.5);
        }
        #fbcmf-settings-popup label {
          display: block; margin: 10px 0; font-size: 14px;
        }
        #fbcmf-settings-popup .toggle-group {
          margin: 15px 0; padding: 10px;
          background: #3a3b3c; border-radius: 8px; text-align: center;
        }
        #fbcmf-settings-popup .button-group {
          display: flex; gap: 8px; margin-top: 15px;
        }
        #fbcmf-save-btn, #fbcmf-clean-now-btn, .fbcmf-toggle-btn {
          padding: 8px 12px; background: #2d88ff; border: none;
          border-radius: 6px; color: white; cursor: pointer; font-weight: bold;
          transition: all 0.2s ease; flex: 1;
        }
        #fbcmf-save-btn:hover, #fbcmf-clean-now-btn:hover, .fbcmf-toggle-btn:hover {
          background: #1b74e4; transform: translateY(-2px);
        }
        .fbcmf-toggle-btn.disable {
          background: #e41e3f;
        }
        .fbcmf-toggle-btn.disable:hover {
          background: #c01131;
        }
        .fbcmf-checkbox-wrapper {
          display: flex; align-items: center; margin: 8px 0;
        }
        .fbcmf-checkbox-wrapper input[type="checkbox"] {
          margin-right: 8px; width: 16px; height: 16px;
        }
      `;
      
      const lightTheme = `
        #fbcmf-clean-btn {
          position: fixed; bottom: 20px; right: 20px; z-index: 9999;
          background: #f0f2f5; color: #1c1e21; border: 1px solid #dadde1;
          padding: 10px 16px; border-radius: 50px; cursor: pointer;
          font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        #fbcmf-clean-btn:hover {
          background: #e4e6eb;
          transform: translateY(-2px);
        }
        #fbcmf-settings-popup {
          display: none; position: fixed; bottom: 70px; right: 20px; z-index: 10000;
          background: #ffffff; color: #1c1e21; padding: 20px; border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15); font-family: sans-serif;
          max-width: 320px; transition: all 0.3s ease; border: 1px solid #dadde1;
        }
        #fbcmf-settings-popup h3 {
          margin-top: 0; margin-bottom: 15px; font-size: 18px;
          border-bottom: 1px solid #dadde1; padding-bottom: 10px;
        }
        #fbcmf-settings-popup input[type="text"],
        #fbcmf-settings-popup select {
          width: 100%; padding: 8px; margin-top: 4px;
          border: 1px solid #dadde1; border-radius: 6px;
          background: #f0f2f5; color: #1c1e21; transition: all 0.2s ease;
        }
        #fbcmf-settings-popup input[type="text"]:focus,
        #fbcmf-settings-popup select:focus {
          background: #ffffff; outline: none;
          box-shadow: 0 0 0 2px rgba(45, 136, 255, 0.5);
        }
        #fbcmf-settings-popup label {
          display: block; margin: 10px 0; font-size: 14px;
        }
        #fbcmf-settings-popup .toggle-group {
          margin: 15px 0; padding: 10px;
          background: #f0f2f5; border-radius: 8px; text-align: center;
        }
        #fbcmf-settings-popup .button-group {
          display: flex; gap: 8px; margin-top: 15px;
        }
        #fbcmf-save-btn, #fbcmf-clean-now-btn, .fbcmf-toggle-btn {
          padding: 8px 12px; background: #1877f2; border: none;
          border-radius: 6px; color: white; cursor: pointer; font-weight: bold;
          transition: all 0.2s ease; flex: 1;
        }
        #fbcmf-save-btn:hover, #fbcmf-clean-now-btn:hover, .fbcmf-toggle-btn:hover {
          background: #166fe5; transform: translateY(-2px);
        }
        .fbcmf-toggle-btn.disable {
          background: #e41e3f;
        }
        .fbcmf-toggle-btn.disable:hover {
          background: #c01131;
        }
        .fbcmf-checkbox-wrapper {
          display: flex; align-items: center; margin: 8px 0;
        }
        .fbcmf-checkbox-wrapper input[type="checkbox"] {
          margin-right: 8px; width: 16px; height: 16px;
        }
      `;
      
      return selectedTheme === 'dark' ? darkTheme : lightTheme;
    };
    
    const saveCurrentSettings = () => {
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
          theme: document.getElementById('fbcmf-theme')?.value ?? 'dark',
          verbosity: document.getElementById('fbcmf-verbosity')?.value ?? 'normal'
        };
        console.log('[UIManager] Cài đặt mới:', newSettings);
        const saved = saveSettings(newSettings);
        if (saved) {
          console.log('[UIManager] Đã lưu cài đặt:', newSettings);
          return true;
        } else {
          console.error('[UIManager] Lưu cài đặt thất bại');
          return false;
        }
      } catch (e) {
        console.error('[UIManager] Lỗi khi lưu cài đặt:', e);
        return false;
      }
    };
    
    const initUI = async () => {
      if (!document.head || !document.body) {
        console.warn('[UIManager] DOM chưa sẵn sàng, thử lại sau 1s');
        setTimeout(initUI, 1000);
        return;
      }
      
      try {
        const style = document.createElement('style');
        style.id = 'fbcmf-styles';
        style.textContent = cleanContent(createStyles());
        document.head.appendChild(style);
        console.log('[UIManager] Đã thêm style vào head');

        const btn = document.createElement('button');
        btn.id = 'fbcmf-clean-btn';
        btn.innerText = i18n.cleanButton;
        document.body.appendChild(btn);
        console.log('[UIManager] Đã thêm nút clean-btn');

        const popup = document.createElement('div');
        popup.id = 'fbcmf-settings-popup';
        popup.innerHTML = cleanContent(`
          <h3>${i18n.settingsTitle}</h3>
          <div class="toggle-group">
            <div>${i18n.toggleAll}</div>
            <div class="button-group">
              <button id="fbcmf-enable-all" class="fbcmf-toggle-btn">${i18n.enableAll}</button>
              <button id="fbcmf-disable-all" class="fbcmf-toggle-btn disable">${i18n.disableAll}</button>
            </div>
          </div>
          <div class="fbcmf-checkbox-wrapper">
            <input type="checkbox" id="fbcmf-blockSponsored">
            <label for="fbcmf-blockSponsored">${i18n.blockSponsored}</label>
          </div>
          <div class="fbcmf-checkbox-wrapper">
            <input type="checkbox" id="fbcmf-blockSuggested">
            <label for="fbcmf-blockSuggested">${i18n.blockSuggested}</label>
          </div>
          <div class="fbcmf-checkbox-wrapper">
            <input type="checkbox" id="fbcmf-blockReels">
            <label for="fbcmf-blockReels">${i18n.blockReels}</label>
          </div>
          <div class="fbcmf-checkbox-wrapper">
            <input type="checkbox" id="fbcmf-blockGIFs">
            <label for="fbcmf-blockGIFs">${i18n.blockGIFs}</label>
          </div>
          <div class="fbcmf-checkbox-wrapper">
            <input type="checkbox" id="fbcmf-blockKeywords">
            <label for="fbcmf-blockKeywords">${i18n.blockKeywords}</label>
          </div>
          <label>
            <input type="text" id="fbcmf-keywordInput" placeholder="${i18n.keywordPlaceholder}">
          </label>
          <div class="fbcmf-checkbox-wrapper">
            <input type="checkbox" id="fbcmf-expandNewsFeed">
            <label for="fbcmf-expandNewsFeed">${i18n.expandNewsFeed}</label>
          </div>
          <label>${i18n.language}:
            <select id="fbcmf-language">
              <option value="vi" ${lang === 'vi' ? 'selected' : ''}>Tiếng Việt</option>
              <option value="en" ${lang === 'en' ? 'selected' : ''}>English</option>
            </select>
          </label>
          <label>${i18n.theme}:
            <select id="fbcmf-theme">
              <option value="dark" ${theme === 'dark' ? 'selected' : ''}>${i18n.themeDark}</option>
              <option value="light" ${theme === 'light' ? 'selected' : ''}>${i18n.themeLight}</option>
            </select>
          </label>
          <label>${i18n.verbosity}:
            <select id="fbcmf-verbosity">
              <option value="normal" ${settings.verbosity === 'normal' ? 'selected' : ''}>Normal</option>
              <option value="verbose" ${settings.verbosity === 'verbose' ? 'selected' : ''}>Verbose</option>
            </select>
          </label>
          <div class="button-group">
            <button id="fbcmf-save-btn">${i18n.save}</button>
            <button id="fbcmf-clean-now-btn">${i18n.cleanNow}</button>
          </div>
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
            'fbcmf-theme': settings.theme || 'dark',
            'fbcmf-verbosity': settings.verbosity || 'normal',
            'fbcmf-keywordInput': (settings.blockedKeywords || []).join(', ')
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

        const attachEvents = async () => {
          try {
            const cleanBtn = document.getElementById('fbcmf-clean-btn');
            const saveBtn = document.getElementById('fbcmf-save-btn');
            const cleanNowBtn = document.getElementById('fbcmf-clean-now-btn');
            const enableAllBtn = document.getElementById('fbcmf-enable-all');
            const disableAllBtn = document.getElementById('fbcmf-disable-all');
            const themeSelect = document.getElementById('fbcmf-theme');

            if (cleanBtn) {
              cleanBtn.addEventListener('click', () => {
                console.log('[UIManager] Nút clean-btn được nhấn');
                popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
              });
            } else {
              console.warn('[UIManager] Không tìm thấy cleanBtn');
            }

            if (saveBtn) {
              saveBtn.addEventListener('click', () => {
                console.log('[UIManager] Nút save-btn được nhấn');
                const saved = saveCurrentSettings();
                if (saved) {
                  alert(i18n.saveSuccess);
                  location.reload();
                } else {
                  alert(i18n.saveError);
                }
              });
            } else {
              console.warn('[UIManager] Không tìm thấy saveBtn');
            }

            if (cleanNowBtn) {
              cleanNowBtn.addEventListener('click', () => {
                console.log('[UIManager] Nút clean-now-btn được nhấn');
                try {
                  if (ctx.FilterRegistry && typeof ctx.FilterRegistry.apply === 'function') {
                    const posts = DOMUtils.query('div[role="article"]');
                    let cleaned = 0;
                    posts.forEach(post => {
                      const reason = ctx.FilterRegistry.apply(post, settings);
                      if (reason) {
                        DOMUtils.hideElement(post, reason);
                        cleaned++;
                      }
                    });
                    alert(i18n.cleanSuccess + ` (${cleaned} posts hidden)`);
                  } else {
                    console.warn('[UIManager] FilterRegistry không khả dụng, làm mới trang');
                    alert(i18n.cleanError + 'FilterRegistry not available');
                    location.reload();
                  }
                } catch (e) {
                  console.error('[UIManager] Lỗi khi dọn dẹp bảng tin:', e);
                  alert(i18n.cleanError + e.message);
                }
              });
            } else {
              console.warn('[UIManager] Không tìm thấy cleanNowBtn');
            }

            if (enableAllBtn) {
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
                  if (checkbox) checkbox.checked = true;
                });
                const saved = saveCurrentSettings();
                if (saved) alert(i18n.saveSuccess);
                else alert(i18n.saveError);
              });
            } else {
              console.warn('[UIManager] Không tìm thấy enableAllBtn');
            }

            if (disableAllBtn) {
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
                  if (checkbox) checkbox.checked = false;
                });
                const saved = saveCurrentSettings();
                if (saved) alert(i18n.saveSuccess);
                else alert(i18n.saveError);
              });
            } else {
              console.warn('[UIManager] Không tìm thấy disableAllBtn');
            }

            if (themeSelect) {
              themeSelect.addEventListener('change', () => {
                console.log('[UIManager] Theme được thay đổi');
                const newTheme = themeSelect.value;
                const styleEl = document.getElementById('fbcmf-styles');
                if (styleEl) {
                  styleEl.textContent = cleanContent(createStyles(newTheme));
                }
                const saved = saveCurrentSettings();
                if (saved) alert(i18n.saveSuccess);
                else alert(i18n.saveError);
              });
            } else {
              console.warn('[UIManager] Không tìm thấy themeSelect');
            }

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
    
    return {
      updateTheme: (newTheme) => {
        const styleEl = document.getElementById('fbcmf-styles');
        if (styleEl) {
          styleEl.textContent = cleanContent(createStyles(newTheme));
        }
      }
    };
  });
})();
