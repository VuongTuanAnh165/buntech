/**
 * Bản đồ ký tự có dấu → không dấu tiếng Việt.
 */
const VIETNAMESE_MAP: Record<string, string> = {
  à: 'a',
  á: 'a',
  ả: 'a',
  ã: 'a',
  ạ: 'a',
  ă: 'a',
  ắ: 'a',
  ằ: 'a',
  ẳ: 'a',
  ẵ: 'a',
  ặ: 'a',
  â: 'a',
  ấ: 'a',
  ầ: 'a',
  ẩ: 'a',
  ẫ: 'a',
  ậ: 'a',
  è: 'e',
  é: 'e',
  ẻ: 'e',
  ẽ: 'e',
  ẹ: 'e',
  ê: 'e',
  ế: 'e',
  ề: 'e',
  ể: 'e',
  ễ: 'e',
  ệ: 'e',
  ì: 'i',
  í: 'i',
  ỉ: 'i',
  ĩ: 'i',
  ị: 'i',
  ò: 'o',
  ó: 'o',
  ỏ: 'o',
  õ: 'o',
  ọ: 'o',
  ô: 'o',
  ố: 'o',
  ồ: 'o',
  ổ: 'o',
  ỗ: 'o',
  ộ: 'o',
  ơ: 'o',
  ớ: 'o',
  ờ: 'o',
  ở: 'o',
  ỡ: 'o',
  ợ: 'o',
  ù: 'u',
  ú: 'u',
  ủ: 'u',
  ũ: 'u',
  ụ: 'u',
  ư: 'u',
  ứ: 'u',
  ừ: 'u',
  ử: 'u',
  ữ: 'u',
  ự: 'u',
  ỳ: 'y',
  ý: 'y',
  ỷ: 'y',
  ỹ: 'y',
  ỵ: 'y',
  đ: 'd',
  À: 'A',
  Á: 'A',
  Ả: 'A',
  Ã: 'A',
  Ạ: 'A',
  Ă: 'A',
  Ắ: 'A',
  Ằ: 'A',
  Ẳ: 'A',
  Ẵ: 'A',
  Ặ: 'A',
  Â: 'A',
  Ấ: 'A',
  Ầ: 'A',
  Ẩ: 'A',
  Ẫ: 'A',
  Ậ: 'A',
  È: 'E',
  É: 'E',
  Ẻ: 'E',
  Ẽ: 'E',
  Ẹ: 'E',
  Ê: 'E',
  Ế: 'E',
  Ề: 'E',
  Ể: 'E',
  Ễ: 'E',
  Ệ: 'E',
  Ì: 'I',
  Í: 'I',
  Ỉ: 'I',
  Ĩ: 'I',
  Ị: 'I',
  Ò: 'O',
  Ó: 'O',
  Ỏ: 'O',
  Õ: 'O',
  Ọ: 'O',
  Ô: 'O',
  Ố: 'O',
  Ồ: 'O',
  Ổ: 'O',
  Ỗ: 'O',
  Ộ: 'O',
  Ơ: 'O',
  Ớ: 'O',
  Ờ: 'O',
  Ở: 'O',
  Ỡ: 'O',
  Ợ: 'O',
  Ù: 'U',
  Ú: 'U',
  Ủ: 'U',
  Ũ: 'U',
  Ụ: 'U',
  Ư: 'U',
  Ứ: 'U',
  Ừ: 'U',
  Ử: 'U',
  Ữ: 'U',
  Ự: 'U',
  Ỳ: 'Y',
  Ý: 'Y',
  Ỷ: 'Y',
  Ỹ: 'Y',
  Ỵ: 'Y',
  Đ: 'D'
}

/**
 * Xóa dấu tiếng Việt — hữu ích cho tìm kiếm không phân biệt dấu.
 * @example removeVietnameseTones('Xưởng bún gia đình') → 'Xuong bun gia dinh'
 */
export const removeVietnameseTones = (text: string): string => {
  // Bỏ qua regex kiểm tra character từ 0000 vì ESLint chặn (no-control-regex).
  // Chỉ dùng map để replace ký tự có dấu.
  let result = text
  for (let i = 0; i < result.length; i++) {
    const char = result[i]
    if (char && VIETNAMESE_MAP[char]) {
      result = result.substring(0, i) + VIETNAMESE_MAP[char] + result.substring(i + 1)
    }
  }
  return result
}

/**
 * Chuyển chuỗi thành slug URL-friendly.
 * @example slugify('Bún tươi BunTech') → 'bun-tuoi-buntech'
 */
export const slugify = (text: string): string => {
  return removeVietnameseTones(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Cắt ngắn chuỗi và thêm dấu "...".
 * @example truncate('Xưởng bún gia đình BunTech', 15) → 'Xưởng bún gia đ...'
 */
export const truncate = (text: string | null | undefined, maxLength: number): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Lấy chữ cái đầu cho Avatar.
 * @example getInitials('Nguyễn Văn An') → 'NA'
 * @example getInitials('Admin') → 'AD'
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return ''
  const words = name.trim().split(/\s+/)
  if (words.length === 1) {
    return (words[0] ?? '').slice(0, 2).toUpperCase()
  }
  const first = words[0]?.[0] ?? ''
  const last = words[words.length - 1]?.[0] ?? ''
  return (first + last).toUpperCase()
}
