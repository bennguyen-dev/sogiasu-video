# Tập 1 - Tạo lớp đầu tiên

> Kịch bản bản đã dựng (duyệt 20/10/2026). Dựng lại 23/10: cảnh 2 đổi sang trang Tổng quan. Code: `src/videos/create-class/`, timeline: `timeline.ts`.

| | |
|---|---|
| Nền tảng | TikTok, Reels, YouTube Shorts (+ nhúng vào blog hướng dẫn) |
| Khung | Dọc 1080×1920, 30fps, ~71 giây (2134 frame) |
| Âm thanh | Không lời thoại. SFX cho mọi thao tác; bản có nhạc dùng chung nhạc nền với video intro |
| Thông điệp | Nhập 1 lần, app tự xếp lịch cả tháng - kể cả các buổi đã dạy từ đầu tháng |
| Render | `yarn render:create-class` (chỉ SFX) · `yarn render:create-class:music` (có nhạc) → `out/` |

## Nguyên tắc dựng

- **Một luồng thao tác thật**, từ trang Lớp học trống tới lịch tháng đã kín buổi. Không tách thành nhiều video.
- **Giải thích bằng khoanh + bong bóng** ngay lúc thao tác: vòng xanh khoanh phần đang nói, bong bóng chữ trắng nền tối trỏ vào. Mỗi bong bóng dừng ~2 giây.
- **Các thao tác user hay hỏi thì làm thật**, không chỉ giải thích: bấm 1 thứ 2 lần, Tùy chỉnh ngày bắt đầu trong quá khứ, chọn ngày vào lớp.
- Chữ phía trên điện thoại: 1 dòng nhỏ màu xám + 1 dòng tiêu đề.
- Toàn bộ giao diện là component thật của app, dữ liệu giả, không chạm DB.

## Dữ liệu demo

- Gia sư: Nguyễn Thu Hương, tài khoản mới (chưa có lớp nào). Hôm nay: **Thứ Hai 05/10/2026**.
- Lớp **"IELTS 5.5 - Lớp 9"**, màu Sage (xanh lá), học phí **Theo buổi học**.
- Học sinh: **Minh Anh 300.000đ/buổi**, **Gia Hân 250.000đ/buổi**, cùng vào lớp từ **01/10**.
- Lịch: **Thứ 3 + Thứ 5, 18:00-19:30**, từ **01/10 đến 01/11** → **9 buổi** (01, 06, 08, 13, 15, 20, 22, 27, 29/10).

## Kịch bản

### 1. Hook (0:00 - 0:03)

| Hình | Chữ | Âm |
|---|---|---|
| Lịch tháng 10 đã kín 9 buổi xanh lá, zoom nhẹ ra | **Xếp lịch cả tháng** / *chỉ trong 1 phút* | whoosh, impact nhẹ |

### 2. Trang Tổng quan của tài khoản mới (0:03 - 0:07)

| Hình | Chữ | Âm |
|---|---|---|
| Điện thoại trượt lên, trang **Tổng quan** của tài khoản mới (thanh dưới sáng tab **Tổng quan**): lời chào, thẻ **"Bắt đầu với lớp học đầu tiên"** với 3 bước Tạo lớp → Thêm học sinh → Lên lịch buổi học, các thẻ số liệu còn trống. Khoanh thẻ, bong bóng "3 bước là xong lớp đầu tiên". Tay bấm **Tạo lớp đầu tiên** → vào Bước 1/3 | **Tài khoản mới?** / *Bắt đầu từ đây* | whoosh, tick, click |

Ba bước trên thẻ trùng đúng 3 bước của wizard, nên các tiêu đề "Bước 1/3, 2/3, 3/3" phía sau nối tiếp thẻ này.

### 3. Bước 1/3 - Thông tin lớp (0:05 - 0:23)

Chữ: **Bước 1/3** / Đặt tên & chọn màu → **Học phí** / *3 cách tính tiền* → **Dạy online?** / *Link học chung*

| Lúc | Thao tác | Khoanh + bong bóng |
|---|---|---|
| 0:06 | Chạm ô Tên lớp, gõ "IELTS 5.5 - Lớp 9" | - |
| 0:07 | Mở bảng màu, chọn **Sage** | - |
| 0:09 | - | Thẻ **Theo giờ**: "Theo giờ: buổi dạy 2 tiếng thì tính tiền 2 giờ" |
| 0:11 | - | Thẻ **Theo buổi học**: "Theo buổi: điểm danh buổi nào, tính tiền buổi đó" |
| 0:13 | - | Thẻ **Theo khóa học**: "Theo khóa: thu trọn gói một đợt, VD khóa tháng 10" |
| 0:15 | - | Dòng "Không thể thay đổi sau khi tạo lớp" (vòng **cam**): "Chọn kỹ nhé: tạo lớp xong là không đổi được hình thức học phí" |
| 0:17 | - | Ô **Link online chung**: "Dạy online? Một link dùng chung cho mọi buổi, gửi học sinh 1 lần là xong" |
| 0:20 | - | Nút **Tạo link Meet**: "Bấm để tạo link Google Meet (cần kết nối Google), hoặc dán link Zoom có sẵn" |
| 0:22 | Bấm **Tiếp tục** | - |

