<script setup lang="ts">
import { blogService } from '~/services/blogService'
import { generateSeoSlug } from '~/utils/idEncoder'

const { data: blogPostsRes } = useAsyncData('landing-blog-posts', () =>
  blogService.getPublicPosts({ limit: 3 })
)
const blogPosts = computed(() => blogPostsRes.value?.data?.data || [])
</script>

<template>
  <div>
    <!-- Blog Preview -->
    <section v-if="blogPosts.length" class="bg-surface py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-8 flex items-end justify-between">
          <div>
            <h2 class="text-surface-foreground text-2xl font-bold sm:text-3xl">
              Tin tức & Mẹo hay
            </h2>
            <p class="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Cập nhật kiến thức về bún và ẩm thực Việt
            </p>
          </div>
          <NuxtLink
            to="/blog"
            class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 group hidden min-h-[44px] items-center gap-1 px-2 text-sm font-medium transition-colors sm:flex"
          >
            Xem tất cả
            <span
              class="i-lucide-chevron-right h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <NuxtLink
            v-for="post in blogPosts"
            :key="post.id"
            :to="`/blog/${generateSeoSlug(post.slug, post.id)}`"
            class="card card-hover group overflow-hidden"
          >
            <div class="bg-surface-muted aspect-[16/9] overflow-hidden">
              <NuxtImg
                :src="getImageUrl(post.thumbnailUrl) || 'https://picsum.photos/400/300?random=1'"
                :alt="post.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div class="p-5">
              <h3
                class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-2 line-clamp-2 font-semibold transition-colors"
              >
                {{ post.title }}
              </h3>
              <p class="line-clamp-2 text-sm text-gray-500 dark:text-zinc-400">
                {{ post.excerpt }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div
        class="from-primary-600 to-primary-800 relative overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-12 text-center sm:px-12 sm:py-16"
      >
        <div
          class="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          class="bg-accent-400/10 absolute bottom-0 left-0 h-72 w-72 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div class="relative">
          <h2 class="mb-4 text-2xl font-bold text-white sm:text-3xl">
            Sẵn sàng đặt hàng bún tươi?
          </h2>
          <p class="mx-auto mb-8 max-w-xl text-white/80">
            Đặt hàng online trong 30 giây, giao hàng tận nơi trong 2 giờ. Bún tươi mỗi ngày, từ
            xưởng đến bàn ăn của bạn.
          </p>
          <NuxtLink to="/quick-order">
            <UButton
              color="primary"
              variant="solid"
              size="lg"
              class="!text-primary-600 group !bg-white hover:!bg-white/90"
            >
              Đặt hàng ngay
              <span
                class="i-lucide-arrow-right h-5 w-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
