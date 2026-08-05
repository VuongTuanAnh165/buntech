<script setup lang="ts">
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
const { toasts, dismiss } = useToast()

const iconMap: Record<string, unknown> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const iconColorMap: Record<string, string> = {
  success: 'text-success-600 dark:text-success-400',
  error: 'text-danger-600 dark:text-danger-400',
  warning: 'text-warning-600 dark:text-warning-400',
  info: 'text-info-600 dark:text-info-400',
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none w-[calc(100%-2rem)] max-w-sm"
      role="region"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="snackbar">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :role="toast.type === 'error' ? 'alert' : 'status'"
          :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
          class="pointer-events-auto flex items-start gap-3 w-full px-4 py-3 bg-surface border border-surface-border rounded-xl shadow-lg dark:shadow-2xl dark:shadow-black/20"
        >
          <component :is="iconMap[toast.type]" :class="['w-5 h-5 flex-shrink-0 mt-0.5', iconColorMap[toast.type]]" aria-hidden="true" />
          <p class="flex-1 text-sm font-medium text-surface-foreground leading-snug">{{ toast.message }}</p>
          <button
            class="flex-shrink-0 p-1 -mt-0.5 -mr-1 text-slate-400 dark:text-zinc-500 hover:text-surface-foreground hover:bg-surface-hover rounded-md transition-colors"
            aria-label="Đóng thông báo"
            @click="dismiss(toast.id)"
          >
            <X class="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
