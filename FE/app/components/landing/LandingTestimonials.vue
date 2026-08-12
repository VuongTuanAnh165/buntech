<script setup lang="ts">
const testimonials = [
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
</script>

<template>
  <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
    <div class="mb-12 text-center">
      <h2 class="text-surface-foreground mb-2 text-2xl font-bold sm:text-3xl">Khách hàng nói gì</h2>
      <p class="text-sm text-slate-500 dark:text-zinc-400">
        Hàng trăm quán ăn, tiệm bún tin tưởng BunTech mỗi ngày
      </p>
    </div>
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div
        v-for="(testimonial, i) in testimonials"
        :key="i"
        class="card animate-fade-in-up p-6"
        :style="{ animationDelay: `${i * 100}ms` }"
      >
        <span
          class="i-lucide-quote text-primary-200 dark:text-primary-800/60 mb-4 block h-8 w-8"
          aria-hidden="true"
        />
        <div class="mb-3 flex gap-0.5">
          <span
            v-for="s in 5"
            :key="s"
            :class="[
              'i-lucide-star h-4 w-4',
              s <= testimonial.rating
                ? 'text-accent-400 fill-accent-400'
                : 'text-slate-200 dark:text-zinc-700'
            ]"
            aria-hidden="true"
          />
        </div>
        <p class="mb-4 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
          "{{ testimonial.text }}"
        </p>
        <div class="flex items-center gap-3">
          <UAvatar :alt="testimonial.name" size="sm" />
          <div>
            <p class="text-surface-foreground text-sm font-medium">{{ testimonial.name }}</p>
            <p class="text-xs text-slate-500 dark:text-zinc-400">{{ testimonial.role }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
