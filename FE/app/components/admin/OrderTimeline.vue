<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
const { constants } = useMasterData()
interface Props {
  currentStatus: string
  createdAt: string
}
const props = defineProps<Props>()
// Define the linear steps
const timelineSteps = computed(() => [
  {
    value: constants.value?.[ConstantKey.OrderStatus]?.PENDING as string,
    label: 'Chờ xử lý',
    icon: 'i-lucide-clock'
  },
  {
    value: constants.value?.[ConstantKey.OrderStatus]?.PROCESSING as string,
    label: 'Đang xử lý',
    icon: 'i-lucide-package'
  },
  {
    value: constants.value?.[ConstantKey.OrderStatus]?.SHIPPING as string,
    label: 'Đang giao',
    icon: 'i-lucide-truck'
  },
  {
    value: constants.value?.[ConstantKey.OrderStatus]?.DELIVERED as string,
    label: 'Đã giao',
    icon: 'i-lucide-check-circle'
  }
])
const getStepStatus = (stepValue: string, index: number) => {
  if (props.currentStatus === constants.value?.[ConstantKey.OrderStatus]?.CANCELLED) {
    // If cancelled, steps up to the index where it might have been cancelled are shown as completed/cancelled
    // For simplicity, just mark the first step as cancelled or everything pending
    return index === 0 ? 'cancelled' : 'pending'
  }
  const currentIndex = timelineSteps.value.findIndex((s) => s.value === props.currentStatus)

  if (index < currentIndex) return 'completed'
  if (index === currentIndex) return 'active'
  return 'pending'
}
// Generate mock dates for completed steps
const getStepDate = (index: number) => {
  const status = getStepStatus(timelineSteps.value[index]?.value as string, index)
  if (status === 'pending') return ''

  const baseDate = new Date(props.createdAt)
  // Add some hours per step for mock data
  const stepDate = new Date(baseDate.getTime() + index * 4 * 60 * 60 * 1000)
  return formatDateTime(stepDate.toISOString())
}
</script>
<template>
  <div class="relative py-4 pl-4 sm:pl-6">
    <!-- Vertical Line -->
    <div class="bg-surface-border absolute top-6 bottom-6 left-[27px] w-0.5 sm:left-[35px]" />
    <div class="space-y-8">
      <!-- Special Cancelled Case handled inside normal loop if we want, but let's override logic -->
      <template v-if="props.currentStatus === constants?.[ConstantKey.OrderStatus]?.CANCELLED">
        <div class="group relative flex items-start">
          <div
            class="absolute top-8 bottom-[-32px] left-[11px] w-0.5 bg-gray-200 sm:left-[19px] dark:bg-zinc-800"
          />

          <div
            class="bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400 z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm sm:h-10 sm:w-10 dark:border-zinc-900"
          >
            <span class="i-lucide-x h-4 w-4 sm:h-5 sm:w-5" />
          </div>

          <div class="ml-4 flex flex-col pt-1">
            <span class="text-error-600 dark:text-error-400 text-sm font-semibold sm:text-base"
              >Đã hủy</span
            >
            <span class="mt-1 text-xs text-gray-500 sm:text-sm">{{
              formatDateTime(props.createdAt)
            }}</span>
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="(step, index) in timelineSteps"
          :key="step.value"
          class="group relative flex items-start"
        >
          <!-- Custom connection line for this segment (covers default background line) -->
          <div
            v-if="index < timelineSteps.length - 1"
            class="absolute top-8 bottom-[-32px] left-[11px] z-0 w-0.5 sm:left-[19px]"
            :class="[
              getStepStatus(step.value, index) === 'completed'
                ? 'bg-success-500'
                : 'left-[10px] border-l-2 border-dashed border-gray-300 bg-transparent sm:left-[18px] dark:border-gray-700'
            ]"
          />

          <!-- Icon indicator -->
          <div
            class="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white transition-colors duration-300 sm:h-10 sm:w-10 dark:border-zinc-900"
            :class="[
              getStepStatus(step.value, index) === 'completed'
                ? 'bg-success-500 text-white'
                : getStepStatus(step.value, index) === 'active'
                  ? 'bg-primary animate-pulse text-white shadow-[0_0_0_4px_rgba(var(--color-primary-500),0.2)]'
                  : 'bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500'
            ]"
          >
            <!-- Show checkmark if completed, otherwise show step icon -->
            <span
              :class="[
                getStepStatus(step.value, index) === 'completed' ? 'i-lucide-check' : step.icon,
                'h-4 w-4 sm:h-5 sm:w-5'
              ]"
            />
          </div>

          <!-- Content -->
          <div class="ml-4 flex flex-col pt-1 sm:pt-2">
            <span
              class="text-sm font-semibold transition-colors duration-300 sm:text-base"
              :class="[
                getStepStatus(step.value, index) === 'completed'
                  ? 'text-surface-foreground'
                  : getStepStatus(step.value, index) === 'active'
                    ? 'text-primary'
                    : 'text-gray-400 dark:text-zinc-500'
              ]"
            >
              {{ step.label }}
            </span>
            <span
              v-if="getStepStatus(step.value, index) !== 'pending'"
              class="mt-1 text-xs text-gray-500 sm:text-sm"
            >
              {{ getStepDate(index) }}
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
