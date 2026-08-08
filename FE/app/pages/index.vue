<script setup lang="ts">
import { ArrowRight, Sparkles, Truck, ShieldCheck, Clock, Star, Package, Quote, ChevronRight, Leaf, Award, Store } from 'lucide-vue-next'

const { formatVND } = useFormat()

useHead({ title: 'BunTech - Xưởng bún gia đình truyền thống 3 đời' })
definePageMeta({ layout: 'default' })

const loading = ref(true)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})

const heroImage = 'https://images.pexels.com/photos/1001773/pexels-photo-1001773.jpeg?auto=compress&cs=tinysrgb&w=1600'

const featuredProducts = computed(() =>
  mockProducts
    .filter(p => p.status === 'ACTIVE')
    .slice(0, 8)
)

const blogPosts = computed(() =>
  mockBlogPosts
    .filter(p => p.status === 'PUBLISHED')
    .slice(0, 3)
)

const trustBadges = [
  { icon: Leaf, label: '100% Gạo tự nhiên' },
  { icon: Truck, label: 'Giao hàng 2 giờ' },
  { icon: Store, label: '50+ đại lý' },
  { icon: Award, label: '3 đời kinh nghiệm' },
]

const features = [
  { icon: Sparkles, title: 'Bún tươi mỗi ngày', desc: 'Sản xuất mỗi sáng, giao đến tay khách hàng trong vòng 2 giờ.', color: 'primary' },
  { icon: Truck, title: 'Giao hàng siêu tốc', desc: 'Nội thành 2 giờ, ngoại thành 4 giờ. Đảm bảo bún còn nóng nguyên bọc.', color: 'secondary' },
  { icon: ShieldCheck, title: 'An toàn vệ sinh', desc: 'Đạt tiêu chuẩn VSATTP, quy trình khép kín từ gạo đến thành phẩm.', color: 'success' },
  { icon: Clock, title: 'Đặt hàng 24/7', desc: 'App đặt hàng anytime, theo dõi đơn hàng và công nợ realtime.', color: 'warning' },
]

const colorMap: Record<string, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary-50 dark:bg-primary-900/20', text: 'text-primary-600 dark:text-primary-400' },
  secondary: { bg: 'bg-secondary-50 dark:bg-secondary-900/20', text: 'text-secondary-600 dark:text-secondary-400' },
  success: { bg: 'bg-success-50 dark:bg-success-900/20', text: 'text-success-600 dark:text-success-400' },
  warning: { bg: 'bg-warning-50 dark:bg-warning-900/20', text: 'text-warning-600 dark:text-warning-400' },
}

