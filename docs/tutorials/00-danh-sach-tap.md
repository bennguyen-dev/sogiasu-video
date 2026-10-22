# Series video hướng dẫn - danh sách tập

> Bản nháp sống: thêm/sửa tập ở đây trước, viết kịch bản chi tiết thì tạo file riêng `NN-ten-tap.md` rồi gắn link vào cột "Kịch bản".
> Mục tiêu: thay tour hướng dẫn trong app (`features/onboarding`) bằng một trang blog gồm list video hướng dẫn.

## Trạng thái

| # | Tập | Thông điệp chính | Trạng thái | Kịch bản |
|---|---|---|---|---|
| 1 | Tạo lớp đầu tiên | Nhập 1 lần, app tự xếp lịch cả tháng | ✅ Đã dựng | [01-tao-lop-dau-tien.md](01-tao-lop-dau-tien.md) |
| 2 | Điểm danh buổi đầu tiên | Điểm danh, nhận xét, đính kèm, bấm "Đã dạy xong" → học phí tự tính | ✅ Đã dựng | [02-diem-danh-buoi-dau-tien.md](02-diem-danh-buoi-dau-tien.md) |
| 3 | Gửi báo cáo cho phụ huynh | Xuất ảnh mỗi buổi thì ngày nào cũng phải gửi → gửi link 1 lần, phụ huynh tự xem nhận xét, bài tập, lịch học → lấy link trong lớp / từng học sinh → tắt chia sẻ | 📝 Kịch bản nháp | [03-gui-bao-cao-phu-huynh.md](03-gui-bao-cao-phu-huynh.md) |
| 4 | Thu học phí cuối tháng | Trang Học phí: ai còn nợ → gộp phí nhiều buổi → tạo phiếu thu QR đúng số tiền → gửi phụ huynh → đánh dấu đã thu (khoản đã thu bị khoá) | 📝 Ý tưởng | - |
| 5 | Đọc lịch dạy | Màu, trạng thái (đồng hồ cam = chưa chốt), bấm buổi, thêm buổi lẻ, đổi kiểu xem, vào Meet | 📝 Ý tưởng | - |
| 6 | Đổi học phí giữa chừng | Tăng giá từ 1 ngày, buổi cũ giữ giá cũ, phí đã thu không bị đổi | 📝 Ý tưởng | - |

Tập 4 gộp cả phiếu thu QR (trước tách 2 tập): thu tiền là một luồng liền mạch. Gắn tài khoản ngân hàng chỉ nhắc bằng 1 bong bóng; không quay lại băng chuyền mẫu phiếu và chat Zalo của intro.

Thứ tự làm: 3 → 4 → 5 → 6. Tập 2 + tập 5 là điều kiện để bỏ tour (thay tour chi tiết buổi học và nút hướng dẫn ở lịch). Tập 3 + 4 là việc gia sư làm hằng tháng.

## Video ngắn "Làm sao để…" (sau 6 tập chính)

| Chủ đề | Ghi chú |
|---|---|
| Thêm học sinh vào lớp đang chạy | Ngày vào lớp quyết định em có mặt ở buổi nào |
| Học sinh nghỉ một thời gian | Tạm dừng (PAUSED) khác xoá thế nào |
| Học bù / học thử | Attendance MAKEUP / GUEST |
| Huỷ buổi / dời lịch | Báo nghỉ buổi → báo cho học sinh qua Google Calendar |
| Mở lại buổi đã chốt | Khoá khi phí đã thu |
| Gắn tài khoản ngân hàng | Làm 1 lần trước khi tạo phiếu thu QR (tập 4) |
| Phiếu thu hàng loạt | BulkVoucher, cho lớp đông học sinh |
| Kết nối Google | Meet tự động, mời học sinh qua Calendar, Google Drive |
| Lưu tài liệu buổi học | Trang Lưu trữ, đính kèm vào buổi |
| Xem điểm danh cả tháng | Bảng điểm danh tháng |
| Trạng thái Vắng | Vắng vẫn tính tiền, chỉ Có phép mới miễn |
| (tuỳ chọn) Thống kê, gói / nâng cấp | Nếu muốn video phục vụ bán hàng |

## Thế giới demo dùng chung (giữ xuyên suốt các tập)

- Gia sư **Nguyễn Thu Hương**. Hôm nay: **Thứ Hai 05/10/2026**.
- Lớp **"IELTS 5.5 - Lớp 9"**, màu Sage, học phí **Theo buổi học**, T3 + T5 18:00-19:30, 9 buổi từ 01/10 đến 29/10.
- **Minh Anh** 300.000đ/buổi, **Gia Hân** 250.000đ/buổi, cùng vào lớp từ 01/10.
- Đã xảy ra: tập 1 tạo lớp; tập 2 chốt buổi 01/10 (Minh Anh có mặt, BTVN 80%, band 6.5, ảnh bài essay; Gia Hân có phép, lý do "Em bị sốt, gia đình xin cho nghỉ buổi này").
- Gia Hân là cùng một em với lớp 1-1 "Ôn thi vào 10" trong intro (học sinh lớp 9, nên lớp IELTS ghi "Lớp 9").

## Nguyên tắc chung

- Dọc 1080×1920, 30fps, không lời thoại, SFX cho mọi thao tác; nhạc nền dùng chung với intro, chỉ render khi cần.
- Điện thoại layout `TUTORIAL_PHONE`, màn hình **411 px** (để chữ trong app không gãy dòng như ở 390 px).
- Một luồng thao tác thật cho mỗi tập; giải thích bằng khoanh + bong bóng; thao tác user hay hỏi thì làm thật.
- Giao diện là component thật của app, dữ liệu giả, không chạm DB.
- **Không lặp lại cảnh của intro** (`docs/intro.md`): intro đã có điểm danh 1 chạm, báo cáo phụ huynh, bảng tháng, học phí, phiếu QR, Zalo, thống kê. Trùng tính năng thì được, trùng cú quay thì không.
- Không nhắc giới hạn gói miễn phí trong video hướng dẫn.
- Mỗi tập kết bằng end card dẫn sang tập kế (`EndCard` trong `create-class/scenes/EndScene.tsx`).

## Việc còn lại ngoài video

- Trang blog liệt kê các tập (mỗi tập 1 bài riêng có chữ đi kèm để SEO, hay 1 trang tổng hợp?) - chưa chốt.
- Bỏ tour trong app: rà `OnboardingCompleteDialog`, nút "xem lại hướng dẫn" ở `ProfileDropdown` (`resetTour`), `LessonDetailTour`, các `data-tour`; thay bằng link "Xem video hướng dẫn" ở empty state trang Lớp, chi tiết buổi học, trang Học phí.
