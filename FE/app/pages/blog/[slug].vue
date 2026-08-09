<script setup lang="ts">
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  Package,
  Tag,
  Facebook,
  Twitter,
  Link2
} from 'lucide-vue-next'
import DOMPurify from 'dompurify'
const toast = useToast()
const route = useRoute()
definePageMeta({ layout: 'default' })

const slug = route.params.slug as string
const loading = ref(true)
const error = ref(false)

const post = computed(() => mockBlogPosts.find((p) => p.slug === slug && p.status === 'PUBLISHED'))

const relatedPosts = computed(() => {
  if (!post.value) return []
  return mockBlogPosts
    .filter(
      (p) =>
        p.category_id === post.value!.category_id &&
        p.id !== post.value!.id &&
        p.status === 'PUBLISHED'
    )
    .slice(0, 3)
})

const blogCategory = computed(() =>
  mockBlogCategories.find((c) => c.id === post.value?.category_id)
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
  title: post.value ? `${post.value.title} - BunTech` : 'Tin tức - BunTech'
}))
</script>

<template>
  <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <!-- Back -->
    <NuxtLink
      to="/blog"
      class="hover:text-surface-foreground mb-6 -ml-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-2 text-sm text-gray-500 transition-colors dark:text-zinc-400"
    >
      <ArrowLeft class="h-4 w-4" aria-hidden="true" />
      Quay lại
    </NuxtLink>

    <BaseEmptyState v-if="error" title="Lỗi" description="Không tìm thấy bài viết" />

    <template v-else-if="loading">
      <USkeleton class="mb-4 h-8" />
      <USkeleton class="mb-6 h-4 w-1/3" />
      <USkeleton class="mb-6 h-64" />
      <USkeleton class="mb-2 h-4" />
      <USkeleton class="mb-2 h-4" />
      <USkeleton class="h-4 w-3/4" />
    </template>

    <template v-else-if="post">
      <!-- Meta -->
      <div class="mb-3 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-zinc-400">
        <span class="inline-flex items-center gap-1"
          ><Calendar class="h-3.5 w-3.5" aria-hidden="true" />
          {{ formatDate(post.published_at) }}</span
        >
        <span class="inline-flex items-center gap-1"
          ><User class="h-3.5 w-3.5" aria-hidden="true" /> {{ post.author_name }}</span
        >
        <span class="inline-flex items-center gap-1"
          ><Clock class="h-3.5 w-3.5" aria-hidden="true" /> {{ readingTime }} phút đọc</span
        >
      </div>

      <h1
        class="text-surface-foreground mb-6 text-2xl leading-tight font-bold tracking-tight sm:text-4xl"
      >
        {{ post.title }}
      </h1>

      <!-- Featured image -->
      <div
        v-if="post.image_url"
        class="bg-surface-muted mb-8 aspect-[16/9] overflow-hidden rounded-2xl"
      >
        <NuxtImg
          :src="post.image_url"
          :alt="post.title"
          class="h-full w-full object-cover"
          loading="eager"
        />
      </div>

      <!-- Share + category -->
      <div class="border-surface-border mb-8 flex items-center justify-between border-b pb-6">
        <div class="flex items-center gap-2">
          <span
            class="badge bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
          >
            <Tag class="h-3 w-3" aria-hidden="true" />
            {{ blogCategory?.name || 'Tin tức' }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <span class="mr-1 hidden text-xs text-gray-400 sm:inline dark:text-zinc-500"
            >Chia sẻ:</span
          >
          <UButton
            variant="ghost"
            color="neutral"
            type="button"
            class="hover:text-primary-600 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 flex h-9 min-h-[36px] w-9 min-w-[36px] items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-blue-50 dark:text-zinc-500"
            aria-label="Chia sẻ Facebook"
            @click="shareFacebook"
          >
            <Facebook class="h-4 w-4" aria-hidden="true" />
          </UButton>
          <UButton
            variant="ghost"
            color="neutral"
            type="button"
            class="flex h-9 min-h-[36px] w-9 min-w-[36px] items-center justify-center rounded-lg text-gray-400 transition-all hover:bg-sky-50 hover:text-sky-500 dark:text-zinc-500 dark:hover:bg-sky-900/20 dark:hover:text-sky-400"
            aria-label="Chia sẻ Twitter"
            @click="shareTwitter"
          >
            <Twitter class="h-4 w-4" aria-hidden="true" />
          </UButton>
          <UButton
            variant="ghost"
            color="neutral"
            type="button"
            class="hover:text-primary-600 dark:hover:text-primary-400 hover:bg-surface-hover flex h-9 min-h-[36px] w-9 min-w-[36px] items-center justify-center rounded-lg text-gray-400 transition-all dark:text-zinc-500"
            aria-label="Sao chép link"
            @click="sharePost"
          >
            <Link2 class="h-4 w-4" aria-hidden="true" />
          </UButton>
        </div>
      </div>

      <!-- Content -->
      <article
        class="prose prose-sm sm:prose-base [&_h2]:text-surface-foreground [&_a]:text-primary-600 dark:[&_a]:text-primary-400 [&_blockquote]:border-primary-300 dark:[&_blockquote]:border-primary-700 max-w-none leading-relaxed text-gray-700 dark:text-zinc-200 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5"
        v-html="sanitizedContent"
      />

      <!-- Author bio card -->
      <div
        class="bg-surface border-surface-border mt-12 flex items-start gap-4 rounded-xl border p-6"
      >
        <UAvatar :alt="post.author_name || ''" size="lg" />
        <div class="flex-1">
          <div class="mb-1 flex items-center gap-2">
            <p class="text-surface-foreground font-semibold">{{ post.author_name }}</p>
            <UBadge color="primary" size="sm">Tác giả</UBadge>
          </div>
          <p class="text-sm leading-relaxed text-gray-500 dark:text-zinc-400">
            Tác giả tại BunTech với nhiều năm kinh nghiệm trong ngành thực phẩm và ẩm thực Việt. Đam
            mê chia sẻ kiến thức về bún truyền thống và văn hóa ẩm thực.
          </p>
        </div>
      </div>

      <!-- Related Posts -->
      <div v-if="relatedPosts.length" class="mt-12">
        <h2 class="text-surface-foreground mb-6 text-xl font-bold">Bài viết liên quan</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NuxtLink
            v-for="(rp, i) in relatedPosts"
            :key="rp.id"
            :to="`/blog/${rp.slug}`"
            class="card card-hover card-gradient group stagger-item overflow-hidden"
            :style="{ animationDelay: `${i * 60}ms` }"
          >
            <div class="bg-surface-muted aspect-[16/9] overflow-hidden">
              <NuxtImg
                v-if="rp.image_url"
                :src="rp.image_url"
                :alt="rp.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div v-else class="flex h-full w-full items-center justify-center">
                <Package class="h-10 w-10 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </div>
            <div class="p-4">
              <p class="mb-1 text-xs text-gray-400 dark:text-zinc-500">
                {{ formatDate(rp.published_at) }}
              </p>
              <h3
                class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 text-sm font-medium transition-colors"
              >
                {{ rp.title }}
              </h3>
            </div>
          </NuxtLink>
        </div>
      </div>
    </template>
  </div>
</template>
