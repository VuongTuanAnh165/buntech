<script setup lang="ts">
import { Grid2x2, LayoutGrid, Package, X, Search, ChevronDown } from 'lucide-vue-next'
useSeoMeta({ title: 'Sản phẩm - BunTech' })
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
  { value: 'name', label: 'Tên A → Z' }
]
const filteredProducts = computed(() => {
  let result = mockProducts.filter((p) => p.status === 'ACTIVE')
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    )
  }
  if (selectedCategory.value) {
    result = result.filter((p) => p.category_id === selectedCategory.value)
  }
  switch (sortBy.value) {
    case 'price-asc':
      result = [...result].sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result = [...result].sort((a, b) => b.price - a.price)
      break
    case 'name':
      result = [...result].sort((a, b) => a.name.localeCompare(b.name))
      break
    default:
      result = [...result].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
  }
  return result
})
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / perPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredProducts.value.slice(start, start + perPage)
})
const hasActiveFilters = computed(
  () => selectedCategory.value || search.value || sortBy.value !== 'latest'
)
watch([search, selectedCategory, sortBy], () => {
  currentPage.value = 1
})
const clearFilters = () => {
  selectedCategory.value = ''
  search.value = ''
  sortBy.value = 'latest'
  currentPage.value = 1
}
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 400)
})
</script>
<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <!-- Header -->
    <div class="mb-8">
      <nav aria-label="Breadcrumb" class="mb-4">
        <ol class="flex items-center gap-1.5 text-sm">
          <li>
            <NuxtLink
              to="/"
              class="hover:text-primary-600 dark:hover:text-primary-400 text-gray-500 transition-colors dark:text-zinc-400"
              >Trang chủ</NuxtLink
            >
          </li>
          <li class="text-gray-300 dark:text-zinc-600" aria-hidden="true">/</li>
          <li aria-current="page" class="text-surface-foreground font-medium">Sản phẩm</li>
        </ol>
      </nav>
      <h1 class="text-surface-foreground mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
        Tất cả sản phẩm
      </h1>
      <p class="text-sm text-gray-500 dark:text-zinc-400">
        Bún tươi thủ công, giao hàng tận nơi trong 2 giờ
      </p>
    </div>
    <!-- Search & Sort Bar -->
    <div class="card mb-6 p-4">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative max-w-md min-w-[200px] flex-1">
          <Search
            class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
            aria-hidden="true"
          />
          <UInput
            v-model="search"
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            class="form-input min-h-[44px] pr-4 pl-10"
          />
        </div>
        <div class="relative">
          <select
            v-model="sortBy"
            class="border-surface-border bg-surface text-surface-foreground focus:border-primary-500 focus:ring-primary-500/15 min-h-[44px] cursor-pointer appearance-none rounded-lg border py-2.5 pr-10 pl-3.5 text-sm font-medium transition-all focus:ring-2 focus:outline-none"
            aria-label="Sắp xếp"
          >
            <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <ChevronDown
            class="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
            aria-hidden="true"
          />
        </div>
        <UButton
          v-if="hasActiveFilters"
          variant="ghost"
          color="neutral"
          type="button"
          class="hover:text-danger-600 dark:hover:text-danger-400 inline-flex min-h-[44px] items-center gap-1 px-2 text-sm text-gray-500 transition-colors dark:text-zinc-400"
          @click="clearFilters"
        >
          <X class="h-4 w-4" aria-hidden="true" />
          Xóa lọc
        </UButton>
        <div class="bg-surface-hover ml-auto hidden items-center gap-1 rounded-lg p-1 sm:flex">
          <UButton
            variant="ghost"
            color="neutral"
            type="button"
            :class="[
              'flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md p-2 transition-colors',
              viewMode === 'grid'
                ? 'bg-surface text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-400 dark:text-zinc-500'
            ]"
            :aria-label="'Hiển thị dạng lưới'"
            :aria-pressed="viewMode === 'grid'"
            @click="viewMode = 'grid'"
          >
            <LayoutGrid class="h-4 w-4" aria-hidden="true" />
          </UButton>
          <UButton
            variant="ghost"
            color="neutral"
            type="button"
            :class="[
              'flex min-h-[36px] min-w-[36px] items-center justify-center rounded-md p-2 transition-colors',
              viewMode === 'list'
                ? 'bg-surface text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-400 dark:text-zinc-500'
            ]"
            :aria-label="'Hiển thị dạng danh sách'"
            :aria-pressed="viewMode === 'list'"
            @click="viewMode = 'list'"
          >
            <Grid2x2 class="h-4 w-4" aria-hidden="true" />
          </UButton>
        </div>
      </div>
    </div>
    <!-- Category Pills -->
    <div class="scrollbar-hide mb-6 flex items-center gap-2 overflow-x-auto pb-1">
      <UButton
        variant="ghost"
        color="neutral"
        type="button"
        :class="[
          'min-h-[40px] rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
          !selectedCategory
            ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
            : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300 dark:hover:border-primary-700'
        ]"
        @click="selectedCategory = ''"
      >
        Tất cả
      </UButton>
      <UButton
        v-for="cat in mockCategories"
        :key="cat.id"
        variant="ghost"
        color="neutral"
        type="button"
        :class="[
          'min-h-[40px] rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
          selectedCategory === cat.id
            ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
            : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300 dark:hover:border-primary-700'
        ]"
        @click="selectedCategory = cat.id"
      >
        {{ cat.name }}
      </UButton>
    </div>
    <!-- Results count -->
    <div class="mb-4 flex items-center justify-between">
      <p class="text-sm text-gray-500 dark:text-zinc-400">
        {{ loading ? 'Đang tải...' : `${filteredProducts.length} sản phẩm` }}
      </p>
    </div>
    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        <div v-for="i in 8" :key="i" class="card p-4">
          <USkeleton class="mb-3 h-40" />
          <USkeleton class="mb-2 h-5 w-3/4" />
          <USkeleton class="h-4 w-1/2" />
        </div>
      </div>
    </template>
    <!-- Grid view -->
    <template v-else-if="paginatedProducts.length && viewMode === 'grid'">
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
        <NuxtLink
          v-for="(product, i) in paginatedProducts"
          :key="product.id"
          :to="`/products/${product.slug}`"
          class="card card-hover card-gradient group stagger-item p-4"
          :style="{ animationDelay: `${Math.min(i * 40, 400)}ms` }"
        >
          <div class="bg-surface-muted relative mb-3 aspect-[4/5] overflow-hidden rounded-xl">
            <NuxtImg
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Package class="h-12 w-12 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
            <span
              v-if="product.stock <= 0"
              class="badge bg-danger-500 absolute top-2 right-2 text-white"
              >Hết hàng</span
            >
            <span
              v-else-if="product.stock <= 10"
              class="badge bg-warning-500 absolute top-2 right-2 text-white"
              >Sắp hết</span
            >
          </div>
          <h3
            class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-1 truncate text-sm font-medium transition-colors sm:text-base"
          >
            {{ product.name }}
          </h3>
          <p class="mb-2 text-xs text-gray-400 dark:text-zinc-500">{{ product.category }}</p>
          <div class="flex items-center justify-between">
            <p class="text-primary-600 dark:text-primary-400 text-sm font-semibold sm:text-base">
              {{ formatVND(product.price) }}
            </p>
            <span class="text-xs text-gray-400 dark:text-zinc-500">/{{ product.unit }}</span>
          </div>
          <div class="mt-3">
            <UButton size="sm" variant="outline" class="group/btn w-full">
              Đặt hàng
              <ChevronRight
                class="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5"
                aria-hidden="true"
              />
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
          class="card card-hover group stagger-item flex gap-4 p-4"
          :style="{ animationDelay: `${Math.min(i * 40, 400)}ms` }"
        >
          <div
            class="bg-surface-muted h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24"
          >
            <NuxtImg
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Package class="h-8 w-8 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <h3
              class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-1 font-semibold transition-colors"
            >
              {{ product.name }}
            </h3>
            <p class="mb-1 line-clamp-1 text-sm text-gray-500 dark:text-zinc-400">
              {{ product.description }}
            </p>
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-primary-600 dark:text-primary-400 text-lg font-bold">
                {{ formatVND(product.price) }}
              </p>
              <span class="text-xs text-gray-400 dark:text-zinc-500">/{{ product.unit }}</span>
              <span
                v-if="product.stock <= 0"
                class="badge bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400"
                >Hết hàng</span
              >
              <span
                v-else
                class="badge bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                >Còn {{ product.stock }} {{ product.unit }}</span
              >
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
    <div v-if="!loading && totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
      <UButton
        variant="ghost"
        color="neutral"
        type="button"
        :disabled="currentPage === 1"
        class="border-surface-border bg-surface text-surface-foreground hover:bg-surface-hover min-h-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        @click="currentPage--"
      >
        Trước
      </UButton>
      <UButton
        v-for="page in totalPages"
        :key="page"
        variant="ghost"
        color="neutral"
        type="button"
        :class="[
          'min-h-[40px] min-w-[40px] rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors',
          currentPage === page
            ? 'bg-primary-600 border-primary-600 text-white'
            : 'bg-surface text-surface-foreground border-surface-border hover:bg-surface-hover'
        ]"
        @click="currentPage = page"
        >{{ page }}</UButton
      >
      <UButton
        variant="ghost"
        color="neutral"
        type="button"
        :disabled="currentPage === totalPages"
        class="border-surface-border bg-surface text-surface-foreground hover:bg-surface-hover min-h-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        @click="currentPage++"
      >
        Sau
      </UButton>
    </div>
  </div>
</template>
