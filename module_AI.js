/**
 * Module: AI
 * Mục đích: Gợi ý từ khóa bằng AI (Gemini) và mở rộng từ khóa người dùng đã nhập
 */
(function() {
  'use strict';
  
  // Đảm bảo namespace FBCMF đã được khởi tạo
  window.FBCMF = window.FBCMF || {};
  
  FBCMF.registerModule('AI', async ({ settings, language }) => {
    // Hàm dịch dựa vào module language
    const t = (key) => {
      if (language && language.translate) {
        return language.translate(key);
      }
      // Fallback nếu module language chưa load
      return key;
    };
    
    // Hàm gợi ý từ khóa dựa trên từ khóa hiện có
    const suggestRelatedKeywords = (existingKeywords) => {
      if (!existingKeywords || existingKeywords.length === 0) {
        return Promise.resolve([]);
      }
      
      // Danh sách các từ khóa liên quan thường gặp
      const commonRelations = {
        'crypto': ['bitcoin', 'ethereum', 'nft', 'blockchain', 'dogecoin', 'binance', 'coinbase'],
        'bitcoin': ['crypto', 'btc', 'ethereum', 'blockchain', 'mining', 'coinbase'],
        'quảng cáo': ['mua ngay', 'giảm giá', 'khuyến mãi', 'sale', 'ưu đãi', 'miễn phí'],
        'game': ['gaming', 'esport', 'pubg', 'liên quân', 'free fire', 'lol', 'steam'],
        'scam': ['lừa đảo', 'đa cấp', 'kiếm tiền online', 'việc làm tại nhà', 'giàu nhanh'],
        'lừa đảo': ['scam', 'đa cấp', 'kiếm tiền online', 'việc làm tại nhà', 'giàu nhanh'],
        'đa cấp': ['mlm', 'kinh doanh mạng lưới', 'thu nhập thụ động', 'cơ hội kinh doanh'],
        'chính trị': ['bầu cử', 'đảng', 'chính phủ', 'quốc hội', 'tổng thống', 'thủ tướng'],
        'covid': ['corona', 'vaccine', 'dịch bệnh', 'khẩu trang', 'giãn cách', 'lockdown'],
        'vaccine': ['tiêm chủng', 'covid', 'dịch bệnh', 'y tế', 'phòng bệnh']
      };
      
      // Tìm các từ khóa liên quan
      const suggestions = new Set();
      
      existingKeywords.forEach(keyword => {
        const lowerKeyword = keyword.toLowerCase().trim();
        
        // Kiểm tra từ khóa có trong danh sách phổ biến không
        if (commonRelations[lowerKeyword]) {
          commonRelations[lowerKeyword].forEach(related => {
            // Chỉ thêm nếu chưa có trong danh sách hiện tại
            if (!existingKeywords.some(k => k.toLowerCase().trim() === related.toLowerCase())) {
              suggestions.add(related);
            }
          });
        }
        
        // Thêm một số biến thể phổ biến
        if (lowerKeyword.includes(' ')) {
          // Nếu là cụm từ, thêm các từ riêng lẻ
          const words = lowerKeyword.split(' ');
          words.forEach(word => {
            if (word.length > 3 && !existingKeywords.includes(word)) {
              suggestions.add(word);
            }
          });
        } else if (lowerKeyword.length > 3) {
          // Nếu là từ đơn, thử thêm số hoặc biến thể
          suggestions.add(lowerKeyword + 's');
          suggestions.add(lowerKeyword + '2023');
          suggestions.add(lowerKeyword + '2024');
        }
      });
      
      return Promise.resolve(Array.from(suggestions));
    };
    
    // Hàm gợi ý từ khóa bằng AI (giả lập Gemini API)
    const suggestKeywordsWithAI = async (prompt) => {
      // Trong thực tế, đây sẽ là API call đến Gemini
      // Nhưng vì đây là mô phỏng, chúng ta sẽ tạo gợi ý dựa trên prompt
      
      if (settings.verbosity === 'verbose') {
        console.log(`[AI] Đang gợi ý từ khóa với prompt: ${prompt}`);
      }
      
      // Giả lập độ trễ của API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Các danh mục gợi ý phổ biến
      const categories = {
        'quảng cáo': [
          'quảng cáo', 'khuyến mãi', 'giảm giá', 'sale', 'mua ngay', 
          'ưu đãi', 'miễn phí', 'hot deal', 'flash sale', 'siêu giảm giá'
        ],
        'tiếp thị': [
          'tiếp thị', 'marketing', 'seo', 'quảng bá', 'thương hiệu',
          'digital marketing', 'content marketing', 'influencer'
        ],
        'tiền điện tử': [
          'bitcoin', 'ethereum', 'crypto', 'nft', 'blockchain', 'dogecoin',
          'binance', 'coinbase', 'altcoin', 'token', 'mining', 'wallet'
        ],
        'lừa đảo': [
          'lừa đảo', 'scam', 'đa cấp', 'mlm', 'kiếm tiền online', 
          'việc làm tại nhà', 'giàu nhanh', 'đầu tư sinh lời', 'thu nhập thụ động'
        ],
        'game': [
          'game', 'gaming', 'esport', 'pubg', 'liên quân', 'free fire',
          'lol', 'steam', 'fortnite', 'game mobile', 'game pc', 'game online'
        ],
        'chính trị': [
          'chính trị', 'bầu cử', 'đảng', 'chính phủ', 'quốc hội',
          'tổng thống', 'thủ tướng', 'nghị sĩ', 'đại biểu', 'chính sách'
        ],
        'tin giả': [
          'tin giả', 'fake news', 'tin đồn', 'thuyết âm mưu', 'hoax',
          'tin sai lệch', 'tin thất thiệt', 'bịa đặt', 'xuyên tạc'
        ]
      };
      
      // Phân tích prompt để chọn danh mục phù hợp
      let selectedCategories = [];
      const lowerPrompt = prompt.toLowerCase();
      
      Object.keys(categories).forEach(category => {
        if (lowerPrompt.includes(category.toLowerCase()) || 
            categories[category].some(kw => lowerPrompt.includes(kw.toLowerCase()))) {
          selectedCategories.push(category);
        }
      });
      
      // Nếu không tìm thấy danh mục phù hợp, chọn ngẫu nhiên 2 danh mục
      if (selectedCategories.length === 0) {
        const allCategories = Object.keys(categories);
        const randomIndex1 = Math.floor(Math.random() * allCategories.length);
        let randomIndex2 = Math.floor(Math.random() * allCategories.length);
        while (randomIndex2 === randomIndex1) {
          randomIndex2 = Math.floor(Math.random() * allCategories.length);
        }
        
        selectedCategories = [allCategories[randomIndex1], allCategories[randomIndex2]];
      }
      
      // Tạo danh sách gợi ý từ các danh mục đã chọn
      const suggestions = new Set();
      selectedCategories.forEach(category => {
        categories[category].forEach(keyword => {
          suggestions.add(keyword);
        });
      });
      
      // Trả về kết quả
      return Array.from(suggestions).slice(0, 15); // Giới hạn 15 gợi ý
    };
    
    // Tạo UI cho gợi ý từ khóa
    const createSuggestionUI = () => {
      // Kiểm tra xem đã có UI chưa
      if (document.getElementById('fbcmf-ai-suggestions')) {
        return;
      }
      
      // Tạo container
      const container = document.createElement('div');
      container.id = 'fbcmf-ai-suggestions';
      container.style.display = 'none';
      container.style.marginTop = '10px';
      container.style.padding = '10px';
      container.style.backgroundColor = '#3a3b3c';
      container.style.borderRadius = '8px';
      container.style.color = 'white';
      
      // Tạo tiêu đề
      const title = document.createElement('h4');
      title.textContent = t('aiSuggestions');
      title.style.margin = '0 0 10px 0';
      title.style.fontSize = '14px';
      container.appendChild(title);
      
      // Tạo nút gợi ý
      const suggestBtn = document.createElement('button');
      suggestBtn.id = 'fbcmf-get-suggestions';
      suggestBtn.textContent = t('getSuggestions');
      suggestBtn.style.backgroundColor = '#2d88ff';
      suggestBtn.style.color = 'white';
      suggestBtn.style.border = 'none';
      suggestBtn.style.borderRadius = '4px';
      suggestBtn.style.padding = '5px 10px';
      suggestBtn.style.marginRight = '5px';
      suggestBtn.style.cursor = 'pointer';
      container.appendChild(suggestBtn);
      
      // Tạo nút thêm đã chọn
      const addSelectedBtn = document.createElement('button');
      addSelectedBtn.id = 'fbcmf-add-selected';
      addSelectedBtn.textContent = t('addSelected');
      addSelectedBtn.style.backgroundColor = '#4caf50';
      addSelectedBtn.style.color = 'white';
      addSelectedBtn.style.border = 'none';
      addSelectedBtn.style.borderRadius = '4px';
      addSelectedBtn.style.padding = '5px 10px';
      addSelectedBtn.style.cursor = 'pointer';
      addSelectedBtn.style.display = 'none';
      container.appendChild(addSelectedBtn);
      
      // Tạo container cho danh sách gợi ý
      const suggestionsContainer = document.createElement('div');
      suggestionsContainer.id = 'fbcmf-suggestions-list';
      suggestionsContainer.style.marginTop = '10px';
      suggestionsContainer.style.display = 'flex';
      suggestionsContainer.style.flexWrap = 'wrap';
      suggestionsContainer.style.gap = '5px';
      container.appendChild(suggestionsContainer);
      
      // Thêm vào DOM sau input từ khóa
      const keywordInput = document.getElementById('fbcmf-keywordInput');
      if (keywordInput && keywordInput.parentNode) {
        keywordInput.parentNode.appendChild(container);
        
        // Hiển thị container khi checkbox blockKeywords được chọn
        const blockKeywordsCheckbox = document.getElementById('fbcmf-blockKeywords');
        if (blockKeywordsCheckbox) {
          // Cập nhật hiển thị ban đầu
          container.style.display = blockKeywordsCheckbox.checked ? 'block' : 'none';
          
          // Lắng nghe sự kiện thay đổi
          blockKeywordsCheckbox.addEventListener('change', () => {
            container.style.display = blockKeywordsCheckbox.checked ? 'block' : 'none';
          });
        }
      }
      
      // Xử lý sự kiện cho nút gợi ý
      suggestBtn.addEventListener('click', async () => {
        const suggestionsContainer = document.getElementById('fbcmf-suggestions-list');
        if (!suggestionsContainer) return;
        
        // Hiển thị trạng thái đang tải
        suggestionsContainer.innerHTML = `<div style="width:100%; text-align:center;">${t('suggestionsLoading')}</div>`;
        
        try {
          // Lấy từ khóa hiện tại
          const keywordInput = document.getElementById('fbcmf-keywordInput');
          const existingKeywords = keywordInput.value
            .split(',')
            .map(k => k.trim())
            .filter(Boolean);
          
          // Gọi cả hai phương thức gợi ý
          const [aiSuggestions, relatedSuggestions] = await Promise.all([
            suggestKeywordsWithAI(existingKeywords.join(', ')),
            suggestRelatedKeywords(existingKeywords)
          ]);
          
          // Kết hợp kết quả và loại bỏ trùng lặp
          const allSuggestions = new Set([...aiSuggestions, ...relatedSuggestions]);
          
          // Loại bỏ các từ khóa đã có
          existingKeywords.forEach(keyword => {
            allSuggestions.delete(keyword.toLowerCase());
          });
          
          // Hiển thị gợi ý
          suggestionsContainer.innerHTML = '';
          
          if (allSuggestions.size === 0) {
            suggestionsContainer.innerHTML = '<div style="width:100%; text-align:center;">Không có gợi ý mới</div>';
            return;
          }
          
          Array.from(allSuggestions).forEach(suggestion => {
            const chip = document.createElement('div');
            chip.className = 'fbcmf-suggestion-chip';
            chip.textContent = suggestion;
            chip.style.backgroundColor = '#4b4f56';
            chip.style.padding = '5px 10px';
            chip.style.borderRadius = '15px';
            chip.style.cursor = 'pointer';
            chip.style.display = 'inline-block';
            chip.style.margin = '0 5px 5px 0';
            chip.dataset.selected = 'false';
            
            chip.addEventListener('click', () => {
              if (chip.dataset.selected === 'false') {
                chip.dataset.selected = 'true';
                chip.style.backgroundColor = '#2d88ff';
              } else {
                chip.dataset.selected = 'false';
                chip.style.backgroundColor = '#4b4f56';
              }
              
              // Hiển thị/ẩn nút thêm đã chọn
              const hasSelected = document.querySelector('.fbcmf-suggestion-chip[data-selected="true"]');
              document.getElementById('fbcmf-add-selected').style.display = hasSelected ? 'inline-block' : 'none';
            });
            
            suggestionsContainer.appendChild(chip);
          });
          
        } catch (error) {
          console.error('[AI] Lỗi khi lấy gợi ý:', error);
          suggestionsContainer.innerHTML = `<div style="width:100%; text-align:center; color:#ff5252;">${t('suggestionsError')}</div>`;
        }
      });
      
      // Xử lý sự kiện cho nút thêm đã chọn
      addSelectedBtn.addEventListener('click', () => {
        const selectedChips = document.querySelectorAll('.fbcmf-suggestion-chip[data-selected="true"]');
        if (selectedChips.length === 0) return;
        
        const keywordInput = document.getElementById('fbcmf-keywordInput');
        if (!keywordInput) return;
        
        // Lấy từ khóa hiện tại
        const existingKeywords = keywordInput.value
          .split(',')
          .map(k => k.trim())
          .filter(Boolean);
        
        // Thêm từ khóa đã chọn
        selectedChips.forEach(chip => {
          existingKeywords.push(chip.textContent);
        });
        
        // Cập nhật input
        keywordInput.value = existingKeywords.join(', ');
        
        // Xóa các chip đã chọn
        selectedChips.forEach(chip => chip.remove());
        
        // Ẩn nút thêm đã chọn
        addSelectedBtn.style.display = 'none';
      });
    };
    
    // Khởi tạo module
    const init = () => {
      // Đợi DOM load xong
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createSuggestionUI);
      } else {
        // Thử tạo UI ngay, nếu chưa có các phần tử cần thiết thì thử lại sau
        setTimeout(createSuggestionUI, 1000);
      }
      
      // Lắng nghe sự kiện DOM thay đổi để tạo UI khi cần
      const observer = new MutationObserver((mutations) => {
        if (document.getElementById('fbcmf-keywordInput') && 
            !document.getElementById('fbcmf-ai-suggestions')) {
          createSuggestionUI();
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
    };
    
    // Khởi chạy
    init();
    
    if (settings.verbosity === 'verbose') {
      console.log('[AI] Module đã được khởi tạo.');
    }
    
    // Xuất các hàm ra context
    return {
      suggestKeywordsWithAI,
      suggestRelatedKeywords
    };
  });
})();
