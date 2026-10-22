# Tập 4 - Thu học phí cuối tháng

> Kịch bản đã dựng (22/10/2026). Code: `src/videos/fees/`, timeline: `timeline.ts` + mốc trong `scenes/FeeScenes.tsx`. Nhảy tới cuối tháng 10: lớp đã dạy đủ 9 buổi.

|            |                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------- |
| Nền tảng   | TikTok, Reels, YouTube Shorts (+ nhúng vào blog hướng dẫn)                               |
| Khung | Dọc 1080×1920, 30fps, ~56 giây (1677 frame), layout `TUTORIAL_PHONE` (411 px) |
| Render | `yarn render:fees` (chỉ SFX) · `yarn render:fees:music` (có nhạc) → `out/` |
| Âm thanh   | Không lời thoại. SFX cho mọi thao tác; bản có nhạc dùng chung nhạc nền với các tập trước |
| Thông điệp | Cuối tháng app cộng sẵn, tạo phiếu có QR đúng số tiền, thu xong bấm 1 nút                |

## Nguyên tắc riêng tập này

- **Không quay lại băng chuyền mẫu phiếu và cảnh Zalo của intro.** Chọn mẫu chỉ lướt dải mẫu ~1 giây rồi bấm 1 mẫu; Zalo chỉ 1 nhịp ngắn.
- **Tài khoản demo là gói Pro**: mẫu Pro tải/chia sẻ bình thường, không hiện dòng khoá. Nhãn "Pro" trên dải mẫu vẫn hiện, không nhắc tới.
- Hộp **Phiếu học phí** giới thiệu đủ 5 tuỳ chọn theo đúng thứ tự trong app, mỗi tuỳ chọn bật lên là phiếu xem trước đổi theo.
- Gộp phiếu (nhiều học sinh/anh chị em vào 1 phiếu) không đưa vào, để video "Làm sao để…".

## Dữ liệu demo

- Hôm nay **Thứ Bảy 31/10/2026**. Lớp **"IELTS 5.5 - Lớp 9"**, 9 buổi tháng 10 đã chốt hết.
- **Minh Anh:** có mặt cả 9 buổi × 300.000đ = **2.700.000đ**.
- **Gia Hân:** nghỉ có phép 01/10 (không tính), 8 buổi × 250.000đ = **2.000.000đ**.
- Tổng chưa thu: **4.700.000đ · 2 học sinh**.
- Đã gắn tài khoản ngân hàng (phiếu có QR). Mẫu mặc định **Cơ bản**, đổi sang **Mùa thu**.
- Lời nhắn: _"Tháng 10 Minh Anh tiến bộ rõ ở phần Writing: bài viết mạch lạc hơn, ít sai số nhiều và trạng từ. Tháng 11 cô sẽ cho em luyện thêm từ vựng theo chủ đề ạ."_

## Kịch bản

### 1. Hook (0:00 - 0:03)

| Hình                                                                 | Chữ                                                   | Âm                 |
| -------------------------------------------------------------------- | ----------------------------------------------------- | ------------------ |
| Phiếu học phí mẫu Mùa thu của Minh Anh, QR + 2.700.000đ. Zoom nhẹ ra | **Thu học phí cuối tháng** / _không cần bấm máy tính_ | whoosh, impact nhẹ |

### 2. Trang Học phí (0:03 - 0:14)

Chữ: **Cuối tháng** / _Học phí cộng sẵn_

| Lúc  | Thao tác                                 | Khoanh + bong bóng                                                                          |
| ---- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| 0:04 | Trang Học phí, tab **Học phí chưa thu**  | Dòng "Học phí chưa thu: 4.700.000đ · 2 học sinh": "Chỉ buổi đã bấm Đã dạy xong mới vào đây" |
| 0:08 | -                                        | Thẻ Gia Hân "8 buổi · 2.000.000đ" (vòng **cam**): "Buổi nghỉ có phép không tính"            |
| 0:12 | Bấm **Tạo phiếu học phí** ở thẻ Minh Anh | -                                                                                           |

### 3. Hộp Phiếu học phí: 5 tuỳ chọn (0:14 - 0:48)

Chữ: **Phiếu có QR** / _đúng số tiền_ → **Tuỳ chỉnh phiếu** / _bật là thấy ngay_

| Lúc  | Thao tác                                                                                         | Khoanh + bong bóng                                                                |
| ---- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| 0:15 | Hộp mở, phiếu mẫu Cơ bản 2.700.000đ                                                              | Mã QR trên phiếu: "QR có sẵn số tiền, phụ huynh quét là chuyển"                   |
| 0:19 | -                                                                                                | Ô **Nội dung chuyển khoản**: "Phụ huynh ghi đúng nội dung này, cô đối soát nhanh" |
| 0:23 | Bật **Ẩn chi tiết học phí** → danh sách 9 buổi trên phiếu gọn lại                                | "Phụ huynh chỉ cần con số? Ẩn bớt chi tiết"                                       |
| 0:27 | Tắt lại (giữ chi tiết)                                                                           | -                                                                                 |
| 0:29 | Bật **Kèm phiếu báo cáo** → hiện thêm ảnh bảng báo cáo tháng 10                                  | "Gửi kèm báo cáo cả tháng, tự lấy đúng khoảng ngày đang thu"                      |
| 0:34 | Bật **Kèm lời nhắn**, bấm **Xem lại nhận xét các buổi** → hộp nhận xét các buổi mở 1 nhịp → đóng | "Xem lại nhận xét để viết lời nhắn cho đúng"                                      |
| 0:39 | Gõ lời nhắn tiến bộ của Minh Anh → lời nhắn hiện trên phiếu                                      | -                                                                                 |
| 0:43 | **Chọn mẫu**: lướt dải mẫu ~1 giây, bấm **Mùa thu** → phiếu đổi giao diện                        | "Chọn 1 lần, app nhớ mẫu cho các phiếu sau"                                       |

