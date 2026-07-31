<script setup lang="ts">
import { ref } from 'vue'
interface Props {
  modelValue?: File | null
  preview?: string | null
  maxSize?: number
  accept?: string
  label?: string
}
const props = withDefaults(defineProps<Props>(), {
  maxSize: 2 * 1024 * 1024,
  accept: 'image/*',
})
const emit = defineEmits<{
  'update:modelValue': [file: File | null]
  'update:preview': [url: string | null]
  error: [message: string]
}>()
const { t } = useI18n()
const dragOver = ref(false)
const localPreview = ref<string | null>(props.preview)

function handleFile(file: File) {
  if (file.size > props.maxSize) {
    emit('error', t('products.imageTooLarge'))
    return
  }
  const url = URL.createObjectURL(file)
  localPreview.value = url
  emit('update:modelValue', file)
  emit('update:preview', url)
}
function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}
function onInput(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}
function removeImage() {
  if (localPreview.value && localPreview.value.startsWith('blob:')) URL.revokeObjectURL(localPreview.value)
  localPreview.value = null
  emit('update:modelValue', null)
  emit('update:preview', null)
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1.5">{{ label }}</label>
    <div
      v-if="!localPreview"
      :class="[
        'flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-colors cursor-pointer',
        dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400',
      ]"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
    >
      <input type="file" :accept="accept" class="hidden" @change="onInput">
      <svg class="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
      <p class="text-sm text-gray-600">{{ t('products.uploadImage') }}</p>
      <p class="text-xs text-gray-400 mt-1">{{ t('products.maxFileSize') }}</p>
    </div>
    <div v-else class="relative inline-block">
      <img :src="localPreview" alt="preview" class="w-32 h-32 object-cover rounded-xl border border-gray-200">
      <button
        class="absolute -top-2 -right-2 w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center hover:bg-danger-600 transition-colors"
        @click="removeImage"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
  </div>
</template>
