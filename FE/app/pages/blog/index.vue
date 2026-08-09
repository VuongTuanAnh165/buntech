<script setup lang="ts">
import { Package, Search, ChevronRight, Calendar, User, X } from 'lucide-vue-next'
useSeoMeta({ title: 'Tin tức - BunTech' })
definePageMeta({ layout: 'default' })
const loading = ref(true)
const search = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const perPage = 9
const allPosts = computed(() => mockBlogPosts.filter((p) => p.status === 'PUBLISHED'))
const filteredPosts = computed(() => {
  let result = allPosts.value
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(
      (p) => p.title.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q)
    )
  }
  if (selectedCategory.value) {
    result = result.filter((p) => p.category_id === selectedCategory.value)
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
watch([search, selectedCategory], () => {
  currentPage.value = 1
})
const clearFilters = () => {
  selectedCategory.value = ''
  search.value = ''
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
        <li aria-current="page" class="text-surface-foreground font-medium">Tin tức</li>
      </ol>
    </nav>
    <h1 class="text-surface-foreground mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
      Tin tức & Mẹo hay
    </h1>
    <p class="mb-8 text-sm text-gray-500 dark:text-zinc-400">
      Cập nhật kiến thức về bún, ẩm thực và mẹo kinh doanh
    </p>
    <!-- Search -->
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <div class="relative max-w-md min-w-[200px] flex-1">
        <Search
          class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
          aria-hidden="true"
        />
        <UInput
          v-model="search"
          type="text"
          placeholder="Tìm kiếm bài viết..."
          class="border-surface-border bg-surface text-surface-foreground focus:border-primary-400 focus:ring-primary-500/10 min-h-[44px] w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm placeholder-gray-400 transition-all focus:ring-4 focus:outline-none dark:placeholder-zinc-500"
        />
      </div>
      <UButton
        v-if="search || selectedCategory"
        variant="ghost"
        color="neutral"
        type="button"
        class="hover:text-danger-600 dark:hover:text-danger-400 inline-flex min-h-[44px] items-center gap-1 px-2 text-sm text-gray-500 transition-colors dark:text-zinc-400"
        @click="clearFilters"
      >
        <X class="h-4 w-4" aria-hidden="true" />
        Xóa lọc
      </UButton>
    </div>
    <!-- Category pills -->
    <div class="scrollbar-hide mb-8 flex items-center gap-2 overflow-x-auto pb-1">
      <UButton
        variant="ghost"
        color="neutral"
        type="button"
        :class="[
          'min-h-[40px] rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
          !selectedCategory
            ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
            : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300'
        ]"
        @click="selectedCategory = ''"
      >
        Tất cả
      </UButton>
      <UButton
        v-for="cat in mockBlogCategories"
        :key="cat.id"
        variant="ghost"
        color="neutral"
        type="button"
        :class="[
          'min-h-[40px] rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
          selectedCategory === cat.id
            ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
            : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300'
        ]"
        @click="selectedCategory = cat.id"
      >
        {{ cat.name }}
      </UButton>
    </div>
    <!-- Loading -->
    <template v-if="loading">
      <!-- Featured skeleton -->
      <div class="card mb-8 overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <USkeleton class="h-64 lg:h-full" />
          <div class="space-y-3 p-6">
            <USkeleton class="h-4 w-1/4" />
            <USkeleton class="h-8" />
            <USkeleton class="h-4" />
            <USkeleton class="h-4 w-3/4" />
          </div>
        </div>
      </div>
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="card p-5">
          <USkeleton class="mb-4 h-40" />
          <USkeleton class="mb-2 h-5" />
          <USkeleton class="h-4 w-3/4" />
        </div>
      </div>
    </template>
    <template v-else-if="filteredPosts.length">
      <!-- Featured post -->
      <NuxtLink
        v-if="featuredPost"
        :to="`/blog/${featuredPost.slug}`"
        class="card card-hover group stagger-item mb-8 block overflow-hidden"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="bg-surface-muted aspect-[16/9] overflow-hidden lg:aspect-auto">
            <NuxtImg
              v-if="featuredPost.image_url"
              :src="featuredPost.image_url"
              :alt="featuredPost.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="eager"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Package class="h-16 w-16 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
          </div>
          <div class="flex flex-col justify-center p-6 sm:p-8">
            <div class="mb-3 flex items-center gap-2">
              <span
                class="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                >Nổi bật</span
              >
              <span class="text-xs text-gray-400 dark:text-zinc-500">{{
                formatDate(featuredPost.published_at)
              }}</span>
            </div>
            <h2
              class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-3 text-xl leading-tight font-bold transition-colors sm:text-2xl"
            >
              {{ featuredPost.title }}
            </h2>
            <p class="mb-4 line-clamp-3 text-sm text-gray-500 dark:text-zinc-400">
              {{ featuredPost.excerpt }}
            </p>
            <div
              class="text-primary-600 dark:text-primary-400 flex items-center gap-2 text-sm font-medium transition-all group-hover:gap-3"
            >
              Đọc tiếp
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </NuxtLink>
      <!-- Posts grid -->
      <div
        v-if="paginatedPosts.length"
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <NuxtLink
          v-for="(post, i) in paginatedPosts"
          :key="post.id"
          :to="`/blog/${post.slug}`"
          class="card card-hover group stagger-item overflow-hidden"
          :style="{ animationDelay: `${Math.min(i * 50, 300)}ms` }"
        >
          <div class="bg-surface-muted aspect-[16/9] overflow-hidden">
            <NuxtImg
              v-if="post.image_url"
              :src="post.image_url"
              :alt="post.title"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Package class="h-12 w-12 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
          </div>
          <div class="p-5">
            <div class="mb-2 flex items-center gap-2 text-xs text-gray-400 dark:text-zinc-500">
              <span class="inline-flex items-center gap-1"
                ><Calendar class="h-3 w-3" aria-hidden="true" />
                {{ formatDate(post.published_at) }}</span
              >
              <span aria-hidden="true">•</span>
              <span class="inline-flex items-center gap-1"
                ><User class="h-3 w-3" aria-hidden="true" /> {{ post.author_name }}</span
              >
            </div>
            <h3
              class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-2 line-clamp-2 font-semibold transition-colors"
            >
              {{ post.title }}
            </h3>
            <p class="line-clamp-2 text-sm text-gray-500 dark:text-zinc-400">{{ post.excerpt }}</p>
            <div
              class="text-primary-600 dark:text-primary-400 mt-3 flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2"
            >
              Đọc tiếp
              <ChevronRight class="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
        </NuxtLink>
      </div>
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
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
    </template>
    <AppEmptyState
      v-else
      title="Không tìm thấy bài viết"
      description="Thử thay đổi từ khóa hoặc danh mục để tìm bài viết phù hợp"
    />
  </div>
</template>
