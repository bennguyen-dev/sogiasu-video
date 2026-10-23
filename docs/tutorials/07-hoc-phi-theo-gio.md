# Tập 7 - Học phí theo giờ

> Kịch bản đã dựng (23/10/2026). Code: `src/videos/hour-fee/`, timeline: `timeline.ts` + mốc trong từng file `scenes/`. Cùng thế giới với tập 6 (Thứ Năm 12/11/2026), lớp theo giờ có sẵn trong dữ liệu intro.

|            |                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------- |
| Nền tảng   | TikTok, Reels, YouTube Shorts (+ nhúng vào blog hướng dẫn)                               |
| Khung      | Dọc 1080×1920, 30fps, ~51 giây (1525 frame), layout `TUTORIAL_PHONE` (411 px)            |
| Render     | `yarn render:hour-fee` (chỉ SFX) · `yarn render:hour-fee:music` (có nhạc) → `out/`       |
| Âm thanh   | Không lời thoại. SFX cho mọi thao tác; bản có nhạc dùng chung nhạc nền                   |
| Thông điệp | Buổi dài ngắn khác nhau: tiền = số giờ × giá giờ, app tự nhân. Tăng giá giờ từ đầu tháng |

## Nguyên tắc riêng tập này

- Mục đích của tính theo giờ: lịch học **không cố định thời lượng** (hôm 1 tiếng, hôm 2 tiếng), không phải chuyện dạy lố giờ.
- Tăng giá từ **đầu tháng** (gia sư thường tăng theo tháng), kiểm tra giống tập 6: tháng 11 giá mới ở trang Chưa thu, tháng 10 đã thu giữ giá cũ ở Lịch sử thu.
- Kết bằng phiếu học phí mẫu **Mùa thu** như tập 4, tập 6.
- Giảm giá %, sửa giá 1 buổi, phí khác: tập 9.

## Dữ liệu demo

- Hôm nay **Thứ Năm 12/11/2026**. Lớp **"IELTS Speaking 1-1"** (online, theo giờ), học sinh **Đỗ Khánh Linh**, **250.000đ/giờ** từ đầu.
- Tháng 10: 9 buổi T2 + T5, thời lượng khác nhau (1 giờ / 1,5 giờ / 2 giờ), **đã thu** ngày 31/10.
- Tháng 11 (05/11 đã báo nghỉ ở tập 5):
  - 02/11 10:00-11:00 · **1 giờ** → 250.000đ
  - 09/11 10:00-11:30 · **1,5 giờ** → 375.000đ
  - 12/11 09:00-11:00 · **2 giờ** (sáng nay, chưa chốt) → 500.000đ
- Chuyện: từ tháng 11 Khánh Linh chuyển sang luyện đề thi nói, cô tăng lên **300.000đ/giờ từ 01/11**.

## Kịch bản

### 1. Hook (0:00 - 0:03)

| Hình                                                                       | Chữ                                                     | Âm                 |
| -------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------ |
| Thẻ học phí Khánh Linh mở sẵn: 1 giờ, 1,5 giờ, 2 giờ, mỗi dòng một số tiền | **Mỗi buổi dài ngắn khác nhau?** / _tính đúng theo giờ_ | whoosh, impact nhẹ |

### 2. Chọn hình thức (0:03 - 0:08)

Chữ: **Học phí theo giờ** / _chọn lúc tạo lớp_

| Lúc  | Thao tác                              | Khoanh + bong bóng                                                                          |
| ---- | ------------------------------------- | ------------------------------------------------------------------------------------------- |
| 0:03 | Bước 1 tạo lớp, chọn thẻ **Theo giờ** | Thẻ Theo giờ: "Buổi dài bao nhiêu, tính tiền bấy nhiêu giờ"                                 |
| 0:05 | -                                     | Dòng "Không thể thay đổi sau khi tạo lớp": "Chọn 1 lần lúc tạo lớp, sau này không đổi được" |

### 3. Buổi hôm nay (0:08 - 0:16)

Chữ: **Buổi 2 tiếng** / _app đọc đúng giờ học_

| Lúc  | Thao tác                                                  | Khoanh + bong bóng                                        |
| ---- | --------------------------------------------------------- | --------------------------------------------------------- |
| 0:08 | Chi tiết buổi 12/11: "09:00 - 11:00 · 2 giờ", Đã lên lịch | Dòng giờ: "App lấy đúng giờ bắt đầu và kết thúc của buổi" |
| 0:11 | -                                                         | "Ghi sai giờ? Sửa trước khi bấm Đã dạy xong"              |
| 0:13 | Bấm **Đã dạy xong** → xác nhận → toast                    | -                                                         |

### 4. Học phí (0:16 - 0:24)

Chữ: **Số giờ × giá giờ** / _app tự nhân_

| Lúc  | Thao tác                                                                            | Khoanh + bong bóng                                             |
| ---- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 0:16 | Trang Học phí, thẻ Khánh Linh "3 buổi theo giờ" → **Chọn buổi**                     | -                                                              |
| 0:18 | 3 dòng: "1 giờ × 250.000 ₫/giờ" 250.000, "1,5 giờ × …" 375.000, "2 giờ × …" 500.000 | "Buổi dài ngắn khác nhau, app tự nhân, không cần bấm máy tính" |

### 5. Tăng giá giờ (0:24 - 0:40)

Chữ: **Tăng giá từ 01/11** / _chọn ngày bắt đầu áp dụng_

