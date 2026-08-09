<script setup lang="ts">
interface Props {
  lines?: number
  variant?: 'table' | 'form' | 'cards' | 'detail'
}

const props = withDefaults(defineProps<Props>(), {
  lines: 5,
  variant: 'table'
})
</script>

<template>
  <!-- Table skeleton -->
  <div v-if="props.variant === 'table'" class="animate-fade-in space-y-3">
    <!-- Header row -->
    <div class="flex items-center justify-between">
      <div class="skeleton h-8 w-48" />
      <div class="skeleton h-9 w-32 rounded-lg" />
    </div>
    <!-- Table header -->
    <div class="border-surface-border flex gap-4 border-b pb-3">
      <div class="skeleton h-4 w-1/4" />
      <div class="skeleton h-4 w-1/6" />
      <div class="skeleton h-4 w-1/6" />
      <div class="skeleton h-4 w-1/6" />
      <div class="skeleton h-4 w-1/6" />
    </div>
    <!-- Table rows -->
    <div v-for="i in props.lines" :key="i" class="flex items-center gap-4 py-3">
      <div class="skeleton h-4 w-1/4" />
      <div class="skeleton h-4 w-1/6" />
      <div class="skeleton h-4 w-1/6" />
      <div class="skeleton h-4 w-1/6" />
      <div class="skeleton h-4 w-1/6" />
    </div>
  </div>

  <!-- Form skeleton -->
  <div v-else-if="props.variant === 'form'" class="animate-fade-in space-y-5">
    <div v-for="i in props.lines" :key="i" class="space-y-2">
      <div class="skeleton h-4 w-24" />
      <div class="skeleton h-10 w-full rounded-lg" />
    </div>
    <div class="skeleton h-10 w-32 rounded-lg" />
  </div>

  <!-- Cards skeleton -->
  <div
    v-else-if="props.variant === 'cards'"
    class="animate-fade-in grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
  >
    <div v-for="i in props.lines" :key="i" class="card space-y-3 p-4">
      <div class="skeleton h-32 w-full rounded-lg" />
      <div class="skeleton h-5 w-3/4" />
      <div class="skeleton h-4 w-1/2" />
    </div>
  </div>

  <!-- Detail skeleton -->
  <div v-else class="animate-fade-in space-y-6">
    <div class="card p-6">
      <div class="flex items-center gap-4">
        <div class="skeleton size-16 rounded-full" />
        <div class="flex-1 space-y-2">
          <div class="skeleton h-6 w-48" />
          <div class="skeleton h-4 w-32" />
        </div>
      </div>
    </div>
    <div class="card space-y-4 p-6">
      <div v-for="i in props.lines" :key="i" class="skeleton h-4 w-full" />
    </div>
  </div>
</template>
