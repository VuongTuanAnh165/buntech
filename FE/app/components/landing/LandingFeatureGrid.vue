<script setup lang="ts">
const features = [
  {
    icon: 'i-lucide-sparkles',
    title: 'Bún tươi mỗi ngày',
    desc: 'Sản xuất mỗi sáng, giao đến tay khách hàng trong vòng 2 giờ.',
    color: 'primary'
  },
  {
    icon: 'i-lucide-truck',
    title: 'Giao hàng siêu tốc',
    desc: 'Nội thành 2 giờ, ngoại thành 4 giờ. Đảm bảo bún còn nóng nguyên bọc.',
    color: 'secondary'
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'An toàn vệ sinh',
    desc: 'Đạt tiêu chuẩn VSATTP, quy trình khép kín từ gạo đến thành phẩm.',
    color: 'success'
  },
  {
    icon: 'i-lucide-clock',
    title: 'Đặt hàng 24/7',
    desc: 'App đặt hàng anytime, theo dõi đơn hàng và công nợ realtime.',
    color: 'warning'
  }
]

const colorMap: Record<string, { bg: string; text: string }> = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400'
  },
  secondary: {
    bg: 'bg-secondary-50 dark:bg-secondary-900/20',
    text: 'text-secondary-600 dark:text-secondary-400'
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400'
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400'
  }
}
</script>

<template>
  <section class="bg-surface py-16 sm:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mb-12 text-center">
        <h2 class="text-surface-foreground mb-2 text-2xl font-bold sm:text-3xl">
          Tại sao chọn BunTech
        </h2>
        <p class="text-sm text-slate-500 dark:text-zinc-400">
          Hơn 60 năm uy tín — chúng tôi hiểu bún như hiểu gia đình mình
        </p>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <div
          v-for="(feature, i) in features"
          :key="i"
          class="card card-hover animate-fade-in-up p-6"
          :style="{ animationDelay: `${i * 80}ms` }"
        >
          <div
            :class="[
              'mb-4 flex h-12 w-12 items-center justify-center rounded-xl',
              colorMap[feature.color]?.bg
            ]"
          >
            <span
              :class="[feature.icon, 'h-6 w-6', colorMap[feature.color]?.text]"
              aria-hidden="true"
            />
          </div>
          <h3 class="text-surface-foreground mb-1.5 font-semibold">{{ feature.title }}</h3>
          <p class="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
            {{ feature.desc }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
