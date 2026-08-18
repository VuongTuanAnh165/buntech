import type { ZodSchema } from 'zod'

/**
 * Composable gom gọn boilerplate khởi tạo form validation với Zod.
 * Cung cấp formErrors (reactive), formRef (tương thích useFormSubmit), và hàm validate().
 *
 * Sử dụng:
 * ```ts
 * const schema = z.object({ name: z.string().min(1), email: z.string().email() })
 * const { formErrors, formRef, validate } = useZodForm(schema)
 * ```
 */
export function useZodForm<T extends Record<string, unknown>>(schema: ZodSchema<T>) {
  const formErrors = reactive<Record<string, string>>({})

  const formRef = ref({
    setErrors: (errors: { path: string; message: string }[]) => {
      Object.keys(formErrors).forEach((key) => delete formErrors[key])
      errors.forEach((e) => {
        formErrors[e.path] = e.message
      })
    },
    clearErrors: () => {
      Object.keys(formErrors).forEach((key) => delete formErrors[key])
    },
  })

  const validate = (state: unknown): state is T => {
    formRef.value.clearErrors()
    const result = schema.safeParse(state)
    if (!result.success) {
      formRef.value.setErrors(
        result.error.issues.map((issue) => ({
          path: issue.path[0]?.toString() || '',
          message: issue.message,
        }))
      )
      return false
    }
    return true
  }

  return { formErrors, formRef, validate }
}
