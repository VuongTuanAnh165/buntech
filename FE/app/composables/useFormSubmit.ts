/**
 * Composable chuẩn hóa logic submit form.
 * Quản lý loading state, error handling, toast, reset form.
 *
 * @example
 * const { isSubmitting, handleSubmit } = useFormSubmit()
 *
 * const onSubmit = handleSubmit(async (data) => {
 *   await CustomerService.create(data)
 * }, {
 *   successMessage: 'Tạo khách hàng thành công!',
 *   onSuccess: () => navigateTo('/admin/customers')
 * })
 */
export const useFormSubmit = () => {
  const isSubmitting = ref(false)

  interface SubmitOptions {
    /** Tin nhắn toast khi thành công (nếu API không trả message). */
    successMessage?: string
    /** Callback sau khi submit thành công. */
    onSuccess?: () => void | Promise<void>
    /** Callback khi có lỗi. */
    onError?: (error: unknown) => void
    /** Có reset form sau khi thành công không? Mặc định: false */
    resetAfterSuccess?: boolean
    /** Ref của FormWrapper để tự động hiển thị lỗi 422 */
    formRef?: Ref<
      | {
          setErrors: (errors: { path: string; message: string }[]) => void
          clearErrors: () => void
        }
      | undefined
    >
  }

  /**
   * Wrap hàm submit với loading state + error handling.
   * @param submitFn - Hàm async chứa logic submit
   * @param options - Tùy chọn xử lý sau submit
   * @returns Hàm submit đã được wrap
   */
  const handleSubmit = <T>(submitFn: (data: T) => Promise<unknown>, options?: SubmitOptions) => {
    return async (data: T) => {
      if (isSubmitting.value) return // Ngăn double-click

      isSubmitting.value = true
      try {
        if (options?.formRef) {
          options.formRef.value?.clearErrors?.()
        }

        await submitFn(data)

        if (options?.onSuccess) {
          await options.onSuccess()
        }
      } catch (err: unknown) {
        const error = err as { data?: { validationErrors?: { path: string; message: string }[] } }
        // Tự động map lỗi 422 vào Form nếu có truyền formRef
        if (options?.formRef && error?.data?.validationErrors) {
          options.formRef.value?.setErrors?.(error.data.validationErrors)
        }

        // Chỉ gọi onError callback nếu dev cần xử lý thêm
        if (options?.onError) {
          options.onError(err)
        }
        console.error('[useFormSubmit Error]', err)
      } finally {
        isSubmitting.value = false
      }
    }
  }

  return {
    isSubmitting: readonly(isSubmitting),
    handleSubmit
  }
}
