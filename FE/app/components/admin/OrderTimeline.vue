<script setup lang="ts">
import { OrderStatus } from '~/utils/mockData'

interface Props {
  currentStatus: OrderStatus
  createdAt: string
}

const props = defineProps<Props>()
const { formatDateTime } = useFormat()

// Define the linear steps
const timelineSteps = [
  { value: OrderStatus.PENDING, label: 'Chờ xử lý', icon: 'i-lucide-clock' },
  { value: OrderStatus.PROCESSING, label: 'Đang xử lý', icon: 'i-lucide-package' },
  { value: OrderStatus.SHIPPING, label: 'Đang giao', icon: 'i-lucide-truck' },
  { value: OrderStatus.DELIVERED, label: 'Đã giao', icon: 'i-lucide-check-circle' }
]

const getStepStatus = (stepValue: OrderStatus, index: number) => {
  if (props.currentStatus === OrderStatus.CANCELLED) {
    // If cancelled, steps up to the index where it might have been cancelled are shown as completed/cancelled
    // For simplicity, just mark the first step as cancelled or everything pending
    return index === 0 ? 'cancelled' : 'pending'
  }

  const currentIndex = timelineSteps.findIndex(s => s.value === props.currentStatus)
  
  if (index < currentIndex) return 'completed'
  if (index === currentIndex) return 'active'
  return 'pending'
}

// Generate mock dates for completed steps
const getStepDate = (index: number) => {
  const status = getStepStatus(timelineSteps[index].value, index)
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
    <div class="absolute left-[27px] sm:left-[35px] top-6 bottom-6 w-0.5 bg-surface-border"/>

    <div class="space-y-8">
      <!-- Special Cancelled Case handled inside normal loop if we want, but let's override logic -->
      <template v-if="props.currentStatus === OrderStatus.CANCELLED">
        <div class="relative flex items-start group">
          <div class="absolute left-[11px] sm:left-[19px] top-8 bottom-[-32px] w-0.5 bg-gray-200 dark:bg-zinc-800"/>
          
          <div class="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-error-100 text-error-600 dark:bg-error-900/30 dark:text-error-400 z-10 shrink-0 shadow-sm border-2 border-white dark:border-zinc-900">
            <span class="i-lucide-x w-4 h-4 sm:w-5 sm:h-5"/>
          </div>
          
          <div class="ml-4 flex flex-col pt-1">
            <span class="text-sm sm:text-base font-semibold text-error-600 dark:text-error-400">Đã hủy</span>
            <span class="text-xs sm:text-sm text-gray-500 mt-1">{{ formatDateTime(props.createdAt) }}</span>
          </div>
        </div>
      </template>
      
      <template v-else>
        <div 
          v-for="(step, index) in timelineSteps" 
          :key="step.value"
          class="relative flex items-start group"
        >
          <!-- Custom connection line for this segment (covers default background line) -->
          <div 
            v-if="index < timelineSteps.length - 1"
            class="absolute left-[11px] sm:left-[19px] top-8 bottom-[-32px] w-0.5 z-0"
            :class="[
              getStepStatus(step.value, index) === 'completed' 
                ? 'bg-success-500' 
                : 'bg-transparent border-l-2 border-dashed border-gray-300 dark:border-gray-700 left-[10px] sm:left-[18px]'
            ]"
          />
          
          <!-- Icon indicator -->
          <div 
            class="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full z-10 shrink-0 border-2 border-white dark:border-zinc-900 transition-colors duration-300"
            :class="[
              getStepStatus(step.value, index) === 'completed' 
                ? 'bg-success-500 text-white' 
                : getStepStatus(step.value, index) === 'active'
                  ? 'bg-primary text-white shadow-[0_0_0_4px_rgba(var(--color-primary-500),0.2)] animate-pulse'
                  : 'bg-gray-100 text-gray-400 dark:bg-zinc-800 dark:text-zinc-500'
            ]"
          >
            <!-- Show checkmark if completed, otherwise show step icon -->
            <span 
              :class="[
                getStepStatus(step.value, index) === 'completed' ? 'i-lucide-check' : step.icon,
                'w-4 h-4 sm:w-5 sm:h-5'
              ]"
            />
          </div>
          
          <!-- Content -->
          <div class="ml-4 flex flex-col pt-1 sm:pt-2">
            <span 
              class="text-sm sm:text-base font-semibold transition-colors duration-300"
              :class="[
                getStepStatus(step.value, index) === 'completed' ? 'text-surface-foreground' : 
                getStepStatus(step.value, index) === 'active' ? 'text-primary' : 
                'text-gray-400 dark:text-zinc-500'
              ]"
            >
              {{ step.label }}
            </span>
            <span 
              v-if="getStepStatus(step.value, index) !== 'pending'"
              class="text-xs sm:text-sm text-gray-500 mt-1"
            >
              {{ getStepDate(index) }}
            </span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
