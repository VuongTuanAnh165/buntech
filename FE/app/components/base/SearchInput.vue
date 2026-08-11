<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder?: string
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Tìm kiếm...',
  debounceMs: 300
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const localValue = ref(props.modelValue)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const handleInput = (value: string) => {
  localValue.value = value
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    emit('update:modelValue', value)
  }, props.debounceMs)
}

const clearSearch = () => {
  localValue.value = ''
  emit('update:modelValue', '')
}

watch(
  () => props.modelValue,
  (val) => {
    localValue.value = val
  }
)

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
})
</script>

<template>
  <UInput
    :model-value="localValue"
    :placeholder="props.placeholder"
    trailing-icon="i-lucide-search"
    class="w-full sm:max-w-xs"
    @update:model-value="handleInput"
  >
    <template #trailing>
      <UButton
        v-if="localValue"
        icon="i-lucide-x"
        color="neutral"
        variant="link"
        size="xs"
        aria-label="Xóa tìm kiếm"
        @click="clearSearch"
      />
    </template>
  </UInput>
</template>
