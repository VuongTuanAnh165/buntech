<script setup lang="ts">
interface Step {
  label: string
  desc?: string
  icon: string
  done: boolean
  active?: boolean
}

interface Props {
  steps: Step[]
}

const props = defineProps<Props>()
</script>

<template>
  <div class="relative py-4">
    <!-- Progress Line -->
    <div class="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-surface-border rounded-full overflow-hidden" aria-hidden="true">
      <div
        class="h-full bg-success-500 transition-all duration-700 ease-in-out"
        :style="{ width: `${(props.steps.filter(s => s.done).length / Math.max(1, props.steps.length - 1)) * 100}%` }"
      />
    </div>

    <!-- Steps -->
    <div class="relative flex justify-between items-center z-10">
      <div v-for="(step, i) in props.steps" :key="i" class="flex flex-col items-center gap-2 group w-20">
        <div :class="[
          'w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-surface transition-all duration-500 z-10',
          step.done ? 'bg-success-500 text-white shadow-sm' : 'bg-surface-hover text-slate-400 dark:text-zinc-500',
          step.active ? 'ring-primary-100 dark:ring-primary-900/30' : ''
        ]">
          <div :class="[step.icon, 'w-5 h-5 transition-transform duration-300', step.done ? 'scale-110' : '']" />
        </div>
        <div class="text-center absolute top-14 w-24">
          <p :class="['text-[11px] font-semibold leading-tight transition-colors duration-300', step.done ? 'text-surface-foreground' : 'text-slate-400 dark:text-zinc-500']">{{ step.label }}</p>
          <p v-if="step.desc" class="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 hidden sm:block">{{ step.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
