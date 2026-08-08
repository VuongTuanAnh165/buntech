<script setup lang="ts">
import { Grid2x2, LayoutGrid, Package, X, Search, ChevronDown } from 'lucide-vue-next'

const { formatVND } = useFormat()

useHead({ title: 'Sản phẩm - BunTech' })
definePageMeta({ layout: 'default' })

const loading = ref(true)
const search = ref('')
const selectedCategory = ref('')
const sortBy = ref<'latest' | 'price-asc' | 'price-desc' | 'name'>('latest')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const perPage = 12

const sortOptions = [
  { value: 'latest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá thấp → cao' },
  { value: 'price-desc', label: 'Giá cao → thấp' },
  { value: 'name', label: 'Tên A → Z' },
]

const filteredProducts = computed(() => {
  let result = mockProducts.filter(p => p.status === 'ACTIVE')

  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
  }

  if (selectedCategory.value) {
    result = result.filter(p => p.category_id === selectedCategory.value)
  }

  switch (sortBy.value) {
    case 'price-asc': result = [...result].sort((a, b) => a.price - b.price); break
    case 'price-desc': result = [...result].sort((a, b) => b.price - a.price); break
    case 'name': result = [...result].sort((a, b) => a.name.localeCompare(b.name)); break
    default: result = [...result].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  return result
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / perPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredProducts.value.slice(start, start + perPage)
})

const hasActiveFilters = computed(() => selectedCategory.value || search.value || sortBy.value !== 'latest')

watch([search, selectedCategory, sortBy], () => { currentPage.value = 1 })

