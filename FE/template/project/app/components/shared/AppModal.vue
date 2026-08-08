<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
  mobileSheet?: boolean
}>(), {
  modelValue: false,
  size: 'md',
  closeOnBackdrop: true,
  mobileSheet: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const modalRef = ref<HTMLElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)
const { activate, deactivate } = useFocusTrap(modalRef)

const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`
const subtitleId = `modal-subtitle-${Math.random().toString(36).slice(2, 9)}`

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

watch(() => props.modelValue, (val) => {
  if (val) {
    previouslyFocused.value = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    setTimeout(() => {
      activate()
      const firstFocusable = modalRef.value?.querySelector<HTMLElement>('[tabindex], button, input, select, textarea')
      firstFocusable?.focus()
    }, 50)
  } else {
    deactivate()
    document.body.style.overflow = ''
    nextTick(() => {
      previouslyFocused.value?.focus()
    })
  }
})

function close() {
  emit('update:modelValue', false)
}

function onBackdrop() {
  if (props.closeOnBackdrop) close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    e.preventDefault()
    close()
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex"
        :class="mobileSheet ? 'items-end sm:items-center justify-center' : 'items-center justify-center'"
        @mousedown.self="onBackdrop"
      >
        <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-md" aria-hidden="true" />

        <div
          ref="modalRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          :aria-describedby="subtitle ? subtitleId : undefined"
          :class="[
            'modal-content relative bg-surface border border-surface-border shadow-2xl w-full mx-4 overflow-hidden',
            mobileSheet ? 'rounded-t-3xl sm:rounded-2xl max-h-[90vh] sm:max-h-[85vh]' : 'rounded-2xl max-h-[85vh]',
            mobileSheet ? `sm:${sizeClasses[size]}` : sizeClasses[size],
          ]"
        >
          <!-- Mobile drag handle -->
          <div v-if="mobileSheet" class="sm:hidden flex justify-center pt-3 pb-1">
            <div class="w-10 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full" />
          </div>

          <!-- Header -->
          <div v-if="title || $slots.header" class="flex items-start justify-between px-5 sm:px-6 py-4 border-b border-surface-border">
            <div class="min-w-0 flex-1">
              <h2 v-if="title" :id="titleId" class="text-lg font-semibold text-surface-foreground truncate tracking-tight">{{ title }}</h2>
              <p v-if="subtitle" :id="subtitleId" class="text-sm text-slate-500 dark:text-zinc-400 mt-1">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              class="ml-4 p-2 -mt-1 -mr-1 text-slate-400 hover:text-surface-foreground hover:bg-surface-hover rounded-lg transition-all duration-150 flex-shrink-0 active:scale-90"
              aria-label="Đóng"
              @click="close"
            >
              <X class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-5 sm:px-6 py-5 overflow-y-auto scrollbar-thin" style="max-height: calc(85vh - 80px)">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-5 sm:px-6 py-4 border-t border-surface-border bg-surface-muted/30 safe-area-bottom">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
