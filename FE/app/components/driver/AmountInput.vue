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

watch(
  () => props.modelValue,
  (newVal) => {
    const currentNumeric = Number(displayValue.value.replace(/[^0-9]/g, ''))
    if (currentNumeric !== newVal) {
      displayValue.value = formatNumber(newVal)
    }
  }
)

function formatNumber(num: number): string {
  if (!num) return ''
  return new Intl.NumberFormat('vi-VN').format(num)
}

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement
  // Remove non-numeric chars
  const raw = target.value.replace(/[^0-9]/g, '')

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
    <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center">
      <span class="font-medium text-neutral-500">{{ $t('common_currency_symbol') }}</span>
    </div>
    <UInput
      type="text"
      inputmode="numeric"
      :value="displayValue"
      class="focus:ring-primary-500 h-14 w-full rounded-xl border border-neutral-200 bg-white pr-10 pl-4 text-right text-xl font-bold text-neutral-900 transition-shadow focus:border-transparent focus:ring-2 focus:outline-none dark:border-neutral-700 dark:bg-zinc-900 dark:text-white"
      placeholder="0"
      @input="handleInput"
    />
  </div>
</template>
