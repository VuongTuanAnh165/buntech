<script setup lang="ts">
/**
 * Component hiển thị tiền VNĐ đã format.
 * Tự động đổi màu đỏ nếu số âm (nợ).
 *
 * @example
 * <BaseCurrencyDisplay :value="1500000" />        → "1.500.000 ₫" (xanh)
 * <BaseCurrencyDisplay :value="-200000" />         → "-200.000 ₫" (đỏ)
 * <BaseCurrencyDisplay :value="0" show-zero-as="-" /> → "-"
 */
import { formatCurrency } from '~/utils/format'

interface Props {
  /** Giá trị tiền (number) */
  value: number | null | undefined
  /** Hiển thị thay thế khi giá trị là 0 hoặc null */
  showZeroAs?: string
}

const props = withDefaults(defineProps<Props>(), {
  showZeroAs: undefined
})

const displayValue = computed(() => {
  if ((!props.value || props.value === 0) && props.showZeroAs) {
    return props.showZeroAs
  }
  return formatCurrency(props.value)
})

const isNegative = computed(() => (props.value ?? 0) < 0)
</script>

<template>
  <span :class="[isNegative ? 'text-error' : 'text-default', 'tabular-nums']">
    {{ displayValue }}
  </span>
</template>
