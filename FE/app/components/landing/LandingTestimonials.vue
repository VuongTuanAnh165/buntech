<script setup lang="ts">
import { productReviewService } from '~/services/productReviewService'
import { Carousel, Slide, Navigation } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

const { data } = await useAsyncData('featured-reviews', () =>
  productReviewService.getFeaturedReviews()
)
const apiReviews = computed(() => data.value?.data || [])

const defaultTestimonials = [
  {
    name: 'Chị Mai',
    role: 'Tiệm bún Mai Hoàng, Q.5',
    text: 'Đặt hàng online rất tiện, giao đúng giờ. Bún ngon, sạch, khách quen khen nhiều. Dùng app BunTech từ ngày đầu, không bao giờ thất vọng.',
    rating: 5
  },
  {
    name: 'Anh Hùng',
    role: 'Quán phở Hùng, Bình Thạnh',
    text: 'Công nợ rõ ràng, dễ theo dõi. Không cần gọi điện đặt hàng mỗi ngày nữa. Tiết kiệm được rất nhiều thời gian cho quán.',
    rating: 5
  },
  {
    name: 'Chị Lan',
    role: 'Hộ kinh doanh, Gò Vấp',
    text: 'App dễ xài, tài xế nhiệt tình. Bún giao còn nóng nguyên bọc. Giá sỉ rẻ hơn mua lẻ nhiều, lại có chương trình tích điểm.',
    rating: 5
  }
]

const testimonials = computed(() => {
  let results = []
  if (apiReviews.value.length > 0) {
    results = apiReviews.value.map((r) => ({
      name: r.user?.fullName || 'Khách hàng',
      role: r.product?.name ? `Đã mua: ${r.product.name}` : 'Khách hàng',
      text: r.content,
      rating: Number(r.rating) || 5
    }))
  }

  if (results.length < 3) {
    results = [...results, ...defaultTestimonials.slice(results.length, 3)]
  }
  return results
})

const breakpoints = {
  768: {
    itemsToShow: 2,
    snapAlign: 'start'
  },
  1024: {
    itemsToShow: 3,
    snapAlign: 'start'
  }
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div class="mb-12 text-center">
      <h2 class="text-surface-foreground mb-2 text-2xl font-bold sm:text-3xl">Khách hàng nói gì</h2>
      <p class="text-sm text-slate-500 dark:text-zinc-400">
        Hàng trăm quán ăn, tiệm bún tin tưởng BunTech mỗi ngày
      </p>
    </div>
    <div class="pt-4 pb-8">
      <Carousel :items-to-show="1" :breakpoints="breakpoints" :wrap-around="true" :autoplay="4000">
        <Slide v-for="(testimonial, i) in testimonials" :key="i">
          <div
            class="card animate-fade-in-up mx-3 flex h-full w-full flex-col p-6 text-left"
            :style="{ animationDelay: `${i * 100}ms` }"
          >
            <UIcon
              name="i-lucide-quote"
              class="text-primary-200 dark:text-primary-800/60 mb-4 block h-8 w-8 shrink-0"
              aria-hidden="true"
            />
            <div class="mb-3 flex shrink-0 gap-0.5">
              <UIcon
                v-for="s in 5"
                :key="s"
                name="i-heroicons-star-solid"
                :class="[
                  'h-4 w-4',
                  s <= testimonial.rating ? 'text-yellow-400' : 'text-slate-200 dark:text-zinc-700'
                ]"
                aria-hidden="true"
              />
            </div>
            <p class="mb-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
              "{{ testimonial.text }}"
            </p>
            <div class="mt-auto flex shrink-0 items-center gap-3">
              <UAvatar :alt="testimonial.name" size="sm" />
              <div>
                <p class="text-surface-foreground text-sm font-medium">{{ testimonial.name }}</p>
                <p class="text-xs text-slate-500 dark:text-zinc-400">{{ testimonial.role }}</p>
              </div>
            </div>
          </div>
        </Slide>

        <template #addons>
          <Navigation />
        </template>
      </Carousel>
    </div>
  </section>
</template>

<style scoped>
@reference "../../assets/css/main.css";

:deep(.carousel__prev),
:deep(.carousel__next) {
  @apply h-10 w-10 rounded-full border border-slate-100 bg-white text-slate-600 shadow-md transition-colors dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300;
}
:deep(.carousel__prev:hover),
:deep(.carousel__next:hover) {
  @apply text-primary-500 bg-slate-50 dark:bg-zinc-700;
}
</style>
