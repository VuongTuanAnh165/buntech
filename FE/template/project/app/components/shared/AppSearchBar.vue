<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  debounce?: number
}
const props = withDefaults(defineProps<Props>(), {
  placeholder: '',
  debounce: 300,
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const { t } = useI18n()
const localValue = ref(props.modelValue)
let timer: ReturnType<typeof setTimeout>
watch(() => props.modelValue, (val) => { localValue.value = val })
watch(localValue, (val) => {
  clearTimeout(timer)
  timer = setTimeout(() => emit('update:modelValue', val), props.debounce)
})
</script>

<template>
  <div class="relative">
    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
    <input
      v-model="localValue"
      type="text"
      :placeholder="placeholder || t('common.search')"
      class="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
    >
  </div>
</template>
