<script setup lang="ts">
import { t } from '~/utils/i18n'
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
      PENDING: { label: t('status_order_pending'), color: 'warning' },
      PROCESSING: { label: t('status_order_processing'), color: 'info' },
      DELIVERING: { label: t('status_order_delivering'), color: 'primary' },
      DELIVERED: { label: t('status_order_delivered'), color: 'success' },
      CANCELLED: { label: t('status_order_cancelled'), color: 'error' }
    }
    return map[props.status] ?? { label: props.status, color: 'neutral' }
  }

  if (props.type === 'user') {
    const map: Record<string, { label: string; color: BadgeColor }> = {
      ACTIVE: { label: t('status_user_active'), color: 'success' },
      INACTIVE: { label: t('status_user_inactive'), color: 'error' },
      PENDING: { label: t('status_user_pending'), color: 'warning' }
    }
    return map[props.status] ?? { label: props.status, color: 'neutral' }
  }

  if (props.type === 'product') {
    const map: Record<string, { label: string; color: BadgeColor }> = {
      ACTIVE: { label: t('status_product_active'), color: 'success' },
      INACTIVE: { label: t('status_product_inactive'), color: 'error' },
      OUT_OF_STOCK: { label: t('status_product_out_of_stock'), color: 'warning' }
    }
    return map[props.status] ?? { label: props.status, color: 'neutral' }
  }

  if (props.type === 'blog') {
    const map: Record<string, { label: string; color: BadgeColor }> = {
      DRAFT: { label: t('status_blog_draft'), color: 'neutral' },
      PUBLISHED: { label: t('status_blog_published'), color: 'success' }
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
