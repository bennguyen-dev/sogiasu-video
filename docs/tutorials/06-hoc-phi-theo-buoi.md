# Tập 6 - Học phí theo buổi

> Kịch bản đã dựng (23/10/2026). Code: `src/videos/session-fee/`, timeline: `timeline.ts` + mốc trong từng file `scenes/`. Tiếp nối tập 4 (tháng 10 đã thu) và tập 5 (lịch tháng 11).

|            |                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------- |
| Nền tảng   | TikTok, Reels, YouTube Shorts (+ nhúng vào blog hướng dẫn)                               |
| Khung      | Dọc 1080×1920, 30fps, ~54 giây (1629 frame), layout `TUTORIAL_PHONE` (411 px)            |
| Render     | `yarn render:session-fee` (chỉ SFX) · `yarn render:session-fee:music` (có nhạc) → `out/` |
| Âm thanh   | Không lời thoại. SFX cho mọi thao tác; bản có nhạc dùng chung nhạc nền                   |
| Thông điệp | Mỗi buổi dạy xong tính 1 khoản. Đổi giá từ 1 ngày: buổi cũ giữ giá, đã thu không đổi     |

## Nguyên tắc riêng tập này

- Tập đầu của bộ 3 tập học phí (6 theo buổi, 7 theo giờ, 8 theo khóa). Mở bằng cảnh chọn hình thức ở bước tạo lớp, ~2 giây: hình thức chỉ chọn 1 lần, không đổi được.
- Chỉ đổi giá của **1 học sinh** (Minh Anh): mỗi em một giá, đổi riêng từng em.
- Giảm giá %, sửa giá 1 buổi, phí khác: để tập 9. Hộp đổi học phí có ô Giảm giá thì lướt qua, không khoanh.

## Dữ liệu demo

- Hôm nay **Thứ Năm 12/11/2026**. Lớp **"IELTS 5.5 - Lớp 9"**, Theo buổi học.
- Tháng 10: Minh Anh 9 buổi × 300.000đ = 2.700.000đ, **đã thu** ngày 31/10 (tập 4).
- Tháng 11 (khớp lịch tập 5): 03/11 đã dạy, 05/11 báo nghỉ, 07/11 dạy bù, 10/11 đã dạy (**Minh Anh vắng không phép**), 12/11 tối nay. Minh Anh có **3 khoản chưa thu** × 300.000đ = 900.000đ (buổi vắng không phép vẫn tính).
- Chuyện: đầu tháng 11 cô đã báo phụ huynh Minh Anh tăng lên **350.000đ từ 01/11** nhưng quên sửa trong app.
- Gia Hân 250.000đ, đã hẹn tăng lên **280.000đ từ 01/12** (có sẵn trong dữ liệu, không quay cảnh nhập): thẻ của em hiện dòng cam "Sắp đổi: 280.000đ từ 01/12/2026".

## Kịch bản

### 1. Hook (0:00 - 0:03)

| Hình                                                                       | Chữ                                                     | Âm                 |
| -------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------ |
| Thẻ Minh Anh "Học phí: 300.000đ / buổi" lật số thành 350.000đ, zoom nhẹ ra | **Tăng học phí giữa chừng?** / _buổi cũ vẫn giữ giá cũ_ | whoosh, impact nhẹ |

### 2. Chọn hình thức (0:03 - 0:07)

Chữ: **Học phí theo buổi** / _chọn lúc tạo lớp_

| Lúc  | Thao tác                                                                                                                                                      | Khoanh + bong bóng                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 0:03 | Bước 1 tạo lớp (Thông tin lớp), cuộn tới **Hình thức học phí**: 3 thẻ xếp dọc Theo giờ / Theo buổi học / Theo khóa học, **Theo buổi học** chọn sẵn (mặc định) | Thẻ Theo buổi học: "Tính tiền từng buổi khi điểm danh"                                                |
| 0:05 | -                                                                                                                                                             | Dòng ⓘ "Không thể thay đổi sau khi tạo lớp" (ngay dưới nhãn, trên 3 thẻ): "Chọn 1 lần, chọn cho đúng" |

### 3. Theo buổi tính thế nào (0:07 - 0:14)

Chữ: **Mỗi buổi dạy xong** / _= 1 khoản học phí_

