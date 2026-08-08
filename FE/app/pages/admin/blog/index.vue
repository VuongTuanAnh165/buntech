<script setup lang="ts">
import { BlogStatus } from '~/utils/enums'
import { mockBlogPosts, mockBlogCategories } from '~/utils/mockData'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Quản lý Blog - BunTech Admin' })

const { formatDate } = useFormat()
const toast = useToast()

// ─── State ────────────────────────────────────────────────
const loading = ref(true)
const search = ref('')
const statusFilter = ref<string>('ALL')
const page = ref(1)
const perPage = ref(10)

// ─── Computed KPIs ────────────────────────────────────────
const totalPosts = computed(() => mockBlogPosts.length)
const publishedPosts = computed(() => mockBlogPosts.filter(p => p.status === BlogStatus.PUBLISHED).length)
const draftPosts = computed(() => mockBlogPosts.filter(p => p.status === BlogStatus.DRAFT).length)
const totalViews = computed(() => mockBlogPosts.reduce((s, p, i) => s + (p.views || (i * 150 + 100)), 0))

const kpiStats = computed(() => [
  { title: 'Tổng bài viết', value: totalPosts.value, icon: 'i-lucide-file-text', color: 'primary' as const, trend: { value: 3, isPositive: true } },
  { title: 'Đã xuất bản', value: publishedPosts.value, icon: 'i-lucide-check-circle-2', color: 'success' as const, trend: { value: 5, isPositive: true } },
  { title: 'Bản nháp', value: draftPosts.value, icon: 'i-lucide-file-edit', color: 'warning' as const, trend: { value: 2, isPositive: false } },
  { title: 'Lượt xem (ước tính)', value: new Intl.NumberFormat('vi-VN').format(totalViews.value), icon: 'i-lucide-eye', color: 'info' as const, trend: { value: 12, isPositive: true } },
])

// ─── Featured Posts ───────────────────────────────────────
const featuredPosts = computed(() => mockBlogPosts.slice(0, 3))

// ─── Filter & Pagination ─────────────────────────────────
const filteredPosts = computed(() => {
  let list = [...mockBlogPosts]
  if (statusFilter.value !== 'ALL') {
    list = list.filter(p => p.status === statusFilter.value)
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(p => p.title.toLowerCase().includes(q))
  }
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / perPage.value))
const pagedPosts = computed(() => {
  const start = (page.value - 1) * perPage.value
  return filteredPosts.value.slice(start, start + perPage.value)
})

const columns = [
  { accessorKey: 'title', header: 'Bài viết' },
  { accessorKey: 'category', header: 'Danh mục' },
  { accessorKey: 'author', header: 'Tác giả' },
  { accessorKey: 'status', header: 'Trạng thái' },
  { accessorKey: 'date', header: 'Ngày xuất bản' },
  { accessorKey: 'actions', header: 'Hành động' },
]

// ─── Handlers ─────────────────────────────────────────────
function handleDelete(id: string) {
  toast.add({ title: 'Đã xóa bài viết', color: 'success' })
}

// ─── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  setTimeout(() => { loading.value = false }, 300)
})
</script>

