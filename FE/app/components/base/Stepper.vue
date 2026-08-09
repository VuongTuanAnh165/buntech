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
    <div
      class="bg-surface-border absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 overflow-hidden rounded-full"
      aria-hidden="true"
    >
      <div
        class="bg-success-500 h-full transition-all duration-700 ease-in-out"
        :style="{
          width: `${(props.steps.filter((s) => s.done).length / Math.max(1, props.steps.length - 1)) * 100}%`
        }"
      />
    </div>

    <!-- Steps -->
    <div class="relative z-10 flex items-center justify-between">
      <div
        v-for="(step, i) in props.steps"
        :key="i"
        class="group flex w-20 flex-col items-center gap-2"
      >
        <div
          :class="[
            'ring-surface z-10 flex h-10 w-10 items-center justify-center rounded-full ring-4 transition-all duration-500',
            step.done
              ? 'bg-success-500 text-white shadow-sm'
              : 'bg-surface-hover text-slate-400 dark:text-zinc-500',
            step.active ? 'ring-primary-100 dark:ring-primary-900/30' : ''
          ]"
        >
          <div
            :class="[
              step.icon,
              'h-5 w-5 transition-transform duration-300',
              step.done ? 'scale-110' : ''
            ]"
          />
        </div>
        <div class="absolute top-14 w-24 text-center">
          <p
            :class="[
              'text-[11px] leading-tight font-semibold transition-colors duration-300',
              step.done ? 'text-surface-foreground' : 'text-slate-400 dark:text-zinc-500'
            ]"
          >
            {{ step.label }}
          </p>
          <p
            v-if="step.desc"
            class="mt-0.5 hidden text-[10px] text-slate-400 sm:block dark:text-zinc-500"
          >
            {{ step.desc }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
