<script setup lang="ts">
interface Props {
  icon?: string
  title: string
  description?: string
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'i-lucide-inbox',
  description: undefined
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center animate-fade-in-up">
    <div class="mb-4 flex size-16 items-center justify-center rounded-full bg-surface-hover">
      <UIcon :name="props.icon" class="size-8 text-gray-400 dark:text-zinc-500" />
    </div>
    <h3 class="mb-1 text-base font-semibold text-surface-foreground">
      {{ props.title }}
    </h3>
    <p
      v-if="props.description"
      class="mb-4 max-w-sm text-sm text-gray-500 dark:text-zinc-400"
    >
      {{ props.description }}
    </p>
    <slot name="action" />
  </div>
</template>
