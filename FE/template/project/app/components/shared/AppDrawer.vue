<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  width?: string
}
const props = withDefaults(defineProps<Props>(), {
  width: 'max-w-md',
})
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

function close() {
  emit('update:modelValue', false)
}
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
watch(() => props.modelValue, (val) => {
  if (val) document.addEventListener('keydown', onKeyDown)
  else document.removeEventListener('keydown', onKeyDown)
})
onUnmounted(() => document.removeEventListener('keydown', onKeyDown))
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close" />
        <div :class="['relative w-full bg-white shadow-xl flex flex-col animate-slide-in-right', width]">
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 v-if="title" class="text-lg font-semibold text-gray-900">{{ title }}</h3>
            <button class="ml-auto text-gray-400 hover:text-gray-600 transition-colors" @click="close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div class="flex-1 px-6 py-4 overflow-y-auto scrollbar-thin">
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
.drawer-enter-active, .drawer-leave-active { transition: opacity 0.2s ease; }
.drawer-enter-from, .drawer-leave-to { opacity: 0; }
</style>
