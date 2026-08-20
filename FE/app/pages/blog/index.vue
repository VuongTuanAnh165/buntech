<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { blogService } from '~/services/blogService'
import type { BlogPost, BlogCategory } from '~/utils/types'
import { normalizePaginationResponse } from '~/utils/api'
import { extractIdFromSlug, generateSeoSlug } from '~/utils/idEncoder'
import { t } from '~/utils/i18n'

useSeoMeta({ title: t('public_blog_seo_title') })
definePageMeta({ layout: 'default' })

const search = ref('')
const selectedCategory = ref<string>('')
const currentPage = ref(1)
const perPage = 10

// Categories
const { data: catRes } = useAsyncData('public-categories', () => blogService.getPublicCategories())
const categories = computed<BlogCategory[]>(() => catRes.value?.data || [])

// Posts
const { data: postsRes, pending: loading } = useAsyncData(
  'public-posts',
  () =>
    blogService.getPublicPosts({
      page: currentPage.value,
      limit: perPage,
      categoryId: selectedCategory.value
        ? extractIdFromSlug(selectedCategory.value) || undefined
        : undefined
    }),
  { watch: [currentPage, selectedCategory] }
)

const normalized = computed(() => normalizePaginationResponse<BlogPost>(postsRes.value))
const posts = computed<BlogPost[]>(() => normalized.value.data)
const meta = computed(() => normalized.value.meta)

// Local filter for search
const filteredPosts = computed(() => {
  if (!search.value.trim()) return posts.value
  const q = search.value.toLowerCase()
  return posts.value.filter(
    (p: BlogPost) =>
      p.title.toLowerCase().includes(q) || (p.excerpt && p.excerpt.toLowerCase().includes(q))
  )
})

const featuredPost = computed(() => filteredPosts.value[0] || null)
const remainingPosts = computed(() => filteredPosts.value.slice(1))

const totalPages = computed(() => meta.value.lastPage || Math.ceil(meta.value.total / perPage))

watch([search, selectedCategory], () => {
  if (currentPage.value !== 1) currentPage.value = 1
})

const clearFilters = () => {
  selectedCategory.value = ''
  search.value = ''
  currentPage.value = 1
}
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
            >{{ $t('nav_home') }}</NuxtLink
          >
        </li>
        <li class="text-gray-300 dark:text-zinc-600" aria-hidden="true">/</li>
        <li aria-current="page" class="text-surface-foreground font-medium">
          {{ $t('nav_news') }}
        </li>
      </ol>
    </nav>
    <h1 class="text-surface-foreground mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
      {{ $t('public_blog_title') }}
    </h1>
    <p class="mb-8 text-sm text-gray-500 dark:text-zinc-400">
      {{ $t('public_blog_subtitle') }}
    </p>

    <!-- Search -->
    <div class="mb-6 flex flex-wrap items-center gap-3">
      <BaseSearchInput
        v-model="search"
        :placeholder="$t('public_blog_search_ph')"
        class="max-w-md min-w-[200px] flex-1"
      />
      <UButton
        v-if="search || selectedCategory"
        variant="ghost"
        color="neutral"
        type="button"
        class="hover:text-danger-600 dark:hover:text-danger-400 inline-flex min-h-[44px] items-center gap-1 px-2 text-sm text-gray-500 transition-colors dark:text-zinc-400"
        @click="clearFilters"
      >
        <X class="h-4 w-4" aria-hidden="true" />
        {{ $t('public_blog_btn_clear') }}
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
        @click="
          () => {
            selectedCategory = ''
          }
        "
      >
        {{ $t('admin_debt_type_all') }}
      </UButton>
      <UButton
        v-for="cat in categories"
        :key="cat.id"
        variant="ghost"
        color="neutral"
        type="button"
        :class="[
          'min-h-[40px] rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all',
          selectedCategory === generateSeoSlug(cat.slug, cat.id)
            ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
            : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300'
        ]"
        @click="
          () => {
            selectedCategory = generateSeoSlug(cat.slug, cat.id)
          }
        "
      >
        {{ cat.name }}
      </UButton>
    </div>

    <!-- Loading -->
    <template v-if="loading && !posts.length">
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
      <DomainBlogPostCard v-if="featuredPost" :post="featuredPost" :is-featured="true" />

      <!-- Posts grid -->
      <div
        v-if="remainingPosts.length"
        class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <DomainBlogPostCard
          v-for="(post, i) in remainingPosts"
          :key="post.id"
          :post="post"
          :index="i"
        />
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          type="button"
          :disabled="currentPage === 1"
          class="border-surface-border bg-surface text-surface-foreground hover:bg-surface-hover min-h-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          @click="
            () => {
              currentPage--
            }
          "
        >
          {{ $t('public_blog_btn_prev') }}
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
          @click="
            () => {
              currentPage = page
            }
          "
          >{{ page }}</UButton
        >
        <UButton
          variant="ghost"
          color="neutral"
          type="button"
          :disabled="currentPage === totalPages"
          class="border-surface-border bg-surface text-surface-foreground hover:bg-surface-hover min-h-[40px] rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          @click="
            () => {
              currentPage++
            }
          "
        >
          {{ $t('public_blog_btn_next') }}
        </UButton>
      </div>
    </template>

    <BaseEmptyState
      v-else
      :title="$t('admin_blog_empty_title')"
      :description="$t('public_blog_not_found_desc')"
    />
  </div>
</template>
