<script setup lang="ts">
/**
 * Component hiển thị trạng thái dưới dạng Badge màu.
 * Tự động map trạng thái sang màu sắc và label tương ứng.
 *
 * @example
 * <BaseStatusBadge
 *   status="delivered"
 *   :status-map="{
 *     pending: { label: 'Chờ xử lý', color: 'warning' },
 *     delivered: { label: 'Đã giao', color: 'success' },
 *     cancelled: { label: 'Đã hủy', color: 'error' }
 *   }"
 * />
 */

interface StatusConfig {
  label: string
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
  icon?: string
}

interface Props {
  /** Giá trị trạng thái hiện tại */
  status: string
  /** Bản đồ trạng thái → { label, color, icon? } */
  statusMap: Record<string, StatusConfig>
}

const props = defineProps<Props>()

const config = computed(() => {
  return (
    props.statusMap[props.status] || {
      label: props.status,
      color: 'neutral' as const
    }
  )
})
</script>

<template>
  <UBadge :color="config.color" variant="subtle" size="sm">
    <UIcon v-if="config.icon" :name="config.icon" class="mr-1 size-3" />
    {{ config.label }}
  </UBadge>
</template>
