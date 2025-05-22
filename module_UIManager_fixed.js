/**
 * Module: UIManager
 * Mục đích: Giao diện popup cài đặt bằng tiếng Việt hoặc tiếng Anh
 */
FBCMF.registerModule('UIManager', async ({ settings, saveSettings }) => {
  const lang = settings.language || 'vi';
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
    }
  }[lang];

  const initUI = () => {
    if (!document.head || !document.body) {
      console.error('[UIManager] document.head hoặc document.body không khả dụng');
      return;
    }

    try {
      // Inject Styles
      const style = document.createElement('style');
      style.textContent = `
        #fbcmf-clean-btn {
          position: fixed; bottom: 20px; right: 20px; z-index: 9999;
          background: #1c1e21; color: white; border: none;
          padding: 10px 16px; border-radius: 50px; cursor: pointer;
          font-size: 14px; box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }
        #fbcmf-settings-popup {
          display: none; position: fixed; bottom: 70px; right: 20px; z-index: 10000;
          background: #242526; color: white; padding: 20px; border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5); font-family: sans-serif;
          max-width: 320px;
        }
        #fbcmf-settings-popup input[type="text"],
        #fbcmf-settings-popup select {
          width: 100%; padding: 6px; margin-top: 4px;
          border: none; border-radius: 6px;
          background: #3a3b3c; color: white;
        }
        #fbcmf-settings-popup label {
          display: block; margin: 8px 0;
        }
        #fbcmf-save-btn, #fbcmf-clean-now-btn {
          margin-top: 12px; padding: 8px 12px;
          background: #2d88ff; border: none; border-radius: 6px;
          color: white; cursor: pointer; font-weight: bold;
          margin-right: 8px;
        }
      `;
      document.head.appendChild(style);
      console.log('[UIManager] Đã thêm style vào head');

      // Inject UI
      const btn = document.createElement('button');
      btn.id = 'fbcmf-clean-btn';
      btn.innerText = i18n.cleanButton;
      document.body.appendChild(btn);
      console.log('[UIManager] Đã thêm nút clean-btn');

      const popup = document.createElement('div');
      popup.id = 'fbcmf-settings-popup';
      popup.innerHTML = `
        <h3>${i18n.settingsTitle}</h3>
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
        <label>${i18n.verbosity}:
          <select id="fbcmf-verbosity">
            <option value="normal">Normal</option>
            <option value="verbose">Verbose</option>
          </select>
        </label>
        <button id="fbcmf-save-btn">${i18n.save}</button>
        <button id="fbcmf-clean-now-btn">${i18n.cleanNow}</button>
      `;
      document.body.appendChild(popup);
      console.log('[UIManager] Đã thêm popup');

      // Load settings
      try {
        document.getElementById('fbcmf-blockSponsored').checked = settings.blockSponsored;
        document.getElementById('fbcmf-blockSuggested').checked = settings.blockSuggested;
        document.getElementById('fbcmf-blockReels').checked = settings.blockReels;
        document.getElementById('fbcmf-blockGIFs').checked = settings.blockGIFs;
        document.getElementById('fbcmf-blockKeywords').checked = settings.blockKeywords;
        document.getElementById('fbcmf-keywordInput').value = (settings.blockedKeywords || []).join(', ');
        document.getElementById('fbcmf-expandNewsFeed').checked = settings.expandNewsFeed;
        document.getElementById('fbcmf-language').value = settings.language;
        document.getElementById('fbcmf-verbosity').value = settings.verbosity;
      } catch (e) {
        console.error('[UIManager] Lỗi khi tải cài đặt vào giao diện:', e);
      }

      // Events
      btn.addEventListener('click', () => {
        popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
      });

      document.getElementById('fbcmf-save-btn').addEventListener('click', () => {
        try {
          const newSettings = {
            blockSponsored: document.getElementById('fbcmf-blockSponsored').checked,
            blockSuggested: document.getElementById('fbcmf-blockSuggested').checked,
            blockReels: document.getElementById('fbcmf-blockReels').checked,
            blockGIFs: document.getElementById('fbcmf-blockGIFs').checked,
            blockKeywords: document.getElementById('fbcmf-blockKeywords').checked,
            blockedKeywords: document.getElementById('fbcmf-keywordInput').value.split(',').map(k => k.trim()).filter(Boolean),
            expandNewsFeed: document.getElementById('fbcmf-expandNewsFeed').checked,
            language: document.getElementById('fbcmf-language').value,
            verbosity: document.getElementById('fbcmf-verbosity').value
          };
          ctx.saveSettings(newSettings);
          console.log('[UIManager] Đã lưu cài đặt:', newSettings);
          alert('✅ Cài đặt đã được lưu. Vui lòng tải lại trang để áp dụng.');
          location.reload();
        } catch (e) {
          console.error('[UIManager] Lỗi khi lưu cài đặt:', e);
          alert('❌ Lỗi khi lưu cài đặt: ' + e.message);
        }
      });

      document.getElementById('fbcmf-clean-now-btn').addEventListener('click', () => {
        location.reload();
      });
    } catch (e) {
      console.error('[UIManager] Lỗi khi khởi tạo giao diện:', e);
    }
  };

  // Chờ DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
  } else {
    initUI();
  }

  console.log('[UIManager] ✅ Đã sẵn sàng.');
});