| Lúc  | Thao tác                                                                                                               | Khoanh + bong bóng                                                                  |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 0:08 | Trang Học phí, thẻ Minh Anh "3 buổi · 900.000đ" → bấm **Chọn buổi** → mở 3 dòng 03/11, 07/11, 10/11, mỗi dòng 300.000đ | 3 dòng: "Bấm Đã dạy xong là có khoản, không cần nhập"                               |
| 0:11 | -                                                                                                                      | Dòng 10/11: "Buổi này em vắng không phép: vẫn tính tiền. Chỉ nghỉ có phép mới miễn" |

### 4. Đổi giá (0:14 - 0:37)

Chữ: **Tăng giá từ 01/11** / _chọn ngày bắt đầu áp dụng_

| Lúc  | Thao tác                                                              | Khoanh + bong bóng                                                                                    |
| ---- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| 0:14 | Vào lớp IELTS, phần học sinh: thẻ Minh Anh "Học phí: 300.000đ / buổi" | "Mỗi em một giá, đổi riêng từng em"                                                                   |
| 0:17 | Bấm **Học phí** → hộp **Học phí theo buổi**                           | Bảng **Lịch sử học phí**: 1 dòng 300.000đ · "Mọi buổi" · Đang áp dụng                                 |
| 0:21 | Ô **Học phí / buổi** (điền sẵn 300.000) → gõ **350.000**              | -                                                                                                     |
| 0:24 | Ô **Ngày bắt đầu áp dụng** → chọn **01/11/2026**                      | "Buổi từ ngày này tính giá mới, buổi trước giữ giá cũ"                                                |
| 0:28 | -                                                                     | Ghi chú dưới form: "Khoản chưa thu tự tính lại, khoản đã thu giữ nguyên"                              |
| 0:30 | Bấm **Lưu** → toast "Đã lưu học phí · Đã cập nhật 3 khoản chưa thu"   | Toast                                                                                                 |
| 0:32 | Hộp đóng: thẻ Minh Anh "350.000đ / buổi · áp dụng từ 01/11/2026"      | -                                                                                                     |
| 0:34 | Cuộn nhẹ xuống thẻ Gia Hân                                            | Dòng cam "Sắp đổi: 280.000đ từ 01/12/2026": "Chọn ngày sau hôm nay? Tới ngày đó app mới tính giá mới" |

### 5. Kiểm tra (0:37 - 0:45)

Chữ: **Đã thu** / _không bị đổi_

| Lúc  | Thao tác                                                                                                                                  | Khoanh + bong bóng                              |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 0:38 | Trang Học phí: Minh Anh "3 buổi · 1.050.000đ", mở **Chọn buổi**: 3 dòng 350.000đ                                                          | "3 buổi tháng 11 đã lên giá mới"                |
| 0:41 | Tab **Lịch sử thu** (mặc định tháng 11, trống Minh Anh) → bấm ô tháng, chọn **Tháng 10** → Minh Anh, thu ngày 31/10, 9 khoản · 2.700.000đ | "Buổi tháng 10 đã thu: vẫn 300.000đ, không đổi" |

### 6. Phiếu học phí (~0:45 - 0:51)

Chữ: **Phiếu cuối tháng** / _tự lấy giá mới_

| Lúc  | Thao tác                                                                                                             | Khoanh + bong bóng                                                                             |
| ---- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| 0:45 | Trang Học phí, thẻ Minh Anh → **Tạo phiếu học phí** → hộp Phiếu học phí, mẫu **Mùa thu** (như tập 4), cuộn tới phiếu | Phiếu: 3 buổi tháng 11 × 350.000đ = 1.050.000đ, có QR: "Phiếu tự lấy giá mới, QR đúng số tiền" |

### 7. End card (0:45 - 0:49)

| Hình          | Chữ                                                                                                                                | Âm               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Nền tối, logo | Tập 6 · Học phí theo buổi / **Tự động tính giá mới,<br>chính xác từng ngày.** / thẻ "Tập 7 · Học phí theo giờ →" / **sogiasu.com** | pop, impact, pop |

## Đã cân nhắc nhưng không đưa vào

