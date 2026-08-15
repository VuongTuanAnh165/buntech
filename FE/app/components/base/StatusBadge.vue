<script setup lang="ts">
interface Props {
  status: string
  type?: 'order' | 'user' | 'product' | 'blog'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'order'
})

type BadgeColor = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'

const statusConfig = computed<{ label: string; color: BadgeColor }>(() => {
  if (props.type === 'order') {
    const map: Record<string, { label: string; color: BadgeColor }> = {
      PENDING: { label: 'Chờ xử lý', color: 'warning' },
      PROCESSING: { label: 'Đang xử lý', color: 'info' },
      DELIVERING: { label: 'Đang giao', color: 'primary' },
      DELIVERED: { label: 'Đã giao', color: 'success' },
      CANCELLED: { label: 'Đã hủy', color: 'error' }
    }
    return map[props.status] ?? { label: props.status, color: 'neutral' }
  }

  if (props.type === 'user') {
    const map: Record<string, { label: string; color: BadgeColor }> = {
      ACTIVE: { label: 'Hoạt động', color: 'success' },
      INACTIVE: { label: 'Ngừng HĐ', color: 'error' },
      PENDING: { label: 'Chờ duyệt', color: 'warning' }
    }
    return map[props.status] ?? { label: props.status, color: 'neutral' }
  }

  if (props.type === 'product') {
    const map: Record<string, { label: string; color: BadgeColor }> = {
      ACTIVE: { label: 'Đang bán', color: 'success' },
      INACTIVE: { label: 'Ngừng bán', color: 'error' },
      OUT_OF_STOCK: { label: 'Hết hàng', color: 'warning' }
    }
    return map[props.status] ?? { label: props.status, color: 'neutral' }
  }

  if (props.type === 'blog') {
    const map: Record<string, { label: string; color: BadgeColor }> = {
      DRAFT: { label: 'Nháp', color: 'neutral' },
      PUBLISHED: { label: 'Đã xuất bản', color: 'success' }
    }
    return map[props.status] ?? { label: props.status, color: 'neutral' }
  }

  return { label: props.status, color: 'neutral' }
})
</script>

<template>
  <UBadge
    :color="statusConfig.color"
    variant="subtle"
    size="sm"
    class="transition-colors duration-200"
  >
    {{ statusConfig.label }}
  </UBadge>
</template>
