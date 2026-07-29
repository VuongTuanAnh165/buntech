# Master Data Module

Module này cung cấp các dữ liệu tĩnh, cấu hình hằng số (Enum) và dữ liệu hành chính (Tỉnh/Thành, Quận/Huyện) để Frontend sử dụng.

## 1. Lấy phiên bản Master Data (Divisions)

- **Module**: Master Data
- **URL**: `/api/v1/master-data/divisions/version`
- **Method**: `GET`
- **Authentication**: Public API
- **Mục đích**: Lấy mã hash (version) của cây dữ liệu hành chính. Client có thể lưu version này để so sánh, tránh phải tải lại file JSON lớn nếu không có sự thay đổi.

### Response

**200 OK**
```json
{
  "success": true,
  "message": "Lấy phiên bản thành công",
  "data": {
    "versionHash": "a1b2c3d4..."
  }
}
```

---

## 2. Lấy cây Đơn vị hành chính (Divisions)

- **Module**: Master Data
- **URL**: `/api/v1/master-data/divisions`
- **Method**: `GET`
- **Authentication**: Public API
- **Mục đích**: Lấy toàn bộ danh sách Tỉnh/Thành -> Quận/Huyện -> Phường/Xã (dưới dạng cây).

### Request Headers
| Header | Giá trị | Ý nghĩa |
| --- | --- | --- |
| `If-None-Match` | `<versionHash>` | (Tùy chọn) Truyền versionHash lấy từ API version. Nếu data chưa đổi, server trả về 304. |

### Business Flow & Performance (ETag)
1. Lấy version hash mới nhất từ Service.
2. So sánh với header `If-None-Match` của client.
3. Nếu trùng khớp -> Trả về HTTP `304 Not Modified` (Không kèm body) để tiết kiệm băng thông.
4. Nếu khác hoặc client không truyền -> Đọc danh sách từ Service, gắn header `ETag` bằng versionHash, và `Cache-Control: no-cache, must-revalidate`. Trả về HTTP `200 OK`.

### Response

**200 OK**
```json
{
  "success": true,
  "message": "Lấy danh sách thành công",
  "data": [
    {
      "code": "01",
      "name": "Thành phố Hà Nội",
      "districts": [
        {
          "code": "001",
          "name": "Quận Ba Đình",
          "wards": [
            { "code": "00001", "name": "Phường Phúc Xá" }
          ]
        }
      ]
    }
  ]
}
```

**304 Not Modified**
(Body trống)

---

## 3. Lấy cấu hình hằng số (Constants)

- **Module**: Master Data
- **URL**: `/api/v1/constants`
- **Method**: `GET`
- **Authentication**: Public API
- **Mục đích**: Trả về tất cả các Enums đang định nghĩa ở Backend (Status, Role, Type...) để Frontend đồng bộ map hiển thị.

### Response

**200 OK**
```json
{
  "success": true,
  "message": "Lấy cấu hình hằng số thành công",
  "data": {
    "DeliveryStatus": { "PENDING": "PENDING", ... },
    "DeviceType": { ... },
    "InventoryType": { ... },
    "OrderSource": { ... },
    "OrderStatus": { ... },
    "PaymentMethod": { ... },
    "PaymentStatus": { ... },
    "Role": { "ADMIN": "ADMIN", "DRIVER": "DRIVER", "CUSTOMER": "CUSTOMER" },
    "TransactionType": { ... },
    "CustomerType": { ... }
  }
}
```
