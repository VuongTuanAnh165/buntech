<script setup lang="ts">
import { Package, Search, ChevronRight, Calendar, User, X } from 'lucide-vue-next'

const { formatDate } = useFormat()

useSeoMeta({ title: 'Tin tức - BunTech' })
definePageMeta({ layout: 'default' })

const loading = ref(true)
const search = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const perPage = 9

const allPosts = computed(() =>
  mockBlogPosts.filter(p => p.status === 'PUBLISHED')
)

const filteredPosts = computed(() => {
  let result = allPosts.value
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(p => p.title.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q))
  }
  if (selectedCategory.value) {
    result = result.filter(p => p.category_id === selectedCategory.value)
  }
  return result
})

const featuredPost = computed(() => filteredPosts.value[0] || null)
const remainingPosts = computed(() => filteredPosts.value.slice(1))
const totalPages = computed(() => Math.ceil(remainingPosts.value.length / perPage))
const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return remainingPosts.value.slice(start, start + perPage)
})

watch([search, selectedCategory], () => { currentPage.value = 1 })

const clearFilters = () => {
  selectedCategory.value = ''
  search.value = ''
  currentPage.value = 1
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Header -->
    <nav aria-label="Breadcrumb" class="mb-4">
      <ol class="flex items-center gap-1.5 text-sm">
        <li><NuxtLink to="/" class="text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Trang chủ</NuxtLink></li>
        <li class="text-gray-300 dark:text-zinc-600" aria-hidden="true">/</li>
        <li aria-current="page" class="text-surface-foreground font-medium">Tin tức</li>
      </ol>
    </nav>
    <h1 class="text-2xl sm:text-3xl font-bold text-surface-foreground tracking-tight mb-2">Tin tức & Mẹo hay</h1>
    <p class="text-sm text-gray-500 dark:text-zinc-400 mb-8">Cập nhật kiến thức về bún, ẩm thực và mẹo kinh doanh</p>

    <!-- Search -->
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <div class="flex-1 min-w-[200px] max-w-md relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" aria-hidden="true" />
        <UInput
          v-model="search"
          type="text"
          placeholder="Tìm kiếm bài viết..."
          class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-border bg-surface text-sm text-surface-foreground placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all min-h-[44px]"
         />
      </div>
      <UButton variant="ghost" color="neutral"
        v-if="search || selectedCategory"
        type="button"
        class="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-zinc-400 hover:text-danger-600 dark:hover:text-danger-400 transition-colors min-h-[44px] px-2"
        @click="clearFilters"
      >
        <X class="w-4 h-4" aria-hidden="true" />
        Xóa lọc
      </UButton>
    </div>

    <!-- Category pills -->
    <div class="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
      <UButton variant="ghost" color="neutral"
        type="button"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-[40px] border',
          !selectedCategory ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300',
        ]"
        @click="selectedCategory = ''"
      >
        Tất cả
      </UButton>
      <UButton variant="ghost" color="neutral"
        v-for="cat in mockBlogCategories"
        :key="cat.id"
        type="button"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-[40px] border',
          selectedCategory === cat.id ? 'bg-primary-600 text-white border-primary-600 shadow-sm' : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300',
        ]"
        @click="selectedCategory = cat.id"
      >
        {{ cat.name }}
      </UButton>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <!-- Featured skeleton -->
      <div class="card overflow-hidden mb-8">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <USkeleton class="h-64 lg:h-full" />
          <div class="p-6 space-y-3">
            <USkeleton class="h-4 w-1/4" />
            <USkeleton class="h-8" />
            <USkeleton class="h-4" />
            <USkeleton class="h-4 w-3/4" />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="card p-5">
          <USkeleton class="h-40 mb-4" />
          <USkeleton class="h-5 mb-2" />
          <USkeleton class="h-4 w-3/4" />
        </div>
      </div>
    </template>

    <template v-else-if="filteredPosts.length">
      <!-- Featured post -->
      <NuxtLink
        v-if="featuredPost"
        :to="`/blog/${featuredPost.slug}`"
        class="card card-hover overflow-hidden group mb-8 block stagger-item"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="aspect-[16/9] lg:aspect-auto bg-surface-muted overflow-hidden">
            <NuxtImg
              v-if="featuredPost.image_url"
              :src="featuredPost.image_url"
              :alt="featuredPost.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="eager"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Package class="w-16 h-16 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
          </div>
          <div class="p-6 sm:p-8 flex flex-col justify-center">
            <div class="flex items-center gap-2 mb-3">
              <span class="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">Nổi bật</span>
              <span class="text-xs text-gray-400 dark:text-zinc-500">{{ formatDate(featuredPost.published_at) }}</span>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-surface-foreground mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-tight">{{ featuredPost.title }}</h2>
            <p class="text-sm text-gray-500 dark:text-zinc-400 line-clamp-3 mb-4">{{ featuredPost.excerpt }}</p>
            <div class="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-medium group-hover:gap-3 transition-all">
              Đọc tiếp
              <ChevronRight class="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </NuxtLink>

      <!-- Posts grid -->
      <div v-if="paginatedPosts.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="(post, i) in paginatedPosts"
          :key="post.id"
          :to="`/blog/${post.slug}`"
          class="card card-hover overflow-hidden group stagger-item"
          :style="{ animationDelay: `${Math.min(i * 50, 300)}ms` }"
        >
          <div class="aspect-[16/9] bg-surface-muted overflow-hidden">
            <NuxtImg
              v-if="post.image_url"
              :src="post.image_url"
              :alt="post.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Package class="w-12 h-12 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
          </div>
          <div class="p-5">
            <div class="flex items-center gap-2 text-xs text-gray-400 dark:text-zinc-500 mb-2">
              <span class="inline-flex items-center gap-1"><Calendar class="w-3 h-3" aria-hidden="true" /> {{ formatDate(post.published_at) }}</span>
              <span aria-hidden="true">•</span>
              <span class="inline-flex items-center gap-1"><User class="w-3 h-3" aria-hidden="true" /> {{ post.author_name }}</span>
            </div>
            <h3 class="font-semibold text-surface-foreground mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ post.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2">{{ post.excerpt }}</p>
            <div class="flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 font-medium mt-3 group-hover:gap-2 transition-all">
              Đọc tiếp
              <ChevronRight class="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-8">
        <UButton variant="ghost" color="neutral"
          type="button"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg text-sm font-medium border border-surface-border bg-surface text-surface-foreground hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[40px]"
          @click="currentPage--"
        >
          Trước
        </UButton>
        <UButton variant="ghost" color="neutral"
          v-for="page in totalPages"
          :key="page"
          type="button"
          :class="[
            'px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors min-h-[40px] min-w-[40px]',
            currentPage === page ? 'bg-primary-600 text-white border-primary-600' : 'bg-surface text-surface-foreground border-surface-border hover:bg-surface-hover',
          ]"
          @click="currentPage = page"
        >{{ page }}</UButton>
        <UButton variant="ghost" color="neutral"
          type="button"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 rounded-lg text-sm font-medium border border-surface-border bg-surface text-surface-foreground hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[40px]"
          @click="currentPage++"
        >
          Sau
        </UButton>
      </div>
    </template>

    <AppEmptyState
      v-else
      title="Không tìm thấy bài viết"
      description="Thử thay đổi từ khóa hoặc danh mục để tìm bài viết phù hợp"
    />
  </div>
</template>
