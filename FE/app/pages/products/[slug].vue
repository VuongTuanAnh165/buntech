<script setup lang="ts">
import {
  Star,
  ArrowRight,
  Package,
  Truck,
  ShieldCheck,
  RotateCcw,
  Share2,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Zap
} from 'lucide-vue-next'
import { extractIdFromSlug, generateSeoSlug } from '~/utils/idEncoder'
import { productService } from '~/services/productService'
import { productReviewService } from '~/services/productReviewService'
import { t } from '~/utils/i18n'

const toast = useToast()
const route = useRoute()
definePageMeta({ layout: 'default' })

const slug = route.params.slug as string
const productId = extractIdFromSlug(slug)

const activeTab = ref<'description' | 'reviews'>('description')
const isWishlisted = ref(false)
const quantity = ref(1)
const activeImage = ref(0)

// Fetch Product
const {
  data: productRes,
  pending: loading,
  error: fetchError
} = useAsyncData(`product-${productId}`, () => {
  if (!productId) return Promise.reject(new Error('Invalid ID'))
  return productService.getClientProduct(productId)
})

const product = computed(() => productRes.value?.data)
const error = computed(() => !productId || !!fetchError.value || (!loading.value && !product.value))

// Fetch Reviews
const { data: reviewsRes } = useAsyncData(
  `product-reviews-${productId}`,
  () => {
    if (!productId) return Promise.resolve(null)
    return productReviewService.getClientReviews(productId, { limit: 100 })
  },
  { lazy: true }
)

const reviews = computed(() => reviewsRes.value?.data?.data || [])

// Fetch Related Products
const { data: relatedRes } = useAsyncData(
  `product-related-${productId}`,
  () => {
    if (!product.value?.categoryId) return Promise.resolve(null)
    return productService.getClientProducts({ categoryId: product.value.categoryId, limit: 5 })
  },
  { watch: [() => product.value?.categoryId] }
)

const relatedProducts = computed(() => {
  const allRelated = relatedRes.value?.data?.data || []
  return allRelated.filter((p) => p.id !== product.value?.id).slice(0, 4)
})

const galleryImages = computed(() => {
  if (!product.value) return []
  const imgs: string[] = []
  if (product.value.thumbnailUrl) imgs.push(product.value.thumbnailUrl)
  if (product.value.images && Array.isArray(product.value.images)) {
    imgs.push(...product.value.images.map((g: { fileUrl: string }) => g.fileUrl))
  }
  return imgs.length ? imgs : []
})

const avgRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const total = reviews.value.reduce((acc: number, r) => acc + (r.rating || 0), 0)
  return Number((total / reviews.value.length).toFixed(1))
})

const ratingDistribution = computed(() => {
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const r of reviews.value) {
    dist[Number(r.rating)] = (dist[Number(r.rating)] || 0) + 1
  }
  return dist
})

const incrementQty = () => {
  // Assume unlimited stock if not provided
  quantity.value++
}

const decrementQty = () => {
  if (quantity.value > 1) quantity.value--
}

const toggleWishlist = () => {
  isWishlisted.value = !isWishlisted.value
  toast.add({
    title: t('success'),
    description: t('public_product_msg_wishlist_updated'),
    color: 'success'
  })
}

const shareProduct = () => {
  if (import.meta.client) {
    navigator.clipboard.writeText(window.location.href)
    toast.add({
      title: t('success'),
      description: t('public_product_msg_link_copied'),
      color: 'success'
    })
  }
}

const addToCart = () => {
  if (!product.value) return
  toast.add({
    title: t('success'),
    description: t('public_product_msg_cart_added'),
    color: 'success'
  })
}

const quickOrder = () => {
  if (!product.value) return
  navigateTo('/quick-order')
}

