# Tập 5 - Lịch dạy hằng tuần

> Kịch bản đã dựng (23/10/2026). Code: `src/videos/schedule/`, timeline: `timeline.ts` + mốc trong `scenes/`. Đầu tháng 11: cô Hương đã dạy thêm các lớp của intro, lịch tuần kín.

|            |                                                                                                                |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| Nền tảng   | TikTok, Reels, YouTube Shorts (+ nhúng vào blog hướng dẫn)                                                     |
| Khung | Dọc 1080×1920, 30fps, ~55 giây (1655 frame), layout `TUTORIAL_PHONE` (411 px) |
| Render | `yarn render:schedule` (chỉ SFX) · `yarn render:schedule:music` (có nhạc) → `out/` |
| Âm thanh   | Không lời thoại. SFX cho mọi thao tác; bản có nhạc dùng chung nhạc nền với các tập trước                       |
| Thông điệp | Chỉnh lịch theo giờ dạy của mình, đọc trạng thái là biết buổi nào chưa chốt, đổi lịch rồi gửi lịch mới cho lớp |

## Mạch kể

Tuần này cô bận 1 buổi → báo nghỉ → thêm buổi dạy bù → lọc lớp → gửi lịch tuần mới vào nhóm lớp.

## Nguyên tắc riêng tập này

- **Không trùng cú quay với intro:** intro có lịch tuần 05-11/10 trên giao diện máy tính, quét mở từ trái. Tập này là lịch trên điện thoại, tuần khác, khung 9h-22h.
- Không nhắc Google Calendar khi báo nghỉ.
- Không có thao tác "đánh dấu học bù" (app không có): dạy bù = tạo thêm 1 buổi cho lớp.

## Dữ liệu demo

- Hôm nay **Thứ Hai 02/11/2026**. Tuần **02-08/11**.
- Các lớp: **IELTS 5.5 - Lớp 9** (T3 + T5 18:00-19:30, Minh Anh + Gia Hân) cùng 10 lớp của intro (`src/shared/demo/calendar-data.ts`), giờ dạy 09:00-22:00.
- Tuần 02-08/11 có đủ 5 trạng thái để khoanh: buổi đã **Hoàn thành** (02/11), 1 buổi đã dạy nhưng chưa chốt (**Chưa hoàn thành**, đồng hồ cam), 1 buổi **Cần kiểm tra** (chưa có học sinh), 1 buổi **Đã nghỉ** sẵn của lớp khác, còn lại **Đã lên lịch**. Có buổi online, buổi offline có địa chỉ, buổi đã đồng bộ Google Calendar.
- Thứ Năm **05/11** lớp IELTS: báo nghỉ. Buổi bù: Thứ Bảy **07/11 18:00-19:30**.
- Khoảng giờ hiển thị: mặc định của app **07:00-23:00** (`DEFAULT_VIEW_WINDOW`) → đổi thành **09:00-22:00**.

## Kịch bản

### 1. Hook (0:00 - 0:03)

| Hình                                                                                      | Chữ                                          | Âm                 |
| ----------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------ |
| Lịch Tuần 02-08/11 trên điện thoại, khung 09:00-22:00, kín các lớp nhiều màu. Zoom nhẹ ra | **10 lớp một tuần** / _gọn trong 1 màn hình_ | whoosh, impact nhẹ |

### 2. Chỉnh khoảng giờ (0:03 - 0:09)

Chữ: **Lịch theo giờ dạy** / *của chính bạn*

| Lúc | Thao tác | Khoanh + bong bóng |
|---|---|---|
| 0:03 | Lịch Tuần ở khung mặc định 07:00-23:00; bấm **Hiển thị** | Nút Hiển thị: "Chỉnh khoảng giờ theo giờ dạy của bạn" |
| 0:05 | **Khoảng giờ hiển thị** đổi thành **09:00-22:00** → đóng hộp, lịch gọn lại | - |

### 3. Đọc thẻ buổi học (0:09 - 0:33)