### 4. Bước 2/3 - Học sinh (0:23 - 0:42)

Chữ: **Bước 2/3** / Thêm học sinh → **Học phí mỗi buổi** / *Mỗi em một giá*

| Lúc | Thao tác | Khoanh + bong bóng |
|---|---|---|
| 0:23 | - | Dòng chú thích dưới "Học sinh trong lớp": "Ngày vào lớp quyết định em có mặt ở những buổi nào. Học từ đầu tháng thì chọn ngày 1" |
| 0:26 | Cuộn tới thẻ học sinh 1 | Nút **Mới / Cũ**: "Mới: tạo học sinh mới · Cũ: chọn em đã có ở lớp khác" |
| 0:29 | Gõ "Minh Anh", học phí **300.000** | - |
| 0:30 | Mở lịch chọn ngày ở **Ngày vào lớp**, chọn **ngày 1** (làm thật) | - |
| 0:32 | - | Nút **Thêm thông tin**: "Thêm email và SĐT phụ huynh, để mời học và gửi báo cáo" |
| 0:35 | Bấm **Thêm học sinh** → hàng 2 tự có 300.000 + 01/10 | Học phí + ngày vào lớp của hàng 2: "Hàng mới tự chép học phí và ngày vào lớp của hàng trên" |
| 0:38 | Gõ "Gia Hân", sửa học phí thành **250.000** | - |
| 0:40 | Cuộn cho thấy cả 2 giá | Khoanh 2 ô học phí (không bong bóng), chữ trên: *Mỗi em một giá* |
| 0:41 | Bấm **Tiếp tục** | - |

### 5. Bước 3/3 - Lịch học (0:42 - 1:00)

Chữ: **Bước 3/3** / Chọn thứ & giờ học → **Lớp học từ đầu tháng?** / *Tạo lại buổi đã dạy* → **Đồng bộ lịch** / *Kết nối Google* → **App tự sinh** / *cả 9 buổi*

| Lúc | Thao tác | Khoanh + bong bóng |
|---|---|---|
| 0:43 | Chạm **T3**, rồi **T5** → app tự điền 18:00-19:30 cho từng ca | - |
| 0:45 | Bấm **T5 lần nữa** (làm thật) → nút thành "T5 (2)", thêm ca Thứ Năm thứ 2, footer "Tạo lớp + 12 buổi" | Danh sách ca: "Bấm 1 thứ 2 lần = 2 ca trong cùng ngày, mỗi ca một giờ riêng" |
| 0:47 | Bấm thùng rác xoá ca thừa → về 8 buổi | - |
| 0:49 | Cuộn tới "Tạo buổi học trong khoảng", bấm **Tùy chỉnh** (làm thật) | Ô Ngày bắt đầu / kết thúc: "Tùy chỉnh: chọn ngày bắt đầu trong quá khứ để tạo lại các buổi đã dạy" |
| 0:51 | Mở lịch ở **Ngày bắt đầu**, chọn **ngày 1** → 9 buổi; app hiện thông báo "1 buổi trước hôm nay sẽ không lên Google Calendar" | - |
| 0:53 | Cuộn tới đồng bộ | Dòng **Đồng bộ Google Calendar**: "Kết nối Google để tự tạo link Meet, đưa lịch lên Google Calendar và mời học sinh qua email" |
| 0:56 | Cuộn tới danh sách buổi | Hàng **Chọn tất cả (9/9)**: "Xem trước từng buổi. Bỏ tick buổi nghỉ, VD ngày lễ" |
| 0:59 | Bấm **Tạo lớp + 9 buổi** → toast xanh *Đã tạo lớp "IELTS 5.5 - Lớp 9" với 9 buổi học* | - |

### 6. Lịch tuần (1:00 - 1:02)

| Hình | Chữ | Âm |
|---|---|---|
| Mở Lịch dạy (tuần 05-11/10), toast tắt dần, cuộn xuống khoanh 2 buổi T3 + T5 lúc 18:00, cuộn lại. Tay bấm **Tháng** | **Xong! Mở Lịch dạy** / Buổi học đã lên lịch | whoosh, drop ×2, click |

### 7. Lịch tháng (1:02 - 1:06)

| Hình | Chữ | Âm |
|---|---|---|
| Lịch tháng 10, 9 buổi lần lượt bật ra (từ 01/10) | **Cả 9 buổi** / *Xong lịch cả tháng* | drop mỗi buổi, impact nhẹ |

### 8. End card (1:06 - 1:09)

| Hình | Chữ | Âm |
|---|---|---|
| Nền tối, logo | Tập 1 · Tạo lớp đầu tiên / **Xong lịch cả tháng.** / thẻ "Tập 2 · Điểm danh buổi đầu tiên →" / **sogiasu.com** | pop, impact, pop |

## Đã cân nhắc nhưng không đưa vào

- **Trùng lịch:** lớp đầu tiên không thể trùng với buổi nào → để dành cho video thêm buổi / lớp thứ hai.
- **Dán danh sách từ Excel, Phí khác, Mô tả lớp, màu Google Calendar:** có trong app nhưng không phải thao tác của lần tạo lớp đầu tiên.
- **Giới hạn 8 học sinh của gói miễn phí:** không nhắc trong video hướng dẫn.
