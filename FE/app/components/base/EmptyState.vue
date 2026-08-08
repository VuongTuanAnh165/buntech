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
  <div class="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in-up">
    <div class="relative mb-6 group">
      <!-- Glow effect -->
      <div 
        :class="[`absolute inset-0 bg-${props.color}-500/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500`]" 
      />
      
      <!-- Icon container -->
      <div 
        :class="[
          'relative flex size-20 items-center justify-center rounded-3xl bg-surface shadow-sm border border-surface-border transition-transform duration-500 group-hover:-translate-y-2 group-hover:shadow-md'
        ]"
      >
        <div :class="[`absolute inset-0 bg-${props.color}-50 dark:bg-${props.color}-900/10 rounded-3xl`]" />
        <UIcon 
          :name="props.icon" 
          :class="[`relative size-10 text-${props.color}-500 dark:text-${props.color}-400 transition-transform duration-500 group-hover:scale-110`]" 
        />
      </div>
      
      <!-- Decorative dots -->
      <div class="absolute -top-2 -right-4 size-2 rounded-full bg-surface-border animate-ping" style="animation-duration: 3s;" />
      <div class="absolute -bottom-1 -left-3 size-1.5 rounded-full bg-surface-border" />
    </div>

    <h3 class="mb-2 text-lg font-bold text-surface-foreground tracking-tight">
      {{ props.title }}
    </h3>
    
    <p
      v-if="props.description"
      class="mb-6 max-w-sm text-sm text-slate-500 dark:text-zinc-400 leading-relaxed"
    >
      {{ props.description }}
    </p>
    
    <div v-if="$slots.action" class="mt-2 transition-all duration-300 hover:-translate-y-0.5">
      <slot name="action" />
    </div>
  </div>
</template>
