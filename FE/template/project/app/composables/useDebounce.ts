import { ref, type Ref } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(value.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout>
  watch(value, (newVal) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = newVal
    }, delay)
  })
  return debounced
}

export function useDebouncedRef<T>(initial: T, delay = 300): { value: T } {
  const ref = useDebounce(toRef(initial) as Ref<T>, delay)
  return { get value() { return ref.value }, set value(v: T) { ref.value = v } }
}