| Lúc  | Thao tác                                                                                                       | Khoanh + bong bóng                                          |
| ---- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 0:24 | Vào lớp Speaking 1-1, thẻ Khánh Linh "Học phí: 250.000 ₫ / giờ" → bấm **Học phí**                              | -                                                           |
| 0:27 | Hộp **Học phí theo giờ**: gõ **300.000**, chọn ngày **01/11**                                                  | Ô ngày: "Buổi từ 01/11 tính giá mới, buổi trước giữ giá cũ" |
| 0:35 | Bấm **Lưu** → toast "Đã lưu học phí · Đã cập nhật 3 khoản chưa thu" → thẻ "300.000 ₫ / giờ · áp dụng từ 01/11" | -                                                           |

### 6. Kiểm tra (0:40 - 0:50)

Chữ: **Tháng 11 giá mới** → **Đã thu** / _không đổi_

| Lúc  | Thao tác                                                                                                        | Khoanh + bong bóng                                                     |
| ---- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 0:40 | Trang Học phí, **Chọn buổi**: "1 giờ × 300.000" 300.000, "1,5 giờ × 300.000" 450.000, "2 giờ × 300.000" 600.000 | "3 buổi tháng 11 đã lên giá mới"                                       |
| 0:44 | Tab **Lịch sử thu** → **Tháng trước** → mở dòng thu 31/10                                                       | Các buổi tháng 10: "Buổi tháng 10 đã thu: vẫn 250.000đ/giờ, không đổi" |

### 7. Phiếu học phí (0:50 - 0:56)

Chữ: **Phiếu cuối tháng** / _rõ từng buổi_

| Lúc  | Thao tác                                                                                                                           | Khoanh + bong bóng                                         |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| 0:50 | Trang Chưa thu, thẻ Khánh Linh → **Tạo phiếu học phí**, mẫu **Mùa thu**, cuộn tới phiếu: 3 dòng giờ × 300.000, tổng 1.350.000đ, QR | "Phụ huynh thấy rõ từng buổi bao nhiêu giờ, giá bao nhiêu" |

### 8. End card (0:56 - 1:00)

| Hình          | Chữ                                                                                                                             | Âm               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Nền tối, logo | Tập 7 · Học phí theo giờ / **Dạy bao nhiêu giờ,<br>tính đúng bấy nhiêu.** / thẻ "Tập 8 · Học phí theo khóa →" / **sogiasu.com** | pop, impact, pop |

## Đã cân nhắc nhưng không đưa vào

- **Dạy lố giờ** làm câu chuyện chính: tính theo giờ là cho lịch không cố định thời lượng, lố giờ chỉ là 1 trường hợp nhỏ (gói vào bong bóng "Ghi sai giờ?").
- **Tăng giá từ giữa tháng** để cũ/mới nằm chung 1 danh sách: gia sư thường tăng theo tháng.
- **Để tháng 10 chưa thu** cho cũ/mới chung 1 danh sách: 9 + 3 dòng theo giờ (mỗi dòng 3 dòng chữ) quá dài.
- **Mở lại buổi để sửa giờ** thành cảnh riêng: chỉ nhắc bằng bong bóng.

## Đã kiểm tra trong code

- Tiền 1 buổi = giá giờ × số phút thật / 60, làm tròn đến đồng (`fee/lib/session-amount.ts`). Dòng học phí ghi "{số giờ} × {giá}/giờ" (`HourClassGroup`, `fee.table.hourRate`).
- Chi tiết buổi ghi "giờ bắt đầu - giờ kết thúc · số giờ" (`LessonDetailHeader`, `formatDuration`).
- Nút **Sửa** chỉ hiện khi buổi chưa chốt; buổi theo giờ đã chốt không cho đổi giờ (`LESSON_SCHEDULE_LOCKED`), phải **Mở lại buổi học**; buổi đã thu tiền thì không mở lại được (`CANNOT_REOPEN_PAID`).
- Hộp đổi giá giờ (`HourRateDialog`) giống hộp theo buổi, chỉ khác tiêu đề, cột "Mức phí / giờ", ô "Học phí / giờ".

## Khác với bảng trên khi dựng

- **Màn chi tiết buổi** là `LessonDetailContent` thật (thẻ điểm danh, ghi chú), chỉ không thao tác điểm danh: bấm thẳng **Đã dạy xong**.
- Buổi 09:00-11:00 đã qua lúc 15:30 nên trước khi chốt app hiện nhãn cam **Chưa hoàn thành** (đúng như app), chốt xong thành **Hoàn thành**.
- Bong bóng "Ghi sai giờ?" khoanh nút **Sửa** (bút chì) ở góc phải.
- Cảnh tăng giá không có nhịp khoanh thẻ học sinh trước khi bấm Học phí (tập 6 đã có).
- Lịch sử thu tháng 10 hiện số tiền từng buổi (375k, 250k, 500k… theo số giờ), không ghi "× 250.000/giờ"; bong bóng nói rõ "vẫn 250.000đ/giờ".

## Lưu ý khi sửa

- Dùng chung với tập 6: cảnh chọn hình thức / kiểm tra / phiếu (`src/videos/fee-common/scenes.tsx`), helper trang Học phí (`src/shared/tutorial/fee-page.ts`), `RateDialog` của tập 6 (thêm `hourly`, `student`, `className`); hộp phiếu `VoucherDialog` của tập 4 nhận `student` + `view`.
- Trạng thái demo (`raised`, `todayDone`) ở `scenes/shared.ts`: đổi trạng thái thì mọi query tải lại (`invalidateQueries()`), như sau mutation thật.
- Học sinh phải có dòng điểm danh PRESENT sau khi chốt, nếu không app hiện nhãn đỏ "Không có học sinh" (`hasNoStudents`).
