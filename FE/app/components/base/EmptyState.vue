<script setup lang="ts">
interface Props {
  icon?: string
  title: string
  description?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-inbox',
  description: undefined,
  color: 'primary'
})
</script>

<template>
  <div class="animate-fade-in-up flex flex-col items-center justify-center px-4 py-16 text-center">
    <div class="group relative mb-6">
      <!-- Glow effect -->
      <div
        :class="[
          `absolute inset-0 bg-${props.color}-500/20 scale-150 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100`
        ]"
      />

      <!-- Icon container -->
      <div
        :class="[
          'bg-surface border-surface-border relative flex size-20 items-center justify-center rounded-3xl border shadow-sm transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-md'
        ]"
      >
        <div
          :class="[
            `absolute inset-0 bg-${props.color}-50 dark:bg-${props.color}-900/10 rounded-3xl`
          ]"
        />
        <UIcon
          :name="props.icon"
          :class="[
            `relative size-10 text-${props.color}-500 dark:text-${props.color}-400 transition-transform duration-500 group-hover:scale-110`
          ]"
        />
      </div>

      <!-- Decorative dots -->
      <div
        class="bg-surface-border absolute -top-2 -right-4 size-2 animate-ping rounded-full"
        style="animation-duration: 3s"
      />
      <div class="bg-surface-border absolute -bottom-1 -left-3 size-1.5 rounded-full" />
    </div>

    <h3 class="text-surface-foreground mb-2 text-lg font-bold tracking-tight">
      {{ props.title }}
    </h3>

    <p
      v-if="props.description"
      class="mb-6 max-w-sm text-sm leading-relaxed text-slate-500 dark:text-zinc-400"
    >
      {{ props.description }}
    </p>

    <div v-if="$slots.action" class="mt-2 transition-all duration-300 hover:-translate-y-0.5">
      <slot name="action" />
    </div>
  </div>
</template>
