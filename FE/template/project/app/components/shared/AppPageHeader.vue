<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  breadcrumbLabel?: string
}>(), {
  subtitle: '',
  breadcrumbLabel: '',
})

const { t } = useI18n()
</script>

<template>
  <div class="mb-6 animate-fade-in-up">
    <AppBreadcrumb v-if="breadcrumbLabel" :items="[{ label: breadcrumbLabel }]" />
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="min-w-0">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="flex flex-wrap gap-2 flex-shrink-0">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