const testimonials = [
  { name: 'Chị Mai', role: 'Tiệm bún Mai Hoàng, Q.5', text: 'Đặt hàng online rất tiện, giao đúng giờ. Bún ngon, sạch, khách quen khen nhiều. Dùng app BunTech từ ngày đầu, không bao giờ thất vọng.', rating: 5 },
  { name: 'Anh Hùng', role: 'Quán phở Hùng, Bình Thạnh', text: 'Công nợ rõ ràng, dễ theo dõi. Không cần gọi điện đặt hàng mỗi ngày nữa. Tiết kiệm được rất nhiều thời gian cho quán.', rating: 5 },
  { name: 'Chị Lan', role: 'Hộ kinh doanh, Gò Vấp', text: 'App dễ xài, tài xế nhiệt tình. Bún giao còn nóng nguyên bọc. Giá sỉ rẻ hơn mua lẻ nhiều, lại có chương trình tích điểm.', rating: 5 },
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden min-h-[640px] flex items-center">
      <div class="absolute inset-0">
        <NuxtImg :src="heroImage" alt="" class="w-full h-full object-cover" aria-hidden="true" />
        <div class="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/75 to-slate-900/40" />
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 w-full">
        <div class="max-w-2xl">
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm font-medium mb-6 animate-fade-in">
            <Sparkles class="w-4 h-4" aria-hidden="true" />
            Xưởng bún truyền thống từ năm 1960
          </div>
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6 animate-fade-in-up leading-[1.1]" style="letter-spacing: -0.02em">
            Bún tươi thủ công BunTech<br class="hidden sm:block" > — Truyền 3 đời
          </h1>
          <p class="text-lg sm:text-xl text-slate-200 mb-8 max-w-xl animate-fade-in-up leading-relaxed" style="animation-delay: 100ms">
            Bún làm từ 100% gạo tự nhiên, sản xuất mỗi sáng theo bí truyền gia đình. Giao hàng tận nơi trong 2 giờ, đặt hàng dễ dàng qua app.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style="animation-delay: 200ms">
            <NuxtLink to="/quick-order" class="block">
              <UButton color="primary" variant="solid" size="lg" class="w-full sm:w-auto group">
                Đặt hàng nhanh
                <ArrowRight class="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </UButton>
            </NuxtLink>
            <NuxtLink to="/products" class="block">
              <UButton color="neutral" variant="outline" size="lg" class="w-full sm:w-auto !bg-white/10 !border-white/30 !text-white hover:!bg-white/20">
                Xem sản phẩm
              </UButton>
            </NuxtLink>
          </div>

          <!-- Stats bar -->
          <div class="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10 animate-fade-in-up" style="animation-delay: 300ms">
            <div>
              <div class="text-2xl sm:text-3xl font-bold text-white">1000+ kg</div>
              <div class="text-sm text-slate-400 mt-0.5">Sản xuất mỗi ngày</div>
            </div>
            <div>
              <div class="text-2xl sm:text-3xl font-bold text-white">60+ năm</div>
              <div class="text-sm text-slate-400 mt-0.5">Kinh nghiệm</div>
            </div>
            <div>
              <div class="text-2xl sm:text-3xl font-bold text-white">50+</div>
              <div class="text-sm text-slate-400 mt-0.5">Đại lý phục vụ</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Badges -->
    <section class="border-b border-surface-border bg-surface">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 lg:grid-cols-4 divide-x divide-surface-border">
          <div
            v-for="(badge, i) in trustBadges"
            :key="i"
            class="flex items-center gap-3 py-5 px-4 sm:px-6 animate-fade-in-up"
            :style="{ animationDelay: `${i * 60}ms` }"
            :class="{ 'border-r': i < 3 }"
          >
            <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
              <component :is="badge.icon" class="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <span class="text-sm font-medium text-surface-foreground">{{ badge.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Showcase -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div class="text-center mb-10">
        <h2 class="text-2xl sm:text-3xl font-bold text-surface-foreground mb-2">Danh mục sản phẩm</h2>
        <p class="text-sm text-slate-500 dark:text-zinc-400">Khám phá đa dạng các loại bún tươi BunTech</p>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <NuxtLink
          v-for="(cat, i) in mockCategories"
          :key="cat.id"
          to="/products"
          class="card card-hover p-5 text-center group stagger-item"
          :style="{ animationDelay: `${i * 60}ms` }"
        >
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
            <Package class="w-7 h-7 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          </div>
          <h3 class="font-semibold text-surface-foreground text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ cat.name }}</h3>
          <p class="text-xs text-slate-400 dark:text-zinc-500 mt-1">{{ mockProducts.filter(p => p.category_id === cat.id).length }} sản phẩm</p>
        </NuxtLink>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex items-end justify-between mb-8">
        <div>
          <h2 class="text-2xl sm:text-3xl font-bold text-surface-foreground">Sản phẩm nổi bật</h2>
          <p class="text-sm text-slate-500 dark:text-zinc-400 mt-1">Bún tươi mới sản xuất, đặt hàng giao ngay</p>
        </div>
        <NuxtLink to="/products" class="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors min-h-[44px] px-2 group">
          Xem tất cả
          <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </NuxtLink>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div v-for="i in 8" :key="i" class="card p-4">
          <USkeleton class="h-48 w-full mb-4" />
          <USkeleton class="h-4 w-full mb-2" />
          <USkeleton class="h-4 w-2/3" />
        </div>
      </div>

      <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <NuxtLink
          v-for="(product, i) in featuredProducts"
          :key="product.id"
          :to="`/products/${product.slug}`"
          class="card card-hover card-gradient p-4 group stagger-item"
          :style="{ animationDelay: `${i * 60}ms` }"
        >
          <div class="aspect-square rounded-lg bg-surface-muted overflow-hidden mb-3 relative">
            <NuxtImg
              v-if="product.image_url"
              :src="product.image_url"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <Package class="w-12 h-12 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
            </div>
            <span
              v-if="product.stock <= 0"
              class="absolute top-2 right-2 badge bg-danger-500 text-white"
            >Hết hàng</span>
          </div>
          <h3 class="font-medium text-surface-foreground text-sm sm:text-base truncate mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ product.name }}</h3>
          <p class="text-xs text-slate-400 dark:text-zinc-500 mb-2">{{ product.category }}</p>
          <div class="flex items-center justify-between">
            <p class="text-primary-600 dark:text-primary-400 font-semibold text-sm sm:text-base">{{ formatVND(product.price) }}</p>
            <span class="text-xs text-slate-400 dark:text-zinc-500">/{{ product.unit }}</span>
          </div>
        </NuxtLink>
      </div>

      <div class="sm:hidden mt-6">
        <NuxtLink to="/products">
          <UButton color="neutral" variant="outline" block>Xem tất cả sản phẩm</UButton>
        </NuxtLink>
      </div>
    </section>

    <!-- Why Choose BunTech -->
    <section class="bg-surface py-16 sm:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl font-bold text-surface-foreground mb-2">Tại sao chọn BunTech</h2>
          <p class="text-sm text-slate-500 dark:text-zinc-400">Hơn 60 năm uy tín — chúng tôi hiểu bún như hiểu gia đình mình</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div
            v-for="(feature, i) in features"
            :key="i"
            class="card card-hover p-6 animate-fade-in-up"
            :style="{ animationDelay: `${i * 80}ms` }"
          >
            <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-4', colorMap[feature.color]?.bg]">
              <component :is="feature.icon" :class="['w-6 h-6', colorMap[feature.color]?.text]" aria-hidden="true" />
            </div>
            <h3 class="font-semibold text-surface-foreground mb-1.5">{{ feature.title }}</h3>
            <p class="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div class="text-center mb-12">
        <h2 class="text-2xl sm:text-3xl font-bold text-surface-foreground mb-2">Khách hàng nói gì</h2>
        <p class="text-sm text-slate-500 dark:text-zinc-400">Hàng trăm quán ăn, tiệm bún tin tưởng BunTech mỗi ngày</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="(testimonial, i) in testimonials"
          :key="i"
          class="card p-6 animate-fade-in-up"
          :style="{ animationDelay: `${i * 100}ms` }"
        >
          <Quote class="w-8 h-8 text-primary-200 dark:text-primary-800/60 mb-4" aria-hidden="true" />
          <div class="flex gap-0.5 mb-3">
            <Star
              v-for="s in 5"
              :key="s"
              :class="['w-4 h-4', s <= testimonial.rating ? 'text-accent-400 fill-accent-400' : 'text-slate-200 dark:text-zinc-700']"
              aria-hidden="true"
            />
          </div>
          <p class="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed mb-4">"{{ testimonial.text }}"</p>
          <div class="flex items-center gap-3">
            <UAvatar :alt="testimonial.name" size="sm" />
            <div>
              <p class="text-sm font-medium text-surface-foreground">{{ testimonial.name }}</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400">{{ testimonial.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Blog Preview -->
    <section v-if="blogPosts.length" class="bg-surface py-16 sm:py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-8">
          <div>
            <h2 class="text-2xl sm:text-3xl font-bold text-surface-foreground">Tin tức & Mẹo hay</h2>
            <p class="text-sm text-slate-500 dark:text-zinc-400 mt-1">Cập nhật kiến thức về bún và ẩm thực Việt</p>
          </div>
          <NuxtLink to="/blog" class="hidden sm:flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors min-h-[44px] px-2 group">
            Xem tất cả
            <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </NuxtLink>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NuxtLink
            v-for="post in blogPosts"
            :key="post.id"
            :to="`/blog/${post.slug}`"
            class="card card-hover overflow-hidden group"
          >
            <div class="aspect-[16/9] bg-surface-muted overflow-hidden">
              <NuxtImg
                v-if="post.image_url"
                :src="post.image_url"
                :alt="post.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Package class="w-12 h-12 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </div>
            <div class="p-5">
              <h3 class="font-semibold text-surface-foreground mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{{ post.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-zinc-400 line-clamp-2">{{ post.excerpt }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 px-6 sm:px-12 py-12 sm:py-16 text-center">
        <div class="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
        <div class="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-accent-400/10 blur-3xl" aria-hidden="true" />
        <div class="relative">
          <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4">Sẵn sàng đặt hàng bún tươi?</h2>
          <p class="text-white/80 mb-8 max-w-xl mx-auto">Đặt hàng online trong 30 giây, giao hàng tận nơi trong 2 giờ. Bún tươi mỗi ngày, từ xưởng đến bàn ăn của bạn.</p>
          <NuxtLink to="/quick-order">
            <UButton color="primary" variant="solid" size="lg" class="!bg-white !text-primary-600 hover:!bg-white/90 group">
              Đặt hàng ngay
              <ArrowRight class="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </UButton>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
