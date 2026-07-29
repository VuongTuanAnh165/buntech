# Dashboard Module

Module thống kê và báo cáo tổng quan dành cho ban quản lý.

Tất cả các API trong module này yêu cầu quyền `ADMIN` (`Bearer Token`).

---

## 1. Tổng quan Dashboard (Overview)

- **URL**: `GET /api/v1/admin/dashboard/overview`
- **Mục đích**: Lấy số liệu thống kê tổng hợp (KPI) bao gồm Doanh thu, Số lượng đơn hàng, Tổng công nợ khách hàng, và Phân bổ trạng thái đơn hàng. Có thể lọc theo khoảng thời gian tùy chỉnh.

### Query Parameters

| Params | Type | Required | Description | Example |
| --- | --- | --- | --- | --- |
| `startDate` | string/date | Không | Ngày bắt đầu lọc | `2026-07-01` |
| `endDate` | string/date | Không | Ngày kết thúc lọc | `2026-07-31` |

*(Nếu không truyền `startDate` và `endDate`, backend sẽ lấy mặc định là đầu tháng đến ngày hiện hành, hoặc theo nghiệp vụ mặc định của Service).*

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
    }
  }
}
```
