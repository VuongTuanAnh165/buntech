<script setup lang="ts">
import { mockBlogPosts } from '~/utils/mockData'
const { constants } = useMasterData()
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Quản lý Blog - BunTech Admin' })
const toast = useToast()
// ─── State ────────────────────────────────────────────────
const loading = ref(true)
const search = ref('')
const statusFilter = ref<string>('ALL')
const page = ref(1)
const perPage = ref(10)
// ─── Computed KPIs ────────────────────────────────────────
const totalPosts = computed(() => mockBlogPosts.length)
const publishedPosts = computed(
  () => mockBlogPosts.filter((p) => p.status === constants.value?.['BlogStatus']?.PUBLISHED).length
)
const draftPosts = computed(
  () => mockBlogPosts.filter((p) => p.status === constants.value?.['BlogStatus']?.DRAFT).length
)
const totalViews = computed(() =>
  mockBlogPosts.reduce((s, p, i) => s + (p.views || i * 150 + 100), 0)
)
const kpiStats = computed(() => [
  {
    title: 'Tổng bài viết',
    value: totalPosts.value,
    icon: 'i-lucide-file-text',
    color: 'primary' as const,
    trend: { value: 3, isPositive: true }
  },
  {
    title: 'Đã xuất bản',
    value: publishedPosts.value,
    icon: 'i-lucide-check-circle-2',
    color: 'success' as const,
    trend: { value: 5, isPositive: true }
  },
  {
    title: 'Bản nháp',
    value: draftPosts.value,
    icon: 'i-lucide-file-edit',
    color: 'warning' as const,
    trend: { value: 2, isPositive: false }
  },
  {
    title: 'Lượt xem (ước tính)',
    value: new Intl.NumberFormat('vi-VN').format(totalViews.value),
    icon: 'i-lucide-eye',
    color: 'info' as const,
    trend: { value: 12, isPositive: true }
  }
])
// ─── Featured Posts ───────────────────────────────────────
const featuredPosts = computed(() => mockBlogPosts.slice(0, 3))
// ─── Filter & Pagination ─────────────────────────────────
const filteredPosts = computed(() => {
  let list = [...mockBlogPosts]
  if (statusFilter.value !== 'ALL') {
    list = list.filter((p) => p.status === statusFilter.value)
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter((p) => p.title.toLowerCase().includes(q))
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
  { accessorKey: 'actions', header: 'Hành động' }
]
// ─── Handlers ─────────────────────────────────────────────
function handleDelete(_id: string) {
  toast.add({ title: 'Đã xóa bài viết', color: 'success' })
}
// ─── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
</script>
<template>
  <div>
    <BasePageHeader
      title="Blog"
      description="Quản lý và xuất bản bài viết cho website"
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Blog' }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/blog/categories">
          <UIcon name="i-lucide-layers" class="mr-1 h-4 w-4" /> Danh mục
        </UButton>
        <UButton to="/admin/blog/edit">
          <UIcon name="i-lucide-plus" class="mr-1 h-4 w-4" /> Viết bài mới
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
      <div class="stagger-item mb-8" style="animation-delay: 200ms">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-surface-foreground flex items-center gap-2 text-sm font-semibold">
            <UIcon name="i-lucide-trending-up" class="text-primary-500 h-4 w-4" />
            Bài viết nổi bật
          </h3>
          <span
            class="text-primary-500 hover:text-primary-600 cursor-pointer text-xs transition-colors"
            >Xem tất cả →</span
          >
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            v-for="(post, i) in featuredPosts"
            :key="post.id"
            class="group animate-fade-in-up relative aspect-[16/10] cursor-pointer overflow-hidden rounded-xl"
            :style="{ animationDelay: `${i * 100 + 250}ms` }"
          >
            <NuxtImg
              :src="post.image_url || 'https://picsum.photos/800/500?random=1'"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"
            />
            <div class="absolute inset-0 flex flex-col justify-end p-5">
              <UBadge color="primary" class="mb-2 w-fit">{{
                post.category?.name || 'Tin tức'
              }}</UBadge>
              <h4
                class="group-hover:text-primary-300 mb-2 line-clamp-2 text-lg leading-tight font-semibold text-white transition-colors"
              >
                {{ post.title }}
              </h4>
              <div class="flex items-center gap-3 text-xs text-slate-300">
                <span class="flex items-center gap-1"
                  ><UIcon name="i-lucide-user" class="h-3.5 w-3.5" />
                  {{ post.author_name || 'Admin' }}</span
                >
                <span class="flex items-center gap-1"
                  ><UIcon name="i-lucide-eye" class="h-3.5 w-3.5" />
                  {{
                    new Intl.NumberFormat('vi-VN').format(
                      (post as any).views || Math.floor(Math.random() * 1000) + 100
                    )
                  }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Table Section -->
      <div class="card stagger-item p-5" style="animation-delay: 500ms">
        <div class="mb-4 flex items-center justify-between gap-4">
          <div class="max-w-sm flex-1">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Tìm bài viết theo tiêu đề..."
            />
          </div>
          <div class="flex items-center gap-2">
            <USelectMenu
              v-model="statusFilter"
              :items="[
                { label: 'Tất cả trạng thái', value: 'ALL' },
                { label: 'Đã xuất bản', value: constants?.['BlogStatus']?.PUBLISHED },
                { label: 'Bản nháp', value: constants?.['BlogStatus']?.DRAFT }
              ]"
              value-key="value"
            />
          </div>
        </div>
        <div class="bg-surface ring-surface-border overflow-hidden rounded-lg ring-1">
          <UTable :columns="columns" :data="pagedPosts">
            <template #title-cell="{ row }">
              <div class="flex max-w-sm gap-3">
                <NuxtImg
                  :src="row.original.image_url || 'https://picsum.photos/100/100?random=1'"
                  class="border-surface-border h-12 w-12 flex-shrink-0 rounded border object-cover"
                />
                <div class="min-w-0">
                  <p
                    class="text-surface-foreground hover:text-primary-600 line-clamp-1 cursor-pointer text-sm font-medium transition-colors"
                  >
                    {{ row.original.title }}
                  </p>
                  <p class="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-zinc-400">
                    {{ row.original.excerpt }}
                  </p>
                </div>
              </div>
            </template>
            <template #category-cell="{ row }">
              <UBadge color="primary" variant="subtle" size="sm">{{
                row.original.category?.name || 'Tin tức'
              }}</UBadge>
            </template>
            <template #author-cell="{ row }">
              <div class="flex items-center gap-2">
                <UAvatar :alt="row.original.author_name || 'A'" size="xs" />
                <span class="text-surface-foreground text-sm font-medium">{{
                  row.original.author_name || 'Admin'
                }}</span>
              </div>
            </template>
            <template #status-cell="{ row }">
              <UBadge
                :color="
                  row.original.status === constants?.['BlogStatus']?.PUBLISHED
                    ? 'success'
                    : 'warning'
                "
                variant="subtle"
                size="sm"
              >
                <span class="flex items-center gap-1">
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="
                      row.original.status === constants?.['BlogStatus']?.PUBLISHED
                        ? 'bg-success-500'
                        : 'bg-warning-500'
                    "
                  />
                  {{
                    row.original.status === constants?.['BlogStatus']?.PUBLISHED
                      ? 'Đã xuất bản'
                      : 'Bản nháp'
                  }}
                </span>
              </UBadge>
            </template>
            <template #date-cell="{ row }">
              <span class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
                <UIcon name="i-lucide-clock" class="h-3.5 w-3.5" />
                {{
                  row.original.status === constants?.['BlogStatus']?.PUBLISHED
                    ? formatDate(row.original.published_at || row.original.created_at)
                    : 'Chưa XB'
                }}
              </span>
            </template>
            <template #actions-cell="{ row }">
              <div class="flex items-center gap-1">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-lucide-pencil"
                  :to="`/admin/blog/edit?id=${row.original.id}`"
                />
                <UButton
                  variant="ghost"
                  color="error"
                  size="sm"
                  icon="i-lucide-trash-2"
                  @click="handleDelete(row.original.id)"
                />
              </div>
            </template>
          </UTable>
          <div
            v-if="totalPages > 1"
            class="border-surface-border flex items-center justify-between border-t px-4 py-3"
          >
            <span class="text-sm text-slate-500 tabular-nums">
              {{ (page - 1) * perPage + 1 }}-{{ Math.min(page * perPage, filteredPosts.length) }} /
              {{ filteredPosts.length }}
            </span>
            <UPagination v-model="page" :total="filteredPosts.length" :items-per-page="perPage" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
