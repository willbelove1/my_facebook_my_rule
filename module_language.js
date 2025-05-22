/**
 * Module: language
 * Mục đích: Hỗ trợ giao diện đa ngôn ngữ (tiếng Việt/English)
 */
(function() {
  'use strict';
  
  // Đảm bảo namespace FBCMF đã được khởi tạo
  window.FBCMF = window.FBCMF || {};
  
  FBCMF.registerModule('language', async (ctx) => {
    // Định nghĩa các chuỗi dịch
    const translations = {
      en: {
        // Giao diện chính
        cleanButton: 'Clean My Feed',
        settingsTitle: 'Cleaner Settings',
        save: 'Save Settings',
        cleanNow: 'Clean Now',
        settingsSaved: 'Settings saved! Reloading...',
        cleanedNow: 'Feed cleaned successfully!',
        
        // Các tùy chọn bộ lọc
        blockSponsored: 'Block Sponsored Posts',
        blockSuggested: 'Block Suggested Posts',
        blockReels: 'Block Reels',
        blockGIFs: 'Block GIFs',
        blockKeywords: 'Block Posts by Keyword',
        keywordPlaceholder: 'e.g. crypto, scam, game',
        expandNewsFeed: 'Expand News Feed Full Width',
        
        // Cài đặt khác
        language: 'Language',
        verbosity: 'Log Level',
        verbosityNormal: 'Normal',
        verbosityVerbose: 'Verbose',
        dialogPosition: 'Dialog Position',
        dialogPositionLeft: 'Left',
        dialogPositionRight: 'Right',
        
        // Quản lý cài đặt
        importExport: 'Import/Export Settings',
        importBtn: 'Import',
        exportBtn: 'Export',
        importSuccess: 'Settings imported successfully!',
        importError: 'Error importing settings. Check format.',
        
        // AI gợi ý
        aiSuggestions: 'AI Keyword Suggestions',
        getSuggestions: 'Get Suggestions',
        suggestionsLoading: 'Getting suggestions...',
        suggestionsError: 'Error getting suggestions',
        addSelected: 'Add Selected',
        
        // Lọc từ khóa
        keywordsTitle: 'Blocked Keywords',
        addKeyword: 'Add',
        removeKeyword: 'Remove',
        clearKeywords: 'Clear All',
        
        // Thông báo lọc
        hiddenReason: {
          sponsored: 'Sponsored content',
          suggested: 'Suggested content',
          reels: 'Reels video',
          gif: 'GIF animation',
          keyword: 'Matched keyword:'
        }
      },
      vi: {
        // Giao diện chính
        cleanButton: 'Dọn dẹp bảng tin',
        settingsTitle: 'Cài đặt bộ lọc',
        save: 'Lưu cài đặt',
        cleanNow: 'Dọn ngay',
        settingsSaved: 'Đã lưu cài đặt! Đang tải lại...',
        cleanedNow: 'Đã dọn dẹp bảng tin thành công!',
        
        // Các tùy chọn bộ lọc
        blockSponsored: 'Chặn bài tài trợ',
        blockSuggested: 'Chặn bài gợi ý',
        blockReels: 'Chặn video Reels',
        blockGIFs: 'Chặn ảnh động GIF',
        blockKeywords: 'Chặn từ khóa',
        keywordPlaceholder: 'vd: crypto, quảng cáo, game',
        expandNewsFeed: 'Mở rộng bài viết toàn khung',
        
        // Cài đặt khác
        language: 'Ngôn ngữ',
        verbosity: 'Chi tiết ghi log',
        verbosityNormal: 'Thường',
        verbosityVerbose: 'Chi tiết',
        dialogPosition: 'Vị trí hộp thoại',
        dialogPositionLeft: 'Bên trái',
        dialogPositionRight: 'Bên phải',
        
        // Quản lý cài đặt
        importExport: 'Nhập/Xuất cài đặt',
        importBtn: 'Nhập',
        exportBtn: 'Xuất',
        importSuccess: 'Nhập cài đặt thành công!',
        importError: 'Lỗi khi nhập cài đặt. Kiểm tra định dạng.',
        
        // AI gợi ý
        aiSuggestions: 'Gợi ý từ khóa bằng AI',
        getSuggestions: 'Lấy gợi ý',
        suggestionsLoading: 'Đang lấy gợi ý...',
        suggestionsError: 'Lỗi khi lấy gợi ý',
        addSelected: 'Thêm đã chọn',
        
        // Lọc từ khóa
        keywordsTitle: 'Từ khóa đã chặn',
        addKeyword: 'Thêm',
        removeKeyword: 'Xóa',
        clearKeywords: 'Xóa tất cả',
        
        // Thông báo lọc
        hiddenReason: {
          sponsored: 'Nội dung được tài trợ',
          suggested: 'Nội dung được gợi ý',
          reels: 'Video Reels',
          gif: 'Ảnh động GIF',
          keyword: 'Từ khóa khớp:'
        }
      }
    };
    
    // Hàm lấy chuỗi dịch
    const translate = (key, lang) => {
      const currentLang = lang || ctx.settings.language || 'vi';
      
      // Hỗ trợ truy cập nested object với dot notation
      const keys = key.split('.');
      let result = translations[currentLang];
      
      for (const k of keys) {
        if (result && result[k] !== undefined) {
          result = result[k];
        } else {
          // Fallback về tiếng Anh nếu không tìm thấy
          let fallback = translations['en'];
          for (const fk of keys) {
            if (fallback && fallback[fk] !== undefined) {
              fallback = fallback[fk];
            } else {
              return key; // Trả về key gốc nếu không tìm thấy
            }
          }
          return fallback;
        }
      }
      
      return result;
    };
    
    // Hàm cập nhật ngôn ngữ giao diện
    const updateUILanguage = (lang) => {
      // Cập nhật các phần tử UI đã có
      const elements = {
        'fbcmf-clean-btn': 'cleanButton',
        'fbcmf-settings-title': 'settingsTitle',
        'fbcmf-save-btn': 'save',
        'fbcmf-clean-now-btn': 'cleanNow',
        'fbcmf-blockSponsored-label': 'blockSponsored',
        'fbcmf-blockSuggested-label': 'blockSuggested',
        'fbcmf-blockReels-label': 'blockReels',
        'fbcmf-blockGIFs-label': 'blockGIFs',
        'fbcmf-blockKeywords-label': 'blockKeywords',
        'fbcmf-expandNewsFeed-label': 'expandNewsFeed',
        'fbcmf-language-label': 'language',
        'fbcmf-verbosity-label': 'verbosity',
        'fbcmf-dialogPosition-label': 'dialogPosition'
      };
      
      Object.entries(elements).forEach(([id, key]) => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = translate(key, lang);
        }
      });
      
      // Cập nhật placeholder
      const keywordInput = document.getElementById('fbcmf-keywordInput');
      if (keywordInput) {
        keywordInput.placeholder = translate('keywordPlaceholder', lang);
      }
      
      // Cập nhật các option trong select
      const verbositySelect = document.getElementById('fbcmf-verbosity');
      if (verbositySelect) {
        const options = verbositySelect.querySelectorAll('option');
        options.forEach(option => {
          if (option.value === 'normal') {
            option.textContent = translate('verbosityNormal', lang);
          } else if (option.value === 'verbose') {
            option.textContent = translate('verbosityVerbose', lang);
          }
        });
      }
      
      const positionSelect = document.getElementById('fbcmf-dialogPosition');
      if (positionSelect) {
        const options = positionSelect.querySelectorAll('option');
        options.forEach(option => {
          if (option.value === 'left') {
            option.textContent = translate('dialogPositionLeft', lang);
          } else if (option.value === 'right') {
            option.textContent = translate('dialogPositionRight', lang);
          }
        });
      }
    };
    
    // Xuất các hàm ra context
    ctx.language = {
      translate,
      updateUILanguage,
      availableLanguages: Object.keys(translations)
    };
    
    if (ctx.settings.verbosity === 'verbose') {
      console.log(`[language] Module đã được khởi tạo với ngôn ngữ: ${ctx.settings.language || 'vi'}`);
    }
  });
})();
