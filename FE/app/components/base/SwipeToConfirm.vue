<script setup lang="ts">
const props = defineProps<{
  text?: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'confirmed'): void
}>()

const target = ref<HTMLElement | null>(null)
const container = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const thumbWidth = 48
const threshold = 0.85 // 85% to trigger

useResizeObserver(container, (entries) => {
  const entry = entries[0]
  if (entry) {
    containerWidth.value = entry.contentRect.width
  }
})

// Calculate max distance thumb can travel
const maxDistance = computed(() => {
  // Container width minus thumb width minus left padding minus right padding
  return Math.max(0, containerWidth.value - thumbWidth - 8)
})

const isConfirmed = ref(false)

const { distanceX, isSwiping } = usePointerSwipe(target, {
  threshold: 0,
  onSwipeEnd() {
    if (leftOffset.value >= maxDistance.value * threshold && !props.loading && !isConfirmed.value) {
      isConfirmed.value = true
      emit('confirmed')
    }
  }
})

const leftOffset = computed(() => {
  if (isConfirmed.value) return maxDistance.value

  // usePointerSwipe distanceX is startX - currentX.
  // Swiping right makes distanceX negative.
  let dist = -distanceX.value

  if (dist < 0) dist = 0
  if (dist > maxDistance.value) dist = maxDistance.value

  if (!isSwiping.value && !isConfirmed.value) {
    return 0 // Reset if not swiping and not confirmed
  }
  return dist
})

// Reset if loading finishes and we don't unmount (e.g., API error)
watch(
  () => props.loading,
  (newVal, oldVal) => {
    if (oldVal && !newVal) {
      isConfirmed.value = false
    }
  }
)
</script>

<template>
  <div
    ref="container"
    class="relative flex h-14 w-full items-center overflow-hidden rounded-2xl bg-neutral-100 shadow-inner dark:bg-zinc-800"
    :class="[isConfirmed ? 'ring-success-500/50 ring-2' : '']"
  >
    <!-- Background Text -->
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center pl-8">
      <span
        class="text-sm font-medium transition-opacity duration-300"
        :class="[isConfirmed || isSwiping ? 'opacity-0' : 'text-slate-500 dark:text-zinc-400']"
      >
        {{ text || 'Vuốt để xác nhận' }}
      </span>
    </div>

    <!-- Success Text -->
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center pl-8">
      <span
        class="text-success-600 dark:text-success-400 text-sm font-bold transition-opacity duration-300"
        :class="[isConfirmed && !loading ? 'opacity-100' : 'opacity-0']"
      >
        Đã xác nhận
      </span>
    </div>

    <!-- Loading Text -->
    <div class="pointer-events-none absolute inset-0 flex items-center justify-center pl-8">
      <span
        class="text-primary-600 dark:text-primary-400 text-sm font-bold transition-opacity duration-300"
        :class="[loading ? 'opacity-100' : 'opacity-0']"
      >
        Đang xử lý...
      </span>
    </div>

    <!-- Background Fill for progress -->
    <div
      class="bg-success-500/20 dark:bg-success-900/30 absolute top-0 bottom-0 left-0 transition-all"
      :class="[!isSwiping ? 'duration-300 ease-out' : 'duration-0']"
      :style="{ width: `${leftOffset + thumbWidth + 8}px` }"
    />

    <!-- Thumb (Draggable handle) -->
    <div
      ref="target"
      class="absolute top-1 bottom-1 left-1 z-10 flex w-[48px] touch-none items-center justify-center rounded-xl bg-white shadow-md transition-all select-none dark:bg-zinc-700"
      :class="[
        !isSwiping ? 'duration-300 ease-out' : 'duration-0',
        isSwiping ? 'scale-95 cursor-grabbing' : 'cursor-grab',
        isConfirmed
          ? 'bg-success-500 dark:bg-success-600 text-white'
          : 'text-slate-400 dark:text-zinc-300'
      ]"
      :style="{ transform: `translateX(${leftOffset}px)` }"
    >
      <UIcon
        v-if="loading"
        name="i-lucide-loader-2"
        class="text-primary-500 dark:text-primary-400 h-5 w-5 animate-spin"
      />
      <UIcon v-else-if="isConfirmed" name="i-lucide-check" class="h-6 w-6 text-white" />
      <UIcon v-else name="i-lucide-chevrons-right" class="h-6 w-6" />
    </div>
  </div>
</template>
