<script setup lang="ts">
interface Props {
  text?: string
  disabled?: boolean
  width?: number
}
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  width: 320,
})
const emit = defineEmits<{ confirm: [] }>()
const { t } = useI18n()
const sliderRef = ref<HTMLElement | null>(null)
const handleX = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const confirmed = ref(false)
const trackWidth = 280
const handleSize = 52

function onStart(e: TouchEvent | MouseEvent) {
  if (props.disabled || confirmed.value) return
  isDragging.value = true
  startX.value = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
}
function onMove(e: TouchEvent | MouseEvent) {
  if (!isDragging.value || props.disabled) return
  const currentX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
  const delta = currentX - startX.value
  handleX.value = Math.max(0, Math.min(delta, trackWidth - handleSize))
}
function onEnd() {
  if (!isDragging.value) return
  isDragging.value = false
  if (handleX.value > trackWidth - handleSize - 20) {
    handleX.value = trackWidth - handleSize
    confirmed.value = true
    emit('confirm')
  } else {
    handleX.value = 0
  }
}
</script>

<template>
  <div
    class="relative rounded-full bg-gray-200 select-none overflow-hidden"
    :style="{ width: `${trackWidth}px`, height: '56px' }"
  >
    <div
      class="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-500"
    >
      {{ confirmed ? t('driver.deliveryConfirmed') : (text || t('driver.swipeToConfirm')) }}
    </div>
    <div
      class="absolute inset-y-0 left-0 bg-success-500 rounded-full transition-all duration-300"
      :style="{ width: `${handleX.value + handleSize}px` }"
    />
    <div
      ref="sliderRef"
      :class="[
        'absolute top-1 left-1 w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center touch-none',
        confirmed ? 'bg-success-500' : '',
        props.disabled ? 'opacity-50' : '',
      ]"
      :style="{ transform: `translateX(${handleX.value}px)` }"
      @touchstart="onStart"
      @touchmove="onMove"
      @touchend="onEnd"
      @mousedown="onStart"
      @mousemove="onMove"
      @mouseup="onEnd"
      @mouseleave="onEnd"
    >
      <svg v-if="!confirmed" class="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
      <svg v-else class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
    </div>
  </div>
</template>
