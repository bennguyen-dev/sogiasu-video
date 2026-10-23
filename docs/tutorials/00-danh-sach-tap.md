# Series video hướng dẫn - danh sách tập

> Bản nháp sống: thêm/sửa tập ở đây trước, viết kịch bản chi tiết thì tạo file riêng `NN-ten-tap.md` rồi gắn link vào cột "Kịch bản".
> Mục tiêu: thay tour hướng dẫn trong app (`features/onboarding`) bằng một trang blog gồm list video hướng dẫn.

## Trạng thái

| # | Tập | Thông điệp chính | Trạng thái | Kịch bản |
|---|---|---|---|---|
| 1 | Tạo lớp đầu tiên | Nhập 1 lần, app tự xếp lịch cả tháng | ✅ Đã dựng | [01-tao-lop-dau-tien.md](01-tao-lop-dau-tien.md) |
| 2 | Điểm danh buổi đầu tiên | Điểm danh, nhận xét, đính kèm, bấm "Đã dạy xong" → học phí tự tính | ✅ Đã dựng | [02-diem-danh-buoi-dau-tien.md](02-diem-danh-buoi-dau-tien.md) |
| 3 | Gửi báo cáo cho phụ huynh | Xuất ảnh mỗi buổi thì ngày nào cũng phải gửi → gửi link 1 lần, phụ huynh tự xem nhận xét, bài tập, lịch học → lấy link trong lớp / từng học sinh → tắt chia sẻ | ✅ Đã dựng | [03-gui-bao-cao-phu-huynh.md](03-gui-bao-cao-phu-huynh.md) |
| 4 | Thu học phí cuối tháng | Trang Học phí cộng sẵn → tạo phiếu QR (giới thiệu 5 tuỳ chọn, mẫu Mùa thu) → gửi phụ huynh → Đã thu tiền → Lịch sử thu, hoàn tác | ✅ Đã dựng | [04-thu-hoc-phi-cuoi-thang.md](04-thu-hoc-phi-cuoi-thang.md) |
| 5 | Lịch dạy hằng tuần | Chỉnh khoảng giờ 9h-22h → đọc trạng thái (hoàn thành, chưa chốt, cần kiểm tra) → báo nghỉ → thêm buổi dạy bù → lọc lớp → gửi ảnh lịch tuần vào nhóm lớp | ✅ Đã dựng | [05-lich-day-hang-tuan.md](05-lich-day-hang-tuan.md) |
| 6 | Học phí theo buổi | Mỗi buổi chốt tính 1 khoản → đổi giá từ 1 ngày: buổi cũ giữ giá, khoản đã thu không đổi, khoản chưa thu tự tính lại | ✅ Đã dựng | [06-hoc-phi-theo-buoi.md](06-hoc-phi-theo-buoi.md) |
| 7 | Học phí theo giờ | Buổi dài ngắn khác nhau: tiền = số giờ × giá giờ, app tự nhân → tăng giá giờ từ 01/11: tháng 11 giá mới, tháng 10 đã thu giữ giá cũ → phiếu học phí | ✅ Đã dựng | [07-hoc-phi-theo-gio.md](07-hoc-phi-theo-gio.md) |
| 8 | Học phí theo khóa | Thu tiền trọn gói theo khóa học: thêm khóa tháng 11 cho cả lớp → khóa tháng 10 chưa thu hiện Quá hạn → mục Học phí mỗi khóa một dòng → phiếu học phí | ✅ Đã dựng | [08-hoc-phi-theo-khoa.md](08-hoc-phi-theo-khoa.md) |
| 9 | Giảm giá, sửa giá, phí khác | Gia Hân giảm 10% từ 01/11 → sửa giá buổi 07/11 (buổi học kết thúc sớm) → phí Giáo trình cho cả lớp → cả 3 hiện trên phiếu | ✅ Đã dựng | [09-giam-gia-sua-gia-phi-khac.md](09-giam-gia-sua-gia-phi-khac.md) |
| 10 | Bảng điểm danh | Card nổi như intro: xem cả tháng mọi lớp, ai nghỉ ai vắng → về khung điện thoại: điểm danh 1 ô → chốt buổi ngay trên bảng | 📋 Đã chốt kịch bản | [10-bang-diem-danh.md](10-bang-diem-danh.md) |
| 11 | Xem doanh thu | Trang Phân tích: đã thu theo tháng, đã thu vs tiềm năng theo lớp, số buổi và giờ dạy | 📝 Ý tưởng | - |

Tập 4 gộp cả phiếu thu QR (trước tách 2 tập): thu tiền là một luồng liền mạch. Gắn tài khoản ngân hàng chỉ nhắc bằng 1 bong bóng; không quay lại băng chuyền mẫu phiếu và chat Zalo của intro.

Tập 6-8: hình thức học phí chọn 1 lần lúc tạo lớp, không đổi được → mỗi tập mở bằng cảnh chọn hình thức (~2 giây), mỗi tập kết bằng cảnh phiếu học phí (mẫu Mùa thu như tập 4) rồi end card dẫn sang tập kế. Lớp demo lấy đúng hình thức trong dữ liệu intro: tập 6 lớp IELTS (theo buổi), tập 7 "IELTS Speaking 1-1" - Đỗ Khánh Linh (theo giờ), tập 8 "IELTS Foundation (khóa tháng)" - Bùi Thu Trang + 2 em thêm trong tập (theo khóa). Tập 9 dùng chung cho cả 3 hình thức.

Thứ tự làm: 6 → 7 → 8 → 9 → 10 → 11. Tập 2 + tập 5 là điều kiện để bỏ tour (thay tour chi tiết buổi học và nút hướng dẫn ở lịch). Tập 3 + 4 là việc gia sư làm hằng tháng.

## Video ngắn "Làm sao để…" (sau 6 tập chính)

| Chủ đề | Ghi chú |
|---|---|
| Thêm học sinh vào lớp đang chạy | Ngày vào lớp quyết định em có mặt ở buổi nào |
| Học sinh nghỉ một thời gian | Tạm dừng (PAUSED) khác xoá thế nào |
| Mở lại buổi đã chốt | Khoá khi phí đã thu |
| Gắn tài khoản ngân hàng | Làm 1 lần trước khi tạo phiếu thu QR (tập 4) |
| Phiếu thu hàng loạt | BulkVoucher, cho lớp đông học sinh |
| Gộp phiếu anh chị em | Nhiều học sinh cùng nhà vào 1 phiếu (MergeDock) |
| Kết nối Google | Meet tự động, mời học sinh qua Calendar, Google Drive |
| Lưu tài liệu buổi học | Trang Lưu trữ, đính kèm vào buổi |
| Trạng thái Vắng | Vắng vẫn tính tiền, chỉ Có phép mới miễn |
| (tuỳ chọn) Gói / nâng cấp | Nếu muốn video phục vụ bán hàng |

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
