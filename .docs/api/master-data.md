# Master Data Module API Specification

Tài liệu này mô tả các API cấp phát dữ liệu hành chính tĩnh (Tỉnh/Thành phố/Quận/Huyện).

---

## 1. GET `/api/v1/master-data/divisions`

### 1. Tổng quan
- **Tên API**: Lấy cây dữ liệu Tỉnh/Thành/Quận/Huyện
- **URL**: `/api/v1/master-data/divisions`
- **Method**: `GET`
- **Authentication Required**: No

### 2. Mục đích
Dùng để Frontend render các ô Dropdown (Combobox) chọn Địa chỉ giao hàng khi thêm Địa chỉ mới hoặc đặt hàng.

### 3. Khi nào Frontend nên gọi
- Khi mở modal "Thêm Địa Chỉ".
- Khi khởi động App (Lưu vào Global State/Context).

### 6. Business Rule
- Dữ liệu trả về được thiết kế dưới dạng cây lồng nhau (Tree). 
- Bậc 1: Mảng các Tỉnh/Thành phố (`level = province`).
- Bậc 2: Nằm trong trường `wards` của bậc 1 (`level = ward / district`).
- Toàn bộ dữ liệu này được lưu trữ siêu nhanh trên In-Memory Cache (RAM) của Node.js.

### 7. Response
- **Response DTO**: Mảng các phần tử `DivisionTreeItem`.
- Dữ liệu mẫu 1 phần tử:
```json
{
  "code": 1,
  "name": "Thành phố Hà Nội",
  "codename": "thanh_pho_ha_noi",
  "division_type": "thành phố trung ương",
  "phone_code": 24,
  "wards": [
    {
      "code": 271,
      "name": "Huyện Sóc Sơn",
      "codename": "huyen_soc_son",
      "division_type": "huyện"
    }
  ]
}
```

### 11. Cache Strategy *(Recommended Practice)*
- **RẤT QUAN TRỌNG**: File JSON này có thể nặng tới 1MB nếu đầy đủ dữ liệu cả nước. Frontend BẮT BUỘC phải cache cực mạnh tay.
- Cache bằng LocalStorage hoặc IndexedDB để lần sau user mở Web không cần phải fetch lại mạng.

---

## 2. GET `/api/v1/master-data/divisions/version`

### 1. Tổng quan
- **Tên API**: Lấy phiên bản đồng bộ hiện tại
- **URL**: `/api/v1/master-data/divisions/version`
- **Method**: `GET`

### 2. Mục đích
Dùng kết hợp với Cache Strategy của API (1). Trước khi Frontend tải cả cây dữ liệu 1MB, hãy gọi API này (rất nhẹ, vài bytes) để lấy chuỗi Hash (Version). Nếu Hash giống với Hash trong LocalStorage thì không cần gọi API (1) nữa.

### 3. Khi nào Frontend nên gọi
- Mở App lần đầu trong ngày.

### 7. Response
- Trả về 1 chuỗi ký tự (Hash MD5/SHA256). VD: `"v2_wards_a8f3b2..."`.

### 9. Frontend Workflow
- `const version = await getVersion()`
- `if (version !== localVersion) { await fetchDivisions(); setLocalVersion(version); }`
