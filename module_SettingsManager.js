
/**
 * Module: SettingsManager
 * Mục đích: Cung cấp API lưu trữ/lấy cài đặt từ localStorage, hỗ trợ import/export
 */
FBCMF.registerModule('SettingsManager', async (ctx) => {
  const storageKey = 'fbcmf-settings';
  const defaults = {
    blockSponsored: true,
    blockSuggested: true,
    blockReels: true,
    blockGIFs: true,
    blockKeywords: false,
    expandNewsFeed: true,
    verbosity: 'normal',
    language: 'vi',
    blockedKeywords: [],
  };

  FBCMF.settings = Object.assign({}, defaults, load());

  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('[FBCMF Settings] Lỗi khi load settings:', e);
      return {};
    }
  }

  function save(newSettings) {
    try {
      const data = Object.assign({}, defaults, newSettings);
      localStorage.setItem(storageKey, JSON.stringify(data));
      FBCMF.settings = data;
    } catch (e) {
      console.warn('[FBCMF Settings] Lỗi khi lưu settings:', e);
    }
  }

  function exportSettings() {
    return JSON.stringify(FBCMF.settings, null, 2);
  }

  function importSettings(jsonStr) {
    try {
      const obj = JSON.parse(jsonStr);
      save(obj);
      alert('✅ Nhập cài đặt thành công. Tải lại trang để áp dụng!');
      location.reload();
    } catch (e) {
      alert('❌ Lỗi khi nhập cài đặt. Kiểm tra định dạng JSON.');
    }
  }

  // Gắn vào context cho các module khác dùng
  ctx.loadSettings = () => load();
  ctx.saveSettings = save;
  ctx.exportSettings = exportSettings;
  ctx.importSettings = importSettings;

  console.log('[SettingsManager] ✅ Đã sẵn sàng.');
});
