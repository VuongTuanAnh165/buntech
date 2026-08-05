<script setup lang="ts">
import { AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  text?: string
  disabled?: boolean
  width?: number
}>(), {
  text: '',
  disabled: false,
  width: 320,
})

const emit = defineEmits<{ confirm: [] }>()

const trackRef = ref<HTMLElement | null>(null)
const handleX = ref(0)
const handleSize = 56
const trackWidth = ref(props.width)
const isDragging = ref(false)
const confirmed = ref(false)
const fallbackConfirming = ref(false)

onMounted(() => {
  if (trackRef.value) {
    trackWidth.value = trackRef.value.offsetWidth
  }
})

function onStart(e: MouseEvent | TouchEvent) {
  if (props.disabled || confirmed.value) return
  isDragging.value = true
  if (e.type === 'mousedown') {
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onEnd)
  }
}

let lastTouchX = 0
function onMove(e: MouseEvent | TouchEvent) {
  if (!isDragging.value || !trackRef.value) return
  let clientX: number
  if (e.type === 'touchmove') {
    clientX = (e as TouchEvent).touches[0].clientX
  } else {
    clientX = (e as MouseEvent).clientX
  }
  const rect = trackRef.value.getBoundingClientRect()
  const x = clientX - rect.left - handleSize / 2
  handleX.value = Math.max(0, Math.min(x, trackWidth.value - handleSize))
  if (handleX.value >= trackWidth.value - handleSize - 4) {
    confirm()
  }
}

function onEnd() {
  isDragging.value = false
  if (!confirmed.value) {
    handleX.value = 0
  }
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onEnd)
}

function confirm() {
  if (confirmed.value) return
  confirmed.value = true
  handleX.value = trackWidth.value - handleSize
  emit('confirm')
}

function fallbackConfirm() {
  if (props.disabled || confirmed.value) return
  fallbackConfirming.value = true
  setTimeout(() => {
    confirm()
    fallbackConfirming.value = false
  }, 200)
}

function onTouchStart(e: TouchEvent) {
  if (props.disabled || confirmed.value) return
  lastTouchX = e.touches[0].clientX
  isDragging.value = true
  window.addEventListener('touchmove', onMove, { passive: true })
  window.addEventListener('touchend', onEnd)
}

function onTouchEnd() {
  isDragging.value = false
  if (!confirmed.value) handleX.value = 0
  window.removeEventListener('touchmove', onMove)
  window.removeEventListener('touchend', onEnd)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('mouseup', onEnd)
  window.removeEventListener('touchmove', onMove)
  window.removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
  <div class="space-y-2">
    <div
      ref="trackRef"
      class="relative bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden select-none"
      :style="{ width: `${trackWidth}px`, height: `${handleSize}px` }"
      :class="{ 'opacity-50': disabled }"
    >
      <div
        class="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-500 dark:text-zinc-400"
        :style="{ opacity: 1 - (handleX / (trackWidth - handleSize)) * 2 }"
      >
        {{ text }}
      </div>
      <div
        class="absolute inset-y-0 left-0 bg-success-500/20 transition-all duration-150"
        :style="{ width: `${handleX + handleSize}px` }"
      />
      <div
        class="absolute top-0 left-0 w-14 h-14 bg-success-500 rounded-full shadow-lg flex items-center justify-center text-white cursor-grab active:cursor-grabbing"
        :style="{ transform: `translateX(${handleX}px)` }"
        :class="{ 'cursor-not-allowed': disabled }"
        @mousedown="onStart"
        @touchstart="onTouchStart"
      >
        <ArrowRight v-if="!confirmed" class="w-5 h-5" aria-hidden="true" />
        <CheckCircle2 v-else class="w-5 h-5 animate-scale-in" aria-hidden="true" />
      </div>
    </div>
    <button
      type="button"
      class="text-xs text-gray-400 dark:text-zinc-500 hover:text-success-600 dark:hover:text-success-400 transition-colors underline underline-offset-2 min-h-[44px] px-2"
      :disabled="disabled || confirmed"
      :aria-label="text"
      @click="fallbackConfirm"
    >
      {{ fallbackConfirming ? 'Đang xác nhận...' : 'Hoặc nhấn để xác nhận' }}
    </button>
  </div>
</template>
