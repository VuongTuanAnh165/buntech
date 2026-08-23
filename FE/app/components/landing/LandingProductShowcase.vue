<script setup lang="ts">
import { productService } from '~/services/productService'
import { generateSeoSlug } from '~/utils/idEncoder'

const { pending: loading, data: featuredRes } = useAsyncData('landing-products', () =>
  productService.getClientProducts({ limit: 8 })
)

const { data: catRes } = useAsyncData('landing-categories', () =>
  productService.getClientCategories()
)

const featuredProducts = computed(() => featuredRes.value?.data?.data || [])
const categories = computed(() => catRes.value?.data || [])
</script>

<template>
  <div>
    <!-- Categories Showcase -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div class="mb-10 text-center">
        <h2 class="text-surface-foreground mb-2 text-2xl font-bold sm:text-3xl">
          {{ $t('public_landing_prod_cat_title') }}
        </h2>
        <p class="text-sm text-slate-500 dark:text-zinc-400">
          {{ $t('public_landing_prod_cat_subtitle') }}
        </p>
      </div>
      <div class="flex flex-wrap justify-center gap-4 sm:gap-6">
        <NuxtLink
          v-for="(cat, i) in categories"
          :key="cat.id"
          :to="`/products?category=${generateSeoSlug(cat.slug, cat.id)}`"
          class="card card-hover group stagger-item w-[calc(50%-0.5rem)] max-w-[280px] p-5 text-center sm:w-[calc(25%-1.125rem)]"
          :style="{ animationDelay: `${i * 60}ms` }"
        >
          <div
            class="from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10 mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110 sm:h-20 sm:w-20"
          >
            <NuxtImg
              v-if="cat.thumbnailUrl"
              :src="getImageUrl(cat.thumbnailUrl) || undefined"
              :alt="cat.name"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <span
              v-else
              class="i-lucide-package text-primary-600 dark:text-primary-400 h-8 w-8 sm:h-10 sm:w-10"
              aria-hidden="true"
            />
          </div>
          <h3
            class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 text-sm font-semibold transition-colors"
          >
            {{ cat.name }}
          </h3>
          <p class="mt-1 text-xs text-slate-400 dark:text-zinc-500">
            {{ $t('public_landing_prod_cat_btn') }}
          </p>
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="mb-8 flex items-end justify-between">
        <div>
          <h2 class="text-surface-foreground text-2xl font-bold sm:text-3xl">
            {{ $t('public_landing_prod_feat_title') }}
          </h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            {{ $t('public_landing_prod_feat_subtitle') }}
          </p>
        </div>
        <NuxtLink
          to="/products"
          class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 group hidden min-h-[44px] items-center gap-1 px-2 text-sm font-medium transition-colors sm:flex"
        >
          {{ $t('wholesale_view_all') }}
          <span
            class="i-lucide-chevron-right h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </NuxtLink>
      </div>
      <!-- Loading skeleton -->
      <div v-if="loading" class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <div v-for="i in 8" :key="i" class="card p-4">
          <USkeleton class="mb-4 h-48 w-full" />
          <USkeleton class="mb-2 h-4 w-full" />
          <USkeleton class="h-4 w-2/3" />
        </div>
      </div>
      <div v-else class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <NuxtLink
          v-for="(product, i) in featuredProducts"
          :key="product.id"
          :to="`/products/${generateSeoSlug(product.slug, product.id)}`"
          class="card card-hover card-gradient group stagger-item p-4"
          :style="{ animationDelay: `${i * 60}ms` }"
        >
          <div class="bg-surface-muted relative mb-3 aspect-square overflow-hidden rounded-lg">
            <NuxtImg
              v-if="product.thumbnailUrl"
              :src="getImageUrl(product.thumbnailUrl) || undefined"
              :alt="product.name"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <span
                class="i-lucide-package h-12 w-12 text-gray-300 dark:text-zinc-600"
                aria-hidden="true"
              />
            </div>
          </div>
          <h3
            class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-1 truncate text-sm font-medium transition-colors sm:text-base"
          >
            {{ product.name }}
          </h3>
          <p class="mb-2 text-xs text-slate-400 dark:text-zinc-500">
            {{ product.category?.name || $t('admin_blog_default_cat') }}
          </p>
          <div class="flex items-center justify-between">
            <p class="text-primary-600 dark:text-primary-400 text-sm font-semibold sm:text-base">
              {{ formatVND(product.basePrice) }}
            </p>
            <span class="text-xs text-slate-400 dark:text-zinc-500">/{{ product.unit }}</span>
          </div>
        </NuxtLink>
      </div>
      <div class="mt-6 sm:hidden">
        <NuxtLink to="/products">
          <UButton color="neutral" variant="outline" block>{{
            $t('public_landing_prod_btn_all_mobile')
          }}</UButton>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
