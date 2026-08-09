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

const toast = useToast()
const route = useRoute()
definePageMeta({ layout: 'default' })

const slug = route.params.slug as string
const loading = ref(true)
const error = ref(false)
const activeTab = ref<'description' | 'reviews'>('description')
const isWishlisted = ref(false)
const quantity = ref(1)
const activeImage = ref(0)

const product = computed(() => mockProducts.find((p) => p.slug === slug && p.status === 'ACTIVE'))

const reviews = computed(() =>
  mockProductReviews.filter((r) => r.product_id === product.value?.id && r.is_approved)
)

const relatedProducts = computed(() => {
  if (!product.value) return []
  return mockProducts
    .filter(
      (p) =>
        p.category_id === product.value!.category_id &&
        p.id !== product.value!.id &&
        p.status === 'ACTIVE'
    )
    .slice(0, 4)
})

const galleryImages = computed(() => {
  if (!product.value) return []
  // Use the product image + mock thumbnails
  const imgs = [product.value.image_url]
  // Generate 4 thumbnails from mock (same image with variations for demo)
  for (let i = 0; i < 3; i++) {
    imgs.push(product.value.image_url)
  }
  return imgs.filter(Boolean)
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
  if (product.value && quantity.value < product.value.stock) {
    quantity.value++
  } else {
    toast.add({ title: 'Cảnh báo', description: '', color: 'warning' })
  }
}

const decrementQty = () => {
  if (quantity.value > 1) quantity.value--
}

const toggleWishlist = () => {
  isWishlisted.value = !isWishlisted.value
  toast.add({ title: 'Thành công', description: '', color: 'success' })
}

const shareProduct = () => {
  if (import.meta.client) {
    navigator.clipboard.writeText(window.location.href)
    toast.add({ title: 'Thành công', description: '', color: 'success' })
  }
}

const addToCart = () => {
  if (!product.value) return
  if (product.value.stock <= 0) {
    toast.add({ title: 'Thất bại', description: '', color: 'error' })
    return
  }
  toast.add({ title: 'Thành công', description: '', color: 'success' })
}

const quickOrder = () => {
  if (!product.value) return
  toast.add({ title: 'Thông báo', description: '', color: 'info' })
  setTimeout(() => navigateTo('/quick-order'), 600)
}

onMounted(() => {
  setTimeout(() => {
    if (!product.value) {
      error.value = true
    }
    loading.value = false
  }, 400)
})

useHead(() => ({
  title: product.value ? `${product.value.name} - BunTech` : 'Sản phẩm - BunTech'
}))
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
            >Trang chủ</NuxtLink
          >
        </li>
        <li class="text-gray-300 dark:text-zinc-600" aria-hidden="true">/</li>
        <li>
          <NuxtLink
            to="/products"
            class="hover:text-primary-600 dark:hover:text-primary-400 text-gray-500 transition-colors dark:text-zinc-400"
            >Sản phẩm</NuxtLink
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
    <AppErrorState
      v-if="error"
      message="Không tìm thấy sản phẩm"
      @retry="navigateTo('/products')"
    />

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
            <span
              v-if="product.stock <= 0"
              class="badge bg-danger-500 absolute top-3 left-3 text-white"
              >Hết hàng</span
            >
            <span
              v-else-if="product.stock <= 10"
              class="badge bg-warning-500 absolute top-3 left-3 text-white"
              >Sắp hết hàng</span
            >
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
              :aria-label="`Xem ảnh ${i + 1}`"
              @click="
                () => {
                  activeImage = i
                }
              "
            >
              <NuxtImg
                v-if="img"
                :src="img"
                :alt="`Ảnh ${i + 1}`"
                class="h-full w-full object-cover"
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
              <span class="text-xs font-medium text-gray-600 dark:text-zinc-300">Giao 2h</span>
            </div>
            <div
              class="bg-surface-muted flex flex-col items-center gap-1.5 rounded-xl p-3 text-center"
            >
              <ShieldCheck
                class="text-success-600 dark:text-success-400 h-5 w-5"
                aria-hidden="true"
              />
              <span class="text-xs font-medium text-gray-600 dark:text-zinc-300">An toàn</span>
            </div>
            <div
              class="bg-surface-muted flex flex-col items-center gap-1.5 rounded-xl p-3 text-center"
            >
              <RotateCcw
                class="text-secondary-600 dark:text-secondary-400 h-5 w-5"
                aria-hidden="true"
              />
              <span class="text-xs font-medium text-gray-600 dark:text-zinc-300">Đổi trả</span>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div>
          <p class="text-primary-600 dark:text-primary-400 mb-2 text-sm font-medium">
            {{ product.category }}
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
            <span class="text-sm text-gray-500 dark:text-zinc-400"
              >{{ avgRating.toFixed(1) }} ({{ reviews.length }} đánh giá)</span
            >
          </div>

          <!-- Price -->
          <div class="mb-6 flex items-baseline gap-2">
            <span class="text-primary-600 dark:text-primary-400 text-3xl font-bold sm:text-4xl">{{
              formatVND(product.price)
            }}</span>
            <span class="text-sm text-gray-400 dark:text-zinc-500">/{{ product.unit }}</span>
          </div>

          <!-- Stock -->
          <div class="mb-6 flex items-center gap-2">
            <AppBadge :color="product.stock > 0 ? 'success' : 'danger'" :dot="true">
              {{ product.stock > 0 ? 'Còn hàng' : 'Hết hàng' }}
            </AppBadge>
            <span v-if="product.stock > 0" class="text-sm text-gray-500 dark:text-zinc-400">
              {{ product.stock }} {{ product.unit }} khả dụng
            </span>
          </div>

          <!-- Quantity selector -->
          <div class="mb-6 flex items-center gap-4">
            <label class="text-surface-foreground text-sm font-medium">Số lượng:</label>
            <div
              class="border-surface-border flex items-center gap-1 overflow-hidden rounded-lg border"
            >
              <UButton
                variant="ghost"
                color="neutral"
                type="button"
                class="hover:bg-surface-hover flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center transition-colors disabled:opacity-40"
                :disabled="quantity <= 1"
                :aria-label="'Giảm số lượng'"
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
                :disabled="quantity >= product.stock"
                :aria-label="'Tăng số lượng'"
                @click="incrementQty"
              >
                <Plus class="h-4 w-4" aria-hidden="true" />
              </UButton>
            </div>
            <span class="text-sm text-gray-400 dark:text-zinc-500"
              >Tổng: {{ formatVND(product.price * quantity) }}</span
            >
          </div>

          <!-- Actions -->
          <div class="mb-6 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <UButton size="lg" variant="outline" class="group flex-1" @click="addToCart">
              <ShoppingCart class="h-5 w-5" aria-hidden="true" />
              Thêm vào giỏ
            </UButton>
            <UButton size="lg" class="group flex-1" @click="quickOrder">
              <Zap class="h-5 w-5" aria-hidden="true" />
              Đặt hàng nhanh
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
              :aria-label="isWishlisted ? 'Bỏ yêu thích' : 'Thêm yêu thích'"
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
              aria-label="Chia sẻ sản phẩm"
              @click="shareProduct"
            >
              <Share2 class="h-5 w-5" aria-hidden="true" />
            </UButton>
          </div>

          <!-- Quick info -->
          <div class="card space-y-2 p-4 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-zinc-400">Đơn vị</span>
              <span class="text-surface-foreground font-medium">{{ product.unit }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-zinc-400">Danh mục</span>
              <span class="text-surface-foreground font-medium">{{ product.category }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-zinc-400">Tồn kho</span>
              <span class="text-surface-foreground font-medium"
                >{{ product.stock }} {{ product.unit }}</span
              >
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
              { accessorKey: 'description', header: 'Mô tả sản phẩm' },
              { accessorKey: 'reviews', header: `Đánh giá (${reviews.length})` }
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
          <p class="leading-relaxed text-gray-600 dark:text-zinc-300">
            {{
              product.description ||
              'Bún tươi BunTech được làm từ 100% gạo tự nhiên, sản xuất theo quy trình truyền thống 3 đời. Bún mềm, dẻo, không hàn the, an toàn vệ sinh thực phẩm. Giao hàng tận nơi trong 2 giờ.'
            }}
          </p>
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
                  {{ reviews.length }} đánh giá
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
                  <AppAvatar :name="review.author_name" size="sm" />
                  <div>
                    <p class="text-surface-foreground font-medium">{{ review.author_name }}</p>
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
                v-if="review.reply"
                class="bg-surface-muted border-primary-300 dark:border-primary-700 mt-3 rounded-lg border-l-2 p-3"
              >
                <p class="text-primary-600 dark:text-primary-400 mb-1 text-xs font-medium">
                  Phản hồi từ BunTech:
                </p>
                <p class="text-sm text-gray-700 dark:text-zinc-200">{{ review.reply }}</p>
              </div>
            </div>
          </template>
          <AppEmptyState
            v-else
            title="Chưa có đánh giá"
            description="Hãy là người đầu tiên đánh giá sản phẩm này!"
          />
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length" class="mt-16">
        <h2 class="text-surface-foreground mb-6 text-xl font-bold sm:text-2xl">
          Sản phẩm liên quan
        </h2>
        <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          <NuxtLink
            v-for="(rp, i) in relatedProducts"
            :key="rp.id"
            :to="`/products/${rp.slug}`"
            class="card card-hover card-gradient group stagger-item p-4"
            :style="{ animationDelay: `${i * 60}ms` }"
          >
            <div class="bg-surface-muted mb-3 aspect-square overflow-hidden rounded-lg">
              <NuxtImg
                v-if="rp.image_url"
                :src="rp.image_url"
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
              {{ formatVND(rp.price) }}
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
            {{ formatVND(product.price * quantity) }}
          </p>
        </div>
        <UButton size="lg" class="!px-6" @click="quickOrder">
          <Zap class="h-4 w-4" aria-hidden="true" />
          Đặt hàng
        </UButton>
      </div>
    </div>
  </div>
</template>
