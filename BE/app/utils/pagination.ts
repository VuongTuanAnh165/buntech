import { type ModelPaginatorContract, type LucidRow } from '@adonisjs/lucid/types/model'

/**
 * Chuẩn hóa format dữ liệu phân trang trả về từ Lucid ORM.
 * Thay vì trả về snake_case hoặc root-level meta,
 * hàm này chuyển đổi thành `{ data: [...], meta: { perPage, currentPage, ... } }`.
 */
export function formatPagination<T extends LucidRow>(paginator: ModelPaginatorContract<T>) {
  const meta = paginator.getMeta()

  return {
    meta: {
      total: meta.total,
      perPage: meta.perPage,
      currentPage: meta.currentPage,
      lastPage: meta.lastPage,
      firstPage: meta.firstPage,
    },
    data: paginator.all(),
  }
}
