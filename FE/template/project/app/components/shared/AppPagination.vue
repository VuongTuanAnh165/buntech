<script setup lang="ts">
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
const { t } = useI18n()

const props = defineProps<{
  page: number
  totalPages: number
  total: number
  from: number
  to: number
  limit: number
  limitOptions?: number[]
}>()

const emit = defineEmits<{
  'update:page': [value: number]
  'update:limit': [value: number]
}>()

const limitOptions = props.limitOptions || [10, 20, 50]

const pages = computed(() => {
  const result: (number | '...')[] = []
  const tp = props.totalPages
  const cp = props.page
  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) result.push(i)
  } else {
    result.push(1)
    if (cp > 3) result.push('...')
    const start = Math.max(2, cp - 1)
    const end = Math.min(tp - 1, cp + 1)
    for (let i = start; i <= end; i++) result.push(i)
    if (cp < tp - 2) result.push('...')
    result.push(tp)
  }
  return result
})

function go(p: number) {
  if (p < 1 || p > props.totalPages || p === props.page) return
  emit('update:page', p)
}
</script>

<template>
  <nav class="flex flex-col sm:flex-row items-center justify-between gap-3" aria-label="Phân trang">
    <div class="flex items-center gap-3 text-sm">
      <span class="text-slate-500 dark:text-zinc-400 tabular-nums">
        {{ from + 1 }}–{{ Math.min(to + 1, total) }} / {{ total }}
      </span>
      <div class="relative">
        <select
          :value="limit"
          class="appearance-none rounded-lg border border-surface-border bg-surface pl-3 pr-8 py-1.5 text-sm text-surface-foreground focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 cursor-pointer h-8"
          aria-label="Số dòng mỗi trang"
          @change="emit('update:limit', Number(($event.target as HTMLSelectElement).value)); emit('update:page', 1)"
        >
          <option v-for="opt in limitOptions" :key="opt" :value="opt">{{ opt }} / trang</option>
        </select>
        <svg class="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>

    <div class="flex items-center gap-0.5">
      <button
        class="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-surface-foreground hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 h-8 w-8 flex items-center justify-center"
        :disabled="page <= 1"
        aria-label="Trang trước"
        @click="go(page - 1)"
      >
        <ChevronLeft class="w-4 h-4" aria-hidden="true" />
      </button>

      <template v-for="(p, i) in pages" :key="i">
        <span
          v-if="p === '...'"
          class="px-2 text-slate-400 dark:text-zinc-500 select-none text-sm"
          aria-hidden="true"
        >…</span>
        <button
          v-else
          :class="[
            'h-8 min-w-[32px] px-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center',
            p === page
              ? 'bg-primary-600 text-white shadow-xs shadow-primary-600/20'
              : 'text-slate-600 dark:text-zinc-300 hover:bg-surface-hover'
          ]"
          :aria-current="p === page ? 'page' : undefined"
          :aria-label="`Trang ${p}`"
          @click="go(p as number)"
        >{{ p }}</button>
      </template>

      <button
        class="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-surface-foreground hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 h-8 w-8 flex items-center justify-center"
        :disabled="page >= totalPages"
        aria-label="Trang sau"
        @click="go(page + 1)"
      >
        <ChevronRight class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  </nav>
</template>