<template>
  <div>
    <BasePageHeader
      title="Blog"
      description="Quản lý và xuất bản bài viết cho website"
      :breadcrumbs="[{ label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' }, { label: 'Blog' }]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/blog/categories">
          <UIcon name="i-lucide-layers" class="w-4 h-4 mr-1" /> Danh mục
        </UButton>
        <UButton to="/admin/blog/edit">
          <UIcon name="i-lucide-plus" class="w-4 h-4 mr-1" /> Viết bài mới
        </UButton>
      </template>
    </BasePageHeader>

    <template v-if="loading">
      <BasePageLoading />
    </template>

    <template v-else>
      <div class="mb-6">
        <BaseStatsGrid :stats="kpiStats" :columns="4" />
      </div>

      <!-- Featured Posts -->
      <div class="mb-8 stagger-item" style="animation-delay: 200ms">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-surface-foreground flex items-center gap-2">
            <UIcon name="i-lucide-trending-up" class="w-4 h-4 text-primary-500" />
            Bài viết nổi bật
          </h3>
          <span class="text-xs text-primary-500 cursor-pointer hover:text-primary-600 transition-colors">Xem tất cả →</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="(post, i) in featuredPosts"
            :key="post.id"
            class="relative rounded-xl overflow-hidden aspect-[16/10] group cursor-pointer animate-fade-in-up"
            :style="{ animationDelay: `${i * 100 + 250}ms` }"
          >
            <NuxtImg
              :src="post.image_url || 'https://picsum.photos/800/500?random=1'"
              class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
            <div class="absolute inset-0 p-5 flex flex-col justify-end">
              <UBadge color="primary" class="w-fit mb-2">{{ post.category?.name || 'Tin tức' }}</UBadge>
              <h4 class="text-white font-semibold text-lg line-clamp-2 leading-tight mb-2 group-hover:text-primary-300 transition-colors">{{ post.title }}</h4>
              <div class="flex items-center gap-3 text-xs text-slate-300">
                <span class="flex items-center gap-1"><UIcon name="i-lucide-user" class="w-3.5 h-3.5" /> {{ post.author_name || 'Admin' }}</span>
                <span class="flex items-center gap-1"><UIcon name="i-lucide-eye" class="w-3.5 h-3.5" /> {{ new Intl.NumberFormat('vi-VN').format(post.views || Math.floor(Math.random() * 1000) + 100) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="card p-5 stagger-item" style="animation-delay: 500ms">
        <div class="flex items-center justify-between gap-4 mb-4">
          <div class="flex-1 max-w-sm">
            <UInput v-model="search" icon="i-lucide-search" placeholder="Tìm bài viết theo tiêu đề..." />
          </div>
          <div class="flex items-center gap-2">
            <USelectMenu
              v-model="statusFilter"
              :items="[
                { label: 'Tất cả trạng thái', value: 'ALL' },
                { label: 'Đã xuất bản', value: BlogStatus.PUBLISHED },
                { label: 'Bản nháp', value: BlogStatus.DRAFT },
              ]"
              value-key="value"
            />
          </div>
        </div>

        <div class="bg-surface ring-1 ring-surface-border rounded-lg overflow-hidden">
          <UTable :columns="columns" :data="pagedPosts">
            <template #title-cell="{ row }">
              <div class="flex gap-3 max-w-sm">
                <NuxtImg
                  :src="row.original.image_url || 'https://picsum.photos/100/100?random=1'"
                  class="w-12 h-12 rounded object-cover flex-shrink-0 border border-surface-border"
                />
                <div class="min-w-0">
                  <p class="font-medium text-surface-foreground text-sm line-clamp-1 hover:text-primary-600 transition-colors cursor-pointer">
                    {{ row.original.title }}
                  </p>
                  <p class="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-1">{{ row.original.excerpt }}</p>
                </div>
              </div>
            </template>

            <template #category-cell="{ row }">
              <UBadge color="primary" variant="subtle" size="sm">{{ row.original.category?.name || 'Tin tức' }}</UBadge>
            </template>

            <template #author-cell="{ row }">
              <div class="flex items-center gap-2">
                <UAvatar :alt="row.original.author_name || 'A'" size="xs" />
                <span class="text-sm font-medium text-surface-foreground">{{ row.original.author_name || 'Admin' }}</span>
              </div>
            </template>

            <template #status-cell="{ row }">
              <UBadge
                :color="row.original.status === BlogStatus.PUBLISHED ? 'success' : 'warning'"
                variant="subtle"
                size="sm"
              >
                <span class="flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full" :class="row.original.status === BlogStatus.PUBLISHED ? 'bg-success-500' : 'bg-warning-500'" />
                  {{ row.original.status === BlogStatus.PUBLISHED ? 'Đã xuất bản' : 'Bản nháp' }}
                </span>
              </UBadge>
            </template>

            <template #date-cell="{ row }">
              <span class="text-sm text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
                {{ row.original.status === BlogStatus.PUBLISHED ? formatDate(row.original.published_at || row.original.created_at) : 'Chưa XB' }}
              </span>
            </template>

            <template #actions-cell="{ row }">
              <div class="flex items-center gap-1">
                <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-pencil" :to="`/admin/blog/edit?id=${row.original.id}`" />
                <UButton variant="ghost" color="error" size="sm" icon="i-lucide-trash-2" @click="handleDelete(row.original.id)" />
              </div>
            </template>
          </UTable>

          <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-surface-border">
            <span class="text-sm text-slate-500 tabular-nums">
              {{ (page - 1) * perPage + 1 }}-{{ Math.min(page * perPage, filteredPosts.length) }} / {{ filteredPosts.length }}
            </span>
            <UPagination v-model="page" :total="filteredPosts.length" :items-per-page="perPage" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
