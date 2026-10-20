# Video intro - Sổ Gia Sư

> Kịch bản bản đã dựng. Code: `src/videos/intro/`, timeline: `timeline.ts`. Video quảng bá, không phải hướng dẫn: nhịp nhanh, chữ to, mỗi cảnh 1 lợi ích.

| | |
|---|---|
| Nền tảng | TikTok, Reels, YouTube Shorts |
| Khung | Dọc 1080×1920, 30fps, ~59 giây (1770 frame); nhịp cắt theo beat 120 bpm (15 frame/beat) |
| Âm thanh | Không lời thoại. SFX cho mọi thao tác; bản có nhạc dùng "Happy Upbeat" (DELOSound, Pixabay), nhạc hạ xuống trước cú nhấn ở CTA |
| Thông điệp | Sổ tay, Excel, tin nhắn chồng chất? Để Sổ Gia Sư lo |
| Render | `yarn render` (chỉ SFX) · `yarn render:music` (có nhạc) → `out/` |

## Cấu trúc

Hai nửa, nối bằng một màn chuyển chương:

1. **Trong tháng:** xếp lịch → điểm danh → báo cáo cho phụ huynh.
2. **Cuối tháng:** bảng điểm danh cả tháng → học phí tự cộng → phiếu thu QR → gửi Zalo, phụ huynh chuyển khoản → thống kê thu tiền.

Layout `INTRO_PHONE`: điện thoại to, trượt lên từ đáy khung và bị cắt ở đáy, chữ tiêu đề 2 dòng phía trên. Một số cảnh (lịch tuần, bảng điểm danh, thống kê) dùng giao diện desktop/tablet thu nhỏ thay vì điện thoại.

## Dữ liệu demo

- Gia sư **Nguyễn Thu Hương** (tài khoản demo, `docs/demo-seed` bên app). Hôm nay: **Thứ Hai 05/10/2026, 15:40**.
- 10 lớp trong tuần (IELTS, Starters, Movers, giao tiếp…); nhân vật chính là **Gia Hân - Ôn thi vào 10**, học ở nhà em, phụ huynh là **Mẹ Gia Hân**.
- Tháng chốt sổ: **tháng 9**. Gia Hân nghỉ **19/9 (có phép)** và **28/9 (vắng)**.

## Kịch bản

### 1. Hook - nỗi đau cuối tháng (0:00 - 0:04)

| Hình | Chữ | Âm |
|---|---|---|
| Nền chấm, giấy nhớ vàng và tin nhắn Zalo bay ra rải rác: "T9: Bảo 8 buổi × 120k = ???", "Cô ơi chị chuyển khoản rồi nha", "Cô gửi chị STK nhé", "Gia Hân nghỉ 19/9 hay 28/9?", "Tháng này con học mấy buổi vậy cô?", "1.440.000? 1.320.000??", "Thứ 3 - 18h, Bảo hay Bơ?". Cuối cảnh tất cả xoáy vào giữa rồi biến mất | **Cuối tháng.** / **Ai đóng học phí rồi?** / ***Ai chưa?*** (đỏ, rung) | drop / pop theo từng mẩu, impact nhẹ, whoosh khi xoáy |

Frame đầu đã có sẵn giấy nhớ và tin nhắn để làm thumbnail.

### 2. Logo (0:04 - 0:07)

| Hình | Chữ | Âm |
|---|---|---|
| Nền tối mở ra hình tròn, logo xoay bật vào | **Sổ Gia Sư** / Dạy thêm gọn gàng, *học phí rõ ràng.* | whoosh, impact nhẹ |

### 3. Lịch dạy (0:07 - 0:12)

| Hình | Chữ | Âm |
|---|---|---|
| Lịch tuần 05-11/10 (desktop) quét mở từ trái sang, kín 10 lớp nhiều màu. Camera zoom vào buổi Gia Hân thứ Hai, tay chạm vào buổi đó | **Lịch dạy** *cả tuần* / Đồng bộ Google Calendar + Meet → **Sắp tới giờ dạy?** *Chạm vào buổi học* | whoosh ×2, click |

### 4. Điểm danh (0:12 - 0:20)

| Hình | Chữ | Âm |
|---|---|---|
| Thẻ điểm danh của Gia Hân trên điện thoại. Tay chạm **Có mặt** → **BTVN 90%** → **Điểm 9** → ô nhận xét, gõ "Nhớ cụm động từ tốt, cần luyện thêm cách dùng giới từ đi kèm.". Cuộn lại, khoanh cam ô **Có phép** | **Điểm danh** *1 chạm* → **Có phép thì** *không tính tiền* | click mỗi chạm, gõ phím, pop |

### 5. Báo cáo cho phụ huynh (0:20 - 0:27)

