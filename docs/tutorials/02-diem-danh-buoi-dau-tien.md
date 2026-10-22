# Tập 2 - Điểm danh buổi đầu tiên

> Kịch bản đã dựng (22/10/2026). Code: `src/videos/attendance/`, timeline: `timeline.ts` + mốc trong `scenes/DetailScene.tsx`. Nối tiếp tập 1: cùng lớp, cùng học sinh, cùng ngày "hôm nay".

| | |
|---|---|
| Nền tảng | TikTok, Reels, YouTube Shorts (+ nhúng vào blog hướng dẫn) |
| Khung | Dọc 1080×1920, 30fps, ~85 giây (2555 frame), layout `TUTORIAL_PHONE` |
| Render | `yarn render:attendance` (chỉ SFX) · `yarn render:attendance:music` (có nhạc) → `out/` |
| Âm thanh | Không lời thoại. SFX cho mọi thao tác; bản có nhạc dùng chung nhạc nền với tập 1 |
| Thông điệp | Điểm danh, nhận xét, đính kèm bài làm, bấm "Đã dạy xong" → học phí tự tính, có phép thì không mất tiền |

## Nguyên tắc dựng

- Giữ nguyên tắc của tập 1: một luồng thao tác thật, khoanh + bong bóng, component thật của app, dữ liệu giả.
- **Không lặp cảnh điểm danh của intro** (Gia Hân có mặt, BTVN 90%, điểm 9, gõ tay nhận xét). Tập này làm thật những gì intro chưa có: lý do nghỉ, câu chọn nhanh, đính kèm file, ghi chú buổi, chốt buổi ra học phí.
- Trang báo cáo phụ huynh để dành cho tập 3.

## Dữ liệu demo

- Gia sư: Nguyễn Thu Hương. Hôm nay: **Thứ Hai 05/10/2026**.
- Lớp **"IELTS 5.5 - Lớp 9"** (từ tập 1), học phí **Theo buổi học**.
- Buổi cần chốt: **Thứ Năm 01/10, 18:00-19:30**, đã qua nên lịch hiện icon đồng hồ cam (chưa hoàn thành).
- **Minh Anh** (300.000đ/buổi): Có mặt, BTVN **80%**, điểm **6.5** (band), 2 câu chọn nhanh, đính kèm ảnh `bai-lam-minh-anh.jpg` (bài essay viết tay).
- **Gia Hân** (250.000đ/buổi): **Có phép**, lý do "Em bị sốt, gia đình xin cho nghỉ buổi này".
- Ghi chú buổi: Nội dung đã dạy "Writing Task 2 - Opinion essay", Bài tập về nhà "Viết 1 bài Task 2 (250 từ)" + đính kèm `task2-sample-essay.pdf`.

## Kịch bản

### 1. Hook (0:00 - 0:03)

| Hình | Chữ | Âm |
|---|---|---|
| Chi tiết buổi đã chốt: Minh Anh có chip **300.000đ**, Gia Hân badge **Có phép**, không có phí. Zoom nhẹ ra | **Dạy xong 1 buổi** / *chốt sổ trong 1 phút* | whoosh, impact nhẹ |

### 2. Mở buổi từ lịch (0:03 - 0:07)

| Hình | Chữ | Âm |
|---|---|---|
| Lịch tháng 10 như cuối tập 1, khoanh cam icon đồng hồ ở buổi 01/10. Tay chạm buổi đó → **Chi tiết buổi học** mở lên | **Buổi đã dạy?** / *Chạm vào để chốt* | whoosh, click |

### 3. Điểm danh (0:07 - 0:22)

Chữ: **Điểm danh** / *1 chạm là lưu* → **Nghỉ có phép?** / *Không tính tiền*

| Lúc | Thao tác | Khoanh + bong bóng |
|---|---|---|
| 0:08 | - | Banner: "Buổi chưa chốt. Điểm danh xong rồi bấm **Đã dạy xong** để tạo học phí" |
| 0:11 | - | Trạng thái Minh Anh đang **Có mặt**: "Mặc định ai cũng có mặt, chỉ sửa bạn nghỉ" |
| 0:14 | Thẻ Gia Hân, chạm **Có phép** (tự lưu, app không hiện toast) | - |
| 0:15 | - | Bảng thống kê Có mặt / Vắng / Có phép (vòng **cam**): "Vắng vẫn tính tiền · Có phép thì không" |
| 0:18 | Ô **Lý do nghỉ** hiện ra, gõ "Em bị sốt, gia đình xin cho nghỉ buổi này" | - |
| 0:20 | - | Ô Lý do: "Lý do nghỉ hiện trong báo cáo cho phụ huynh" |
| 0:21 | Bấm **Lưu** của Gia Hân (lý do nghỉ cũng phải bấm Lưu) → toast "Đã lưu: Gia Hân" | - |

### 4. Đánh giá riêng Minh Anh (0:22 - 0:44)

Chữ: **Đánh giá từng em** → **Không muốn gõ?** / *Bấm câu có sẵn* → **Chữa bài?** / *Chụp gửi luôn*

