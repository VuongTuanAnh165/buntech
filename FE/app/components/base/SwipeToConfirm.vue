<script setup lang="ts">
const props = defineProps<{
  text?: string
  successText?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
}>()

const trackRef = ref<HTMLElement | null>(null)
const thumbRef = ref<HTMLElement | null>(null)

const isDragging = ref(false)
const dragOffset = ref(0)
const isConfirmed = ref(false)

const trackWidth = ref(0)
const thumbWidth = 56 // Fixed thumb width (14 * 4 = 56px)
const maxOffset = computed(() => Math.max(0, trackWidth.value - thumbWidth))
const progress = computed(() => {
  if (isConfirmed.value) return 1
  if (!maxOffset.value) return 0
  return dragOffset.value / maxOffset.value
})

let startX = 0

function handleStart(e: MouseEvent | TouchEvent) {
  if (props.disabled || isConfirmed.value) return
  isDragging.value = true
  startX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  if (trackRef.value) {
    trackWidth.value = trackRef.value.offsetWidth
  }
  
  window.addEventListener('mousemove', handleMove)
  window.addEventListener('touchmove', handleMove, { passive: false })
  window.addEventListener('mouseup', handleEnd)
  window.addEventListener('touchend', handleEnd)
}

function handleMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value) return
  // e.preventDefault() // prevent scrolling while dragging
  const currentX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  const deltaX = currentX - startX
  dragOffset.value = Math.max(0, Math.min(deltaX, maxOffset.value))
}

function handleEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  
  if (dragOffset.value >= maxOffset.value * 0.8) {
    // Snap to end and confirm
    dragOffset.value = maxOffset.value
    isConfirmed.value = true
    emit('confirm')
  } else {
    // Snap back
    dragOffset.value = 0
  }
  
  window.removeEventListener('mousemove', handleMove)
  window.removeEventListener('touchmove', handleMove)
  window.removeEventListener('mouseup', handleEnd)
  window.removeEventListener('touchend', handleEnd)
}
</script>

<template>
  <div 
    ref="trackRef"
    class="relative h-14 w-full rounded-full overflow-hidden select-none transition-all duration-300"
    :class="[
      disabled ? 'bg-slate-100 dark:bg-zinc-800 opacity-70 cursor-not-allowed' : 'bg-primary-50 dark:bg-primary-950/30 ring-1 ring-inset ring-primary-200/50 dark:ring-primary-900/50',
      isConfirmed ? 'bg-success-500 ring-success-500' : ''
    ]"
  >
    <!-- Background Progress Gradient -->
    <div 
      class="absolute inset-y-0 left-0 bg-primary-100 dark:bg-primary-900/50 transition-all"
      :class="isDragging ? 'duration-0' : 'duration-300 ease-out'"
      :style="{ width: `${(dragOffset / maxOffset) * 100}%` }"
      v-if="!isConfirmed && !disabled"
    />

    <!-- Shimmer Effect -->
    <div 
      v-if="!disabled && !isConfirmed"
      class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer pointer-events-none"
    />

    <!-- Text -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <span 
        class="text-sm font-semibold transition-colors duration-300"
        :class="[
          disabled ? 'text-slate-400' : (isConfirmed ? 'text-white' : 'text-primary-700 dark:text-primary-400'),
          isConfirmed ? 'animate-fade-in-up' : ''
        ]"
      >
        {{ isConfirmed ? (successText || 'Đã xác nhận') : (text || 'Vuốt để xác nhận') }}
      </span>
    </div>

    <!-- Thumb -->
    <div 
      ref="thumbRef"
      class="absolute left-0 top-0 bottom-0 w-14 rounded-full flex items-center justify-center transition-all z-20"
      :class="[
        disabled ? 'bg-slate-200 dark:bg-zinc-700 text-slate-400' : (isConfirmed ? 'bg-white text-success-500 shadow-md' : 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 cursor-grab active:cursor-grabbing'),
        isDragging ? 'duration-0 scale-95' : 'duration-300 ease-spring',
        isConfirmed ? 'scale-0 opacity-0' : '' // Hide thumb when confirmed
      ]"
      :style="{ transform: `translateX(${dragOffset}px) ${isDragging ? 'scale(0.95)' : ''}` }"
      @mousedown="handleStart"
      @touchstart.passive="handleStart"
    >
      <UIcon 
        :name="disabled ? 'i-lucide-lock' : 'i-lucide-chevron-right'" 
        class="w-6 h-6 transition-transform duration-300"
        :class="isDragging ? 'translate-x-1' : ''"
      />
    </div>

    <!-- Checkmark (Shows on confirm) -->
    <div 
      class="absolute left-4 top-0 bottom-0 flex items-center z-20 pointer-events-none transition-all duration-500"
      :class="isConfirmed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'"
    >
      <UIcon name="i-lucide-check-circle-2" class="w-6 h-6 text-white" />
    </div>
  </div>
</template>

<style scoped>
.ease-spring {
  transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>