useSeoMeta({
  title: () =>
    product.value ? `${product.value.name} - ${t('app_name')}` : t('public_products_seo_title')
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-8 pb-24 sm:px-6 sm:py-12 sm:pb-12 lg:px-8">
    <!-- Breadcrumb -->
    <nav aria-label="Breadcrumb" class="mb-6">
      <ol class="flex flex-wrap items-center gap-1.5 text-sm">
        <li>
          <NuxtLink
            to="/"
            class="hover:text-primary-600 dark:hover:text-primary-400 text-gray-500 transition-colors dark:text-zinc-400"
            >{{ $t('nav_home') }}</NuxtLink
          >
        </li>
        <li class="text-gray-300 dark:text-zinc-600" aria-hidden="true">/</li>
        <li>
          <NuxtLink
            to="/products"
            class="hover:text-primary-600 dark:hover:text-primary-400 text-gray-500 transition-colors dark:text-zinc-400"
            >{{ $t('nav_products') }}</NuxtLink
          >
        </li>
        <li class="text-gray-300 dark:text-zinc-600" aria-hidden="true">/</li>
        <li
          aria-current="page"
          class="text-surface-foreground max-w-[150px] truncate font-medium sm:max-w-none"
        >
          {{ product?.name }}
        </li>
      </ol>
    </nav>

    <!-- Error -->
    <div v-if="error" class="py-8 text-center">
      <EmptyState
        :title="$t('wholesale_msg_error')"
        :description="$t('admin_order_picker_empty')"
        icon="i-lucide-alert-circle"
        color="error"
      />
      <UButton class="mt-4" color="primary" @click="navigateTo('/products')">
        {{ $t('public_product_btn_back') }}
      </UButton>
    </div>

    <!-- Loading -->
    <template v-else-if="loading">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div class="space-y-3">
          <USkeleton class="h-96 rounded-2xl" />
          <div class="flex gap-3">
            <USkeleton v-for="i in 4" :key="i" height="h-20" width="w-20" class="rounded-lg" />
          </div>
        </div>
        <div class="space-y-4">
          <USkeleton class="h-4 w-1/4" />
          <USkeleton class="h-10 w-3/4" />
          <USkeleton class="h-6 w-1/3" />
          <USkeleton class="h-24" />
          <USkeleton class="h-12 w-48" />
        </div>
      </div>
    </template>

    <template v-else-if="product">
      <!-- Product Main -->
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <!-- Gallery -->
        <div class="space-y-3">
          <div
            class="bg-surface-muted group relative aspect-square overflow-hidden rounded-2xl shadow-md"
          >
            <NuxtImg
              v-if="galleryImages[activeImage]"
              :src="galleryImages[activeImage] || ''"
              :alt="product.name"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="eager"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Package class="h-24 w-24 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
          </div>
          <!-- Thumbnails -->
          <div class="grid grid-cols-4 gap-2 sm:gap-3">
            <UButton
              v-for="(img, i) in galleryImages.slice(0, 4)"
              :key="i"
              variant="ghost"
              color="neutral"
              type="button"
              :class="[
                'aspect-square min-h-[44px] min-w-[44px] overflow-hidden rounded-lg border-2 transition-all',
                activeImage === i
                  ? 'border-primary-500 ring-primary-500/20 ring-2'
                  : 'border-surface-border hover:border-primary-300'
              ]"
              :aria-label="$t('public_product_img_view', { i: i + 1 })"
              @click="
                () => {
                  activeImage = i
                }
              "
            >
              <NuxtImg
                v-if="img"
                :src="img"
                :alt="$t('public_product_img_alt', { i: i + 1 })"
                class="h-full w-full object-cover"
                loading="lazy"
              />
              <div v-else class="bg-surface-muted flex h-full w-full items-center justify-center">
                <Package class="h-6 w-6 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </UButton>
          </div>
          <!-- Trust badges -->
          <div class="grid grid-cols-3 gap-2 pt-2 sm:gap-3">
            <div
              class="bg-surface-muted flex flex-col items-center gap-1.5 rounded-xl p-3 text-center"
            >
              <Truck class="text-primary-600 dark:text-primary-400 h-5 w-5" aria-hidden="true" />
              <span class="text-xs font-medium text-gray-600 dark:text-zinc-300">{{
                $t('public_product_badge_fast')
              }}</span>
            </div>
            <div
              class="bg-surface-muted flex flex-col items-center gap-1.5 rounded-xl p-3 text-center"
            >
              <ShieldCheck
                class="text-success-600 dark:text-success-400 h-5 w-5"
                aria-hidden="true"
              />
              <span class="text-xs font-medium text-gray-600 dark:text-zinc-300">{{
                $t('public_product_badge_safe')
              }}</span>
            </div>
            <div
              class="bg-surface-muted flex flex-col items-center gap-1.5 rounded-xl p-3 text-center"
            >
              <RotateCcw
                class="text-secondary-600 dark:text-secondary-400 h-5 w-5"
                aria-hidden="true"
              />
              <span class="text-xs font-medium text-gray-600 dark:text-zinc-300">{{
                $t('public_product_badge_return')
              }}</span>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div>
          <p class="text-primary-600 dark:text-primary-400 mb-2 text-sm font-medium">
            {{ product.category?.name || $t('admin_blog_default_cat') }}
          </p>
          <h1 class="text-surface-foreground mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {{ product.name }}
          </h1>

          <!-- Rating -->
          <div class="mb-4 flex items-center gap-3">
            <div class="flex items-center gap-0.5">
              <Star
                v-for="i in 5"
                :key="i"
                :class="[
                  'h-4 w-4',
                  i <= Math.round(avgRating)
                    ? 'text-accent-400 fill-accent-400'
                    : 'text-gray-200 dark:text-zinc-700'
                ]"
                aria-hidden="true"
              />
            </div>
            <span class="text-sm text-gray-500 dark:text-zinc-400">{{
              $t('public_product_rating', { rating: avgRating.toFixed(1), count: reviews.length })
            }}</span>
          </div>

          <!-- Price -->
          <div class="mb-6 flex items-baseline gap-2">
            <span class="text-primary-600 dark:text-primary-400 text-3xl font-bold sm:text-4xl">{{
              formatVND(product.basePrice)
            }}</span>
            <span class="text-sm text-gray-400 dark:text-zinc-500">/{{ product.unit }}</span>
          </div>

          <!-- Quantity selector -->
          <div class="mb-6 flex items-center gap-4">
            <label class="text-surface-foreground text-sm font-medium">{{
              $t('public_product_qty_label')
            }}</label>
            <div
              class="border-surface-border flex items-center gap-1 overflow-hidden rounded-lg border"
            >
              <UButton
                variant="ghost"
                color="neutral"
                type="button"
                class="hover:bg-surface-hover flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center transition-colors disabled:opacity-40"
                :disabled="quantity <= 1"
                :aria-label="$t('quick_order_cart_dec')"
                @click="decrementQty"
              >
                <Minus class="h-4 w-4" aria-hidden="true" />
              </UButton>
              <span
                class="text-surface-foreground w-12 text-center text-base font-semibold tabular-nums"
                >{{ quantity }}</span
              >
              <UButton
                variant="ghost"
                color="neutral"
                type="button"
                class="hover:bg-surface-hover flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center transition-colors disabled:opacity-40"
                :aria-label="$t('quick_order_cart_inc')"
                @click="incrementQty"
              >
                <Plus class="h-4 w-4" aria-hidden="true" />
              </UButton>
            </div>
            <span class="text-sm text-gray-400 dark:text-zinc-500">{{
              $t('public_product_total', { total: formatVND(product.basePrice * quantity) })
            }}</span>
          </div>

          <!-- Actions -->
          <div class="mb-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <UButton size="lg" variant="outline" class="group flex-1" @click="addToCart">
              <ShoppingCart class="h-5 w-5" aria-hidden="true" />
              {{ $t('public_product_btn_add_cart') }}
            </UButton>
            <UButton size="lg" class="group flex-1" @click="quickOrder">
              <Zap class="h-5 w-5" aria-hidden="true" />
              {{ $t('quick_order_title') }}
              <ArrowRight
                class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              type="button"
              :class="[
                'border-surface-border flex h-12 min-h-[44px] w-12 min-w-[44px] flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-200',
                isWishlisted
                  ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 border-danger-200 dark:border-danger-800'
                  : 'hover:text-danger-600 dark:hover:text-danger-400 hover:bg-surface-hover text-gray-400 dark:text-zinc-500'
              ]"
              :aria-label="
                isWishlisted
                  ? $t('public_product_btn_remove_wishlist')
                  : $t('public_product_btn_add_wishlist')
              "
              :aria-pressed="isWishlisted"
              @click="toggleWishlist"
            >
              <Heart :class="['h-5 w-5', isWishlisted ? 'fill-current' : '']" aria-hidden="true" />
            </UButton>
            <UButton
              variant="ghost"
              color="neutral"
              type="button"
              class="border-surface-border hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-hover flex h-12 min-h-[44px] w-12 min-w-[44px] flex-shrink-0 items-center justify-center rounded-xl border text-gray-400 transition-all duration-200 dark:text-zinc-500"
              :aria-label="$t('public_product_btn_share')"
              @click="shareProduct"
            >
              <Share2 class="h-5 w-5" aria-hidden="true" />
            </UButton>
          </div>

          <!-- Quick info -->
          <div class="card space-y-2 p-4 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-zinc-400">{{ $t('admin_prod_form_unit') }}</span>
              <span class="text-surface-foreground font-medium">{{ product.unit }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-zinc-400">{{ $t('nav_categories') }}</span>
              <span class="text-surface-foreground font-medium">{{
                product.category?.name || $t('admin_blog_default_cat')
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mt-12">
        <div
          class="border-surface-border scrollbar-hide mb-6 flex items-center gap-1 overflow-x-auto border-b"
          role="tablist"
        >
          <UButton
            v-for="tab in [
              { accessorKey: 'description', header: $t('public_product_tab_desc') },
              {
                accessorKey: 'reviews',
                header: $t('public_product_tab_reviews', { count: reviews.length })
              }
            ]"
            :key="tab.accessorKey"
            variant="ghost"
            color="neutral"
            :class="[
              'min-h-[44px] border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.accessorKey
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'hover:text-surface-foreground border-transparent text-gray-500 dark:text-zinc-400'
            ]"
            role="tab"
            :aria-selected="activeTab === tab.accessorKey"
            @click="
              () => {
                activeTab = tab.accessorKey as 'description' | 'reviews'
              }
            "
            >{{ tab.header }}</UButton
          >
        </div>

        <!-- Description -->
        <div v-if="activeTab === 'description'" class="prose prose-sm max-w-none">
          <div
            class="prose prose-sm prose-primary dark:prose-invert max-w-none pb-8 text-gray-600 dark:text-zinc-300"
          >
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-html="product.shortDescription || $t('public_product_desc_empty')" />
          </div>
        </div>

        <!-- Reviews -->
        <div v-else-if="activeTab === 'reviews'">
          <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div class="flex items-center gap-6">
              <div class="text-center">
                <p class="text-surface-foreground text-4xl font-bold">{{ avgRating.toFixed(1) }}</p>
                <div class="mt-1 flex justify-center gap-0.5">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    :class="[
                      'h-4 w-4',
                      i <= Math.round(avgRating)
                        ? 'text-accent-400 fill-accent-400'
                        : 'text-gray-200 dark:text-zinc-700'
                    ]"
                    aria-hidden="true"
                  />
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                  {{ $t('public_product_reviews_count', { count: reviews.length }) }}
                </p>
              </div>
              <!-- Distribution -->
              <div class="max-w-xs flex-1 space-y-1">
                <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-2">
                  <span class="w-3 text-xs text-gray-500 dark:text-zinc-400">{{ star }}</span>
                  <Star class="text-accent-400 fill-accent-400 h-3 w-3" aria-hidden="true" />
                  <div class="bg-surface-hover h-1.5 flex-1 overflow-hidden rounded-full">
                    <div
                      class="bg-accent-400 h-full rounded-full transition-all duration-500"
                      :style="{
                        width: `${reviews.length ? ((ratingDistribution[star] || 0) / reviews.length) * 100 : 0}%`
                      }"
                    />
                  </div>
                  <span class="w-6 text-right text-xs text-gray-400 dark:text-zinc-500">{{
                    ratingDistribution[star] || 0
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews list -->
          <template v-if="reviews.length">
            <div
              v-for="(review, i) in reviews"
              :key="i"
              class="card stagger-item mb-3 p-4"
              :style="{ animationDelay: `${i * 60}ms` }"
            >
              <div class="mb-2 flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <UAvatar :alt="review.user?.fullName || $t('public_product_guest')" size="sm" />
                  <div>
                    <p class="text-surface-foreground font-medium">
                      {{ review.user?.fullName || $t('public_product_guest') }}
                    </p>
                    <div class="mt-0.5 flex items-center gap-1">
                      <Star
                        v-for="j in 5"
                        :key="j"
                        :class="[
                          'h-3.5 w-3.5',
                          j <= review.rating
                            ? 'text-accent-400 fill-accent-400'
                            : 'text-gray-200 dark:text-zinc-700'
                        ]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <p class="text-sm leading-relaxed text-gray-600 dark:text-zinc-300">
                {{ review.content }}
              </p>
              <div
                v-if="review.replyContent"
                class="bg-surface-muted border-primary-300 dark:border-primary-700 mt-3 rounded-lg border-l-2 p-3"
              >
                <p class="text-primary-600 dark:text-primary-400 mb-1 text-xs font-medium">
                  {{ $t('public_product_review_reply') }}
                </p>
                <p class="text-sm text-gray-700 dark:text-zinc-200">{{ review.replyContent }}</p>
              </div>
            </div>
          </template>
          <BaseEmptyState
            v-else
            :title="$t('public_product_review_empty_title')"
            :description="$t('public_product_review_empty_desc')"
          />
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length" class="mt-16">
        <h2 class="text-surface-foreground mb-6 text-xl font-bold sm:text-2xl">
          {{ $t('public_product_related_title') }}
        </h2>
        <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          <NuxtLink
            v-for="(rp, i) in relatedProducts"
            :key="rp.id"
            :to="`/products/${generateSeoSlug(rp.slug, rp.id)}`"
            class="card card-hover card-gradient group stagger-item p-4"
            :style="{ animationDelay: `${i * 60}ms` }"
          >
            <div class="bg-surface-muted mb-3 aspect-square overflow-hidden rounded-lg">
              <NuxtImg
                v-if="rp.thumbnailUrl"
                :src="rp.thumbnailUrl"
                :alt="rp.name"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div v-else class="flex h-full w-full items-center justify-center">
                <Package class="h-12 w-12 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </div>
            <h3
              class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-1 truncate text-sm font-medium transition-colors"
            >
              {{ rp.name }}
            </h3>
            <p class="text-primary-600 dark:text-primary-400 text-sm font-semibold">
              {{ formatVND(rp.basePrice) }}
            </p>
          </NuxtLink>
        </div>
      </div>
    </template>

    <!-- Sticky mobile buy bar -->
    <div
      v-if="product && !loading"
      class="glass border-surface-border/40 safe-area-bottom fixed right-0 bottom-0 left-0 z-40 border-t p-3 sm:hidden"
    >
      <div class="flex items-center gap-3">
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs text-gray-500 dark:text-zinc-400">{{ product.name }}</p>
          <p class="text-primary-600 dark:text-primary-400 text-lg font-bold">
            {{ formatVND(product.basePrice * quantity) }}
          </p>
        </div>
        <UButton size="lg" class="!px-6" @click="quickOrder">
          <Zap class="h-4 w-4" aria-hidden="true" />
          {{ $t('wholesale_qa_order') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
