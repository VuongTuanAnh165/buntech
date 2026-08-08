<script setup lang="ts">
import { UploadCloud, X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue?: File | null
  preview?: string | null
  maxSize?: number
  accept?: string
  label?: string
}>(), {
  modelValue: null,
  preview: null,
  maxSize: 2 * 1024 * 1024,
  accept: 'image/*',
})

const emit = defineEmits<{
  'update:modelValue': [file: File | null]
  'update:preview': [url: string | null]
  error: [message: string]
}>()

const { t } = useI18n()
const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const localPreview = ref<string | null>(props.preview)

function handleFile(file: File) {
  if (!file.type.startsWith('image/')) {
    emit('error', t('errors.invalidFileType'))
    return
  }
  if (file.size > props.maxSize) {
    emit('error', t('errors.fileTooLarge'))
    return
  }
  if (localPreview.value && localPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(localPreview.value)
  }
  const url = URL.createObjectURL(file)
  localPreview.value = url
  emit('update:modelValue', file)
  emit('update:preview', url)
}

function onInputChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    inputRef.value?.click()
  }
}

function removeImage() {
  if (localPreview.value && localPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(localPreview.value)
  }
  localPreview.value = null
  emit('update:modelValue', null)
  emit('update:preview', null)
  if (inputRef.value) inputRef.value.value = ''
}

onUnmounted(() => {
  if (localPreview.value && localPreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(localPreview.value)
  }
})
</script>

<template>
  <div>
    <label v-if="label" class="form-label">{{ label }}</label>
    <input
      ref="inputRef"
      type="file"
      class="hidden"
      :accept="accept"
      aria-label="Tải lên hình ảnh"
      @change="onInputChange"
    >
    <div
      v-if="!localPreview"
      role="button"
      tabindex="0"
      :class="[
        'relative flex flex-col items-center justify-center w-full min-h-[160px] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200',
        isDragging ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/10' : 'border-surface-border hover:border-primary-300 hover:bg-surface-hover',
      ]"
      aria-label="Kéo thả hoặc nhấn để tải lên hình ảnh"
      @click="inputRef?.click()"
      @keydown="onKeydown"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <UploadCloud class="w-8 h-8 text-gray-400 dark:text-zinc-500 mb-2" aria-hidden="true" />
      <p class="text-sm text-gray-500 dark:text-zinc-400">{{ t('common.dropOrClick') || 'Kéo thả hoặc nhấn để tải lên' }}</p>
      <p class="text-xs text-gray-400 dark:text-zinc-500 mt-1">{{ t('common.maxSize') || 'Tối đa' }} {{ (maxSize / 1024 / 1024).toFixed(0) }}MB</p>
    </div>
    <div v-else class="relative w-full rounded-xl overflow-hidden border border-surface-border group">
      <img :src="localPreview" alt="Xem trước hình ảnh" class="w-full h-48 object-cover">
      <button
        type="button"
        class="absolute top-2 right-2 p-2 bg-gray-900/70 text-white rounded-lg hover:bg-gray-900 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
        aria-label="Xóa hình ảnh"
        @click="removeImage"
      >
        <X class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
