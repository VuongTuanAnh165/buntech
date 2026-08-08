<script setup lang="ts">
import { Search, X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  debounce?: number
}>(), {
  modelValue: '',
  placeholder: '',
  debounce: 300,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const localValue = ref(props.modelValue)
let timer: ReturnType<typeof setTimeout> | undefined

watch(() => props.modelValue, (val) => {
  if (val !== localValue.value) localValue.value = val
})

watch(localValue, (val) => {
  clearTimeout(timer)
  timer = setTimeout(() => emit('update:modelValue', val), props.debounce)
})

function clear() {
  localValue.value = ''
  emit('update:modelValue', '')
}

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <div class="relative group" role="search">
    <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" aria-hidden="true" />
    <input
      v-model="localValue"
      type="text"
      :placeholder="placeholder || 'Tìm kiếm...'"
      class="form-input pl-10 pr-10 group-focus-within:border-primary-400"
      role="searchbox"
      aria-label="Tìm kiếm"
    >
    <button
      v-if="localValue"
      type="button"
      class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-surface-hover rounded-md transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
      aria-label="Xóa tìm kiếm"
      @click="clear"
    >
      <X class="w-4 h-4" aria-hidden="true" />
    </button>
  </div>
</template>