- **Quay cảnh nhập giá tương lai cho Gia Hân:** trùng thao tác với Minh Anh, chỉ khoanh dòng "Sắp đổi" là đủ.
- **Giảm giá %, sửa giá 1 buổi, phí khác:** tập 9.
- **Xoá mức phí mới nhất** (nhập nhầm → quay về giá cũ): lưu xong hộp tự đóng, phải mở lại mới thấy nút xoá. Để video "Làm sao để…" nếu cần.
- **Hộp đổi học phí của lớp theo giờ:** giống hệt, chỉ khác đơn vị "/ giờ"; tập 7.

## Đã kiểm tra trong code

- **Hình thức học phí** nằm ở bước 1 wizard (`ClassField`), dưới ô Màu. Dòng ⓘ "Không thể thay đổi sau khi tạo lớp" đứng ngay dưới nhãn, trên 3 thẻ. Trên điện thoại 3 thẻ xếp dọc, thứ tự **Theo giờ, Theo buổi học, Theo khóa học** Wizard mặc định chọn Theo buổi học.
- **Trang Học phí, thẻ học sinh** (`FeeStudentCard`): thu gọn chỉ hiện "3 buổi"; nút **Chọn buổi** mở danh sách từng buổi theo tháng (ngày, giờ, số tiền, nút sửa giá). Gia Hân còn nợ tháng 10 nên thẻ của em có vạch chia tháng.
- **Lịch sử thu** (`PaidHistoryList`): có ô chọn tháng, mặc định tháng hiện tại; lọc theo **ngày thu**, nên chọn Tháng 10 là thấy khoản thu 31/10.
- **Lưu xong hộp tự đóng** (`SessionRateDialog` gọi `onOpenChange(false)`), toast kèm "Đã cập nhật {n} khoản chưa thu".
- **Trang Học phí không ghi trạng thái điểm danh** trên từng dòng buổi (`SessionClassGroup`: ngày, giờ, số tiền), nên dòng 10/11 trông như buổi thường; bong bóng phải nói rõ "em vắng không phép".
- **"Sắp đổi"** (`SessionRateLine`): mức có ngày bắt đầu sau hôm nay hiện thành dòng cam riêng, mức đang áp dụng vẫn giữ.
- **Ngày áp dụng 01/11 hợp lệ:** mức hiện tại là "Mọi buổi" (không có ngày bắt đầu) nên chọn ngày nào cũng được.

## Khác với bảng trên khi dựng

- **Trang Học phí khi bấm Chọn buổi** hiện ô tick trước mỗi buổi (chế độ chọn khoản để tạo phiếu của app), vẫn để nguyên.
- **Bảng Lịch sử học phí** rộng hơn màn 411 px nên cột "Kết thúc" bị cắt ở mép phải, giống app thật.
- **Lịch sử thu:** chọn tháng 10 bằng nút **Tháng trước** trong ô chọn tháng (1 chạm), không bấm ô Tháng 10 trong lưới.
- **Thêm 1 chạm mở dòng thu 31/10** ở Lịch sử thu: hiện 9 buổi tháng 10, mỗi buổi 300.000đ, để thấy buổi cũ giữ giá cũ ngay sau cảnh buổi mới lên giá mới. Bong bóng: "Buổi tháng 10 đã thu: vẫn 300.000đ, không đổi".

## Lưu ý khi sửa

- Hộp **Học phí theo buổi** (`RateDialog.tsx`) dựng lại markup của `SessionRateDialog` quanh giá trị do frame truyền vào: form của app nằm bên trong component nên không gõ giá / chọn ngày theo từng frame được. Ô tiền, ô giảm giá, ô chọn ngày (cả lịch bật ra), bảng lịch sử, khung ghi chú là component thật.
- Cảnh chọn hình thức, cảnh kiểm tra (giá mới → Lịch sử thu tháng 10) và cảnh phiếu học phí dùng chung với tập 7 (và tập 8): `src/videos/fee-common/scenes.tsx` (`makeModeScene`, `makeCheckScene`, `makeVoucherScene`). Helper trang Học phí (`studentCardOf`, `useOpenCard`, `useRerenderWhen`…) ở `src/shared/tutorial/fee-page.ts`.
- Hộp / lịch đóng ngay ở cú chạm cuối nên vị trí chạm được giữ lại từ lần đo trước (`last` trong `RateScene.tsx`, `lastPrev` trong `fee-common/scenes.tsx`).
- Tab và tháng của trang Học phí đọc từ URL: cảnh kiểm tra đặt `setDemoSearch` theo frame trước khi trang đọc.