Chữ: **Nhìn thẻ** / *biết ngay buổi đó thế nào*

Mỗi bong bóng ~3 giây, khoanh đúng chỗ trên thẻ (huy hiệu góc, icon trước giờ, dòng địa điểm).

| Lúc | Khoanh | Bong bóng |
|---|---|---|
| 0:09 | Huy hiệu đồng hồ xanh dương | "Đã lên lịch" |
| 0:12 | Huy hiệu tick xanh lá | "Hoàn thành: đã chốt, học phí đã tạo" |
| 0:15 | Huy hiệu đồng hồ cam (vòng **cam**) | "Chưa hoàn thành: đã dạy mà chưa bấm Đã dạy xong, nên chưa có học phí" |
| 0:18 | Huy hiệu tam giác đỏ | "Cần kiểm tra: buổi chưa có học sinh" |
| 0:21 | Thẻ mờ gạch ngang, huy hiệu X đỏ | "Đã nghỉ: không tính học phí" |
| 0:24 | Icon máy quay / ghim bản đồ trước giờ học | "Online hay offline" |
| 0:27 | Dòng địa điểm (icon ngôi nhà) | "Buổi offline có địa chỉ" |
| 0:29 | Logo Google Calendar cạnh huy hiệu | "Đã đồng bộ Google Calendar" |
| 0:31 | Lướt nhanh **3 ngày** / **Tháng** rồi về **Tuần** | "Màu thẻ là màu lớp · đổi kiểu xem ở góc trên" |

### 4. Báo nghỉ (0:33 - 0:42)

Chữ: **Cô bận?** / _Báo nghỉ 1 chạm_

| Lúc  | Thao tác                                                                         | Khoanh + bong bóng                 |
| ---- | -------------------------------------------------------------------------------- | ---------------------------------- |
| 0:33 | Bấm buổi Thứ Năm 05/11 lớp IELTS → menu **⋮** → **Báo nghỉ buổi này** → xác nhận | "Báo nghỉ, buổi vẫn còn trên lịch" |
| 0:39 | Thẻ 05/11 chuyển sang mờ, gạch ngang | "Buổi vẫn ở đó, không tính học phí" |

### 5. Dạy bù (0:42 - 0:50)

Chữ: **Dạy bù?** / _Bấm ô trống_

| Lúc  | Thao tác                                                             | Khoanh + bong bóng                                                          |
| ---- | -------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 0:42 | Bấm ô trống Thứ Bảy 07/11 18:00 → hộp tạo buổi, chọn lớp IELTS → Tạo | "Bấm ô trống để thêm buổi dạy bù, học sinh trong lớp tự có trong điểm danh" |
| 0:48 | Buổi bù hiện trên lịch                                               | -                                                                           |

### 6. Lọc lớp + gửi lịch (0:50 - 1:12)

Chữ: **Lọc theo lớp** → **Gửi lịch mới** / _vào nhóm lớp_

| Lúc  | Thao tác                                                                   | Khoanh + bong bóng                                                        |
| ---- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 0:50 | **Lọc lịch** → tab **Lớp** → **IELTS 5.5 - Lớp 9** → Áp dụng               | "Dạy nhiều lớp? Lọc để chỉ xem một lớp"                                   |
| 0:56 | **Chia sẻ lịch** → tuần này, bật **Tên lớp**, **Địa điểm** → xem trước ảnh | "Ảnh theo đúng lớp đang lọc và khung 9h-22h. Buổi nghỉ tự bỏ, có buổi bù" |
| 1:05 | **Chia sẻ**                                                                | "Gửi vào nhóm Zalo của lớp"                                               |
| 1:09 | **Xoá lọc** → lịch đầy đủ                                                  | -                                                                         |

### 7. End card (1:12 - 1:16)

| Hình          | Chữ                                                                                                                             | Âm               |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Nền tối, logo | Tập 5 · Lịch dạy hằng tuần / **Đổi lịch, gửi lịch<br>trong 1 phút.** / thẻ "Tập 6 · Đổi học phí giữa chừng →" / **sogiasu.com** | pop, impact, pop |

