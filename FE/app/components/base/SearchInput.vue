<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
/**
 * Search Input — input tìm kiếm có debounce tích hợp.
 *
 * @example
 * <BaseSearchInput v-model="search" placeholder="Tìm khách hàng..." />
 */

interface Props {
  /** Placeholder text */
  placeholder?: string
  /** Thời gian debounce (ms) */
  debounce?: number
  /** Icon */
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Tìm kiếm...',
  debounce: 300,
  icon: 'i-lucide-search'
})

const model = defineModel<string>({ default: '' })

const localValue = ref(model.value)

watch(model, (newVal) => {
  // Sync từ ngoài vào (reset, v.v.)
  if (newVal !== localValue.value) {
    localValue.value = newVal
  }
})

watchDebounced(
  localValue,
  (value) => {
    model.value = value
  },
  { debounce: props.debounce }
)

const onInput = (value: string) => {
  localValue.value = value
}

const clear = () => {
  localValue.value = ''
  model.value = ''
}
</script>

<template>
  <UInput
    :model-value="localValue"
    :placeholder="placeholder"
    :icon="icon"
    @update:model-value="onInput"
  >
    <template v-if="localValue" #trailing>
      <UButton
        icon="i-lucide-x"
        size="xs"
        color="neutral"
        variant="ghost"
        class="-mr-1"
        aria-label="Xóa tìm kiếm"
        @click="clear"
      />
    </template>
  </UInput>
</template>
