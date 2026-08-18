import type { ZodSchema } from 'zod'
import type { MaybeRefOrGetter } from 'vue'

/**
 * Composable gom gọn boilerplate khởi tạo form validation với Zod.
 * Cung cấp formErrors (reactive), formRef (tương thích useFormSubmit), và hàm validate().
 *
 * Hỗ trợ cả static schema lẫn reactive/computed schema:
 * ```ts
 * // Static schema
 * const { formErrors, formRef, validate } = useZodForm(schema)
 *
 * // Dynamic schema (computed)
 * const schema = computed(() => z.object({ ... }))
 * const { formErrors, formRef, validate } = useZodForm(schema)
 * ```
 */
export function useZodForm<T extends Record<string, unknown>>(
  schemaOrRef: MaybeRefOrGetter<ZodSchema<T>>
) {
  const formErrors = reactive<Record<string, string>>({})

  const formRef = ref({
    setErrors: (errors: { path: string; message: string }[]) => {
      Object.keys(formErrors).forEach((key) => {
        formErrors[key] = ''
      })
      errors.forEach((e) => {
        formErrors[e.path] = e.message
      })
    },
    clearErrors: () => {
      Object.keys(formErrors).forEach((key) => {
        formErrors[key] = ''
      })
    }
  })

  const validate = (state: unknown): state is T => {
    formRef.value.clearErrors()
    const resolvedSchema = toValue(schemaOrRef)
    const result = resolvedSchema.safeParse(state)
    if (!result.success) {
      formRef.value.setErrors(
        result.error.issues.map((issue) => ({
          path: issue.path[0]?.toString() || '',
          message: issue.message
        }))
      )
      return false
    }
    return true
  }

  return { formErrors, formRef, validate }
}
