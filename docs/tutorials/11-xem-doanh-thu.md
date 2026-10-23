# Tập 11 - Xem doanh thu

> Kịch bản đã dựng (23/10/2026). Code: `src/videos/revenue/`, số liệu: `data.ts`, timeline: `timeline.ts` + mốc trong từng file `scenes/`. Cùng thế giới với tập 6-10 (Thứ Năm 12/11/2026), trường demo của intro (10 lớp, 16 học sinh).

|            |                                                                                |
| ---------- | ------------------------------------------------------------------------------ |
| Nền tảng   | TikTok, Reels, YouTube Shorts (+ nhúng vào blog hướng dẫn)                     |
| Khung      | Dọc 1080×1920, 30fps, ~30 giây. Giống tập 10: phần đọc số liệu là trang Phân tích dạng card nổi (như `intro/scenes/AnalyticsScene.tsx`), phần thao tác về khung điện thoại `TUTORIAL_PHONE` (411 px) |
| Âm thanh   | Không lời thoại. SFX cho mọi thao tác; bản có nhạc dùng chung nhạc nền         |
| Thông điệp | Tháng này thu được bao nhiêu, còn bao nhiêu chưa thu, dạy bao nhiêu buổi; chọn "Tất cả" để xem từng tháng |

## Nguyên tắc riêng tập này

- Giữ **tháng 11** (mặc định khi mở trang), dù mới 12/11: đó là thứ gia sư thấy đầu tiên.
- Không quay lọc theo lớp (ô chọn lớp đã thấy ở tập 10).
- "Tiềm năng" là mức trần (có dự báo các buổi đã lên lịch), bong bóng nói rõ "nếu dạy hết lịch".
- Biểu đồ doanh thu theo tháng **chỉ hiện khi chọn "Tất cả"** ở ô tháng.

## Dữ liệu demo

- Trường demo của intro: 10 lớp, 16 học sinh, lịch theo `shared/demo/demo-school.ts`. Giá trong tập này bằng 75% giá trường demo (tập này không hiện giá từng học sinh), để một tháng đủ dưới 20 triệu.
- Tháng 11 đến 12/11: Đã thu 3.003.000 ₫ (phí khóa Foundation + Speaking 1-1 trả theo buổi), Chưa thu 4.825.000 ₫, Tiềm năng 18.349.000 ₫, Tỷ lệ thu 38%.
- Đã thu theo tháng (triệu): T1 12,0 · T2 10,8 (Tết) · T3 13,2 · T4 14,5 · T5 16,3 · T6 18,6 · T7 19,2 (hè) · T8 17,3 · T9 15,6 (khai giảng) · T10 17,1 · T11 3,0. Tổng "Tất cả" 157.604.000 ₫, chia về từng lớp theo quy mô lớp.

## Kịch bản

| # | Cảnh | Khung | Diễn biến | Chữ trên màn hình |
|---|---|---|---|---|
| 0 | Hook (~3s) | Card nổi | Trang Phân tích tháng 11 trượt lên | "Tháng này / thu được bao nhiêu?" |
| 1 | 4 ô số liệu (~10s) | Card, camera phóng gần | Khoanh lần lượt: Đã thu, Chưa thu, Tiềm năng, Tỷ lệ thu | "Đã thu: tiền đã về" · "Chưa thu: đã dạy, chưa đóng" · "Tiềm năng: nếu dạy hết lịch" · "Tỷ lệ thu" |
| 2 | Buổi học theo lớp (~6s) | Card | Khoanh một lớp: đã dạy bao nhiêu buổi, bao nhiêu giờ, nghỉ mấy buổi | "Dạy bao nhiêu buổi, bao nhiêu giờ" |
| 3 | Đã thu vs Tiềm năng (~6s) | Card | Khoanh lớp còn nhiều tiền chưa thu | "Lớp nào còn chưa thu" |
| 4 | Doanh thu từng tháng (~10s) | Điện thoại | Ô tháng → **Tất cả** → biểu đồ doanh thu theo tháng hiện ra | "Chọn Tất cả / xem từng tháng" |
| 5 | End card (~3,5s) | | → **Tập 12 · Cài đặt và kết nối** | |
