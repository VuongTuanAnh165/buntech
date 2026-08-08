import type { ConfirmDialogOptions } from '~/types/common'

/**
 * State reactive dùng chung giữa composable và ConfirmDialog component.
 * Khai báo bên trong composable function để tránh rò rỉ SSR.
 */
const defaultOptions: ConfirmDialogOptions = {
  title: 'Xác nhận',
  description: 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmLabel: 'Xác nhận',
  cancelLabel: 'Hủy',
  color: 'error',
  icon: 'i-lucide-alert-triangle'
}

/**
 * Composable mở dialog xác nhận trước các hành động nguy hiểm.
 * Phối hợp với component ConfirmDialog.vue.
 *
 * @example
 * const { confirm } = useConfirmDialog()
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: 'Xóa khách hàng?',
 *     description: 'Hành động này không thể hoàn tác.',
 *     confirmLabel: 'Xóa',
 *     color: 'error'
 *   })
 *   if (confirmed) {
 *     // Tiến hành xóa...
 *   }
 * }
 */
/**
 * Đưa resolvePromise ra ngoài module scope (Global Singleton).
 * Lý do: Nếu để bên trong export const useConfirmDialog, mỗi lần một component gọi useConfirmDialog(),
 * nó sẽ tạo ra một closure resolvePromise riêng biệt.
 * Khi Component A gọi confirm(), nó set resolvePromise A. Khi BaseConfirmDialog gọi handleConfirm(),
 * nó invoke resolvePromise B (lúc này đang null), khiến promise của Component A bị treo vô thời hạn (Memory Leak).
 */
let globalResolvePromise: ((value: boolean) => void) | null = null

export const useConfirmDialog = () => {
  const isOpen = useState<boolean>('confirm-dialog-open', () => false)
  const options = useState<ConfirmDialogOptions>('confirm-dialog-options', () => ({
    ...defaultOptions
  }))

  const confirm = (opts?: Partial<ConfirmDialogOptions>): Promise<boolean> => {
    options.value = { ...defaultOptions, ...opts }
    isOpen.value = true

    return new Promise<boolean>((resolve) => {
      globalResolvePromise = resolve
    })
  }

  const handleConfirm = () => {
    isOpen.value = false
    globalResolvePromise?.(true)
    globalResolvePromise = null
  }

  const handleCancel = () => {
    isOpen.value = false
    globalResolvePromise?.(false)
    globalResolvePromise = null
  }

  return {
    isOpen: readonly(isOpen),
    options: readonly(options),
    confirm,
    handleConfirm,
    handleCancel
  }
}
