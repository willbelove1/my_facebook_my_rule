# my_facebook_my_rule
Hide Sponsored, Suggested posts, Reels, GIFs, and Keywords in FB's News Feed, Groups Feed, Watch Videos, etc. 
# Tài liệu hướng dẫn FBCMF - Facebook Cleaner Modular Framework

## Tổng quan

FBCMF (Facebook Cleaner Modular Framework) là một framework mở rộng cho phép lọc và dọn dẹp nội dung không mong muốn trên Facebook. Framework được thiết kế theo kiến trúc mô-đun (modular architecture), cho phép dễ dàng thêm các tính năng mới mà không cần sửa đổi code core.

## Các tính năng chính

- 🔕 **Chặn bài viết được tài trợ** - Ẩn bài có từ "Được tài trợ" / "Sponsored"
- 🤖 **Chặn bài gợi ý** - Ẩn bài có chữ "Gợi ý cho bạn" / "Suggested for you"
- 📱 **Chặn video Reels** - Ẩn video Reels trên bảng tin
- 🎞️ **Chặn ảnh GIF** - Ẩn ảnh động GIF
- 🔍 **Chặn từ khóa** - Ẩn bài viết chứa từ khóa người dùng chỉ định
- 📏 **Mở rộng khung bài viết** - Thiết lập độ rộng các post là 100%
- 🌐 **Giao diện tùy biến** - Giao diện popup cài đặt bằng tiếng Việt hoặc tiếng Anh
- 🌓 **Chế độ sáng/tối** - Tùy chọn giao diện sáng hoặc tối cho popup
- ⚙️ **Cài đặt và lưu cấu hình** - Lưu trữ config trong `localStorage`
- 📋 **Quản lý bộ lọc** - Cấu trúc dễ mở rộng để thêm điều kiện lọc mới
- 🔁 **Theo dõi động nội dung feed** - Tự động dọn khi lướt Facebook hoặc thay đổi URL
- 💬 **Ngôn ngữ** - Hỗ trợ giao diện tiếng Việt / English
- 📦 **Tùy chọn vị trí popup** - Chọn hiển thị hộp cài đặt bên trái/phải
- 🔄 **Bật/tắt tất cả tính năng** - Nút bật/tắt tất cả tính năng cùng lúc

## Cấu trúc framework

Framework được thiết kế theo kiến trúc mô-đun với các thành phần chính:

1. **Core Framework** - Cung cấp cơ sở hạ tầng, quản lý module, context, settings
2. **FilterRegistry** - Đăng ký và quản lý các bộ lọc
3. **SettingsManager** - Quản lý cài đặt người dùng
4. **UIManager** - Giao diện người dùng
5. **MutationObserver** - Theo dõi thay đổi DOM và áp dụng bộ lọc
6. **Các module filter** - Các bộ lọc cụ thể (blockSponsored, blockSuggested, v.v.)

## Cách sử dụng

1. Cài đặt script vào Violentmonkey hoặc Tampermonkey
2. Truy cập Facebook
3. Nhấn nút "Dọn dẹp bảng tin" ở góc dưới bên phải
4. Tùy chỉnh các cài đặt theo ý muốn
5. Nhấn "Lưu cài đặt" để áp dụng thay đổi
6. Nhấn "Dọn ngay" để áp dụng bộ lọc ngay lập tức

## Cải tiến mới

- ✅ Đã sửa lỗi không lưu được cài đặt
- ✅ Đã sửa lỗi không dọn dẹp khi bấm nút
- ✅ Thêm chế độ giao diện sáng (light mode)
- ✅ Thêm nút bật/tắt tất cả tính năng
- ✅ Cải thiện giao diện người dùng
- ✅ Tăng cường xử lý lỗi và độ ổn định
- ✅ Cải thiện hiệu suất dọn dẹp feed

## Phát triển module mới

Để phát triển module mới, bạn cần:

1. Tạo file module mới (ví dụ: `module_myFeature.js`)
2. Đăng ký module với framework:

```javascript
FBCMF.registerModule('myFeature', async (ctx) => {
  // Sử dụng context
  const { DOMUtils, settings, saveSettings, FilterRegistry } = ctx;
  
  // Mã của module
  
  // Trả về API (nếu cần)
  return {
    myFunction: () => { /* ... */ }
  };
});
```

3. Đảm bảo module được tải sau core framework

## Gỡ lỗi

Để gỡ lỗi, bạn có thể:

1. Mở Console trong Developer Tools của trình duyệt
2. Đặt `verbosity` thành `verbose` trong cài đặt
3. Kiểm tra các log với tiền tố `[FBCMF]`
