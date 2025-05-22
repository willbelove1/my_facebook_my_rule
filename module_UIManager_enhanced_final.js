/**
 * Module: UIManager (Nâng cấp)
 * Mục đích: Quản lý giao diện người dùng, thêm button cài đặt nâng cao
 * Phiên bản: 2.0.0
 */
(function() {
  'use strict';
  
  // Đảm bảo namespace FBCMF đã được khởi tạo
  window.FBCMF = window.FBCMF || {};
  
  FBCMF.registerModule = FBCMF.registerModule || function(name, initFn) {
    if (!FBCMF.modules) FBCMF.modules = {};
    FBCMF.modules[name] = initFn;
  };
  
  FBCMF.registerModule('UIManager', async (ctx) => {
    console.log('[UIManager] Khởi tạo với context:', Object.keys(ctx));
    
    // Tham chiếu đến các phần tử UI
    let settingsPopup = null;
    let settingsButton = null;
    let advancedSettingsButton = null;
    let advancedSettingsPanel = null;
    let themeSelector = null;
    let currentTheme = 'dark';
    
    // Chuỗi ngôn ngữ
    const LABELS = {
      en: {
        settings: "Settings",
        cleanNow: "Clean Feed Now",
        advancedSettings: "Advanced Settings",
        saveSettings: "Save Settings",
        enableAll: "Enable All",
        disableAll: "Disable All",
        blockSponsored: "Block sponsored posts",
        blockSuggested: "Block suggested posts",
        blockReels: "Block Reels videos",
        blockGIFs: "Block GIFs",
        blockKeywords: "Block posts with keywords",
        expandNewsFeed: "Expand news feed width",
        hideAnonymous: "Hide anonymous members",
        autoSortChrono: "Auto sort by chronological order",
        showAllComments: "Show all comments by default",
        autoDetectComments: "Auto detect comments",
        notifyComments: "Notify after comment action",
        scrollComments: "Enable scroll effect for comments",
        autoSuggestKeywords: "Auto suggest keywords with AI",
        keywordsToBlock: "Keywords to block (comma separated)",
        language: "Language",
        theme: "Theme",
        dark: "Dark",
        light: "Light",
        verbosity: "Log level",
        minimal: "Minimal",
        verbose: "Verbose",
        geminiApiKey: "Gemini API Key",
        suggestKeywords: "Suggest Keywords with AI",
        settingsSaved: "✅ Settings saved. Please reload the page to apply.",
        settingsError: "❌ Error saving settings: "
      },
      vi: {
        settings: "Cài đặt",
        cleanNow: "Dọn bảng tin ngay",
        advancedSettings: "Cài đặt nâng cao",
        saveSettings: "Lưu cài đặt",
        enableAll: "Bật tất cả",
        disableAll: "Tắt tất cả",
        blockSponsored: "Chặn bài được tài trợ",
        blockSuggested: "Chặn bài gợi ý",
        blockReels: "Chặn video Reels",
        blockGIFs: "Chặn GIFs",
        blockKeywords: "Chặn bài có từ khóa",
        expandNewsFeed: "Mở rộng khung bài viết",
        hideAnonymous: "Ẩn thành viên ẩn danh",
        autoSortChrono: "Tự động sắp xếp theo thời gian",
        showAllComments: "Hiện tất cả bình luận mặc định",
        autoDetectComments: "Tự động phát hiện bình luận",
        notifyComments: "Thông báo sau thao tác bình luận",
        scrollComments: "Bật hiệu ứng cuộn cho bình luận",
        autoSuggestKeywords: "Tự động gợi ý từ khóa bằng AI",
        keywordsToBlock: "Từ khóa chặn (phân cách bằng dấu phẩy)",
        language: "Ngôn ngữ",
        theme: "Giao diện",
        dark: "Tối",
        light: "Sáng",
        verbosity: "Mức độ log",
        minimal: "Tối thiểu",
        verbose: "Chi tiết",
        geminiApiKey: "API Key Gemini",
        suggestKeywords: "Gợi ý từ khóa bằng AI",
        settingsSaved: "✅ Cài đặt đã được lưu. Vui lòng tải lại trang để áp dụng.",
        settingsError: "❌ Lỗi khi lưu cài đặt: "
      }
    };
    
    // CSS cho popup
    const darkThemeCSS = `
      #fbcmf-settings-popup {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #242526;
        color: #e4e6eb;
        border-radius: 8px;
        padding: 15px;
        width: 300px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 9999;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        border: 1px solid #3e4042;
      }
      #fbcmf-settings-popup h3 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 18px;
        border-bottom: 1px solid #3e4042;
        padding-bottom: 8px;
      }
      #fbcmf-settings-popup label {
        display: block;
        margin-bottom: 10px;
        font-size: 14px;
      }
      #fbcmf-settings-popup input[type="checkbox"] {
        margin-right: 8px;
        vertical-align: middle;
      }
      #fbcmf-settings-popup input[type="text"],
      #fbcmf-settings-popup select {
        width: 100%;
        padding: 6px;
        margin-top: 5px;
        margin-bottom: 10px;
        border-radius: 4px;
        border: 1px solid #3e4042;
        background-color: #3a3b3c;
        color: #e4e6eb;
      }
      #fbcmf-settings-popup button {
        background-color: #4267b2;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 8px;
        margin-top: 10px;
        font-size: 14px;
      }
      #fbcmf-settings-popup button:hover {
        background-color: #365899;
      }
      #fbcmf-settings-popup .fbcmf-button-row {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
      }
      #fbcmf-settings-popup .fbcmf-section {
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #3e4042;
      }
      #fbcmf-settings-popup .fbcmf-section-title {
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 15px;
      }
      #fbcmf-settings-popup .fbcmf-advanced-panel {
        display: none;
        margin-top: 15px;
        padding-top: 10px;
        border-top: 1px solid #3e4042;
      }
      #fbcmf-settings-popup .fbcmf-advanced-panel.active {
        display: block;
      }
      #fbcmf-suggestedKeywords {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 10px;
      }
      #fbcmf-suggestedKeywords button {
        margin: 0;
        padding: 4px 8px;
        font-size: 12px;
        background-color: #3a3b3c;
        border: 1px solid #3e4042;
      }
      #fbcmf-suggestedKeywords button:hover {
        background-color: #4e4f50;
      }
      #fbcmf-clean-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4267b2;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        z-index: 9998;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
      }
      #fbcmf-clean-button:hover {
        background-color: #365899;
      }
    `;
    
    const lightThemeCSS = `
      #fbcmf-settings-popup {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #ffffff;
        color: #1c1e21;
        border-radius: 8px;
        padding: 15px;
        width: 300px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 9999;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        border: 1px solid #dddfe2;
      }
      #fbcmf-settings-popup h3 {
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 18px;
        border-bottom: 1px solid #dddfe2;
        padding-bottom: 8px;
      }
      #fbcmf-settings-popup label {
        display: block;
        margin-bottom: 10px;
        font-size: 14px;
      }
      #fbcmf-settings-popup input[type="checkbox"] {
        margin-right: 8px;
        vertical-align: middle;
      }
      #fbcmf-settings-popup input[type="text"],
      #fbcmf-settings-popup select {
        width: 100%;
        padding: 6px;
        margin-top: 5px;
        margin-bottom: 10px;
        border-radius: 4px;
        border: 1px solid #dddfe2;
        background-color: #f5f6f7;
        color: #1c1e21;
      }
      #fbcmf-settings-popup button {
        background-color: #4267b2;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 8px;
        margin-top: 10px;
        font-size: 14px;
      }
      #fbcmf-settings-popup button:hover {
        background-color: #365899;
      }
      #fbcmf-settings-popup .fbcmf-button-row {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
      }
      #fbcmf-settings-popup .fbcmf-section {
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid #dddfe2;
      }
      #fbcmf-settings-popup .fbcmf-section-title {
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 15px;
      }
      #fbcmf-settings-popup .fbcmf-advanced-panel {
        display: none;
        margin-top: 15px;
        padding-top: 10px;
        border-top: 1px solid #dddfe2;
      }
      #fbcmf-settings-popup .fbcmf-advanced-panel.active {
        display: block;
      }
      #fbcmf-suggestedKeywords {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 10px;
      }
      #fbcmf-suggestedKeywords button {
        margin: 0;
        padding: 4px 8px;
        font-size: 12px;
        background-color: #f5f6f7;
        border: 1px solid #dddfe2;
        color: #1c1e21;
      }
      #fbcmf-suggestedKeywords button:hover {
        background-color: #e4e6eb;
      }
      #fbcmf-clean-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #4267b2;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        z-index: 9998;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      }
      #fbcmf-clean-button:hover {
        background-color: #365899;
      }
    `;
    
    // Lấy chuỗi ngôn ngữ
    function getLabel(key) {
      const lang = ctx.settings.language || 'vi';
      return LABELS[lang]?.[key] || LABELS['en'][key] || key;
    }
    
    // Thêm CSS vào trang
    function addCSS() {
      const style = document.createElement('style');
      style.id = 'fbcmf-style';
      style.textContent = currentTheme === 'dark' ? darkThemeCSS : lightThemeCSS;
      document.head.appendChild(style);
    }
    
    // Cập nhật theme
    function updateTheme(theme) {
      currentTheme = theme || 'dark';
      const existingStyle = document.getElementById('fbcmf-style');
      if (existingStyle) {
        existingStyle.textContent = currentTheme === 'dark' ? darkThemeCSS : lightThemeCSS;
      } else {
        addCSS();
      }
    }
    
    // Tạo popup cài đặt
    function createSettingsPopup() {
      // Tạo popup container
      settingsPopup = document.createElement('div');
      settingsPopup.id = 'fbcmf-settings-popup';
      settingsPopup.style.display = 'none';
      
      // Thêm popup vào DOM
      document.body.appendChild(settingsPopup);
      
      // Đợi một chu kỳ render
      requestAnimationFrame(() => {
        // Thêm nội dung HTML vào popup
        settingsPopup.innerHTML = `
          <h3>${getLabel('settings')}</h3>
          
          <div class="fbcmf-section">
            <div class="fbcmf-section-title">${getLabel('settings')}</div>
            
            <label>
              <input type="checkbox" id="fbcmf-blockSponsored">
              ${getLabel('blockSponsored')}
            </label>
            
            <label>
              <input type="checkbox" id="fbcmf-blockSuggested">
              ${getLabel('blockSuggested')}
            </label>
            
            <label>
              <input type="checkbox" id="fbcmf-blockReels">
              ${getLabel('blockReels')}
            </label>
            
            <label>
              <input type="checkbox" id="fbcmf-blockGIFs">
              ${getLabel('blockGIFs')}
            </label>
            
            <label>
              <input type="checkbox" id="fbcmf-blockKeywords">
              ${getLabel('blockKeywords')}
            </label>
            
            <label>
              ${getLabel('keywordsToBlock')}
              <input type="text" id="fbcmf-keywordInput">
            </label>
            
            <label>
              <input type="checkbox" id="fbcmf-expandNewsFeed">
              ${getLabel('expandNewsFeed')}
            </label>
          </div>
          
          <div class="fbcmf-section">
            <div class="fbcmf-button-row">
              <button id="fbcmf-enable-all">${getLabel('enableAll')}</button>
              <button id="fbcmf-disable-all">${getLabel('disableAll')}</button>
            </div>
          </div>
          
          <div class="fbcmf-section">
            <label>
              ${getLabel('language')}
              <select id="fbcmf-language">
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </label>
            
            <label>
              ${getLabel('theme')}
              <select id="fbcmf-theme">
                <option value="dark">${getLabel('dark')}</option>
                <option value="light">${getLabel('light')}</option>
              </select>
            </label>
            
            <label>
              ${getLabel('verbosity')}
              <select id="fbcmf-verbosity">
                <option value="minimal">${getLabel('minimal')}</option>
                <option value="verbose">${getLabel('verbose')}</option>
              </select>
            </label>
          </div>
          
          <div class="fbcmf-section">
            <button id="fbcmf-advanced-settings-btn">${getLabel('advancedSettings')}</button>
            <button id="fbcmf-save-btn">${getLabel('saveSettings')}</button>
          </div>
          
          <div id="fbcmf-advanced-panel" class="fbcmf-advanced-panel">
            <div class="fbcmf-section">
              <div class="fbcmf-section-title">Reels & Video</div>
              <label>
                <input type="checkbox" id="fbcmf-videoAdBlocker">
                Block video advertisements
              </label>
            </div>
            
            <div class="fbcmf-section">
              <div class="fbcmf-section-title">Comments</div>
              <label>
                <input type="checkbox" id="fbcmf-showAllComments">
                ${getLabel('showAllComments')}
              </label>
              
              <label>
                <input type="checkbox" id="fbcmf-autoDetectComments">
                ${getLabel('autoDetectComments')}
              </label>
              
              <label>
                <input type="checkbox" id="fbcmf-notifyComments">
                ${getLabel('notifyComments')}
              </label>
              
              <label>
                <input type="checkbox" id="fbcmf-scrollComments">
                ${getLabel('scrollComments')}
              </label>
            </div>
            
            <div class="fbcmf-section">
              <div class="fbcmf-section-title">Feed & Content</div>
              <label>
                <input type="checkbox" id="fbcmf-hideAnonymous">
                ${getLabel('hideAnonymous')}
              </label>
              
              <label>
                <input type="checkbox" id="fbcmf-autoSortChrono">
                ${getLabel('autoSortChrono')}
              </label>
            </div>
            
            <div class="fbcmf-section">
              <div class="fbcmf-section-title">AI Features</div>
              <label>
                <input type="checkbox" id="fbcmf-autoSuggestKeywords">
                ${getLabel('autoSuggestKeywords')}
              </label>
              
              <label>
                ${getLabel('geminiApiKey')}
                <input type="text" id="fbcmf-gemini-key" placeholder="AIza...">
              </label>
              
              <button id="fbcmf-suggest-btn">${getLabel('suggestKeywords')}</button>
              <div id="fbcmf-suggestedKeywords"></div>
            </div>
            
            <div class="fbcmf-section">
              <div class="fbcmf-section-title">UI Elements</div>
              <label>
                <input type="checkbox" id="fbcmf-showLogoutButton">
                Show quick logout button
              </label>
            </div>
          </div>
        `;
        
        // Đợi thêm một chu kỳ để đảm bảo DOM đã được cập nhật
        setTimeout(() => {
          // Gắn sự kiện cho các phần tử
          attachEvents();
          
          // Tải cài đặt vào giao diện
          loadSettingsToUI();
        }, 0);
      });
    }
    
    // Tạo nút dọn bảng tin
    function createCleanButton() {
      settingsButton = document.createElement('button');
      settingsButton.id = 'fbcmf-clean-button';
      settingsButton.textContent = getLabel('settings');
      settingsButton.addEventListener('click', toggleSettingsPopup);
      document.body.appendChild(settingsButton);
    }
    
    // Hiển thị/ẩn popup cài đặt
    function toggleSettingsPopup() {
      if (settingsPopup.style.display === 'none') {
        settingsPopup.style.display = 'block';
        settingsButton.style.display = 'none';
        loadSettingsToUI(); // Tải lại cài đặt mỗi khi mở popup
      } else {
        settingsPopup.style.display = 'none';
        settingsButton.style.display = 'block';
      }
    }
    
    // Hiển thị/ẩn panel cài đặt nâng cao
    function toggleAdvancedPanel() {
      const panel = document.getElementById('fbcmf-advanced-panel');
      if (panel) {
        panel.classList.toggle('active');
        advancedSettingsButton.textContent = panel.classList.contains('active') 
          ? getLabel('settings')
          : getLabel('advancedSettings');
      }
    }
    
    // Bật tất cả tính năng
    function enableAllFeatures() {
      const checkboxes = settingsPopup.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.checked = true;
      });
    }
    
    // Tắt tất cả tính năng
    function disableAllFeatures() {
      const checkboxes = settingsPopup.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
    }
    
    // Gắn sự kiện cho các phần tử
    function attachEvents() {
      try {
        // Nút lưu cài đặt
        const saveButton = document.getElementById('fbcmf-save-btn');
        if (saveButton) {
          saveButton.addEventListener('click', saveSettings);
        } else {
          console.warn('[UIManager] Không tìm thấy phần tử fbcmf-save-btn');
        }
        
        // Nút cài đặt nâng cao
        advancedSettingsButton = document.getElementById('fbcmf-advanced-settings-btn');
        if (advancedSettingsButton) {
          advancedSettingsButton.addEventListener('click', toggleAdvancedPanel);
        } else {
          console.warn('[UIManager] Không tìm thấy phần tử fbcmf-advanced-settings-btn');
        }
        
        // Nút bật tất cả
        const enableAllButton = document.getElementById('fbcmf-enable-all');
        if (enableAllButton) {
          enableAllButton.addEventListener('click', enableAllFeatures);
        } else {
          console.warn('[UIManager] Không tìm thấy phần tử fbcmf-enable-all');
        }
        
        // Nút tắt tất cả
        const disableAllButton = document.getElementById('fbcmf-disable-all');
        if (disableAllButton) {
          disableAllButton.addEventListener('click', disableAllFeatures);
        } else {
          console.warn('[UIManager] Không tìm thấy phần tử fbcmf-disable-all');
        }
        
        // Selector theme
        themeSelector = document.getElementById('fbcmf-theme');
        if (themeSelector) {
          themeSelector.addEventListener('change', () => {
            updateTheme(themeSelector.value);
          });
        } else {
          console.warn('[UIManager] Không tìm thấy phần tử fbcmf-theme');
        }
        
        // Nút gợi ý từ khóa
        const suggestButton = document.getElementById('fbcmf-suggest-btn');
        if (suggestButton) {
          suggestButton.addEventListener('click', () => {
            if (ctx.AIKeywordSuggester && typeof ctx.AIKeywordSuggester.runKeywordSuggestion === 'function') {
              ctx.AIKeywordSuggester.runKeywordSuggestion();
            }
          });
        } else {
          console.warn('[UIManager] Không tìm thấy phần tử fbcmf-suggest-btn');
        }
        
        // Đăng ký callback cho gợi ý từ khóa
        ctx.onKeywordSuggested = (keywords) => {
          const container = document.getElementById('fbcmf-suggestedKeywords');
          if (!container) return;
          
          container.innerHTML = keywords.map(k =>
            `<button class="keyword-suggestion" data-key="${k}">+ ${k}</button>`
          ).join('');
          
          container.querySelectorAll('.keyword-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
              const kw = btn.getAttribute('data-key');
              const kwBox = document.getElementById('fbcmf-keywordInput');
              if (!kwBox) return;
              
              const current = kwBox.value.split(',').map(k => k.trim()).filter(Boolean);
              if (!current.includes(kw)) {
                current.push(kw);
                kwBox.value = current.join(', ');
              }
            });
          });
        };
        
        console.log('[UIManager] Đã gắn sự kiện cho các phần tử.');
      } catch (error) {
        console.error('[UIManager] Lỗi khi gắn sự kiện:', error);
      }
    }
    
    // Tải cài đặt vào giao diện
    function loadSettingsToUI() {
      try {
        // Danh sách các phần tử cần kiểm tra
        const elements = [
          'fbcmf-blockSponsored',
          'fbcmf-blockSuggested',
          'fbcmf-blockReels',
          'fbcmf-blockGIFs',
          'fbcmf-blockKeywords',
          'fbcmf-expandNewsFeed',
          'fbcmf-language',
          'fbcmf-theme',
          'fbcmf-verbosity',
          'fbcmf-keywordInput',
          'fbcmf-videoAdBlocker',
          'fbcmf-showAllComments',
          'fbcmf-autoDetectComments',
          'fbcmf-notifyComments',
          'fbcmf-scrollComments',
          'fbcmf-hideAnonymous',
          'fbcmf-autoSortChrono',
          'fbcmf-autoSuggestKeywords',
          'fbcmf-gemini-key',
          'fbcmf-showLogoutButton'
        ];
        
        // Kiểm tra từng phần tử
        let missingElements = [];
        elements.forEach(id => {
          const element = document.getElementById(id);
          if (!element) {
            missingElements.push(id);
            console.warn(`[UIManager] Không tìm thấy phần tử ${id}`);
          }
        });
        
        // Nếu có phần tử bị thiếu, thử lại sau 100ms
        if (missingElements.length > 0) {
          console.warn(`[UIManager] Một số phần tử chưa sẵn sàng, thử lại sau 100ms`);
          setTimeout(loadSettingsToUI, 100);
          return;
        }
        
        // Cài đặt checkbox
        document.getElementById('fbcmf-blockSponsored').checked = ctx.settings.blockSponsored !== false;
        document.getElementById('fbcmf-blockSuggested').checked = ctx.settings.blockSuggested !== false;
        document.getElementById('fbcmf-blockReels').checked = ctx.settings.blockReels !== false;
        document.getElementById('fbcmf-blockGIFs').checked = ctx.settings.blockGIFs !== false;
        document.getElementById('fbcmf-blockKeywords').checked = ctx.settings.blockKeywords !== false;
        document.getElementById('fbcmf-expandNewsFeed').checked = ctx.settings.expandNewsFeed !== false;
        document.getElementById('fbcmf-videoAdBlocker').checked = ctx.settings.videoAdBlocker !== false;
        document.getElementById('fbcmf-showAllComments').checked = ctx.settings.showAllComments !== false;
        document.getElementById('fbcmf-autoDetectComments').checked = ctx.settings.autoDetectComments !== false;
        document.getElementById('fbcmf-notifyComments').checked = ctx.settings.notifyComments !== false;
        document.getElementById('fbcmf-scrollComments').checked = ctx.settings.scrollComments !== false;
        document.getElementById('fbcmf-hideAnonymous').checked = ctx.settings.hideAnonymous !== false;
        document.getElementById('fbcmf-autoSortChrono').checked = ctx.settings.autoSortChrono !== false;
        document.getElementById('fbcmf-autoSuggestKeywords').checked = ctx.settings.autoSuggestKeywords === true;
        document.getElementById('fbcmf-showLogoutButton').checked = ctx.settings.showLogoutButton !== false;
        
        // Cài đặt select
        document.getElementById('fbcmf-language').value = ctx.settings.language || 'vi';
        document.getElementById('fbcmf-theme').value = ctx.settings.theme || 'dark';
        document.getElementById('fbcmf-verbosity').value = ctx.settings.verbosity || 'minimal';
        
        // Cài đặt input
        document.getElementById('fbcmf-keywordInput').value = (ctx.settings.blockedKeywords || []).join(', ');
        document.getElementById('fbcmf-gemini-key').value = ctx.settings.geminiApiKey || localStorage.getItem('fbcmf-gemini-api-key') || '';
        
        // Cập nhật theme
        updateTheme(ctx.settings.theme);
        
        console.log('[UIManager] Đã tải cài đặt vào giao diện');
      } catch (error) {
        console.error('[UIManager] Lỗi khi tải cài đặt vào giao diện:', error);
      }
    }
    
    // Lưu cài đặt
    function saveSettings() {
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
          theme: document.getElementById('fbcmf-theme').value,
          verbosity: document.getElementById('fbcmf-verbosity').value,
          videoAdBlocker: document.getElementById('fbcmf-videoAdBlocker').checked,
          showAllComments: document.getElementById('fbcmf-showAllComments').checked,
          autoDetectComments: document.getElementById('fbcmf-autoDetectComments').checked,
          notifyComments: document.getElementById('fbcmf-notifyComments').checked,
          scrollComments: document.getElementById('fbcmf-scrollComments').checked,
          hideAnonymous: document.getElementById('fbcmf-hideAnonymous').checked,
          autoSortChrono: document.getElementById('fbcmf-autoSortChrono').checked,
          autoSuggestKeywords: document.getElementById('fbcmf-autoSuggestKeywords').checked,
          geminiApiKey: document.getElementById('fbcmf-gemini-key').value,
          showLogoutButton: document.getElementById('fbcmf-showLogoutButton').checked
        };
        
        // Lưu API key Gemini vào localStorage
        if (newSettings.geminiApiKey) {
          localStorage.setItem('fbcmf-gemini-api-key', newSettings.geminiApiKey);
        }
        
        // Sử dụng hàm saveSettings từ context nếu có
        if (typeof ctx.saveSettings === 'function') {
          ctx.saveSettings(newSettings);
        } else {
          // Fallback: Lưu trực tiếp vào localStorage
          localStorage.setItem('fbcmf-settings', JSON.stringify(newSettings));
        }
        
        alert(getLabel('settingsSaved'));
        location.reload();
      } catch (e) {
        alert(getLabel('settingsError') + e.message);
        console.error('[UIManager] Lỗi khi lưu cài đặt:', e);
      }
    }
    
    // Khởi tạo module
    function init() {
      // Thêm CSS
      addCSS();
      
      // Tạo popup cài đặt
      createSettingsPopup();
      
      // Tạo nút dọn bảng tin
      createCleanButton();
      
      console.log('[UIManager] ✅ Đã khởi tạo UIManager.');
    }
    
    // Hủy module
    function destroy() {
      // Xóa popup cài đặt
      if (settingsPopup) {
        settingsPopup.remove();
        settingsPopup = null;
      }
      
      // Xóa nút dọn bảng tin
      if (settingsButton) {
        settingsButton.remove();
        settingsButton = null;
      }
      
      // Xóa CSS
      const style = document.getElementById('fbcmf-style');
      if (style) {
        style.remove();
      }
      
      console.log('[UIManager] Đã hủy UIManager.');
    }
    
    // Tải lại cài đặt
    function reloadSettings() {
      loadSettingsToUI();
    }
    
    // Khởi tạo
    init();
    
    // Trả về API cho context
    return {
      init,
      destroy,
      reloadSettings,
      toggleSettingsPopup
    };
  });
})();
