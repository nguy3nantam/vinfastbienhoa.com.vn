# Rà soát và sửa lỗi — 21/09/2026

Đã rà soát các luồng React/Vite, tải dữ liệu PocketBase, quản trị, cấu hình triển khai và kiểm thử đồng bộ tin. Các thay đổi nằm trong mã nguồn và bản build local; chưa triển khai lại container production.

## Các lỗi đã sửa

- Trang chi tiết xe: giữ màu đã chọn khi nhập form; VF3 lấy giá, ảnh chính và thông số từ dữ liệu quản trị; kênh liên hệ dùng cấu hình website; nút quay lại không bị header cố định che khuất.
- Form tư vấn/nhận ưu đãi: danh sách mẫu xe lấy từ dữ liệu đang hiển thị, khớp với xe khách hàng vừa chọn.
- Slider: slide ẩn không nhận chuột hoặc focus bàn phím.
- Tin tức: đặt lại trạng thái khi đổi bài, hủy yêu cầu cũ, tránh phản hồi cũ ghi đè bài mới; lỗi mạng có nút thử lại thay vì bị coi là bài không tồn tại.
- Điều hướng: hỗ trợ cuộn đến `#dong-xe` khi trang được tải lazy; URL không khớp có giao diện 404 và `noindex`.
- Quản trị: xử lý lỗi tải ở thống kê, khách hàng, tin tức, người dùng và cấu hình website; xử lý lỗi xóa/cập nhật ở các trang đã sửa. Lưu tin thất bại có thông báo trong hộp thoại; sửa nội dung không tự đổi ngày đăng. Bỏ cấu trúc nút lồng nút ở công tắc xuất bản.
- Kiểm thử Python: tách giả lập đồng bộ slider khỏi kiểm thử retry tin tức, thêm trường hợp slider lỗi sau khi tin đã nhập thành công.

## Tối ưu

- Chia sẻ một yêu cầu tải xe/cấu hình giữa nhiều thành phần; cập nhật cả thành phần đang mở sau khi invalidation; ngăn phản hồi cũ ghi đè lần tải mới.
- Cache thành công trong 5 phút, kiểm tra thời hạn ở lần `load` kế tiếp. Khi lỗi, giữ dữ liệu tốt gần nhất và chờ 30 giây trước lần thử tự động kế tiếp; không polling nền.
- Ghi nhớ danh sách xe theo nhóm, tránh tạo mảng mới mỗi lần render và vô tình đặt lại trạng thái trang chi tiết.
- Luôn lọc `active = true` ở website công khai, kể cả khi đang đăng nhập quản trị.
- Danh sách/carousel tin không tải trường nội dung bài viết; thống kê chỉ yêu cầu ID và tổng số bản ghi.
- Vite dùng `command`/`isPreview` để bật công cụ chỉnh sửa chỉ trong dev, hoạt động đúng cả khi build qua API. Bỏ tối ưu trước toàn bộ dependency không dùng, bỏ việc tắt toàn bộ cảnh báo/lỗi CSS và cấu hình Rollup không hợp lệ.

## Kết quả kiểm tra

- `npm run lint:warn --workspace=web`: không lỗi, không cảnh báo ESLint.
- `npm test`: 5 test JavaScript cho cache và 4 test Python đều qua. Các dòng lỗi timeout/import trong output Python là tình huống được giả lập có chủ đích.
- `npm run build`: thành công. Vite báo thư mục output nằm ngoài project root và giữ asset cũ; không tự xóa các bản build trước.
- Build qua API Vite: xác nhận không nạp plugin dev.
- Chromium trên bản production build local: qua kiểm tra chọn màu, dữ liệu VF3, kênh liên hệ, điều hướng hash, chọn mẫu xe trong dialog, tương tác slide, lỗi mạng và đổi bài nhanh, 404, lỗi tải 5 trang quản trị, lỗi lưu tin và giữ ngày đăng, trang chủ ở chiều rộng 390px. Không có lỗi JavaScript chưa xử lý trong các luồng này.
- `nginx -t` trong container web hiện tại: cấu hình hợp lệ. Đây là kiểm tra cấu hình đang chạy, không phải triển khai bản sửa.

## Chạy lại kiểm tra trình duyệt

Script `scripts/browser-check.mjs` chỉ chấp nhận địa chỉ local. Nó giả lập API và dữ liệu đăng nhập, không dùng thông tin quản trị thật; các yêu cầu lưu đều được chặn và trả lời bằng dữ liệu thử.

1. Build và mở preview: `npm run build`, sau đó `npm run start --workspace=web -- --host 127.0.0.1 --port 4173`.
2. Cài Playwright ở thư mục công cụ riêng nếu chưa có: `npm install --prefix /tmp/vinfast-review-tools --no-audit --no-fund playwright`.
3. Cài Chromium: `/tmp/vinfast-review-tools/node_modules/.bin/playwright install chromium --only-shell`.
4. Chạy: `PLAYWRIGHT_MODULE=file:///tmp/vinfast-review-tools/node_modules/playwright/index.mjs node scripts/browser-check.mjs`.

Các kiểm tra này không xác nhận việc gửi email thật, đồng bộ nguồn tin bên ngoài, hoặc toàn bộ CRUD trên database production. Chưa có phép đo Lighthouse hay so sánh tốc độ trước/sau. Thư mục làm việc hiện không phải Git repository.
