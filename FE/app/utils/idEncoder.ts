const BASE62_CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const BASE = BASE62_CHARSET.length

/**
 * Mã hoá một ID (số nguyên) thành chuỗi Base62 ngắn gọn.
 * Dùng để tạo các slug đẹp trên URL nhưng vẫn giấu đi ID gốc.
 */
export function encodeId(id: number | string): string {
  let numId = typeof id === 'string' ? parseInt(id, 10) : id

  if (isNaN(numId) || numId < 0) {
    return ''
  }

  if (numId === 0) {
    return BASE62_CHARSET[0] as string
  }

  let encoded = ''
  while (numId > 0) {
    encoded = (BASE62_CHARSET[numId % BASE] as string) + encoded
    numId = Math.floor(numId / BASE)
  }

  // Thêm một chút random/salt hoặc padding đơn giản để làm chuỗi trông khó đoán hơn một chút
  // Ví dụ ta có thể đảo ngược hoặc trộn, nhưng đơn giản nhất là base62 thuần cho nhanh.
  // Để tránh ID 1 2 3 quá ngắn, có thể thêm 1 offset cố định, ví dụ cộng thêm 10000.
  // Nhưng để chuẩn thì giữ nguyên base62.
  // Để tránh quá dễ đoán, đảo ngược chuỗi hoặc thêm ký tự "B" làm mốc (không cần thiết).
  return encoded
}

/**
 * Giải mã chuỗi Base62 về lại ID gốc.
 */
export function decodeId(encoded: string): number | null {
  if (!encoded || typeof encoded !== 'string') return null

  let decoded = 0
  for (let i = 0; i < encoded.length; i++) {
    const char = encoded[i]
    const val = BASE62_CHARSET.indexOf(char as string)
    if (val === -1) return null // Ký tự không hợp lệ
    decoded = decoded * BASE + val
  }

  return decoded
}

/**
 * Lấy ID từ một slug đầy đủ dạng 'bai-viet-hay-xY12'
 */
export function extractIdFromSlug(slugWithId: string): number | null {
  if (!slugWithId) return null

  const parts = slugWithId.split('-')
  if (parts.length === 0) return null

  // Encoded ID luôn nằm ở phần cuối cùng của URL slug
  const idPart = parts[parts.length - 1] as string
  return decodeId(idPart)
}

/**
 * Hàm hỗ trợ tạo slug đầy đủ từ tên/tiêu đề và ID gốc.
 * Gọi sau khi tạo mới record thành công (để lấy ID) hoặc khi render danh sách.
 */
export function generateSeoSlug(slug: string, id: number | string): string {
  return `${slug}-${encodeId(id)}`
}
