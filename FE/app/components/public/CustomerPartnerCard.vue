<script setup lang="ts">
import type { PublicCustomer } from '~/services/publicCustomerService'

interface Props {
  customer: PublicCustomer
}

defineProps<Props>()

const tierConfig: Record<string, { label: string; color: string; ribbon: string; bg: string }> = {
  diamond: {
    label: '💎 Diamond',
    color: 'text-slate-800 dark:text-slate-200',
    ribbon: 'bg-slate-800 text-amber-300 dark:bg-slate-200 dark:text-slate-900',
    bg: 'border-slate-300 dark:border-slate-600 ring-slate-800/20'
  },
  gold: {
    label: '🥇 Gold',
    color: 'text-amber-600 dark:text-amber-400',
    ribbon: 'bg-amber-500 text-white dark:bg-amber-600',
    bg: 'border-amber-200 dark:border-amber-800 ring-amber-500/20'
  },
  silver: {
    label: '🥈 Silver',
    color: 'text-slate-500 dark:text-slate-400',
    ribbon: 'bg-slate-400 text-white',
    bg: 'border-slate-200 dark:border-slate-700'
  },
  bronze: {
    label: '🥉 Bronze',
    color: 'text-primary-600 dark:text-primary-400',
    ribbon: 'bg-primary-500 text-white',
    bg: 'border-primary-200 dark:border-primary-800'
  }
}
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800/50"
    :class="[
      tierConfig[customer.tier]?.bg,
      customer.tier === 'diamond' || customer.tier === 'gold' ? 'ring-2' : ''
    ]"
  >
    <!-- Tier Ribbon -->
    <div
      v-if="customer.tier === 'diamond' || customer.tier === 'gold'"
      class="absolute top-4 -right-8 z-10 rotate-45 px-10 py-1 text-xs font-bold text-white shadow-md"
      :class="tierConfig[customer.tier]?.ribbon"
    >
      {{ customer.tier === 'diamond' ? 'DIAMOND' : 'GOLD' }}
    </div>

    <!-- FOMO Badge -->
    <div
      v-if="customer.isRecentlyRestocked"
      class="bg-primary-500/90 border-primary-400 absolute top-3 left-3 z-10 animate-pulse rounded-full border px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm"
    >
      🔥 Vừa nhập lô mới
    </div>

    <div class="p-5">
      <!-- Avatar + Name -->
      <div class="flex items-center gap-3">
        <div class="relative flex-shrink-0">
          <img
            v-if="customer.avatarUrl"
            :src="customer.avatarUrl"
            :alt="customer.storeName || customer.fullName"
            class="h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm dark:border-neutral-700"
          />
          <div
            v-else
            class="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white text-lg font-bold shadow-sm dark:border-neutral-700"
          >
            {{ (customer.storeName || customer.fullName).charAt(0).toUpperCase() }}
          </div>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <h3 class="truncate text-base font-semibold text-neutral-900 dark:text-white">
              {{ customer.storeName || customer.fullName }}
            </h3>
            <UIcon
              name="i-lucide-badge-check"
              class="text-primary-500 h-4 w-4 flex-shrink-0"
              aria-label="Đại lý chính hãng"
            />
          </div>
          <p :class="['text-xs font-medium', tierConfig[customer.tier]?.color]">
            {{ tierConfig[customer.tier]?.label }}
          </p>
        </div>
      </div>

      <!-- Addresses -->
      <div v-if="customer.addresses.length > 0" class="mt-4 space-y-1.5">
        <div
          v-for="addr in customer.addresses.slice(0, 3)"
          :key="addr.id"
          class="flex items-start gap-2 text-xs text-neutral-500 dark:text-neutral-400"
        >
          <UIcon name="i-lucide-map-pin" class="mt-0.5 h-3 w-3 flex-shrink-0" />
          <span class="line-clamp-1">
            {{ [addr.addressLine, addr.ward, addr.province].filter(Boolean).join(', ') }}
          </span>
        </div>
        <p v-if="customer.addresses.length > 3" class="text-primary-500 text-xs font-medium">
          +{{ customer.addresses.length - 3 }} chi nhánh khác
        </p>
      </div>

      <!-- Phone -->
      <div class="mt-4 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
        <UIcon name="i-lucide-phone" class="h-3.5 w-3.5" />
        <span class="tabular-nums">{{ customer.phoneNumber }}</span>
      </div>
    </div>
  </div>
</template>
