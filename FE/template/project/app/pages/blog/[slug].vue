<script setup lang="ts">
import { mockBlogPosts, mockBlogCategories } from '~/core/mockData'
import DOMPurify from 'dompurify'
import { ArrowLeft } from 'lucide-vue-next'
const { t } = useI18n()
const route = useRoute()
const { formatDate, formatDateTime } = useFormat()
definePageMeta({ layout: 'default' })

const slug = route.params.slug as string
const loading = ref(true)
const error = ref(false)
const post = ref<Record<string, unknown> | null>(null)

async function loadPost() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    const p = mockBlogPosts.value.find(p => p.slug === slug && p.status === 'PUBLISHED' && !p.deleted_at)
    if (p) {
      post.value = {
        ...p,
        category: mockBlogCategories.value.find(c => c.id === p.category_id) || { name: 'Unknown' }
      } as Record<string, unknown>
      useHead({ title: `${post.value.title} - BunTech` })
    } else {
      error.value = true
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

const sanitizedContent = computed(() => DOMPurify.sanitize((post.value?.content as string) || ''))

onMounted(loadPost)
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <AppErrorState v-if="error" @retry="loadPost" />
    <template v-if="loading">
      <div class="skeleton h-10 w-3/4 mb-4" />
      <div class="skeleton h-6 w-1/3 mb-8" />
      <div class="skeleton h-64 w-full rounded-xl" />
    </template>
    <template v-else-if="post">
      <NuxtLink to="/blog" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
      </NuxtLink>
      <p class="text-sm text-primary-600 font-medium mb-2">{{ (post.category as Record<string, unknown>)?.name }}</p>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ post.title }}</h1>
      <p class="text-sm text-gray-400 mb-6">{{ formatDateTime(post.created_at as string) }}</p>
      <img v-if="post.image_url" :src="post.image_url as string" :alt="post.title as string" class="w-full aspect-video object-cover rounded-2xl mb-8" loading="lazy">
      <div class="prose prose-lg max-w-none" v-html="sanitizedContent" />
    </template>
  </div>
</template>
