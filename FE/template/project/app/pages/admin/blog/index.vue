<script setup lang="ts">
import {
  Plus, Pencil, Trash2, FileText, Eye, Users, Clock, ArrowRight,
  TrendingUp, Layers, CheckCircle2, FileEdit, Image as ImageIcon, ArrowUpRight,
} from 'lucide-vue-next'
import { BlogStatus } from '../../../core/enums'
import type { BlogPost } from '../../../core/types'
import { mockBlogPosts } from '../../../core/mock/data'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatDate, formatNumber } = useFormat()

useHead({ title: `Blog - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── State ──────────────────────────────────────────────
const loading = ref(true)
const posts = ref<BlogPost[]>(mockBlogPosts.filter(p => !p.deleted_at).map(p => ({ ...p })))

const search = ref('')
const statusFilter = ref<'ALL' | BlogStatus>('ALL')
const sortBy = ref<'created_at' | 'title'>('created_at')
const sortDirection = ref<'asc' | 'desc'>('desc')
const page = ref(1)
const limit = ref(10)

const deleteTarget = ref<BlogPost | null>(null)
const deleting = ref(false)

const debouncedSearch = useDebounce(search, 300)

onMounted(() => {
  setTimeout(() => { loading.value = false }, 350)
})

// ─── KPIs ───────────────────────────────────────────────
const activePosts = computed(() => posts.value.filter(p => !p.deleted_at))
const publishedPosts = computed(() => activePosts.value.filter(p => p.status === BlogStatus.PUBLISHED))
const draftPosts = computed(() => activePosts.value.filter(p => p.status === BlogStatus.DRAFT))
const totalViews = computed(() => publishedPosts.value.length * 1280 + 8640)

const kpiCards = computed(() => [
  {
    label: 'Tổng bài viết',
    value: formatNumber(activePosts.value.length),
    icon: FileText,
    accent: 'bg-gradient-to-r from-primary-500 to-primary-400',
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    ring: 'ring-primary-100 dark:ring-primary-900/30',
    trend: '+3',
  },
  {
    label: 'Đã xuất bản',
    value: formatNumber(publishedPosts.value.length),
    icon: CheckCircle2,
    accent: 'bg-gradient-to-r from-success-500 to-success-400',
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    ring: 'ring-success-100 dark:ring-success-900/30',
    trend: '+5',
  },
  {
    label: 'Bản nháp',
    value: formatNumber(draftPosts.value.length),
    icon: FileEdit,
    accent: 'bg-gradient-to-r from-warning-500 to-warning-400',
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400',
    ring: 'ring-warning-100 dark:ring-warning-900/30',
    trend: '−2',
  },
  {
    label: 'Lượt xem',
    value: formatNumber(totalViews.value),
    icon: Eye,
    accent: 'bg-gradient-to-r from-info-500 to-info-400',
    bg: 'bg-info-50 dark:bg-info-900/20',
    text: 'text-info-600 dark:text-info-400',
    ring: 'ring-info-100 dark:ring-info-900/30',
    trend: '+12%',
  },
])

// ─── Featured posts (top 3 published with images) ────────
const featuredPosts = computed(() =>
  publishedPosts.value
    .filter(p => p.image_url)
    .sort((a, b) => (b.published_at || b.created_at).localeCompare(a.published_at || a.created_at))
    .slice(0, 3),
)

// ─── Filtered + sorted + paginated ────────────────────────
const filteredPosts = computed(() => {
  let result = activePosts.value
  if (debouncedSearch.value) {
    const q = debouncedSearch.value.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.excerpt || '').toLowerCase().includes(q) ||
      (p.author_name || '').toLowerCase().includes(q),
    )
  }
  if (statusFilter.value !== 'ALL') {
    result = result.filter(p => p.status === statusFilter.value)
  }
  const sorted = [...result]
  sorted.sort((a, b) => {
    let cmp = 0
    if (sortBy.value === 'title') cmp = a.title.localeCompare(b.title)
    else cmp = a.created_at.localeCompare(b.created_at)
    return sortDirection.value === 'asc' ? cmp : -cmp
  })
  return sorted
})

const total = computed(() => filteredPosts.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit.value)))

const pagedPosts = computed(() => {
  const start = (page.value - 1) * limit.value
  return filteredPosts.value.slice(start, start + limit.value)
})

watch([debouncedSearch, statusFilter], () => { page.value = 1 })

function toggleSort(col: string) {
  if (sortBy.value === col) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = col as 'created_at' | 'title'
    sortDirection.value = 'asc'
  }
}

function setFilter(f: 'ALL' | BlogStatus) {
  statusFilter.value = f
  page.value = 1
}

// ─── Mock view count (deterministic) ────────────────────
function viewCount(p: BlogPost): number {
  if (p.status !== BlogStatus.PUBLISHED) return 0
  const seed = [...p.id].reduce((s, c) => s + c.charCodeAt(0), 0)
  return ((seed * 137) % 9000) + 320
}

// ─── Delete ─────────────────────────────────────────────
function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  setTimeout(() => {
    const idx = posts.value.findIndex(p => p.id === deleteTarget.value!.id)
    if (idx !== -1) {
      posts.value[idx] = { ...posts.value[idx], deleted_at: new Date().toISOString() }
    }
    toast.success('Đã xóa bài viết')
    deleteTarget.value = null
    deleting.value = false
    if (page.value > totalPages.value) page.value = Math.max(1, totalPages.value)
  }, 400)
}

const deleteConfirmMessage = computed(() =>
  deleteTarget.value
    ? `Bạn có chắc muốn xóa bài viết "${deleteTarget.value.title}"? Hành động này không thể hoàn tác.`
    : '',
)

const statusTabs = computed(() => [
  { key: 'ALL' as const, label: 'Tất cả', count: activePosts.value.length },
  { key: BlogStatus.PUBLISHED, label: 'Đã xuất bản', count: publishedPosts.value.length },
  { key: BlogStatus.DRAFT, label: 'Bản nháp', count: draftPosts.value.length },
])

const columns = computed(() => [
  { key: 'title', label: 'Bài viết', sortable: true },
  { key: 'category', label: 'Danh mục', hideOnMobile: true },
  { key: 'author_name', label: 'Tác giả', hideOnMobile: true },
  { key: 'status', label: 'Trạng thái' },
  { key: 'published_at', label: 'Ngày xuất bản', sortable: true, hideOnMobile: true },
  { key: 'actions', label: t('common.actions'), align: 'right' as const, hideOnMobile: true },
])
</script>

<template>
  <div>
    <AppPageHeader title="Blog" subtitle="Quản lý và xuất bản bài viết cho website" breadcrumb-label="Blog">
      <template #actions>
        <NuxtLink to="/admin/blog/categories">
          <AppButton variant="outline">
            <Layers class="w-4 h-4" aria-hidden="true" /> Danh mục
          </AppButton>
        </NuxtLink>
        <NuxtLink to="/admin/blog/edit">
          <AppButton>
            <Plus class="w-4 h-4" aria-hidden="true" /> Viết bài
          </AppButton>
        </NuxtLink>
      </template>
    </AppPageHeader>

    <!-- KPI Row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="card p-5">
          <div class="flex items-center gap-3 mb-3">
            <AppSkeleton height="h-10" width="w-10" class="rounded-xl" />
            <div class="flex-1"><AppSkeleton height="h-3" width="w-16" /></div>
          </div>
          <AppSkeleton height="h-3" class="mb-2" />
          <AppSkeleton height="h-6" width="w-2/3" />
        </div>
      </template>
      <template v-else>
        <div
          v-for="(card, i) in kpiCards"
          :key="card.label"
          class="card card-hover p-5 stagger-item relative overflow-hidden group"
          :style="{ animationDelay: `${i * 40}ms` }"
        >
          <div :class="['kpi-accent', card.accent]" />
          <div class="flex items-start justify-between mb-2.5">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center ring-1 transition-transform duration-200 group-hover:scale-110', card.bg, card.ring]">
              <component :is="card.icon" :class="['w-5 h-5', card.text]" aria-hidden="true" />
            </div>
            <span class="text-xs font-medium text-success-600 dark:text-success-400 flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-success-50 dark:bg-success-900/20">
              <TrendingUp class="w-3 h-3" aria-hidden="true" /> {{ card.trend }}
            </span>
          </div>
          <p class="text-[13px] text-slate-500 dark:text-zinc-400 mb-1 font-medium">{{ card.label }}</p>
          <p class="text-2xl font-bold text-surface-foreground tracking-tight tabular-nums">{{ card.value }}</p>
        </div>
      </template>
    </div>

    <!-- Featured Posts -->
    <div v-if="!loading && featuredPosts.length" class="mb-6 stagger-item" style="animation-delay: 200ms">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center">
            <TrendingUp class="w-4 h-4 text-accent-600 dark:text-accent-400" aria-hidden="true" />
          </div>
          <h2 class="text-sm font-semibold text-surface-foreground">Bài viết nổi bật</h2>
        </div>
        <NuxtLink to="/admin/blog" class="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-0.5">
          Xem tất cả <ArrowRight class="w-3 h-3" aria-hidden="true" />
        </NuxtLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NuxtLink
          v-for="(post, i) in featuredPosts"
          :key="post.id"
          :to="`/admin/blog/edit?id=${post.id}`"
          class="card card-hover p-0 overflow-hidden group stagger-item"
          :style="{ animationDelay: `${220 + i * 60}ms` }"
        >
          <div class="relative aspect-[16/10] overflow-hidden bg-surface-muted">
            <img
              :src="post.image_url || ''"
              :alt="post.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/0" />
            <div class="absolute top-3 left-3">
              <AppBadge color="accent" variant="solid" size="sm">
                {{ post.category?.name || 'Tin tức' }}
              </AppBadge>
            </div>
            <div class="absolute bottom-3 left-3 right-3">
              <h3 class="text-white font-semibold text-sm leading-snug line-clamp-2 drop-shadow-sm">{{ post.title }}</h3>
            </div>
          </div>
          <div class="p-3.5 flex items-center justify-between">
            <div class="flex items-center gap-2 min-w-0">
              <AppAvatar :name="post.author_name || 'BunTech'" size="xs" />
              <span class="text-xs text-slate-600 dark:text-zinc-300 truncate">{{ post.author_name || 'BunTech' }}</span>
            </div>
            <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 flex-shrink-0">
              <span class="flex items-center gap-1 tabular-nums">
                <Eye class="w-3.5 h-3.5" aria-hidden="true" /> {{ formatNumber(viewCount(post)) }}
              </span>
              <span class="flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" aria-hidden="true" /> {{ formatDate(post.published_at || post.created_at) }}
              </span>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Toolbar -->
    <AppToolbar>
      <template #search>
        <AppSearchBar v-model="search" placeholder="Tìm bài viết theo tiêu đề, tác giả..." />
      </template>
      <template #filters>
        <div class="inline-flex p-1 rounded-lg bg-surface-hover border border-surface-border" role="tablist" aria-label="Lọc theo trạng thái">
          <button
            v-for="tab in statusTabs"
            :key="tab.key"
            type="button"
            role="tab"
            :aria-selected="statusFilter === tab.key"
            :class="[
              'inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] font-medium transition-all',
              statusFilter === tab.key
                ? 'bg-surface text-surface-foreground shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-surface-foreground',
            ]"
            @click="setFilter(tab.key)"
          >
            {{ tab.label }}
            <span
              :class="[
                'tabular-nums text-[11px] px-1.5 py-0.5 rounded-full',
                statusFilter === tab.key
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                  : 'bg-surface-border/40 text-slate-500 dark:text-zinc-400',
              ]"
            >{{ tab.count }}</span>
          </button>
        </div>
      </template>
    </AppToolbar>

    <!-- Table -->
    <div class="animate-fade-in-up" style="animation-delay: 100ms">
      <AppTable
        :columns="columns"
        :rows="pagedPosts as unknown as Record<string, unknown>[]"
        :loading="loading"
        :sort-by="sortBy"
        :sort-direction="sortDirection"
        row-key="id"
        :empty-title="statusFilter === 'ALL' ? 'Chưa có bài viết nào' : 'Không tìm thấy bài viết'"
        :empty-description="statusFilter === 'ALL' ? 'Bắt đầu chia sẻ câu chuyện của BunTech với khách hàng.' : 'Thử đổi bộ lọc hoặc từ khóa tìm kiếm.'"
        :empty-cta-text="'Viết bài mới'"
        @sort="toggleSort"
        @empty-action="router.push('/admin/blog/edit')"
        @row-click="(row: Record<string, unknown>) => router.push(`/admin/blog/edit?id=${row.id}`)"
      >
        <template #cell-title="{ row }">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-muted ring-1 ring-surface-border">
              <img
                v-if="(row as BlogPost).image_url"
                :src="(row as BlogPost).image_url || ''"
                :alt="(row as BlogPost).title"
                class="w-full h-full object-cover"
                loading="lazy"
              >
              <div v-else class="w-full h-full flex items-center justify-center">
                <ImageIcon class="w-4 h-4 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </div>
            <div class="min-w-0">
              <p class="font-medium text-surface-foreground truncate max-w-[280px]">{{ (row as BlogPost).title }}</p>
              <p class="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-[280px]">{{ (row as BlogPost).excerpt || '—' }}</p>
            </div>
          </div>
        </template>

        <template #cell-category="{ row }">
          <AppBadge color="info" variant="soft">{{ (row as BlogPost).category?.name || '—' }}</AppBadge>
        </template>

        <template #cell-author_name="{ row }">
          <div class="flex items-center gap-2">
            <AppAvatar :name="(row as BlogPost).author_name || 'BunTech'" size="xs" />
            <span class="text-sm text-surface-foreground truncate">{{ (row as BlogPost).author_name || 'BunTech' }}</span>
          </div>
        </template>

        <template #cell-status="{ value }">
          <AppBadge :color="value === BlogStatus.PUBLISHED ? 'success' : 'warning'" :dot="true">
            {{ value === BlogStatus.PUBLISHED ? 'Đã xuất bản' : 'Bản nháp' }}
          </AppBadge>
        </template>

        <template #cell-published_at="{ value, row }">
          <div class="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
            <Clock class="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span v-if="value">{{ formatDate(value as string) }}</span>
            <span v-else class="italic text-slate-400 dark:text-zinc-500">Chưa XB</span>
          </div>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end gap-1" @click.stop>
            <NuxtLink :to="`/admin/blog/edit?id=${(row as BlogPost).id}`" class="inline-flex">
              <AppIconButton :icon="Pencil" label="Sửa bài viết" variant="edit" />
            </NuxtLink>
            <AppIconButton :icon="Trash2" label="Xóa bài viết" variant="delete" @click.stop="deleteTarget = row as BlogPost" />
          </div>
        </template>

        <!-- Mobile card -->
        <template #mobile-row="{ row }">
          <div class="flex gap-3">
            <div class="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-surface-muted ring-1 ring-surface-border">
              <img
                v-if="(row as BlogPost).image_url"
                :src="(row as BlogPost).image_url || ''"
                :alt="(row as BlogPost).title"
                class="w-full h-full object-cover"
                loading="lazy"
              >
              <div v-else class="w-full h-full flex items-center justify-center">
                <ImageIcon class="w-5 h-5 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
              </div>
            </div>
            <div class="flex-1 min-w-0 space-y-1.5">
              <p class="font-medium text-surface-foreground line-clamp-2">{{ (row as BlogPost).title }}</p>
              <div class="flex items-center gap-2 flex-wrap">
                <AppBadge color="info" variant="soft">{{ (row as BlogPost).category?.name || '—' }}</AppBadge>
                <AppBadge :color="(row as BlogPost).status === BlogStatus.PUBLISHED ? 'success' : 'warning'" :dot="true">
                  {{ (row as BlogPost).status === BlogStatus.PUBLISHED ? 'Đã xuất bản' : 'Bản nháp' }}
                </AppBadge>
              </div>
              <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
                <span class="flex items-center gap-1"><Users class="w-3 h-3" aria-hidden="true" /> {{ (row as BlogPost).author_name || 'BunTech' }}</span>
                <span class="flex items-center gap-1"><Eye class="w-3 h-3" aria-hidden="true" /> {{ formatNumber(viewCount(row as BlogPost)) }}</span>
              </div>
            </div>
            <div class="flex flex-col gap-1 flex-shrink-0">
              <NuxtLink :to="`/admin/blog/edit?id=${(row as BlogPost).id}`" class="inline-flex">
                <AppIconButton :icon="Pencil" label="Sửa" variant="edit" />
              </NuxtLink>
              <AppIconButton :icon="Trash2" label="Xóa" variant="delete" @click.stop="deleteTarget = row as BlogPost" />
            </div>
          </div>
        </template>

        <template #pagination>
          <AppPagination
            :page="page"
            :total-pages="totalPages"
            :total="total"
            :from="total === 0 ? 0 : (page - 1) * limit + 1"
            :to="Math.min(page * limit, total)"
            :limit="limit"
            @update:page="page = $event"
            @update:limit="limit = $event; page = 1"
          />
        </template>
      </AppTable>
    </div>

    <AppConfirmDialog
      :model-value="!!deleteTarget"
      title="Xóa bài viết"
      :message="deleteConfirmMessage"
      variant="danger"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>
