<script setup lang="ts">
import { Star, ArrowRight, Package, Truck, ShieldCheck, RotateCcw, Share2, Heart, Minus, Plus, ShoppingCart, Zap } from 'lucide-vue-next'

const toast = useAppToast()
const route = useRoute()
const { formatVND } = useFormat()

definePageMeta({ layout: 'default' })

const slug = route.params.slug as string
const loading = ref(true)
const error = ref(false)
const activeTab = ref<'description' | 'reviews'>('description')
const isWishlisted = ref(false)
const quantity = ref(1)
const activeImage = ref(0)

const product = computed(() =>
  mockProducts.find(p => p.slug === slug && p.status === 'ACTIVE')
)

const reviews = computed(() =>
  mockProductReviews.filter(r => r.product_id === product.value?.id && r.is_approved)
)

const relatedProducts = computed(() => {
  if (!product.value) return []
  return mockProducts
    .filter(p => p.category_id === product.value!.category_id && p.id !== product.value!.id && p.status === 'ACTIVE')
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
    toast.warning('Đã đạt giới hạn tồn kho')
  }
}

const decrementQty = () => {
  if (quantity.value > 1) quantity.value--
}

const toggleWishlist = () => {
  isWishlisted.value = !isWishlisted.value
  toast.success(isWishlisted.value ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích')
}

const shareProduct = () => {
  if (import.meta.client) {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Đã sao chép link sản phẩm')
  }
}

const addToCart = () => {
  if (!product.value) return
  if (product.value.stock <= 0) {
    toast.error('Sản phẩm đã hết hàng')
    return
  }
  toast.success(`Đã thêm ${quantity.value} ${product.value.unit} ${product.value.name} vào giỏ`)
}

const quickOrder = () => {
  if (!product.value) return
  toast.info('Đang chuyển đến trang đặt hàng nhanh...')
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
  title: product.value ? `${product.value.name} - BunTech` : 'Sản phẩm - BunTech',
}))
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 sm:pb-12">
    <!-- Breadcrumb -->
    <nav aria-label="Breadcrumb" class="mb-6">
      <ol class="flex items-center gap-1.5 text-sm flex-wrap">
        <li><NuxtLink to="/" class="text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Trang chủ</NuxtLink></li>
        <li class="text-gray-300 dark:text-zinc-600" aria-hidden="true">/</li>
        <li><NuxtLink to="/products" class="text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Sản phẩm</NuxtLink></li>
        <li class="text-gray-300 dark:text-zinc-600" aria-hidden="true">/</li>
        <li aria-current="page" class="text-surface-foreground font-medium truncate max-w-[150px] sm:max-w-none">{{ product?.name }}</li>
      </ol>
    </nav>

    <!-- Error -->
    <AppErrorState v-if="error" message="Không tìm thấy sản phẩm" @retry="navigateTo('/products')" />

    <!-- Loading -->
    <template v-else-if="loading">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
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
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Gallery -->
        <div class="space-y-3">
          <div class="aspect-square bg-surface-muted rounded-2xl overflow-hidden shadow-md relative group">
            <NuxtImg
              v-if="galleryImages[activeImage]"
              :src="galleryImages[activeImage] || ''"
              :alt="product.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="eager"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Package class="w-24 h-24 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
            <span
              v-if="product.stock <= 0"
              class="absolute top-3 left-3 badge bg-danger-500 text-white"
            >Hết hàng</span>
            <span
              v-else-if="product.stock <= 10"
              class="absolute top-3 left-3 badge bg-warning-500 text-white"
            >Sắp hết hàng</span>
          </div>
          <!-- Thumbnails -->
          <div class="grid grid-cols-4 gap-2 sm:gap-3">
            <button
              v-for="(img, i) in galleryImages.slice(0, 4)"
              :key="i"
              type="button"
              :class="[
                'aspect-square rounded-lg overflow-hidden border-2 transition-all min-w-[44px] min-h-[44px]',
                activeImage === i ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-surface-border hover:border-primary-300',
              ]"
              :aria-label="`Xem ảnh ${i + 1}`"
              @click="activeImage = i"
            >
              <NuxtImg v-if="img" :src="img" :alt="`Ảnh ${i + 1}`" class="w-full h-full object-cover"/>
              <div v-else class="w-full h-full flex items-center justify-center bg-surface-muted">
                <Package class="w-6 h-6 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </button>
          </div>
          <!-- Trust badges -->
          <div class="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
            <div class="flex flex-col items-center gap-1.5 text-center p-3 rounded-xl bg-surface-muted">
              <Truck class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              <span class="text-xs text-gray-600 dark:text-zinc-300 font-medium">Giao 2h</span>
            </div>
            <div class="flex flex-col items-center gap-1.5 text-center p-3 rounded-xl bg-surface-muted">
              <ShieldCheck class="w-5 h-5 text-success-600 dark:text-success-400" aria-hidden="true" />
              <span class="text-xs text-gray-600 dark:text-zinc-300 font-medium">An toàn</span>
            </div>
            <div class="flex flex-col items-center gap-1.5 text-center p-3 rounded-xl bg-surface-muted">
              <RotateCcw class="w-5 h-5 text-secondary-600 dark:text-secondary-400" aria-hidden="true" />
              <span class="text-xs text-gray-600 dark:text-zinc-300 font-medium">Đổi trả</span>
            </div>
          </div>
        </div>

        <!-- Info -->
        <div>
          <p class="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">{{ product.category }}</p>
          <h1 class="text-2xl sm:text-3xl font-bold text-surface-foreground mb-3 tracking-tight">{{ product.name }}</h1>

          <!-- Rating -->
          <div class="flex items-center gap-3 mb-4">
            <div class="flex items-center gap-0.5">
              <Star
                v-for="i in 5"
                :key="i"
                :class="['w-4 h-4', i <= Math.round(avgRating) ? 'text-accent-400 fill-accent-400' : 'text-gray-200 dark:text-zinc-700']"
                aria-hidden="true"
              />
            </div>
            <span class="text-sm text-gray-500 dark:text-zinc-400">{{ avgRating.toFixed(1) }} ({{ reviews.length }} đánh giá)</span>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-2 mb-6">
            <span class="text-3xl sm:text-4xl font-bold text-primary-600 dark:text-primary-400">{{ formatVND(product.price) }}</span>
            <span class="text-sm text-gray-400 dark:text-zinc-500">/{{ product.unit }}</span>
          </div>

          <!-- Stock -->
          <div class="flex items-center gap-2 mb-6">
            <AppBadge :color="product.stock > 0 ? 'success' : 'danger'" :dot="true">
              {{ product.stock > 0 ? 'Còn hàng' : 'Hết hàng' }}
            </AppBadge>
            <span v-if="product.stock > 0" class="text-sm text-gray-500 dark:text-zinc-400">
              {{ product.stock }} {{ product.unit }} khả dụng
            </span>
          </div>

          <!-- Quantity selector -->
          <div class="flex items-center gap-4 mb-6">
            <label class="text-sm font-medium text-surface-foreground">Số lượng:</label>
            <div class="flex items-center gap-1 border border-surface-border rounded-lg overflow-hidden">
              <button
                type="button"
                class="w-11 h-11 flex items-center justify-center hover:bg-surface-hover transition-colors disabled:opacity-40 min-w-[44px] min-h-[44px]"
                :disabled="quantity <= 1"
                :aria-label="'Giảm số lượng'"
                @click="decrementQty"
              >
                <Minus class="w-4 h-4" aria-hidden="true" />
              </button>
              <span class="w-12 text-center text-base font-semibold text-surface-foreground tabular-nums">{{ quantity }}</span>
              <button
                type="button"
                class="w-11 h-11 flex items-center justify-center hover:bg-surface-hover transition-colors disabled:opacity-40 min-w-[44px] min-h-[44px]"
                :disabled="quantity >= product.stock"
                :aria-label="'Tăng số lượng'"
                @click="incrementQty"
              >
                <Plus class="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <span class="text-sm text-gray-400 dark:text-zinc-500">Tổng: {{ formatVND(product.price * quantity) }}</span>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-6">
            <UButton size="lg" variant="outline" class="flex-1 group" @click="addToCart">
              <ShoppingCart class="w-5 h-5" aria-hidden="true" />
              Thêm vào giỏ
            </UButton>
            <UButton size="lg" class="flex-1 group" @click="quickOrder">
              <Zap class="w-5 h-5" aria-hidden="true" />
              Đặt hàng nhanh
              <ArrowRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </UButton>
            <button
              type="button"
              :class="[
                'w-12 h-12 rounded-xl border border-surface-border flex items-center justify-center transition-all duration-200 min-w-[44px] min-h-[44px] flex-shrink-0',
                isWishlisted ? 'bg-danger-50 dark:bg-danger-900/20 text-danger-600 dark:text-danger-400 border-danger-200 dark:border-danger-800' : 'text-gray-400 dark:text-zinc-500 hover:text-danger-600 dark:hover:text-danger-400 hover:bg-surface-hover',
              ]"
              :aria-label="isWishlisted ? 'Bỏ yêu thích' : 'Thêm yêu thích'"
              :aria-pressed="isWishlisted"
              @click="toggleWishlist"
            >
              <Heart :class="['w-5 h-5', isWishlisted ? 'fill-current' : '']" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="w-12 h-12 rounded-xl border border-surface-border flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-hover transition-all duration-200 min-w-[44px] min-h-[44px] flex-shrink-0"
              aria-label="Chia sẻ sản phẩm"
              @click="shareProduct"
            >
              <Share2 class="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <!-- Quick info -->
          <div class="card p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-zinc-400">Đơn vị</span>
              <span class="font-medium text-surface-foreground">{{ product.unit }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-zinc-400">Danh mục</span>
              <span class="font-medium text-surface-foreground">{{ product.category }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500 dark:text-zinc-400">Tồn kho</span>
              <span class="font-medium text-surface-foreground">{{ product.stock }} {{ product.unit }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="mt-12">
        <div class="flex items-center gap-1 border-b border-surface-border mb-6 overflow-x-auto scrollbar-hide" role="tablist">
          <button
            v-for="tab in [
              { accessorKey: 'description', header: 'Mô tả sản phẩm' },
              { accessorKey: 'reviews', header: `Đánh giá (${reviews.length})` },
            ]"
            :key="tab.key"
            :class="[
              'px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px]',
              activeTab === tab.key ? 'border-primary-600 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-zinc-400 hover:text-surface-foreground',
            ]"
            role="tab"
            :aria-selected="activeTab === tab.key"
            @click="activeTab = tab.key as 'description' | 'reviews'"
          >{{ tab.label }}</button>
        </div>

        <!-- Description -->
        <div v-if="activeTab === 'description'" class="prose prose-sm max-w-none">
          <p class="text-gray-600 dark:text-zinc-300 leading-relaxed">{{ product.description || 'Bún tươi BunTech được làm từ 100% gạo tự nhiên, sản xuất theo quy trình truyền thống 3 đời. Bún mềm, dẻo, không hàn the, an toàn vệ sinh thực phẩm. Giao hàng tận nơi trong 2 giờ.' }}</p>
        </div>

        <!-- Reviews -->
        <div v-else-if="activeTab === 'reviews'">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div class="flex items-center gap-6">
              <div class="text-center">
                <p class="text-4xl font-bold text-surface-foreground">{{ avgRating.toFixed(1) }}</p>
                <div class="flex justify-center gap-0.5 mt-1">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    :class="['w-4 h-4', i <= Math.round(avgRating) ? 'text-accent-400 fill-accent-400' : 'text-gray-200 dark:text-zinc-700']"
                    aria-hidden="true"
                  />
                </div>
                <p class="text-xs text-gray-500 dark:text-zinc-400 mt-1">{{ reviews.length }} đánh giá</p>
              </div>
              <!-- Distribution -->
              <div class="flex-1 max-w-xs space-y-1">
                <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="flex items-center gap-2">
                  <span class="text-xs text-gray-500 dark:text-zinc-400 w-3">{{ star }}</span>
                  <Star class="w-3 h-3 text-accent-400 fill-accent-400" aria-hidden="true" />
                  <div class="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                    <div class="h-full bg-accent-400 rounded-full transition-all duration-500" :style="{ width: `${reviews.length ? ((ratingDistribution[star] || 0) / reviews.length) * 100 : 0}%` }" />
                  </div>
                  <span class="text-xs text-gray-400 dark:text-zinc-500 w-6 text-right">{{ ratingDistribution[star] || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Reviews list -->
          <template v-if="reviews.length">
            <div v-for="(review, i) in reviews" :key="i" class="card p-4 mb-3 stagger-item" :style="{ animationDelay: `${i * 60}ms` }">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-3">
                  <AppAvatar :name="review.author_name" size="sm" />
                  <div>
                    <p class="font-medium text-surface-foreground">{{ review.author_name }}</p>
                    <div class="flex items-center gap-1 mt-0.5">
                      <Star
                        v-for="j in 5"
                        :key="j"
                        :class="['w-3.5 h-3.5', j <= review.rating ? 'text-accent-400 fill-accent-400' : 'text-gray-200 dark:text-zinc-700']"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <p class="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">{{ review.content }}</p>
              <div v-if="review.reply" class="mt-3 bg-surface-muted rounded-lg p-3 border-l-2 border-primary-300 dark:border-primary-700">
                <p class="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">Phản hồi từ BunTech:</p>
                <p class="text-sm text-gray-700 dark:text-zinc-200">{{ review.reply }}</p>
              </div>
            </div>
          </template>
          <AppEmptyState v-else title="Chưa có đánh giá" description="Hãy là người đầu tiên đánh giá sản phẩm này!" />
        </div>
      </div>

      <!-- Related Products -->
      <div v-if="relatedProducts.length" class="mt-16">
        <h2 class="text-xl sm:text-2xl font-bold text-surface-foreground mb-6">Sản phẩm liên quan</h2>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <NuxtLink
            v-for="(rp, i) in relatedProducts"
            :key="rp.id"
            :to="`/products/${rp.slug}`"
            class="card card-hover card-gradient p-4 group stagger-item"
            :style="{ animationDelay: `${i * 60}ms` }"
          >
            <div class="aspect-square rounded-lg bg-surface-muted overflow-hidden mb-3">
              <NuxtImg
                v-if="rp.image_url"
                :src="rp.image_url"
                :alt="rp.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Package class="w-12 h-12 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </div>
            <h3 class="font-medium text-surface-foreground text-sm truncate mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ rp.name }}</h3>
            <p class="text-primary-600 dark:text-primary-400 font-semibold text-sm">{{ formatVND(rp.price) }}</p>
          </NuxtLink>
        </div>
      </div>
    </template>

    <!-- Sticky mobile buy bar -->
    <div
      v-if="product && !loading"
      class="fixed bottom-0 left-0 right-0 z-40 glass border-t border-surface-border/40 p-3 sm:hidden safe-area-bottom"
    >
      <div class="flex items-center gap-3">
        <div class="flex-1 min-w-0">
          <p class="text-xs text-gray-500 dark:text-zinc-400 truncate">{{ product.name }}</p>
          <p class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ formatVND(product.price * quantity) }}</p>
        </div>
        <UButton size="lg" class="!px-6" @click="quickOrder">
          <Zap class="w-4 h-4" aria-hidden="true" />
          Đặt hàng
        </UButton>
      </div>
    </div>
  </div>
</template>
