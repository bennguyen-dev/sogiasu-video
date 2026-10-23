# Tập 10 - Bảng điểm danh

> Kịch bản đã dựng (23/10/2026). Code: `src/videos/attendance-grid/`, timeline: `timeline.ts` + mốc trong từng file `scenes/`. Cùng thế giới với tập 6-9 (Thứ Năm 12/11/2026), nhiều lớp của trường demo trong intro.

|            |                                                                                |
| ---------- | ------------------------------------------------------------------------------ |
| Nền tảng   | TikTok, Reels, YouTube Shorts (+ nhúng vào blog hướng dẫn)                     |
| Khung      | Dọc 1080×1920, 30fps, ~40 giây. **Hai cỡ**: phần giới thiệu là bảng dạng card nổi như cảnh bảng điểm danh ở intro (`intro/scenes/GridScene.tsx`, rộng ~920 px, ẩn bớt cột ngày); phần thao tác về khung điện thoại `TUTORIAL_PHONE` (411 px) như tập 1-9 |
| Render     | `yarn render:attendance-grid` (chỉ SFX) · `yarn render:attendance-grid:music` (có nhạc) → `out/`. ~37 giây (1111 frame) |
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

## Đã dựng

| # | Cảnh | Ghi chú |
|---|---|---|
| 0-1 | Card nổi (15s) | Bảng tháng 11, 10 lớp, ngày 1-14 (ẩn 15-30 bằng CSS). Camera phóng lần lượt: ô 11/11 "Chưa hoàn thành" của IELTS Teens 5.5, ô 7/11 Có phép (Gia Hân) + 3/11 Vắng (Em Bảo), cột Buổi nhóm IELTS 6.5, nút Xuất Excel. Cuối cảnh card thu nhỏ, mờ dần |
| 3 | Điểm danh (9,6s) | Điện thoại, bảng cuộn tới IELTS Teens 5.5 (11-15/11). Thảo Vy 11/11 → menu → Vắng → lý do "Em báo bận việc gia đình" → toast "Đã điểm danh: Vắng" |
| 4 | Chốt buổi (8,9s) | Chạm ô hàng đầu → chi tiết buổi mở ngay trên bảng → Đã dạy xong → Xác nhận → đóng → Minh Quân ✓, Thảo Vy K, cột Buổi tự cộng |
| 5 | End card | "Cả tháng, mọi lớp / trên một bảng." → Tập 11 · Xem doanh thu |

## Ghi chú kỹ thuật

- Card nổi render bảng thật ngoài iframe như intro: ảnh chụp không vẽ được `scrollLeft`, nên ẩn bớt cột ngày thay vì cuộn.
- Trong iframe điện thoại, bảng tự cuộn ngang tới hôm nay và có thanh cuộn dọc riêng: scene đặt `scrollTop` của `[data-slot=table-container]`.
- Menu chọn trạng thái, hộp lý do và toast điểm danh là bản dựng lại (`Replicas.tsx`); hộp chi tiết buổi và hộp xác nhận là component thật, mở bằng click.
- Ở bề rộng video, app hiện menu dạng dropdown chứ không phải drawer như trên điện thoại thật (breakpoint đọc `window.innerWidth` của trang video), giống các hộp thoại ở tập trước.
