<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'

import { t } from '~/utils/i18n'

useSeoMeta({
  title: t('public_distribution_seo_title'),
  description: t('public_distribution_seo_desc'),
  ogTitle: t('public_distribution_og_title'),
  ogDescription: t('public_distribution_og_desc')
})

const { filteredCustomers, customersWithCoords, searchQuery, status } = usePublicCustomers()

const localSearch = ref('')
const debouncedUpdate = useDebounceFn((val: string) => {
  searchQuery.value = val
}, 300)

watch(localSearch, (val) => {
  debouncedUpdate(val)
})

const loading = computed(() => status.value === 'pending')

const tierStats = computed(() => {
  const counts = { diamond: 0, gold: 0, silver: 0, bronze: 0 }
  for (const c of filteredCustomers.value) {
    counts[c.tier]++
  }
  return [
    { label: 'Diamond', count: counts.diamond, icon: '💎', color: 'text-blue-500' },
    { label: 'Gold', count: counts.gold, icon: '🥇', color: 'text-yellow-500' },
    { label: 'Silver', count: counts.silver, icon: '🥈', color: 'text-gray-400' },
    { label: 'Bronze', count: counts.bronze, icon: '🥉', color: 'text-orange-500' }
  ]
})
</script>

<template>
  <div>
    <!-- Section 1: Hero Banner & Smart Search -->
    <section class="relative overflow-hidden bg-slate-900 py-16 md:py-24">
      <div class="absolute inset-0">
        <!-- Ảnh nền xưởng bún truyền thống mờ -->
        <div
          class="absolute inset-0 bg-[url('/images/banner_1.webp')] bg-cover bg-center opacity-10"
          aria-hidden="true"
        />
      </div>

      <div class="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <div
          class="animate-fade-in-up mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md"
        >
          <UIcon name="i-lucide-map-pin" class="text-primary-400 h-4 w-4" />
          {{ $t('public_distribution_badge') }}
        </div>
        <h1
          class="animate-fade-in-up mb-6 text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
          style="letter-spacing: -0.02em"
        >
          {{ $t('public_distribution_title_1') }}
          <span class="text-primary-400">{{ $t('public_distribution_title_highlight') }}</span>
          <br class="hidden sm:block" />
          {{ $t('public_distribution_title_2') }}
        </h1>
        <p
          class="animate-fade-in-up mx-auto max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl"
        >
          {{ $t('public_distribution_subtitle') }}
        </p>

        <!-- Search Bar -->
        <div class="mx-auto mt-8 max-w-lg">
          <div
            class="flex items-center overflow-hidden rounded-xl bg-white/95 shadow-2xl ring-4 ring-white/20 backdrop-blur-sm transition-all focus-within:ring-white/40 dark:bg-neutral-800/95"
          >
            <UIcon name="i-lucide-search" class="ml-4 h-5 w-5 text-neutral-400" />
            <input
              v-model="localSearch"
              type="text"
              :placeholder="$t('public_distribution_search_ph')"
              class="flex-1 border-0 bg-transparent px-4 py-3.5 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-white dark:placeholder:text-neutral-500"
            />
          </div>
        </div>

        <!-- Tier Stats -->
        <div class="mx-auto mt-8 flex max-w-lg flex-wrap items-center justify-center gap-4">
          <div
            v-for="stat in tierStats"
            :key="stat.label"
            class="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white backdrop-blur-sm"
          >
            <span>{{ stat.icon }}</span>
            <span class="font-semibold">{{ stat.count }}</span>
            <span class="text-white/70">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 2: Interactive Map -->
    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="mb-6 flex items-center gap-3">
        <UIcon name="i-lucide-map" class="h-6 w-6 text-blue-500" />
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">
          {{ $t('public_distribution_map_title') }}
        </h2>
        <UBadge color="info" variant="soft">
          {{ $t('public_distribution_map_count', { count: customersWithCoords.length }) }}
        </UBadge>
      </div>
      <ClientOnly>
        <PublicCustomerMapSection :markers="customersWithCoords" />
        <template #fallback>
          <div
            class="flex h-[400px] items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50 md:h-[500px] dark:border-neutral-700 dark:bg-neutral-800"
          >
            <div class="text-center">
              <UIcon
                name="i-lucide-loader-2"
                class="mx-auto mb-2 h-8 w-8 animate-spin text-blue-500"
              />
              <p class="text-sm text-neutral-500">{{ $t('public_distribution_map_loading') }}</p>
            </div>
          </div>
        </template>
      </ClientOnly>
    </section>

    <!-- Section 3: Tiered Partner Grid -->
    <section class="bg-neutral-50 py-12 dark:bg-neutral-900/50">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-8 flex items-center gap-3">
          <UIcon name="i-lucide-award" class="h-6 w-6 text-yellow-500" />
          <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">
            {{ $t('public_distribution_partner_title') }}
          </h2>
          <UBadge color="primary" variant="soft">
            {{ $t('public_distribution_partner_count', { count: filteredCustomers.length }) }}
          </UBadge>
        </div>

        <!-- Loading -->
        <div
          v-if="loading"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <div
            v-for="i in 8"
            :key="i"
            class="h-48 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-700"
          />
        </div>

        <!-- Empty -->
        <div
          v-else-if="filteredCustomers.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center"
        >
          <UIcon
            name="i-lucide-search-x"
            class="mb-4 h-16 w-16 text-neutral-300 dark:text-neutral-600"
          />
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
            {{ $t('public_distribution_partner_empty_title') }}
          </h3>
          <p class="mt-2 text-sm text-neutral-500">
            {{ $t('public_distribution_partner_empty_desc') }}
          </p>
          <UButton
            v-if="searchQuery"
            class="mt-4"
            variant="soft"
            @click="
              () => {
                localSearch = ''
                searchQuery = ''
              }
            "
          >
            {{ $t('public_distribution_partner_clear_filter') }}
          </UButton>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <PublicCustomerPartnerCard
            v-for="customer in filteredCustomers"
            :key="customer.id"
            :customer="customer"
          />
        </div>
      </div>
    </section>

    <!-- Section 4: CTA Banner -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div
        class="from-primary-600 to-primary-800 relative overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-12 text-center sm:px-12 sm:py-16"
      >
        <div
          class="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          class="bg-accent-400/10 absolute bottom-0 left-0 h-72 w-72 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div class="relative">
          <h2 class="mb-4 text-2xl font-bold text-white sm:text-3xl">
            {{ $t('public_distribution_cta_title') }}
          </h2>
          <p class="mx-auto mb-8 max-w-xl text-white/80">
            {{ $t('public_distribution_cta_desc_1') }}<br />
            {{ $t('public_distribution_cta_desc_2') }}
          </p>
          <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <UButton
              color="primary"
              variant="solid"
              size="lg"
              icon="i-lucide-phone"
              to="tel:0123456789"
              class="!text-primary-600 group !bg-white hover:!bg-white/90"
            >
              {{ $t('public_distribution_cta_hotline') }}
            </UButton>
            <UButton
              color="primary"
              variant="outline"
              size="lg"
              icon="i-lucide-message-circle"
              to="https://zalo.me/tamhung"
              target="_blank"
              class="!border-white !text-white hover:!bg-white/10"
            >
              {{ $t('public_distribution_cta_zalo') }}
            </UButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
