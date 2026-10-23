# Tập 9 - Giảm giá, sửa giá, phí khác

> Kịch bản đã dựng (23/10/2026). Code: `src/videos/fee-adjust/`, timeline: `timeline.ts` + mốc trong từng file `scenes/`. Cùng thế giới với tập 6-8 (Thứ Năm 12/11/2026), lớp IELTS theo buổi của tập 6.

|            |                                                                       |
| ---------- | --------------------------------------------------------------------- |
| Nền tảng   | TikTok, Reels, YouTube Shorts (+ nhúng vào blog hướng dẫn)            |
| Khung      | Dọc 1080×1920, 30fps, ~40 giây (1199 frame), layout `TUTORIAL_PHONE` (411 px) |
| Render     | `yarn render:fee-adjust` (chỉ SFX) · `yarn render:fee-adjust:music` (có nhạc) → `out/` |
| Âm thanh   | Không lời thoại. SFX cho mọi thao tác; bản có nhạc dùng chung nhạc nền |
| Thông điệp | Giảm giá theo %, sửa giá 1 buổi kèm lý do, thêm phí khác; cả 3 hiện trên phiếu |

## Nguyên tắc riêng tập này

- Câu chữ nói thẳng việc app làm, không câu chốt kiểu quảng cáo.
- Dùng lớp theo buổi (90% gia sư). Nhắc 2 hình thức còn lại thao tác tương tự bằng bong bóng.
- Ô giảm giá không có chỗ ghi lý do: lý do giảm (tháng khuyến mãi, học sinh khó khăn) chỉ nằm trong bong bóng.
- Lớp theo khóa không có sửa giá 1 buổi (khóa không tính theo buổi) → cảnh sửa giá không nhắc 2 hình thức kia.
- Kết bằng phiếu học phí mẫu **Mùa thu** như tập 4, 6, 7, 8.

## Dữ liệu demo

- Lớp IELTS của tập 6, **Gia Hân 250.000đ/buổi**, tháng 10 **đã thu**. Bỏ lịch "280.000đ từ 01/12" của tập 6.
- Tháng 11 Gia Hân có 3 buổi: 03/11, 07/11, 10/11.
- Sau 3 thao tác: 03/11 **225.000đ** (−10%) · 07/11 **125.000đ** (Đã sửa giá · Buổi học kết thúc sớm) · 10/11 **225.000đ** (−10%) · Giáo trình **150.000đ** → **725.000đ**.

## Kịch bản

| # | Cảnh | Diễn biến | Chữ trên màn hình |
|---|---|---|---|
| 0 | Hook (3s) | Trang Học phí, thẻ Gia Hân mở: −10%, buổi "Đã sửa giá", dòng Giáo trình | "Giảm giá, sửa giá / thêm phí khác" |
| 1 | Giảm giá (~12s) | Tab Học sinh → **Học phí** của Gia Hân → giữ 250.000đ, Giảm giá **10%**, từ **01/11** → Lưu. Thẻ hiện 225.000đ, nhãn −10% | "Tháng khuyến mãi hay học sinh khó khăn thì giảm theo %" · "Lớp theo giờ, theo khóa cũng có ô Giảm giá" |
| 2 | Sửa giá 1 buổi (~12s) | Mở buổi **07/11** → dòng Gia Hân → **Sửa giá** → **125.000đ**, lý do **"Buổi học kết thúc sớm"** → Lưu. Dòng hiện "Đã sửa giá · Buổi học kết thúc sớm". Hộp sửa giá tự hiện nhắc "Khoản này đang giảm 10%…" (hành vi thật của app) | "Lý do hiện trên phiếu gửi phụ huynh" |
| 3 | Phí khác (~10s) | Tab Học sinh → **Thêm phí khác** → **"Giáo trình"**, **150.000đ**, cả lớp tick sẵn → Thêm → "Đã thêm khoản cho 2 học sinh" | "Lớp theo giờ, theo khóa thêm phí khác giống vậy" |
| 4 | Phiếu (~8s) | Phiếu Gia Hân mẫu Mùa thu, QR **725.000đ** | "Phụ huynh thấy rõ từng khoản" |
| 5 | End card (~3,5s) | "Giảm giá, sửa giá, / thêm phí khác." → **Tập 10 · Bảng điểm danh** | |

## Lệch so với kịch bản

- Hook dùng thẻ Gia Hân ở trang Học phí (giống hook tập 7, 8) thay vì phiếu; phiếu để dành cho cảnh 4.
- Cảnh phiếu dùng chung nên chữ trên đầu vẫn là "Phiếu cuối tháng".

## Ghi chú kỹ thuật

- Hộp Học phí dùng lại bản dựng lại `session-fee/RateDialog.tsx`, thêm prop `discount` (ô giảm giá, dòng xem trước "250.000 − 10% = 225.000", dòng lịch sử có giảm giá).
- Hộp Sửa giá và hộp Thêm phí khác là bản dựng lại (`Dialogs.tsx`) vì form nằm trong component.
- Thẻ ở trang Học phí có nhiều loại khoản thì nút mở là "Chọn khoản" (`fee-page.ts` nhận cả nhãn này).
