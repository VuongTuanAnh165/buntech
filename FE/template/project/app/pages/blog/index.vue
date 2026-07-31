<script setup lang="ts">
import { mockBlogPosts, mockBlogCategories } from '~/core/mockData'

const { t } = useI18n()
const { formatDate } = useFormat()
useHead({ title: `${t('nav.news')} - BunTech` })
definePageMeta({ layout: 'default' })

const loading = ref(true)
const posts = ref<Record<string, unknown>[]>([])

async function loadData() {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    posts.value = mockBlogPosts.value
      .filter(p => p.status === 'PUBLISHED' && !p.deleted_at)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        image_url: p.image_url,
        created_at: p.created_at,
        category: mockBlogCategories.value.find(c => c.id === p.category_id) || { name: 'Unknown' }
      })) as Record<string, unknown>[]
  } finally {
    loading.value = false
  }
}
onMounted(loadData)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ t('nav.news') }}</h1>
    <template v-if="loading">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white rounded-2xl border border-gray-100 p-4">
          <div class="skeleton h-40 w-full rounded-xl mb-3" />
          <div class="skeleton h-5 w-3/4 mb-2" />
          <div class="skeleton h-4 w-full" />
        </div>
      </div>
    </template>
    <template v-else-if="posts.length">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <NuxtLink v-for="post in posts" :key="post.id as string" :to="`/blog/${post.slug}`" class="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
          <div class="aspect-video bg-gray-100 overflow-hidden">
            <img v-if="post.image_url" :src="post.image_url as string" :alt="post.title as string" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
          </div>
          <div class="p-4">
            <p class="text-xs text-primary-600 font-medium mb-1">{{ (post.category as Record<string, unknown>)?.name }}</p>
            <h3 class="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{{ post.title }}</h3>
            <p class="text-sm text-gray-500 line-clamp-2 mb-2">{{ post.excerpt }}</p>
            <p class="text-xs text-gray-400">{{ formatDate(post.created_at as string) }}</p>
          </div>
        </NuxtLink>
      </div>
    </template>
    <AppEmptyState v-else :description="t('common.noDataDescription')" />
  </div>
</template>
