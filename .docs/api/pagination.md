# Pagination (Phân trang)

Hệ thống Buntech Backend sử dụng tính năng `.paginate(page, limit)` mặc định của **Lucid ORM**.

## Cấu trúc Response Phân Trang

Khi một API trả về danh sách phân trang, `data` sẽ có chứa field `meta` đính kèm cùng `data`:

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "meta": {
      "total": 100,
      "perPage": 10,
      "currentPage": 1,
      "lastPage": 10,
      "firstPage": 1,
      "firstPageUrl": "/?page=1",
      "lastPageUrl": "/?page=10",
      "nextPageUrl": "/?page=2",
      "previousPageUrl": null
    },
    "data": [
      { "id": 1, "name": "Item 1" },
      { "id": 2, "name": "Item 2" }
    ]
  }
}
```

## Các Query Parameters

Thông thường, mọi API list đều hỗ trợ 2 params sau:

| Query Param | Kiểu | Mặc định | Ý nghĩa |
| --- | --- | --- | --- |
| `page` | number | `1` | Trang hiện tại |
| `limit` | number | `10` | Số bản ghi trên mỗi trang (thường giới hạn tối đa <= 100 để chống Overload Memory) |

Lưu ý: Đối với các bảng Master Data ít dữ liệu (như Role, Country, Category), API có thể trả về mảng trực tiếp thay vì bọc trong `meta` phân trang. Chi tiết sẽ được làm rõ trong từng tài liệu API.