| Lúc | Thao tác | Khoanh + bong bóng |
|---|---|---|
| 0:23 | Cuộn về thẻ Minh Anh, chọn **Hoàn thành BTVN 80%** | - |
| 0:25 | Nhập **Điểm số 6.5** (bấm 6 rồi +0.5) | Ô điểm: "Chấm theo band hay thang 10 đều được" |
| 0:27 | - | Thẻ Gia Hân (không có ô BTVN/Điểm): "Học sinh nghỉ thì không chấm điểm" |
| 0:30 | **Nhận xét riêng**: bấm 2 câu chọn nhanh "Hiểu bài, nắm được nội dung." + "Cần luyện tập thêm ở nhà." (làm thật) | Hàng câu chọn nhanh: "Bấm câu có sẵn, hoặc sửa lại cho đúng ý" |
| 0:34 | Bấm **Thêm tài liệu** → modal **Đính kèm tài liệu**, tab **Tải lên** → chọn `bai-lam-minh-anh.jpg` → ảnh hiện dưới nhận xét (làm thật) | Tab **Google Drive**: "Lấy file có sẵn trên Drive cũng được" |
| 0:39 | - | Ảnh vừa thêm: "Chụp bài viết của con, phụ huynh xem được trong báo cáo" |
| 0:41 | Bấm **Lưu** → toast "Đã lưu: Minh Anh" | Nhãn **Chưa lưu** trước khi bấm: "Nhận xét phải bấm Lưu (điểm danh thì tự lưu)" |

### 5. Ghi chú buổi học (0:44 - 1:00)

Chữ: **Ghi chú buổi học** / *Cả lớp cùng thấy*

| Lúc | Thao tác | Khoanh + bong bóng |
|---|---|---|
| 0:45 | Chạm **Nội dung đã dạy**, gõ "Writing Task 2 - Opinion essay" | Nút mic: "Lười gõ? Bấm mic để nói" |
| 0:49 | Chạm **Bài tập về nhà**, gõ "Viết 1 bài Task 2 (250 từ)", bấm **Thêm tài liệu** ngay dưới → tải lên `task2-sample-essay.pdf` (làm thật) | File PDF: "Gắn bài mẫu vào đúng ô Bài tập về nhà" |
| 0:55 | - | **Nhận xét chung** + **Kế hoạch buổi sau**: "Nhận xét cả lớp và việc buổi sau, điền khi cần" |
| 0:58 | - | Nhãn hiển thị cho phụ huynh ở đầu thẻ: "Mọi ghi chú và file đều vào báo cáo của từng em" |

### 6. Chốt buổi (1:00 - 1:12)

Chữ: **Bấm Đã dạy xong** / *Học phí tự tạo*

| Lúc | Thao tác | Khoanh + bong bóng |
|---|---|---|
| 0:59 | - | Nút **Đã dạy xong**: "Quan trọng: chưa bấm Đã dạy xong thì chưa có học phí" |
| 1:02 | Bấm **Đã dạy xong** → hộp **Xác nhận hoàn thành** | Mô tả trong hộp: "Chốt buổi = tạo học phí cho từng em theo điểm danh" |
| 1:05 | Bấm **Xác nhận** → toast "Đã hoàn thành buổi học", banner chuyển sang đã chốt | - |
| 1:06 | - | Chip **300.000đ** ở Minh Anh: "Có mặt → tính theo giá riêng của em" |
| 1:09 | - | Thẻ Gia Hân không có phí (vòng **cam**): "Có phép → 0đ, không phải trừ tay" |

### 7. Lịch (1:12 - 1:16)

| Hình | Chữ | Âm |
|---|---|---|
| Đóng chi tiết, về lịch tháng: buổi 01/10 mất icon đồng hồ cam, thành đã hoàn thành | **Xong buổi đầu tiên** / *8 buổi còn lại y hệt* | whoosh, confirm |

### 8. End card (1:16 - 1:20)

| Hình | Chữ | Âm |
|---|---|---|
| Nền tối, logo | Tập 2 · Điểm danh buổi đầu tiên / **Chốt buổi, học phí tự tính.** / thẻ "Tập 3 · Gửi báo cáo cho phụ huynh →" / **sogiasu.com** | pop, impact, pop |

## Đã cân nhắc nhưng không đưa vào

- **Bấm thật trạng thái Vắng:** chỉ nói trong bong bóng, đỡ dài.
- **Trang báo cáo phụ huynh:** intro đã có, dời sang tập 3.
- **Mở lại buổi học, khoá khi phí đã thu, Học bù / Học thử:** để dành cho video "Làm sao để…".
- **Nút "Tất cả có mặt":** mặc định đã là có mặt.
- **Dán ảnh thẳng vào ô ghi chú, giới hạn dung lượng gói miễn phí:** không nhắc.

## Lưu ý khi sửa

- Thời điểm chi tiết từng thao tác (frame) nằm ở đầu `scenes/DetailScene.tsx`; cột "Lúc" ở trên chỉ là mốc xấp xỉ.
- Thẻ điểm danh dựng lại khung của `AttendanceStudentRow` quanh form do scene điều khiển (`DetailPage.tsx`), các field bên trong là component thật. App sửa markup hàng điểm danh thì cập nhật theo.
- App đọc độ rộng màn hình bằng JS từ cửa sổ 1080 px, nên modal đính kèm và ô ghi chú buổi học hiện kiểu desktop/tablet (dialog giữa màn hình, sửa ghi chú ngay trong ô). Trên điện thoại thật hai chỗ này mở dạng drawer từ dưới lên.
- Ảnh bài làm `public/demo/minh-anh-essay.jpg` dựng từ composition `EssayPhoto`: `npx remotion still EssayPhoto public/demo/minh-anh-essay.jpg --image-format=jpeg`.
