<script setup lang="ts">
import { ArrowLeft, Calendar, User, Clock, Package, Tag, Facebook, Twitter, Link2 } from 'lucide-vue-next'
import DOMPurify from 'dompurify'
const toast = useToast()
const route = useRoute()definePageMeta({ layout: 'default' })

const slug = route.params.slug as string
const loading = ref(true)
const error = ref(false)

const post = computed(() =>
  mockBlogPosts.find(p => p.slug === slug && p.status === 'PUBLISHED')
)

const relatedPosts = computed(() => {
  if (!post.value) return []
  return mockBlogPosts
    .filter(p => p.category_id === post.value!.category_id && p.id !== post.value!.id && p.status === 'PUBLISHED')
    .slice(0, 3)
})

const blogCategory = computed(() =>
  mockBlogCategories.find(c => c.id === post.value?.category_id)
)

const readingTime = computed(() => {
  if (!post.value?.content) return 1
  const words = String(post.value.content).split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
})

const sanitizedContent = computed(() => {
  if (!post.value?.content) return ''
  return DOMPurify.sanitize(String(post.value.content))
})

const sharePost = () => {
  if (import.meta.client) {
    navigator.clipboard.writeText(window.location.href)
    toast.add({ title: 'Thành công', description: '', color: 'success' })
  }
}

const shareFacebook = () => {
  toast.add({ title: 'Thông báo', description: '', color: 'info' })
}

const shareTwitter = () => {
  toast.add({ title: 'Thông báo', description: '', color: 'info' })
}

onMounted(() => {
  setTimeout(() => {
    if (!post.value) {
      error.value = true
    }
    loading.value = false
  }, 400)
})

useHead(() => ({
  title: post.value ? `${post.value.title} - BunTech` : 'Tin tức - BunTech',
}))
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Back -->
    <NuxtLink to="/blog" class="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-zinc-400 hover:text-surface-foreground transition-colors mb-6 min-h-[44px] px-2 -ml-2 rounded-md">
      <ArrowLeft class="w-4 h-4" aria-hidden="true" />
      Quay lại
    </NuxtLink>

    <BaseEmptyState v-if="error" title="Lỗi" description="Không tìm thấy bài viết" />

    <template v-else-if="loading">
      <USkeleton class="h-8 mb-4" />
      <USkeleton class="h-4 w-1/3 mb-6" />
      <USkeleton class="h-64 mb-6" />
      <USkeleton class="h-4 mb-2" />
      <USkeleton class="h-4 mb-2" />
      <USkeleton class="h-4 w-3/4" />
    </template>

    <template v-else-if="post">
      <!-- Meta -->
      <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-zinc-400 mb-3 flex-wrap">
        <span class="inline-flex items-center gap-1"><Calendar class="w-3.5 h-3.5" aria-hidden="true" /> {{ formatDate(post.published_at) }}</span>
        <span class="inline-flex items-center gap-1"><User class="w-3.5 h-3.5" aria-hidden="true" /> {{ post.author_name }}</span>
        <span class="inline-flex items-center gap-1"><Clock class="w-3.5 h-3.5" aria-hidden="true" /> {{ readingTime }} phút đọc</span>
      </div>

      <h1 class="text-2xl sm:text-4xl font-bold text-surface-foreground mb-6 tracking-tight leading-tight">{{ post.title }}</h1>

      <!-- Featured image -->
      <div v-if="post.image_url" class="aspect-[16/9] rounded-2xl overflow-hidden mb-8 bg-surface-muted">
        <NuxtImg :src="post.image_url" :alt="post.title" class="w-full h-full object-cover" loading="eager"/>
      </div>

      <!-- Share + category -->
      <div class="flex items-center justify-between mb-8 pb-6 border-b border-surface-border">
        <div class="flex items-center gap-2">
          <span class="badge bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
            <Tag class="w-3 h-3" aria-hidden="true" />
            {{ blogCategory?.name || 'Tin tức' }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-xs text-gray-400 dark:text-zinc-500 mr-1 hidden sm:inline">Chia sẻ:</span>
          <UButton variant="ghost" color="neutral"
            type="button"
            class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-blue-50 dark:hover:bg-primary-900/20 transition-all min-w-[36px] min-h-[36px]"
            aria-label="Chia sẻ Facebook"
            @click="shareFacebook"
          >
            <Facebook class="w-4 h-4" aria-hidden="true" />
          </UButton>
          <UButton variant="ghost" color="neutral"
            type="button"
            class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all min-w-[36px] min-h-[36px]"
            aria-label="Chia sẻ Twitter"
            @click="shareTwitter"
          >
            <Twitter class="w-4 h-4" aria-hidden="true" />
          </UButton>
          <UButton variant="ghost" color="neutral"
            type="button"
            class="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-hover transition-all min-w-[36px] min-h-[36px]"
            aria-label="Sao chép link"
            @click="sharePost"
          >
            <Link2 class="w-4 h-4" aria-hidden="true" />
          </UButton>
        </div>
      </div>

      <!-- Content -->
      <article class="prose prose-sm sm:prose-base max-w-none text-gray-700 dark:text-zinc-200 leading-relaxed [&_p]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-surface-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary-600 dark:[&_a]:text-primary-400 [&_a]:underline [&_img]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-primary-300 dark:[&_blockquote]:border-primary-700 [&_blockquote]:pl-4 [&_blockquote]:italic" v-html="sanitizedContent" />

      <!-- Author bio card -->
      <div class="bg-surface p-6 mt-12 flex items-start gap-4 rounded-xl border border-surface-border">
        <UAvatar :alt="post.author_name || ''" size="lg" />
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <p class="font-semibold text-surface-foreground">{{ post.author_name }}</p>
            <UBadge color="primary" size="sm">Tác giả</UBadge>
          </div>
          <p class="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
            Tác giả tại BunTech với nhiều năm kinh nghiệm trong ngành thực phẩm và ẩm thực Việt.
            Đam mê chia sẻ kiến thức về bún truyền thống và văn hóa ẩm thực.
          </p>
        </div>
      </div>

      <!-- Related Posts -->
      <div v-if="relatedPosts.length" class="mt-12">
        <h2 class="text-xl font-bold text-surface-foreground mb-6">Bài viết liên quan</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <NuxtLink
            v-for="(rp, i) in relatedPosts"
            :key="rp.id"
            :to="`/blog/${rp.slug}`"
            class="card card-hover card-gradient overflow-hidden group stagger-item"
            :style="{ animationDelay: `${i * 60}ms` }"
          >
            <div class="aspect-[16/9] bg-surface-muted overflow-hidden">
              <NuxtImg
                v-if="rp.image_url"
                :src="rp.image_url"
                :alt="rp.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Package class="w-10 h-10 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </div>
            <div class="p-4">
              <p class="text-xs text-gray-400 dark:text-zinc-500 mb-1">{{ formatDate(rp.published_at) }}</p>
              <h3 class="font-medium text-surface-foreground text-sm line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ rp.title }}</h3>
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>
