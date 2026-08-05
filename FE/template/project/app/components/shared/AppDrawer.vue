<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  subtitle?: string
  width?: string
  closeOnBackdrop?: boolean
  mobileSheet?: boolean
}>(), {
  modelValue: false,
  width: 'max-w-md',
  closeOnBackdrop: true,
  mobileSheet: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const drawerRef = ref<HTMLElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)
const { activate, deactivate } = useFocusTrap(drawerRef)

const titleId = `drawer-title-${Math.random().toString(36).slice(2, 9)}`

watch(() => props.modelValue, (val) => {
  if (val) {
    previouslyFocused.value = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'
    setTimeout(() => {
      activate()
      const firstFocusable = drawerRef.value?.querySelector<HTMLElement>('[tabindex], button, input, select, textarea')
      firstFocusable?.focus()
    }, 50)
  } else {
    deactivate()
    document.body.style.overflow = ''
    nextTick(() => previouslyFocused.value?.focus())
  }
})

function close() { emit('update:modelValue', false) }
function onBackdrop() { if (props.closeOnBackdrop) close() }
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) { e.preventDefault(); close() }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex"
        :class="mobileSheet ? 'items-end sm:items-stretch sm:justify-end' : 'items-stretch justify-end'"
        @mousedown.self="onBackdrop"
      >
        <div class="absolute inset-0 bg-slate-900/30 backdrop-blur-md" aria-hidden="true" />

        <div
          ref="drawerRef"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          class="relative bg-surface border border-surface-border shadow-2xl w-full flex flex-col"
          :class="mobileSheet ? `rounded-t-3xl sm:rounded-t-none sm:rounded-l-2xl ${width} max-h-[90vh] sm:max-h-full` : `rounded-l-2xl ${width}`"
        >
          <!-- Mobile drag handle -->
          <div v-if="mobileSheet" class="sm:hidden flex justify-center pt-3 pb-1">
            <div class="w-10 h-1.5 bg-gray-300 dark:bg-zinc-700 rounded-full" />
          </div>

          <!-- Header -->
          <div v-if="title" class="flex items-start justify-between px-5 sm:px-6 py-4 border-b border-surface-border">
            <div class="min-w-0">
              <h2 :id="titleId" class="text-lg font-semibold text-surface-foreground truncate tracking-tight">{{ title }}</h2>
              <p v-if="subtitle" class="text-sm text-slate-500 dark:text-zinc-400 mt-1">{{ subtitle }}</p>
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
          <div class="flex-1 overflow-y-auto scrollbar-thin px-5 sm:px-6 py-5">
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
