<script setup lang="ts">
/**
 * Date Range Picker — chọn khoảng thời gian với preset nhanh.
 * Dùng cho mọi bộ lọc báo cáo, thống kê, lịch sử.
 *
 * @example
 * <BaseDateRangePicker v-model="dateRange" />
 */
import dayjs from 'dayjs'
import type { DateRange } from '~/types/common'

interface Props {
  /** Placeholder cho input */
  placeholder?: string
  /** Có hiển thị preset buttons không */
  showPresets?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Chọn khoảng thời gian',
  showPresets: true
})

const model = defineModel<DateRange>()

/** Preset khoảng thời gian phổ biến */
const presets = [
  {
    label: 'Hôm nay',
    apply: (): DateRange => ({
      from: dayjs().startOf('day').toISOString(),
      to: dayjs().endOf('day').toISOString()
    })
  },
  {
    label: '7 ngày',
    apply: (): DateRange => ({
      from: dayjs().subtract(6, 'day').startOf('day').toISOString(),
      to: dayjs().endOf('day').toISOString()
    })
  },
  {
    label: '30 ngày',
    apply: (): DateRange => ({
      from: dayjs().subtract(29, 'day').startOf('day').toISOString(),
      to: dayjs().endOf('day').toISOString()
    })
  },
  {
    label: 'Tháng này',
    apply: (): DateRange => ({
      from: dayjs().startOf('month').toISOString(),
      to: dayjs().endOf('month').toISOString()
    })
  },
  {
    label: 'Tháng trước',
    apply: (): DateRange => ({
      from: dayjs().subtract(1, 'month').startOf('month').toISOString(),
      to: dayjs().subtract(1, 'month').endOf('month').toISOString()
    })
  }
]

const applyPreset = (preset: (typeof presets)[number]) => {
  model.value = preset.apply()
}

const clearRange = () => {
  model.value = undefined
}

const hasValue = computed(() => !!model.value?.from && !!model.value?.to)

/** Hiển thị text tóm tắt khoảng ngày đã chọn */
const displayText = computed(() => {
  if (!model.value?.from || !model.value?.to) return ''
  return `${dayjs(model.value.from).format('DD/MM/YYYY')} — ${dayjs(model.value.to).format('DD/MM/YYYY')}`
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Display selected range -->
    <div class="border-default bg-elevated flex items-center gap-2 rounded-md border px-3 py-2">
      <UIcon name="i-lucide-calendar-range" class="text-dimmed size-4 shrink-0" />
      <span v-if="hasValue" class="text-default text-sm">{{ displayText }}</span>
      <span v-else class="text-dimmed text-sm">{{ placeholder }}</span>
      <UButton
        v-if="hasValue"
        icon="i-lucide-x"
        size="xs"
        color="neutral"
        variant="ghost"
        class="-mr-1 ml-auto"
        aria-label="Xóa"
        @click="clearRange"
      />
    </div>

    <!-- Preset Buttons -->
    <div v-if="showPresets" class="flex flex-wrap gap-1.5">
      <UButton
        v-for="preset in presets"
        :key="preset.label"
        :label="preset.label"
        size="xs"
        color="neutral"
        variant="soft"
        @click="applyPreset(preset)"
      />
    </div>
  </div>
</template>
