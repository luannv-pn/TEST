# Giờ thế giới

Website tĩnh hiển thị giờ địa phương và thời gian hiện tại tại các thành phố trên thế giới. Đồng hồ tự cập nhật mỗi giây, hỗ trợ tìm kiếm theo thành phố/quốc gia và chuyển đổi định dạng 12/24 giờ. Múi giờ được xử lý bằng `Intl.DateTimeFormat` của trình duyệt, bao gồm cả thay đổi giờ mùa hè.

## Chạy website

Mở `index.html` trực tiếp trong trình duyệt, hoặc chạy máy chủ tĩnh tại thư mục dự án:

```bash
python3 -m http.server 8000
```

Sau đó truy cập <http://localhost:8000>.

## Kiểm tra

Kiểm tra cú pháp JavaScript:

```bash
node --check app.js
```