| Hình | Chữ | Âm |
|---|---|---|
| Chat Zalo: cô gửi tin "Tổng hợp link nhận báo cáo…" kèm link của Gia Hân; phụ huynh trả lời "Ok cô, chị lưu link rồi nha 👍". Tay chạm link → mở trang báo cáo công khai trong trình duyệt, cuộn tới buổi mới nhất, rồi tới phần file đính kèm | **Gửi link cho** *phụ huynh qua Zalo* → **Phụ huynh mở là thấy** *con học gì* → **Kèm cả bài tập,** *video, tài liệu* | pop, click, whoosh |

### 6. Chuyển chương (0:27 - 0:28)

| Hình | Chữ | Âm |
|---|---|---|
| Nền chấm như hook | **Cuối tháng.** / Chốt sổ tháng 9 | impact nhẹ |

### 7. Bảng điểm danh cả tháng (0:28 - 0:33)

| Hình | Chữ | Âm |
|---|---|---|
| Giấy nhớ "Gia Hân nghỉ 19/9 hay 28/9?" rơi xuống. Bảng điểm danh tháng 9 zoom vào hàng Gia Hân, khoanh **19/9 · Có phép** (cam) và **28/9 · Vắng** (đỏ); giấy nhớ bị gạch | **Cả tháng ai học buổi nào,** *một bảng là thấy* | drop, whoosh, pop ×2, confirm |

### 8. Học phí (0:33 - 0:38)

| Hình | Chữ | Âm |
|---|---|---|
| Trang Học phí trên điện thoại: khoanh cam tổng **Học phí chưa thu**, cuộn tới thẻ Gia Hân và khoanh xanh, tay bấm **Tạo phiếu học phí** | **Học phí** *tự cộng sẵn* → **Không cần** *bấm máy tính* | pop ×2, click |

### 9. Phiếu thu QR (0:38 - 0:43)

| Hình | Chữ | Âm |
|---|---|---|
| Băng chuyền lật qua 5 mẫu phiếu (Summer, Kid, Autumn, Trung thu, Dark), có nhãn tên mẫu, huy hiệu **Pro** cho mẫu trả phí, số thứ tự. Sau đó thu nhỏ thành lưới toàn bộ mẫu | **Phiếu thu có QR** **đúng số tiền** → "N mẫu · Gửi Zalo là xong" | whoosh |

Mẫu nào thuộc gói miễn phí lấy thẳng từ `PLAN_ENTITLEMENTS` của app, để video không ngầm hứa mọi mẫu đều miễn phí.

### 10. Gửi Zalo, phụ huynh chuyển khoản (0:43 - 0:50)

| Hình | Chữ | Âm |
|---|---|---|
| Chat Zalo với **Mẹ Gia Hân**: cô gửi 2 ảnh (phiếu thu mẫu Trung thu + bảng báo cáo T9) và tin "Em gửi học phí kèm báo cáo T9 của Gia Hân ạ, chị quét mã giúp em nha". Phụ huynh: "Chị chuyển rồi nha cô ✅". Cô: "Dạ em nhận rồi ạ, em cảm ơn chị!" | **Gửi phiếu thu** *kèm báo cáo qua Zalo* → **Phụ huynh quét mã,** *chuyển khoản luôn* | pop, confirm |

### 11. Thống kê thu tiền (0:50 - 0:55)

| Hình | Chữ | Âm |
|---|---|---|
| Trang thống kê (tablet) tháng 9: các khoản "Đã thu tiền" được tick dần, biểu đồ tăng theo; camera lia xuống bảng theo lớp | **Ai đóng, ai chưa -** *nhìn là biết* → **Lớp nào thu** *nhiều nhất* | whoosh, confirm |

### 12. CTA (0:55 - 0:59)

| Hình | Chữ | Âm |
|---|---|---|
| Nền tối, logo | Sổ tay, Excel, tin nhắn chồng chất? / ***Để Sổ Gia Sư lo.*** / Tập trung vào giảng dạy - quản lý nhẹ nhàng / **sogiasu.com** / chip "Sử dụng và đồng bộ dữ liệu trên mọi thiết bị" / Hơn 4.000 giáo viên đã sử dụng, quản lý hơn 100.000 buổi học | pop, impact (nhạc hạ xuống ngay trước), pop |

## Lưu ý khi sửa

- Thời lượng từng cảnh nằm ở `timeline.ts`; giữ mỗi cảnh là bội số của 15 frame để cắt đúng beat nhạc.
- Con số ở CTA ("Hơn 4.000 giáo viên", "100.000 buổi học") là số marketing, cần cập nhật khi số thật thay đổi.
- Intro dùng layout `INTRO_PHONE`; series hướng dẫn dùng `TUTORIAL_PHONE` (xem `docs/tutorials/`). Nếu muốn đồng bộ hai loại video, đổi intro sang `TUTORIAL_PHONE` rồi căn lại các cảnh có cuộn.
