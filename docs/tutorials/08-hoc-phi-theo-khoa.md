# Tập 8 - Học phí theo khóa

> Kịch bản đã dựng (23/10/2026). Code: `src/videos/course-fee/`, timeline: `timeline.ts` + mốc trong từng file `scenes/`. Cùng thế giới với tập 6, 7 (Thứ Năm 12/11/2026), lớp theo khóa có sẵn trong dữ liệu intro.

|            |                                                                                    |
| ---------- | ---------------------------------------------------------------------------------- |
| Nền tảng   | TikTok, Reels, YouTube Shorts (+ nhúng vào blog hướng dẫn)                         |
| Khung      | Dọc 1080×1920, 30fps, ~34 giây (1023 frame), layout `TUTORIAL_PHONE` (411 px)      |
| Render     | `yarn render:course-fee` (chỉ SFX) · `yarn render:course-fee:music` (có nhạc) → `out/` |
| Âm thanh   | Không lời thoại. SFX cho mọi thao tác; bản có nhạc dùng chung nhạc nền             |
| Thông điệp | Thu tiền trọn gói theo khóa học: thêm khóa cho cả lớp, chưa thu hết khóa thì Quá hạn |

## Nguyên tắc riêng tập này

- Câu chữ nói thẳng việc app làm, không câu chốt kiểu quảng cáo.
- Không quay thao tác "Đã thu tiền" (tập 4 đã có).
- Theo khóa không có lịch sử giá: mỗi khóa tự nhập số tiền, khóa tháng 11 giá mới 2.800.000đ.
- Kết bằng phiếu học phí mẫu **Mùa thu** như tập 4, 6, 7.

## Dữ liệu demo

- Hôm nay **Thứ Năm 12/11/2026**. Lớp **"IELTS Foundation (khóa tháng)"**, 3 học sinh: **Bùi Thu Trang** (intro), **Lê Quang Huy**, **Phạm Ngọc Ánh** (chỉ dùng trong tập này).
- Khóa tháng 10 (01/10 - 31/10): **2.500.000đ**. Huy, Ánh đã thu; Thu Trang chưa thu → **Quá hạn**.
- Khóa tháng 11 (01/11 - 30/11): **2.800.000đ**, thêm trong video cho cả 3 em.

## Kịch bản

| # | Cảnh | Diễn biến | Chữ trên màn hình |
|---|---|---|---|
| 0 | Hook (3s) | Trang Học phí, thẻ Thu Trang mở: 2 khóa | "Thu tiền trọn gói / theo khóa học" |
| 1 | Chọn hình thức (5,3s) | Cảnh dùng chung, ô **Theo khóa học** | "Mỗi khóa thu một khoản, không tính theo buổi" · "Chọn 1 lần lúc tạo lớp…" |
| 2 | Thêm khóa (12,5s) | Tab Học sinh: thẻ Thu Trang khóa tháng 10 Quá hạn → **Thêm khóa** → gõ "Khóa tháng 11", 2.800.000; Từ ngày có sẵn 01/11, chọn Đến ngày 30/11; 3 em tick sẵn → **Thêm khóa học** → toast "Đã thêm khóa học cho 3 học sinh" | "Hết khóa mà chưa thu sẽ hiện Quá hạn" · "Mỗi học sinh có một khoản riêng" |
| 3 | Mục Học phí (4,7s) | Mở thẻ Thu Trang (**Chọn kỳ**): Khóa tháng 10 (Quá hạn) + Khóa tháng 11 | "Tính theo khóa, không theo số buổi" |
| 4 | Phiếu học phí (5s) | Cảnh dùng chung: phiếu 2 khóa, QR **5.300.000đ** | "Phiếu gộp cả khóa tháng 10 chưa thu" |
| 5 | End card (3,5s) | "Thu tiền trọn gói / theo khóa học.", dẫn sang Tập 9 | |

## Ghi chú kỹ thuật

- Hộp "Thêm khóa học cho nhiều học sinh" là bản dựng lại (`CourseDialog.tsx`) vì form của `BulkCourseFeeDialog` nằm trong component, không điều khiển theo frame được.
- Ô "Từ ngày" 01/11 có sẵn đúng như app (ngày sau khóa muộn nhất của lớp); không có bong bóng giải thích.
- Thẻ học sinh ở tab Học sinh (`CourseFeeLedger`) chỉ hiện 1 khóa: trước khi thêm là tháng 10 (Quá hạn), sau khi thêm là tháng 11 (Chờ thu) + "Còn 1 kỳ chưa thu". Vì vậy bong bóng Quá hạn đặt ở đầu cảnh 2, trước khi thêm khóa.
