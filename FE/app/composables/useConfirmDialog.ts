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
export const useConfirmDialog = () => {
  const isOpen = useState<boolean>('confirm-dialog-open', () => false)
  const options = useState<ConfirmDialogOptions>('confirm-dialog-options', () => ({
    ...defaultOptions
  }))

  let resolvePromise: ((value: boolean) => void) | null = null

  const confirm = (opts?: Partial<ConfirmDialogOptions>): Promise<boolean> => {
    options.value = { ...defaultOptions, ...opts }
    isOpen.value = true

    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve
    })
  }

  const handleConfirm = () => {
    isOpen.value = false
    resolvePromise?.(true)
    resolvePromise = null
  }

  const handleCancel = () => {
    isOpen.value = false
    resolvePromise?.(false)
    resolvePromise = null
  }

  return {
    isOpen: readonly(isOpen),
    options: readonly(options),
    confirm,
    handleConfirm,
    handleCancel
  }
}
