<script setup lang="ts">
import { ArrowRight, Award, Leaf, Truck } from 'lucide-vue-next'
import { mockProducts, mockBlogPosts } from '~/core/mockData'

const { t } = useI18n()
const nuxt = useNuxtApp()
const { formatVND } = useFormat()

useHead({
  title: 'BunTech - Xưởng bún gia đình truyền thống 3 đời',
  meta: [
    { name: 'description', content: 'Bún tươi thủ công truyền thống 3 đời. Gạo nguyên chất, không chất bảo quản. Giao hàng tận nơi trong ngày.' },
    { name: 'keywords', content: 'bún tươi, bún thủ công, xưởng bún, bún gia đình, bún sạch' },
    { property: 'og:title', content: 'BunTech - Xưởng bún gia đình truyền thống' },
    { property: 'og:description', content: 'Bún tươi thủ công truyền thống 3 đời. Gạo nguyên chất, không chất bảo quản.' },
    { property: 'og:type', content: 'website' },
  ],
})
definePageMeta({ layout: 'default' })

const loading = ref(true)
const products = ref<Record<string, unknown>[]>([])
const posts = ref<Record<string, unknown>[]>([])

async function loadData() {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    products.value = mockProducts.value
      .filter(p => !p.deleted_at && p.status === 'ACTIVE')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4) as Record<string, unknown>[]
    
    posts.value = mockBlogPosts.value
      .filter(p => p.status === 'PUBLISHED' && !p.deleted_at)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3) as Record<string, unknown>[]
  } finally {
    loading.value = false
  }
}
onMounted(loadData)

const features = computed(() => [
  { icon: Leaf, title: t('customer.featureCleanTitle'), desc: t('customer.featureCleanDesc') },
  { icon: Award, title: t('customer.featureCraftTitle'), desc: t('customer.featureCraftDesc') },
  { icon: Truck, title: t('customer.featureDeliveryTitle'), desc: t('customer.featureDeliveryDesc') },
])
</script>

<template>
  <div>
    <section class="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-72 h-72 rounded-full bg-accent-300 blur-3xl" />
        <div class="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
      </div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div class="max-w-2xl">
          <h1 class="text-4xl sm:text-5xl font-bold mb-4">{{ t('customer.heroTitle') }}</h1>
          <p class="text-lg text-primary-100 mb-8">{{ t('customer.heroSubtitle') }}</p>
          <div class="flex flex-wrap gap-3">
            <NuxtLink to="/products">
              <button class="px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors flex items-center gap-2">
                {{ t('customer.shopNow') }} <ArrowRight class="w-4 h-4" />
              </button>
            </NuxtLink>
            <NuxtLink to="/quick-order">
              <button class="px-6 py-3 bg-white/20 backdrop-blur text-white rounded-xl font-semibold hover:bg-white/30 transition-colors">
                {{ t('customer.quickOrder') }}
              </button>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="feature in features" :key="feature.title" class="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-lg transition-shadow">
          <div class="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <component :is="feature.icon" class="w-7 h-7 text-primary-600" />
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">{{ feature.title }}</h3>
          <p class="text-sm text-gray-500">{{ feature.desc }}</p>
        </div>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-900">{{ t('customer.featuredProducts') }}</h2>
        <NuxtLink to="/products" class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
          {{ t('customer.viewAll') }} <ArrowRight class="w-4 h-4" />
        </NuxtLink>
      </div>
      <template v-if="loading">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="bg-white rounded-2xl border border-gray-100 p-4">
            <div class="skeleton h-40 w-full rounded-xl mb-3" />
            <div class="skeleton h-5 w-3/4 mb-2" />
            <div class="skeleton h-4 w-1/2" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink v-for="product in products" :key="product.id as string" :to="`/products/${product.slug}`" class="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
            <div class="aspect-square bg-gray-100 overflow-hidden">
              <img v-if="product.image_url" :src="product.image_url as string" :alt="product.name as string" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
              <div v-else class="w-full h-full flex items-center justify-center">
                <svg class="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{{ product.name }}</h3>
              <p class="text-lg font-bold text-primary-600">{{ formatVND(Number(product.price)) }}</p>
            </div>
          </NuxtLink>
        </div>
      </template>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 class="text-2xl font-bold text-gray-900 mb-8">{{ t('blog.latestPosts') }}</h2>
      <template v-if="loading">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="bg-white rounded-2xl border border-gray-100 p-4">
            <div class="skeleton h-40 w-full rounded-xl mb-3" />
            <div class="skeleton h-5 w-3/4 mb-2" />
            <div class="skeleton h-4 w-full" />
          </div>
        </div>
      </template>
      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <NuxtLink v-for="post in posts" :key="post.id as string" :to="`/blog/${post.slug}`" class="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
            <div class="aspect-video bg-gray-100 overflow-hidden">
              <img v-if="post.image_url" :src="post.image_url as string" :alt="post.title as string" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy">
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{{ post.title }}</h3>
              <p class="text-sm text-gray-500 line-clamp-2">{{ post.excerpt }}</p>
            </div>
          </NuxtLink>
        </div>
      </template>
    </section>
  </div>
</template>
