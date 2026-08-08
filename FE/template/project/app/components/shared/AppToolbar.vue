<script setup lang="ts">
const props = withDefaults(defineProps<{
  searchPlaceholder?: string
  showSearch?: boolean
}>(), {
  searchPlaceholder: '',
  showSearch: true,
})

const { t } = useI18n()
</script>

<template>
  <div class="card p-3 sm:p-4 mb-4 animate-fade-in-up" style="animation-delay: 50ms">
    <div class="flex flex-wrap items-center gap-3">
      <div v-if="showSearch" class="flex-1 min-w-[200px] max-w-xs">
        <slot name="search" />
      </div>
      <slot />
      <div class="flex flex-wrap items-center gap-3">
        <slot name="filters" />
      </div>
    </div>
  </div>
</template>
