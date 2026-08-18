export const Pagination = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const

/**
 * Giới hạn limit trong khoảng [1, MAX_LIMIT] để tránh OOM
 */
export function getSafeLimit(limit: number): number {
  return Math.min(Math.max(limit, 1), Pagination.MAX_LIMIT)
}
