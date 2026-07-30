# Dashboard Module

Module thống kê và báo cáo tổng quan dành cho ban quản lý.

Tất cả các API trong module này yêu cầu quyền `ADMIN` (`Bearer Token`).

---

## 1. Tổng quan Dashboard (Overview)

- **URL**: `GET /api/v1/admin/dashboard/overview`
- **Mục đích**: Lấy số liệu thống kê tổng hợp (KPI) bao gồm Doanh thu, Số lượng đơn hàng, Tổng công nợ khách hàng, Phân bổ trạng thái đơn hàng, và mảng dữ liệu chuỗi thời gian (time-series) cho biểu đồ doanh thu. Có thể lọc theo khoảng thời gian tùy chỉnh.

### Query Parameters

| Params | Type | Required | Description | Example |
| --- | --- | --- | --- | --- |
| `startDate` | string/date | Không | Ngày bắt đầu lọc (`YYYY-MM-DD`) | `2026-07-01` |
| `endDate` | string/date | Không | Ngày kết thúc lọc (`YYYY-MM-DD`) | `2026-07-31` |

*(Nếu không truyền `startDate` và `endDate`, backend sẽ lấy mặc định là 30 ngày gần nhất tính đến thời điểm hiện tại).*

### Response (200 OK)

```json
{
  "success": true,
  "message": "Lấy dữ liệu Dashboard thành công",
  "data": {
    "totalRevenue": 500000000,
    "totalOrders": 125,
    "totalDebt": 45000000,
    "orderStatusDistribution": {
      "PENDING": 10,
      "SHIPPING": 5,
      "DELIVERED": 110,
      "CANCELLED": 0
    },
    "revenueChart": [
      {
        "date": "2026-07-01",
        "value": 15000000,
        "ordersCount": 5
      },
      {
        "date": "2026-07-02",
        "value": 20000000,
        "ordersCount": 8
      }
    ]
  }
}
```

---

## 2. Thống kê Khách hàng Mua Nhiều Nhất (Top Buyers)

- **URL**: `GET /api/v1/admin/dashboard/top-buyers`
- **Mục đích**: Trả về danh sách khách hàng đứng đầu dựa trên doanh thu mang lại hoặc sản lượng bún đã tiêu thụ, phục vụ cho việc chăm sóc khách VIP.

### Query Parameters

| Params | Type | Required | Description | Example |
| --- | --- | --- | --- | --- |
| `startDate` | string/date | Không | Ngày bắt đầu lọc (`YYYY-MM-DD`) | `2026-07-01` |
| `endDate` | string/date | Không | Ngày kết thúc lọc (`YYYY-MM-DD`) | `2026-07-31` |
| `limit` | number | Không | Số lượng khách hàng trả về (Mặc định: 10) | `10` |
| `sortBy` | string | Không | Tiêu chí sắp xếp: `revenue` (doanh thu) hoặc `quantity` (sản lượng). Mặc định là `revenue`. | `revenue` |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Lấy danh sách Top Buyers thành công",
  "data": [
    {
      "userId": 45,
      "fullName": "Quán Bún Bò Huế (Chị Hương)",
      "phoneNumber": "0988111222",
      "totalRevenue": 45000000,
      "totalQuantityKg": 3000,
      "ordersCount": 15
    },
    {
      "userId": 89,
      "fullName": "Bún Thịt Nướng Anh Tèo",
      "phoneNumber": "0912333444",
      "totalRevenue": 30000000,
      "totalQuantityKg": 2000,
      "ordersCount": 10
    }
  ]
}
```
