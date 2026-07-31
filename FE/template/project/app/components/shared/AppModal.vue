<script setup lang="ts">
import { ref } from 'vue'
interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnBackdrop: true,
})
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const sizeClasses: Record<string, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

const modalRef = ref<HTMLElement | null>(null)
const { activate, deactivate } = useFocusTrap(modalRef)

function close() {
  emit('update:modelValue', false)
}
function onBackdropClick() {
  if (props.closeOnBackdrop) close()
}
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(() => props.modelValue, (val) => {
  if (val) {
    document.addEventListener('keydown', onKeyDown)
    setTimeout(() => activate(), 100)
  } else {
    document.removeEventListener('keydown', onKeyDown)
    deactivate()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
  deactivate()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" ref="modalRef" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="onBackdropClick" />
        <div :class="['relative w-full bg-white rounded-2xl shadow-xl animate-slide-up', sizeClasses[size]]">
          <div v-if="title" class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
            <button class="text-gray-400 hover:text-gray-600 transition-colors" @click="close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="px-6 py-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
            <slot />
          </div>
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
