<script setup lang="ts">
import { t } from '~/utils/i18n'
import { productReviewService } from '~/services/productReviewService'
import { Carousel, Slide, Navigation } from 'vue3-carousel'
import 'vue3-carousel/dist/carousel.css'

const { data } = useAsyncData('featured-reviews', () => productReviewService.getFeaturedReviews())
const apiReviews = computed(() => data.value?.data || [])
const defaultTestimonials = [
  {
    name: t('public_landing_testi_def_1_name'),
    role: t('public_landing_testi_def_1_role'),
    text: t('public_landing_testi_def_1_text'),
    rating: 5
  },
  {
    name: t('public_landing_testi_def_2_name'),
    role: t('public_landing_testi_def_2_role'),
    text: t('public_landing_testi_def_2_text'),
    rating: 5
  },
  {
    name: t('public_landing_testi_def_3_name'),
    role: t('public_landing_testi_def_3_role'),
    text: t('public_landing_testi_def_3_text'),
    rating: 5
  }
]

const testimonials = computed(() => {
  let results: Array<{ name: string; role: string; text: string; rating: number }> = []
  if (apiReviews.value.length > 0) {
    results = apiReviews.value.map((r) => ({
      name: r.user?.fullName || t('common_customer'),
      role: r.product?.name
        ? t('public_landing_testi_bought', { product: r.product.name })
        : t('common_customer'),
      text: r.content || '',
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
    snapAlign: 'start' as const
  },
  1024: {
    itemsToShow: 3,
    snapAlign: 'start' as const
  }
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div class="mb-12 text-center">
      <h2 class="text-surface-foreground mb-2 text-2xl font-bold sm:text-3xl">
        {{ $t('public_landing_testi_title') }}
      </h2>
      <p class="text-sm text-slate-500 dark:text-zinc-400">
        {{ $t('public_landing_testi_subtitle') }}
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
