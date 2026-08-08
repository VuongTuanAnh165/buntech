export function useFormat() {
  const formatVND = (amount: number | string | null | undefined): string  => {
    if (amount === null || amount === undefined) return '0 ₫'
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(num)) return '0 ₫'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num)
  }

  const formatNumber = (value: number | string | null | undefined): string  => {
    if (value === null || value === undefined) return '0'
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return '0'
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const formatDate = (date: string | Date | null | undefined): string  => {
    if (!date) return ''
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatDateTime = (date: string | Date | null | undefined): string  => {
    if (!date) return ''
    const d = typeof date === 'string' ? new Date(date) : date
    if (isNaN(d.getTime())) return ''
    return d.toLocaleString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  const parseVNDInput = (value: string): number  => {
    const cleaned = value.replace(/[^\d]/g, '')
    return cleaned ? parseInt(cleaned) : 0
  }

  const formatVNDInput = (value: number): string  => {
    if (!value) return ''
    return new Intl.NumberFormat('vi-VN').format(value)
  }

  const slugify = (text: string): string  => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  return {
    formatVND,
    formatNumber,
    formatDate,
    formatDateTime,
    parseVNDInput,
    formatVNDInput,
    slugify,
  }
}
