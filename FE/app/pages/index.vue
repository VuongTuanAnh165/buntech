<script setup lang="ts">
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  Star,
  Package,
  Quote,
  ChevronRight,
  Leaf,
  Award,
  Store
} from 'lucide-vue-next'
useSeoMeta({ title: 'BunTech - Xưởng bún gia đình truyền thống 3 đời' })
definePageMeta({ layout: 'default' })
const loading = ref(true)
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 400)
})
const heroImage =
  'https://images.pexels.com/photos/1001773/pexels-photo-1001773.jpeg?auto=compress&cs=tinysrgb&w=1600'
const featuredProducts = computed(() =>
  mockProducts.filter((p) => p.status === 'ACTIVE').slice(0, 8)
)
const blogPosts = computed(() => mockBlogPosts.filter((p) => p.status === 'PUBLISHED').slice(0, 3))
const trustBadges = [
  { icon: Leaf, label: '100% Gạo tự nhiên' },
  { icon: Truck, label: 'Giao hàng 2 giờ' },
  { icon: Store, label: '50+ đại lý' },
  { icon: Award, label: '3 đời kinh nghiệm' }
]
const features = [
  {
    icon: Sparkles,
    title: 'Bún tươi mỗi ngày',
    desc: 'Sản xuất mỗi sáng, giao đến tay khách hàng trong vòng 2 giờ.',
    color: 'primary'
  },
  {
    icon: Truck,
    title: 'Giao hàng siêu tốc',
    desc: 'Nội thành 2 giờ, ngoại thành 4 giờ. Đảm bảo bún còn nóng nguyên bọc.',
    color: 'secondary'
  },
  {
    icon: ShieldCheck,
    title: 'An toàn vệ sinh',
    desc: 'Đạt tiêu chuẩn VSATTP, quy trình khép kín từ gạo đến thành phẩm.',
    color: 'success'
  },
  {
    icon: Clock,
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
  <div>
    <!-- Hero -->
    <section class="relative flex min-h-[640px] items-center overflow-hidden">
      <div class="absolute inset-0">
        <NuxtImg :src="heroImage" alt="" class="h-full w-full object-cover" aria-hidden="true" />
        <div
          class="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/75 to-slate-900/40"
        />
      </div>
      <div class="relative mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div class="max-w-2xl">
          <div
            class="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md"
          >
            <Sparkles class="h-4 w-4" aria-hidden="true" />
            Xưởng bún truyền thống từ năm 1960
          </div>
          <h1
            class="animate-fade-in-up mb-6 text-4xl leading-[1.1] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
            style="letter-spacing: -0.02em"
          >
            Bún tươi thủ công BunTech<br class="hidden sm:block" />
            — Truyền 3 đời
          </h1>
          <p
            class="animate-fade-in-up mb-8 max-w-xl text-lg leading-relaxed text-slate-200 sm:text-xl"
            style="animation-delay: 100ms"
          >
            Bún làm từ 100% gạo tự nhiên, sản xuất mỗi sáng theo bí truyền gia đình. Giao hàng tận
            nơi trong 2 giờ, đặt hàng dễ dàng qua app.
          </p>
          <div
            class="animate-fade-in-up flex flex-col gap-3 sm:flex-row"
            style="animation-delay: 200ms"
          >
            <NuxtLink to="/quick-order" class="block">
              <UButton color="primary" variant="solid" size="lg" class="group w-full sm:w-auto">
                Đặt hàng nhanh
                <ArrowRight
                  class="h-5 w-5 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </UButton>
            </NuxtLink>
            <NuxtLink to="/products" class="block">
              <UButton
                color="neutral"
                variant="outline"
                size="lg"
                class="w-full !border-white/30 !bg-white/10 !text-white hover:!bg-white/20 sm:w-auto"
              >
                Xem sản phẩm
              </UButton>
            </NuxtLink>
          </div>
          <!-- Stats bar -->
          <div
            class="animate-fade-in-up mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8"
            style="animation-delay: 300ms"
          >
            <div>
              <div class="text-2xl font-bold text-white sm:text-3xl">1000+ kg</div>
              <div class="mt-0.5 text-sm text-slate-400">Sản xuất mỗi ngày</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-white sm:text-3xl">60+ năm</div>
              <div class="mt-0.5 text-sm text-slate-400">Kinh nghiệm</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-white sm:text-3xl">50+</div>
              <div class="mt-0.5 text-sm text-slate-400">Đại lý phục vụ</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Trust Badges -->
    <section class="border-surface-border bg-surface border-b">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="divide-surface-border grid grid-cols-2 divide-x lg:grid-cols-4">
          <div
            v-for="(badge, i) in trustBadges"
            :key="i"
            class="animate-fade-in-up flex items-center gap-3 px-4 py-5 sm:px-6"
            :style="{ animationDelay: `${i * 60}ms` }"
            :class="{ 'border-r': i < 3 }"
          >
            <div
              class="bg-primary-50 dark:bg-primary-900/20 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
            >
              <component
                :is="badge.icon"
                class="text-primary-600 dark:text-primary-400 h-5 w-5"
                aria-hidden="true"
              />
            </div>
            <span class="text-surface-foreground text-sm font-medium">{{ badge.label }}</span>
          </div>
        </div>
      </div>
    </section>
    <!-- Categories Showcase -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div class="mb-10 text-center">
        <h2 class="text-surface-foreground mb-2 text-2xl font-bold sm:text-3xl">
          Danh mục sản phẩm
        </h2>
        <p class="text-sm text-slate-500 dark:text-zinc-400">
          Khám phá đa dạng các loại bún tươi BunTech
        </p>
      </div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        <NuxtLink
          v-for="(cat, i) in mockCategories"
          :key="cat.id"
          to="/products"
          class="card card-hover group stagger-item p-5 text-center"
          :style="{ animationDelay: `${i * 60}ms` }"
        >
          <div
            class="from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10 mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110"
          >
            <Package class="text-primary-600 dark:text-primary-400 h-7 w-7" aria-hidden="true" />
          </div>
          <h3
            class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 text-sm font-semibold transition-colors"
          >
            {{ cat.name }}
          </h3>
          <p class="mt-1 text-xs text-slate-400 dark:text-zinc-500">
            {{ mockProducts.filter((p) => p.category_id === cat.id).length }} sản phẩm
          </p>
        </NuxtLink>
      </div>
    </section>
    <!-- Featured Products -->
    <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="mb-8 flex items-end justify-between">
        <div>
          <h2 class="text-surface-foreground text-2xl font-bold sm:text-3xl">Sản phẩm nổi bật</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Bún tươi mới sản xuất, đặt hàng giao ngay
          </p>
        </div>
        <NuxtLink
          to="/products"
          class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 group hidden min-h-[44px] items-center gap-1 px-2 text-sm font-medium transition-colors sm:flex"
        >
          Xem tất cả
          <ChevronRight
            class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </NuxtLink>
      </div>
      <!-- Loading skeleton -->
      <div v-if="loading" class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <div v-for="i in 8" :key="i" class="card p-4">
          <USkeleton class="mb-4 h-48 w-full" />
          <USkeleton class="mb-2 h-4 w-full" />
          <USkeleton class="h-4 w-2/3" />
        </div>
      </div>
      <div v-else class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        <NuxtLink
          v-for="(product, i) in featuredProducts"
          :key="product.id"
          :to="`/products/${product.slug}`"
          class="card card-hover card-gradient group stagger-item p-4"
          :style="{ animationDelay: `${i * 60}ms` }"
        >
          <div class="bg-surface-muted relative mb-3 aspect-square overflow-hidden rounded-lg">
            <NuxtImg
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div v-else class="flex h-full w-full items-center justify-center">
              <Package class="h-12 w-12 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
            <span
              v-if="product.stock <= 0"
              class="badge bg-danger-500 absolute top-2 right-2 text-white"
              >Hết hàng</span
            >
          </div>
          <h3
            class="text-surface-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 mb-1 truncate text-sm font-medium transition-colors sm:text-base"
          >
            {{ product.name }}
          </h3>
          <p class="mb-2 text-xs text-slate-400 dark:text-zinc-500">{{ product.category }}</p>
          <div class="flex items-center justify-between">
            <p class="text-primary-600 dark:text-primary-400 text-sm font-semibold sm:text-base">
              {{ formatVND(product.price) }}
            </p>
            <span class="text-xs text-slate-400 dark:text-zinc-500">/{{ product.unit }}</span>
          </div>
        </NuxtLink>
      </div>
      <div class="mt-6 sm:hidden">
        <NuxtLink to="/products">
          <UButton color="neutral" variant="outline" block>Xem tất cả sản phẩm</UButton>
        </NuxtLink>
      </div>
    </section>
    <!-- Why Choose BunTech -->
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
              <component
                :is="feature.icon"
                :class="['h-6 w-6', colorMap[feature.color]?.text]"
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
    <!-- Testimonials -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div class="mb-12 text-center">
        <h2 class="text-surface-foreground mb-2 text-2xl font-bold sm:text-3xl">
          Khách hàng nói gì
        </h2>
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
          <Quote
            class="text-primary-200 dark:text-primary-800/60 mb-4 h-8 w-8"
            aria-hidden="true"
          />
          <div class="mb-3 flex gap-0.5">
            <Star
              v-for="s in 5"
              :key="s"
              :class="[
                'h-4 w-4',
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
            <ChevronRight
              class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <NuxtLink
            v-for="post in blogPosts"
            :key="post.id"
            :to="`/blog/${post.slug}`"
            class="card card-hover group overflow-hidden"
          >
            <div class="bg-surface-muted aspect-[16/9] overflow-hidden">
              <NuxtImg
                v-if="post.image_url"
                :src="post.image_url"
                :alt="post.title"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div v-else class="flex h-full w-full items-center justify-center">
                <Package class="h-12 w-12 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
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
              <ArrowRight
                class="h-5 w-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
