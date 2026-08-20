<script setup lang="ts">
import { Calendar, User, ChevronRight } from 'lucide-vue-next'
import { generateSeoSlug } from '~/utils/idEncoder'
import type { BlogPost } from '~/utils/types'

interface Props {
  post: BlogPost
  index?: number
  isFeatured?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
  isFeatured: false
})

const postLink = computed(() => `/blog/${generateSeoSlug(props.post.slug, props.post.id)}`)
const date = computed(() => formatDate(props.post.publishedAt || props.post.createdAt))
</script>

<template>
  <!-- Featured Post Layout -->
  <NuxtLink
    v-if="isFeatured"
    :to="postLink"
    class="card card-hover group stagger-item mb-8 block overflow-hidden"
  >
    <div class="grid grid-cols-1 lg:grid-cols-2">
      <div class="bg-surface-muted aspect-[16/9] overflow-hidden lg:aspect-auto">
        <NuxtImg
          :src="getImageUrl(post.thumbnailUrl) || '/images/logo_sm.webp'"
          width="400"
          height="300"
          :alt="post.title"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="eager"
        />
      </div>
      <div class="flex flex-col justify-center p-6 sm:p-8">
        <div class="mb-3 flex items-center gap-2">
          <span
            class="badge bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
          >
            {{ $t('public_blog_featured_badge') }}
          </span>
          <span class="text-xs text-gray-400 dark:text-zinc-500">
            {{ date }}
          </span>
        </div>
        <h2
          class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-3 text-xl leading-tight font-bold transition-colors sm:text-2xl"
        >
          {{ post.title }}
        </h2>
        <p class="mb-4 line-clamp-3 text-sm text-gray-500 dark:text-zinc-400">
          {{ post.excerpt }}
        </p>
        <div
          class="text-primary-600 dark:text-primary-400 flex items-center gap-2 text-sm font-medium transition-all group-hover:gap-3"
        >
          {{ $t('public_blog_read_more') }}
          <ChevronRight class="h-4 w-4" aria-hidden="true" />
        </div>
      </div>
    </div>
  </NuxtLink>

  <!-- Standard Post Layout -->
  <NuxtLink
    v-else
    :to="postLink"
    class="card card-hover group stagger-item overflow-hidden"
    :style="{ animationDelay: `${Math.min(index * 50, 300)}ms` }"
  >
    <div class="bg-surface-muted group relative aspect-[16/9] overflow-hidden">
      <NuxtImg
        :src="getImageUrl(post.thumbnailUrl) || '/images/logo_sm.webp'"
        width="400"
        height="300"
        :alt="post.title"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </div>
    <div class="p-5">
      <div class="mb-2 flex items-center gap-2 text-xs text-gray-400 dark:text-zinc-500">
        <span class="inline-flex items-center gap-1">
          <Calendar class="h-3 w-3" aria-hidden="true" />
          {{ date }}
        </span>
        <span aria-hidden="true">•</span>
        <span class="inline-flex items-center gap-1">
          <User class="h-3 w-3" aria-hidden="true" />
          {{ $t('public_blog_detail_author', { id: post.authorId }) }}
        </span>
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
        {{ $t('public_blog_read_more') }}
        <ChevronRight class="h-4 w-4" aria-hidden="true" />
      </div>
    </div>
  </NuxtLink>
</template>