## Đã kiểm tra trong code

- Nút **Hiển thị** (`CalendarGuideButton`) gom cả khoảng giờ hiển thị và chú thích trạng thái buổi học.
- Icon trên thẻ (`CalendarEventCard`, `LessonStatusBadge`): huy hiệu góc Clock xanh / Check / XCircle / Clock cam (quá giờ chưa chốt) / AlertTriangle (chưa có học sinh); logo Google Calendar khi đã đồng bộ; Video / MapPin trước giờ; Home + địa điểm cho buổi offline.
- Ảnh **Chia sẻ lịch** dùng đúng khoảng giờ đã chỉnh và bộ lọc đang bật, và tự bỏ buổi đã nghỉ (`use-week-schedule-data.ts`: `status !== "CANCELLED"`).
- Buổi tạo thêm lấy học sinh từ danh sách đang học của lớp (điểm danh lười, `DATABASE_CONVENTION` §5).

## Cần kiểm tra khi dựng

- Thẻ ở chế độ Tuần trên điện thoại đủ cao để thấy dòng địa điểm (dòng này ẩn ở thẻ quá ngắn).
- Ô trống trong chế độ Tuần trên điện thoại có đủ rộng để bấm, hộp tạo buổi có tự điền ngày giờ của ô (`CreateLessonDialog` `initialValues`).

## Đã cân nhắc nhưng không đưa vào

- **Lọc theo học sinh**: chọn lọc theo lớp để gửi vào nhóm lớp.
- **Nút Hôm nay**, **Chia sẻ lịch tháng**: không cần cho mạch này.
- **Báo qua Google Calendar** khi báo nghỉ: không nhắc.

## Khác với bảng trên khi dựng

- **Hôm nay là Thứ Năm 05/11, 15:40** (không phải Thứ Hai 02/11): buổi IELTS báo nghỉ là buổi tối cùng ngày ("Cô bận buổi tối nay?").
- **Đọc thẻ ở chế độ 3 ngày (04-06/11)**, không phải Tuần: ở Tuần mỗi cột chỉ ~50 px, icon quá nhỏ. Buổi chưa chốt là Mít 04/11 14:00, đã nghỉ là IELTS Speaking 05/11, cần kiểm tra là Giao tiếp công sở 06/11.
- Lớp **Cún** dạy 17:30-19:30 trong tập này (intro là 17:30-19:00): thẻ chỉ hiện dòng địa chỉ khi buổi dài hơn 90 phút.
- **Lọc theo lớp Gia Hân**, không phải IELTS: lớp IELTS nằm ngoài vùng nhìn thấy của danh sách lọc. Bỏ bong bóng ở ảnh xem trước, chỉ giữ bong bóng "Gửi vào nhóm Zalo của lớp".
- **Dạy bù:** chọn lớp trong hộp tạo buổi là nhịp 1 giây, không mở danh sách xổ xuống.

## Lưu ý khi sửa

- `CalendarScreen.tsx` dựng lại khung của `CalendarView` để mỗi khung hình đặt chế độ xem, ngày, khoảng giờ, bộ lọc, buổi đang mở và ô tạo buổi. Thanh công cụ, thẻ buổi, hộp chi tiết buổi, hộp tạo buổi, hộp Hiển thị, hộp Chia sẻ lịch là component thật.
- `Replicas.tsx`: hộp Lọc lịch và menu ⋮ của chi tiết buổi là bản dựng lại - thao tác bấm/gõ bằng script không tới được state của hai chỗ này trong khung điện thoại.
- `steps.ts` phát lại các thao tác bấm theo thứ tự tới khung hiện tại, để render bắt đầu giữa cảnh vẫn ra đúng màn hình. Bước nào thử 3 vòng không xong thì bỏ qua (khung vẫn render, lỗi hiện ra trên hình thay vì treo).
- Hộp xác nhận báo nghỉ được nâng `z-index` để nằm trên hộp chi tiết buổi (`CalendarScreen.tsx`).
