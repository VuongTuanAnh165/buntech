export interface AppError {
  status: number
  message: string
  fieldErrors: Record<string, string>
}

export function useErrorHandler() {
  const toast = useToast()
  const { t } = useI18n()

  function handleError(error: unknown, context?: string): AppError {
    const msg = error instanceof Error ? error.message : String(error)

    if (msg.includes('Invalid credentials') || msg.includes('invalid') && msg.includes('credential')) {
      toast.error(t('auth.invalidCredentials'))
      return { status: 401, message: t('auth.invalidCredentials'), fieldErrors: {} }
    }

    if (msg.includes('conflict') || msg.includes('duplicate') || msg.includes('already exists')) {
      toast.error(t('errors.conflict'))
      return { status: 409, message: t('errors.conflict'), fieldErrors: {} }
    }

    if (msg.includes('not found') || msg.includes('404')) {
      toast.error(t('errors.notFound') || t('errors.loadFailed'))
      return { status: 404, message: t('errors.notFound') || t('errors.loadFailed'), fieldErrors: {} }
    }

    if (msg.includes('forbidden') || msg.includes('403')) {
      toast.error(t('errors.forbidden') || t('errors.unexpected'))
      return { status: 403, message: t('errors.forbidden') || t('errors.unexpected'), fieldErrors: {} }
    }

    if (msg.includes('network') || msg.includes('fetch')) {
      toast.error(t('errors.network') || t('errors.unexpected'))
      return { status: 0, message: t('errors.network') || t('errors.unexpected'), fieldErrors: {} }
    }

    if (context) {
      toast.error(context)
    } else {
      toast.error(t('errors.unexpected'))
    }
    return { status: 500, message: t('errors.unexpected'), fieldErrors: {} }
  }

  return { handleError }
}
