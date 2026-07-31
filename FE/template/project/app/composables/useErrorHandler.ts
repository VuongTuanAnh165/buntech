export interface AppError {
  status: number
  message: string
  fieldErrors: Record<string, string>
}

export function parseError(error: { code?: string; message: string }): AppError {
  const message = error.message || ''
  const code = error.code || ''

  if (code === '23505' || message.includes('duplicate') || message.includes('đã tồn tại')) {
    return { status: 409, message: 'Dữ liệu đã tồn tại', fieldErrors: {} }
  }
  if (code === '42501' || message.includes('permission') || message.includes('policy') || message.includes('quyền')) {
    return { status: 403, message: 'Bạn không có quyền tác vụ này', fieldErrors: {} }
  }
  if (message.includes('violates') || message.includes('constraint') || message.includes('không hợp lệ')) {
    return { status: 422, message: 'Dữ liệu không hợp lệ', fieldErrors: {} }
  }
  return { status: 500, message: 'Hệ thống đang bận, vui lòng thử lại', fieldErrors: {} }
}

export function useErrorHandler() {
  function handleError(error: unknown, context?: string): AppError {
    const { t } = useI18n()
    const toast = useToast()

    if (error && typeof error === 'object' && 'code' in error) {
      const appError = parseError(error as { code?: string; message: string })

      if (appError.status === 403) {
        toast.error(t('errors.forbidden'))
      } else if (appError.status === 500) {
        toast.error(t('errors.serverBusy'))
      } else if (context) {
        toast.error(appError.message)
      }
      return appError
    }

    if (error instanceof Error) {
      toast.error(error.message || t('errors.unexpected'))
      return { status: 400, message: error.message, fieldErrors: {} }
    }

    toast.error(t('errors.unexpected'))
    return { status: 500, message: t('errors.unexpected'), fieldErrors: {} }
  }

  return { handleError }
}
