<script setup lang="ts">
const props = defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const displayValue = ref('')

onMounted(() => {
  displayValue.value = formatNumber(props.modelValue)
})

watch(() => props.modelValue, (newVal) => {
  const currentNumeric = Number(displayValue.value.replace(/[^0-9]/g, ''))
  if (currentNumeric !== newVal) {
    displayValue.value = formatNumber(newVal)
  }
})

function formatNumber(num: number): string {
  if (!num) return ''
  return new Intl.NumberFormat('vi-VN').format(num)
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  // Remove non-numeric chars
  let raw = target.value.replace(/[^0-9]/g, '')
  
  // Format with dots
  let formatted = ''
  if (raw) {
    formatted = formatNumber(Number(raw))
  }
  
  displayValue.value = formatted
  emit('update:modelValue', Number(raw) || 0)
}
</script>

<template>
  <div class="relative">
    <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
      <span class="text-neutral-500 font-medium">đ</span>
    </div>
    <input 
      type="text" 
      inputmode="numeric"
      :value="displayValue"
      @input="handleInput"
      class="w-full h-14 pl-4 pr-10 text-xl font-bold rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-zinc-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow text-right"
      placeholder="0"
    />
  </div>
</template>
