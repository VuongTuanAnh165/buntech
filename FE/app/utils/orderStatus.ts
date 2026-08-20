import { ConstantKey } from '~/enums/constantKeys'
import type { MasterDataConstants } from '~/types/masterData'
import { unref, type MaybeRef } from 'vue'
import { t } from '~/utils/i18n'

/** Human-readable labels for each order status */
export const getOrderStatusLabel = (
  constants: MaybeRef<MasterDataConstants | null | undefined>
) => ({
  [unref(constants)?.[ConstantKey.OrderStatus]?.PENDING || 'PENDING']: t('status_order_pending'),
  [unref(constants)?.[ConstantKey.OrderStatus]?.PROCESSING || 'PROCESSING']:
    t('order_status_processing'),
  [unref(constants)?.[ConstantKey.OrderStatus]?.DELIVERING || 'DELIVERING']:
    t('status_order_delivering'),
  [unref(constants)?.[ConstantKey.OrderStatus]?.DELIVERED || 'DELIVERED']:
    t('status_order_delivered'),
  [unref(constants)?.[ConstantKey.OrderStatus]?.CANCELLED || 'CANCELLED']:
    t('status_order_cancelled')
})

/** Nuxt UI color tokens for each order status */
export const getOrderStatusColor = (
  constants: MaybeRef<MasterDataConstants | null | undefined>
) => ({
  [unref(constants)?.[ConstantKey.OrderStatus]?.PENDING || 'PENDING']: 'warning',
  [unref(constants)?.[ConstantKey.OrderStatus]?.PROCESSING || 'PROCESSING']: 'info',
  [unref(constants)?.[ConstantKey.OrderStatus]?.DELIVERING || 'DELIVERING']: 'primary',
  [unref(constants)?.[ConstantKey.OrderStatus]?.DELIVERED || 'DELIVERED']: 'success',
  [unref(constants)?.[ConstantKey.OrderStatus]?.CANCELLED || 'CANCELLED']: 'neutral'
})

/** Lucide icon class for each order status */
export const getOrderStatusIcon = (
  constants: MaybeRef<MasterDataConstants | null | undefined>
) => ({
  [unref(constants)?.[ConstantKey.OrderStatus]?.PENDING || 'PENDING']: 'i-lucide-clock',
  [unref(constants)?.[ConstantKey.OrderStatus]?.PROCESSING || 'PROCESSING']: 'i-lucide-package',
  [unref(constants)?.[ConstantKey.OrderStatus]?.DELIVERING || 'DELIVERING']: 'i-lucide-truck',
  [unref(constants)?.[ConstantKey.OrderStatus]?.DELIVERED || 'DELIVERED']:
    'i-lucide-check-circle-2',
  [unref(constants)?.[ConstantKey.OrderStatus]?.CANCELLED || 'CANCELLED']: 'i-lucide-x-circle'
})

/** Ordered status flow for timeline progression */
export const getOrderStatusList = (constants: MaybeRef<MasterDataConstants | null | undefined>) =>
  [
    unref(constants)?.[ConstantKey.OrderStatus]?.PENDING || 'PENDING',
    unref(constants)?.[ConstantKey.OrderStatus]?.PROCESSING || 'PROCESSING',
    unref(constants)?.[ConstantKey.OrderStatus]?.DELIVERING || 'DELIVERING',
    unref(constants)?.[ConstantKey.OrderStatus]?.DELIVERED || 'DELIVERED'
  ] as const
