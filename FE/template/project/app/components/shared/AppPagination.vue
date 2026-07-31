<script setup lang="ts">
interface Props {
  page: number
  totalPages: number
  total: number
  from: number
  to: number
  limit: number
  limitOptions?: number[]
}
const props = withDefaults(defineProps<Props>(), {
  limitOptions: () => [10, 20, 50],
})
const emit = defineEmits<{
  'update:page': [value: number]
  'update:limit': [value: number]
}>()
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-100">
    <div class="flex items-center gap-3 text-sm text-gray-600">
      <span>{{ from + 1 }}-{{ Math.min(to + 1, total) }} {{ t('common.of').toLowerCase() }} {{ total }}</span>
      <div class="flex items-center gap-2">
        <span class="text-gray-500">{{ t('common.rowsPerPage') }}</span>
        <select
          :value="limit"
          class="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          @change="emit('update:limit', Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="opt in limitOptions" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </div>
    <div class="flex items-center gap-1">
      <button
        :disabled="page <= 1"
        class="px-3 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        @click="emit('update:page', page - 1)"
      >
        {{ t('common.prev') }}
      </button>
      <div class="flex items-center gap-1">
        <template v-for="p in totalPages" :key="p">
          <button
            v-if="p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)"
            :class="[
              'min-w-[2rem] h-8 rounded-lg text-sm font-medium transition-colors',
              p === page ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100',
            ]"
            @click="emit('update:page', p)"
          >{{ p }}</button>
          <span v-else-if="p === page - 2 || p === page + 2" class="px-1 text-gray-400">...</span>
        </template>
      </div>
      <button
        :disabled="page >= totalPages"
        class="px-3 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        @click="emit('update:page', page + 1)"
      >
        {{ t('common.next') }}
      </button>
    </div>
  </div>
</template>
