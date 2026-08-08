export function useExportCSV() {
  function downloadCSV(data: Record<string, unknown>[], filename: string) {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map((row) =>
        headers.map((h) => {
          const val = row[h]
          if (val === null || val === undefined) return ''
          const str = String(val).replace(/"/g, '""')
          return `"${str}"`
        }).join(','),
      ),
    ]
    const csv = csvRows.join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return { downloadCSV }
}