### 4. Gửi (0:48 - 0:54)

Chữ: **Gửi phụ huynh** / _1 chạm_

| Lúc  | Thao tác                                                                                         | Khoanh + bong bóng |
| ---- | ------------------------------------------------------------------------------------------------ | ------------------ |
| 0:48 | Bấm **Chia sẻ ảnh**                                                                              | -                  |
| 0:50 | Cắt nhanh sang Zalo Mẹ Minh Anh: phiếu Mùa thu + ảnh báo cáo; phụ huynh: "Chị chuyển rồi nha cô" | -                  |

### 5. Đã thu tiền (0:54 - 1:08)

Chữ: **Nhận tiền rồi?** / _Bấm Đã thu tiền_

| Lúc  | Thao tác                                                                                            | Khoanh + bong bóng                                          |
| ---- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 0:55 | Về trang Học phí, thẻ Minh Anh: bấm **Đã thu tiền**                                                 | -                                                           |
| 0:57 | Hộp **Xác nhận đã thu tiền**: "Bạn đã nhận 2.700.000đ (9 khoản) từ Minh Anh?" → bấm **Đã thu tiền** | -                                                           |
| 1:00 | Toast "Đã thu 9 khoản cho Minh Anh"; thẻ Minh Anh biến mất, tổng còn 2.000.000đ · 1 học sinh        | Dòng tổng: "Còn ai chưa đóng, nhìn là biết"                 |
| 1:04 | -                                                                                                   | "Đã thu thì khoá: sau này đổi học phí cũng không ảnh hưởng" |

### 6. Lịch sử thu (1:08 - 1:16)

| Lúc  | Thao tác                                                                         | Khoanh + bong bóng                                                     |
| ---- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1:09 | Bấm tab **Lịch sử thu**: "Đã thu trong tháng: 2.700.000đ", dòng Minh Anh 9 khoản | -                                                                      |
| 1:12 | -                                                                                | Nút **Hoàn tác**: "Lỡ bấm nhầm? Hoàn tác, khoản quay lại mục Chưa thu" |

### 7. End card (1:16 - 1:20)

| Hình          | Chữ                                                                                                                  | Âm               |
| ------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Nền tối, logo | Tập 4 · Thu học phí cuối tháng / **Thu đủ,<br>không cần máy tính.** / thẻ "Tập 5 · Đọc lịch dạy →" / **sogiasu.com** | pop, impact, pop |

## Đã cân nhắc nhưng không đưa vào

- **Băng chuyền 10 mẫu:** intro đã có; tập này chỉ chỉ chỗ chọn mẫu.
- **Gộp phiếu** (anh chị em chung 1 phiếu), **Tạo nhiều phiếu** (hàng loạt), **Sửa giá buổi**: video "Làm sao để…".
- **Chọn buổi** (thu một phần tháng): không cần cho lần thu đầu.
- **Gắn tài khoản ngân hàng:** video "Làm sao để…" riêng.

## Khác với bảng trên khi dựng

- **Trên điện thoại, hộp Phiếu học phí xếp tuỳ chọn ở trên, phiếu xem trước ở dưới**, nên bật 1 tuỳ chọn không thấy phiếu đổi ngay. Video chỉnh lần lượt các tuỳ chọn rồi mới cuộn xuống phiếu thành phẩm (Mùa thu, QR, lời nhắn) và ảnh báo cáo.
- **Ẩn chi tiết học phí** chỉ khoanh + giải thích, không bật/tắt.
- Cảnh "Đã thu thì khoá" nằm ở tab Lịch sử thu (khoanh thẻ Minh Anh), không ở trang Chưa thu.

## Lưu ý khi sửa

- Hộp Phiếu học phí (`VoucherDialog.tsx`) dựng lại khung của `PaymentQRDialog` quanh form do scene điều khiển: app làm trễ lời nhắn 400 ms và đọc tuỳ chọn đã lưu từ localStorage, render từng frame không giữ được. Các tuỳ chọn, phiếu xem trước, ảnh báo cáo, hộp nhận xét các buổi là component thật.
- Phần tử trong iframe của điện thoại không qua được `instanceof HTMLElement` của cửa sổ chính: kiểm tra bằng thuộc tính, không bằng `instanceof`.
- Hộp cuộn dừng ở đáy: độ cuộn bị giới hạn bằng `maxScroll` để vòng khoanh không lệch.