const clearFilters = () => {
  selectedCategory.value = ''
  search.value = ''
  sortBy.value = 'latest'
  currentPage.value = 1
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Header -->
    <div class="mb-8">
      <nav aria-label="Breadcrumb" class="mb-4">
        <ol class="flex items-center gap-1.5 text-sm">
          <li><NuxtLink to="/" class="text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Trang chủ</NuxtLink></li>
          <li class="text-gray-300 dark:text-zinc-600" aria-hidden="true">/</li>
          <li aria-current="page" class="text-surface-foreground font-medium">Sản phẩm</li>
        </ol>
      </nav>
      <h1 class="text-2xl sm:text-3xl font-bold text-surface-foreground tracking-tight mb-2">Tất cả sản phẩm</h1>
      <p class="text-sm text-gray-500 dark:text-zinc-400">Bún tươi thủ công, giao hàng tận nơi trong 2 giờ</p>
    </div>

    <!-- Search & Sort Bar -->
    <div class="card p-4 mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <div class="flex-1 min-w-[200px] max-w-md relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" aria-hidden="true" />
          <input
            v-model="search"
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            class="form-input pl-10 pr-4 min-h-[44px]"
          >
        </div>
        <div class="relative">
          <select
            v-model="sortBy"
            class="appearance-none rounded-lg border border-surface-border bg-surface pl-3.5 pr-10 py-2.5 text-sm font-medium text-surface-foreground focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15 cursor-pointer min-h-[44px] transition-all"
            aria-label="Sắp xếp"
          >
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
          <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" aria-hidden="true" />
        </div>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-zinc-400 hover:text-danger-600 dark:hover:text-danger-400 transition-colors min-h-[44px] px-2"
          @click="clearFilters"
        >
          <X class="w-4 h-4" aria-hidden="true" />
          Xóa lọc
        </button>
        <div class="hidden sm:flex items-center gap-1 p-1 bg-surface-hover rounded-lg ml-auto">
          <button
            type="button"
            :class="['p-2 rounded-md transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center', viewMode === 'grid' ? 'bg-surface text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-400 dark:text-zinc-500']"
            :aria-label="'Hiển thị dạng lưới'"
            :aria-pressed="viewMode === 'grid'"
            @click="viewMode = 'grid'"
          >
            <LayoutGrid class="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            :class="['p-2 rounded-md transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center', viewMode === 'list' ? 'bg-surface text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-400 dark:text-zinc-500']"
            :aria-label="'Hiển thị dạng danh sách'"
            :aria-pressed="viewMode === 'list'"
            @click="viewMode = 'list'"
          >
            <Grid2x2 class="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <!-- Category Pills -->
    <div class="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
      <button
        type="button"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-[40px] border',
          !selectedCategory ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300 dark:hover:border-primary-700',
        ]"
        @click="selectedCategory = ''"
      >
        Tất cả
      </button>
      <button
        v-for="cat in mockCategories"
        :key="cat.id"
        type="button"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-[40px] border',
          selectedCategory === cat.id ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300 dark:hover:border-primary-700',
        ]"
        @click="selectedCategory = cat.id"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Results count -->
    <div class="flex items-center justify-between mb-4">
      <p class="text-sm text-gray-500 dark:text-zinc-400">
        {{ loading ? 'Đang tải...' : `${filteredProducts.length} sản phẩm` }}
      </p>
    </div>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <div v-for="i in 8" :key="i" class="card p-4">
          <USkeleton class="h-40 mb-3" />
          <USkeleton class="h-5 w-3/4 mb-2" />
          <USkeleton class="h-4 w-1/2" />
        </div>
      </div>
    </template>

    <!-- Grid view -->
    <template v-else-if="paginatedProducts.length && viewMode === 'grid'">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <NuxtLink
          v-for="(product, i) in paginatedProducts"
          :key="product.id"
          :to="`/products/${product.slug}`"
          class="card card-hover card-gradient p-4 group stagger-item"
          :style="{ animationDelay: `${Math.min(i * 40, 400)}ms` }"
        >
          <div class="aspect-[4/5] rounded-xl bg-surface-muted overflow-hidden mb-3 relative">
            <NuxtImg
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Package class="w-12 h-12 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
            <span
              v-if="product.stock <= 0"
              class="absolute top-2 right-2 badge bg-danger-500 text-white"
            >Hết hàng</span>
            <span
              v-else-if="product.stock <= 10"
              class="absolute top-2 right-2 badge bg-warning-500 text-white"
            >Sắp hết</span>
          </div>
          <h3 class="font-medium text-surface-foreground text-sm sm:text-base truncate mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ product.name }}</h3>
          <p class="text-xs text-gray-400 dark:text-zinc-500 mb-2">{{ product.category }}</p>
          <div class="flex items-center justify-between">
            <p class="text-primary-600 dark:text-primary-400 font-semibold text-sm sm:text-base">{{ formatVND(product.price) }}</p>
            <span class="text-xs text-gray-400 dark:text-zinc-500">/{{ product.unit }}</span>
          </div>
          <div class="mt-3">
            <UButton size="sm" variant="outline" class="w-full group/btn">
              Đặt hàng
              <ChevronRight class="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" aria-hidden="true" />
            </UButton>
          </div>
        </NuxtLink>
      </div>
    </template>

    <!-- List view -->
    <template v-else-if="paginatedProducts.length && viewMode === 'list'">
      <div class="space-y-3">
        <NuxtLink
          v-for="(product, i) in paginatedProducts"
          :key="product.id"
          :to="`/products/${product.slug}`"
          class="card card-hover p-4 flex gap-4 group stagger-item"
          :style="{ animationDelay: `${Math.min(i * 40, 400)}ms` }"
        >
          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-surface-muted overflow-hidden flex-shrink-0">
            <NuxtImg
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Package class="w-8 h-8 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-surface-foreground mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ product.name }}</h3>
            <p class="text-sm text-gray-500 dark:text-zinc-400 line-clamp-1 mb-1">{{ product.description }}</p>
            <div class="flex items-center gap-2 flex-wrap">
              <p class="text-lg font-bold text-primary-600 dark:text-primary-400">{{ formatVND(product.price) }}</p>
              <span class="text-xs text-gray-400 dark:text-zinc-500">/{{ product.unit }}</span>
              <span v-if="product.stock <= 0" class="badge bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400">Hết hàng</span>
              <span v-else class="badge bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400">Còn {{ product.stock }} {{ product.unit }}</span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </template>

    <!-- Empty state -->
    <AppEmptyState
      v-else
      title="Không tìm thấy sản phẩm"
      description="Thử thay đổi từ khóa hoặc bộ lọc để tìm sản phẩm phù hợp"
      cta-text="Đặt hàng nhanh"
      @action="navigateTo('/quick-order')"
    />

    <!-- Pagination -->
    <div v-if="!loading && totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
      <button
        type="button"
        :disabled="currentPage === 1"
        class="px-3 py-2 rounded-lg text-sm font-medium border border-surface-border bg-surface text-surface-foreground hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[40px]"
        @click="currentPage--"
      >
        Trước
      </button>
      <button
        v-for="page in totalPages"
        :key="page"
        type="button"
        :class="[
          'px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors min-h-[40px] min-w-[40px]',
          currentPage === page ? 'bg-primary-600 text-white border-primary-600' : 'bg-surface text-surface-foreground border-surface-border hover:bg-surface-hover',
        ]"
        @click="currentPage = page"
      >{{ page }}</button>
      <button
        type="button"
        :disabled="currentPage === totalPages"
        class="px-3 py-2 rounded-lg text-sm font-medium border border-surface-border bg-surface text-surface-foreground hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[40px]"
        @click="currentPage++"
      >
        Sau
      </button>
    </div>
  </div>
</template>
