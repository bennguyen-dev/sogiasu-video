# Tập 10 - Bảng điểm danh

> Kịch bản đã chốt, chưa dựng. Cùng thế giới với tập 6-9 (Thứ Năm 12/11/2026), nhiều lớp của trường demo trong intro.

|            |                                                                                |
| ---------- | ------------------------------------------------------------------------------ |
| Nền tảng   | TikTok, Reels, YouTube Shorts (+ nhúng vào blog hướng dẫn)                     |
| Khung      | Dọc 1080×1920, 30fps, ~40 giây. **Hai cỡ**: phần giới thiệu là bảng dạng card nổi như cảnh bảng điểm danh ở intro (`intro/scenes/GridScene.tsx`, rộng ~920 px, ẩn bớt cột ngày); phần thao tác về khung điện thoại `TUTORIAL_PHONE` (411 px) như tập 1-9 |
| Âm thanh   | Không lời thoại. SFX cho mọi thao tác; bản có nhạc dùng chung nhạc nền         |
| Thông điệp | Xem tổng quát cả tháng, mọi lớp: ai nghỉ, ai vắng. Điểm danh và chốt buổi ngay trên bảng |

## Nguyên tắc riêng tập này

- Trang Điểm danh để **xem lại tổng quát**: phần giới thiệu dùng card nổi (không phải màn desktop hay điện thoại cụ thể), camera phóng gần từng chỗ, khoanh ô kèm nhãn như intro.
- Phần thao tác về **khung điện thoại**: gia sư hay điểm danh trên điện thoại, và tái dùng được ngón tay, drawer, toast của tập 1-9.
- Chuyển từ card sang điện thoại: card thu nhỏ vào màn hình điện thoại (hoặc điện thoại trượt lên).
- Không nhắc ô đã thu bị khóa. Xuất Excel chỉ khoanh bằng bong bóng, không bấm.
- Chạm ô hàng đầu mỗi lớp mở **chi tiết buổi học** (`LessonDetailDialog`) ngay trên trang: bấm "Đã dạy xong" ở đó.
- Cần kiểm tra bảng ở bề rộng 411 px trước khi dựng phần điện thoại.

## Dữ liệu demo

- Bảng **tháng 11/2026**, các lớp của trường demo (IELTS, IELTS Speaking 1-1, IELTS Foundation…).
- Có sẵn vài ô **P** (có phép), vài ô **K** (vắng).
- Buổi hôm qua 11/11 của một lớp **chưa chốt**.

## Kịch bản

| # | Cảnh | Khung | Diễn biến | Chữ trên màn hình |
|---|---|---|---|---|
| 0 | Hook (~3s) | Card nổi | Bảng tháng 11 nhiều lớp trượt lên | Tiêu đề to kiểu intro: "Cả tháng, mọi lớp / trên một bảng" |
| 1 | Đọc bảng (~10s) | Card nổi, camera phóng gần | Khoanh lần lượt: hàng trạng thái buổi; ô P và ô K; cột **Buổi**; nút **Xuất Excel** | "Hàng đầu: buổi đã dạy hay chưa chốt" · "P: có phép, K: vắng" · "Cột Buổi: số buổi tính phí" · "Xuất Excel gửi trung tâm" |
| 2 | Chuyển cảnh (~1s) | Card → điện thoại | Card thu vào màn hình điện thoại | |
| 3 | Điểm danh (~10s) | Điện thoại | Buổi 11/11: chạm ô của một em → **Vắng** → nhập lý do → ô hiện K | "Chạm ô để điểm danh" |
| 4 | Chốt buổi (~10s) | Điện thoại | Chạm ô "Chưa chốt" ở hàng đầu → chi tiết buổi → **Đã dạy xong** → **Xác nhận** → ô chuyển Hoàn thành | "Chốt buổi ngay trên bảng" |
| 5 | End card (~3,5s) | | → **Tập 11 · Xem doanh thu** | |
