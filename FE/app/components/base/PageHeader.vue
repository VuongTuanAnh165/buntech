<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
  icon?: string
}

interface Props {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  breadcrumbs: () => []
})
</script>

<template>
  <div class="animate-fade-in mb-6">
    <!-- Breadcrumb -->
    <UBreadcrumb v-if="props.breadcrumbs.length" :items="props.breadcrumbs" class="mb-3" />

    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-surface-foreground text-xl font-bold tracking-tight sm:text-2xl">
          {{ props.title }}
        </h1>
        <p v-if="props.description" class="mt-1 text-sm text-gray-500 dark:text-zinc-400">
          {{ props.description }}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
