<script setup lang="ts">
import { blogService } from '~/services/blogService'
import type { BlogPost } from '~/utils/types'
import { normalizePaginationResponse } from '~/utils/api'
import { t } from '~/utils/i18n'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: t('admin_blog_seo_title') })

// ─── State ────────────────────────────────────────────────
const search = ref('')
const statusFilter = ref<string>('ALL')
const page = ref(1)
const perPage = ref(10)

const categoryFilter = ref<number | string>('ALL')

const { data: catData } = useAsyncData('admin-categories', () => blogService.getAdminCategories())
const categoryOptions = computed(() => {
  const options = catData.value?.data?.map((c) => ({ label: c.name, value: c.id })) || []
  return [{ label: t('admin_blog_all_cats'), value: 'ALL' }, ...options]
})

const {
  data: rawRes,
  pending,
  refresh
} = useAsyncData(
  'admin-posts',
  () =>
    blogService.getAdminPosts({
      page: page.value,
      limit: perPage.value,
      search: search.value,
      status: statusFilter.value,
      categoryId: categoryFilter.value !== 'ALL' ? categoryFilter.value : undefined
    }),
  { watch: [page, perPage, search, statusFilter, categoryFilter] }
)

const normalized = computed(() => normalizePaginationResponse<BlogPost>(rawRes.value))
const posts = computed<BlogPost[]>(() => normalized.value.data)
const meta = computed(() => normalized.value.meta)

// ─── Filtered Posts (Dữ liệu đã được BE lọc) ────────
const filteredPosts = computed(() => posts.value)

// ─── Computed KPIs (Dựa trên dữ liệu page hiện tại hoặc giả định) ────────
const totalPosts = computed(() => meta.value.total || 0)
const publishedPosts = computed(() => posts.value.filter((p) => p.isPublished).length)
const draftPosts = computed(() => posts.value.filter((p) => !p.isPublished).length)
const totalViews = computed(() => posts.value.reduce((s, p) => s + (p.views || 0), 0))

const kpiStats = computed(() => [
  {
    title: t('admin_blog_kpi_total'),
    value: totalPosts.value,
    icon: 'i-lucide-file-text',
    color: 'primary' as const,
    trend: { value: 0, isPositive: true }
  },
  {
    title: t('status_blog_published'),
    value: publishedPosts.value,
    icon: 'i-lucide-check-circle-2',
    color: 'success' as const,
    trend: { value: 0, isPositive: true }
  },
  {
    title: t('admin_blog_kpi_draft'),
    value: draftPosts.value,
    icon: 'i-lucide-file-edit',
    color: 'warning' as const,
    trend: { value: 0, isPositive: false }
  },
  {
    title: t('admin_blog_kpi_views'),
    value: new Intl.NumberFormat('vi-VN').format(totalViews.value),
    icon: 'i-lucide-eye',
    color: 'info' as const,
    trend: { value: 0, isPositive: true }
  }
])

// ─── Featured Posts ───────────────────────────────────────
const featuredPosts = computed(() => posts.value.slice(0, 3))

const columns = [
  { accessorKey: 'title', header: t('nav_blog_posts') },
  { accessorKey: 'category', header: t('nav_categories') },
  { accessorKey: 'author', header: t('admin_blog_col_author') },
  { accessorKey: 'status', header: t('status') },
  { accessorKey: 'date', header: t('admin_blog_col_date') },
  { accessorKey: 'actions', header: t('actions') }
]

async function handleDelete(id: number) {
  if (!confirm(t('admin_blog_del_confirm'))) return
  await blogService.deletePost(id)
  refresh()
}
</script>

<template>
  <div>
    <BasePageHeader
      :title="$t('nav_blog_posts')"
      :description="$t('admin_blog_desc')"
      :breadcrumbs="[
        { label: $t('nav_home'), to: '/admin', icon: 'i-lucide-home' },
        { label: $t('nav_blog_posts') }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/blog/categories">
          <UIcon name="i-lucide-layers" class="mr-1 h-4 w-4" /> {{ $t('nav_categories') }}
        </UButton>
        <UButton to="/admin/blog/edit">
          <UIcon name="i-lucide-plus" class="mr-1 h-4 w-4" /> {{ $t('admin_blog_btn_add') }}
        </UButton>
      </template>
    </BasePageHeader>

    <template v-if="pending && !posts.length">
      <BasePageLoading />
    </template>
    <template v-else>
      <div class="mb-6">
        <BaseStatsGrid :stats="kpiStats" :columns="4" />
      </div>
      <!-- Featured Posts -->
      <div v-if="featuredPosts.length > 0" class="stagger-item mb-8" style="animation-delay: 200ms">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-surface-foreground flex items-center gap-2 text-sm font-semibold">
            <UIcon name="i-lucide-trending-up" class="text-primary-500 h-4 w-4" />
            {{ $t('admin_blog_featured_title') }}
          </h3>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            v-for="(post, i) in featuredPosts"
            :key="post.id"
            class="group animate-fade-in-up relative aspect-[16/10] cursor-pointer overflow-hidden rounded-xl"
            :style="{ animationDelay: `${i * 100 + 250}ms` }"
            @click="navigateTo(`/admin/blog/edit?id=${post.id}`)"
          >
            <NuxtImg
              :src="getImageUrl(post.thumbnailUrl) || '/images/logo_sm.webp'"
              width="800"
              height="500"
              class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"
            />
            <div class="absolute inset-0 flex flex-col justify-end p-5">
              <UBadge color="primary" class="mb-2 w-fit">{{
                post.category?.name || $t('admin_blog_default_cat')
              }}</UBadge>
              <h4
                class="group-hover:text-primary-300 mb-2 line-clamp-2 text-lg leading-tight font-semibold text-white transition-colors"
              >
                {{ post.title }}
              </h4>
              <div class="flex items-center gap-3 text-xs text-slate-300">
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-eye" class="h-3.5 w-3.5" />
                  {{ new Intl.NumberFormat('vi-VN').format(post.views || 0) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Table Section -->
      <div class="card stagger-item p-5" style="animation-delay: 500ms">
        <div class="mb-4 flex items-center justify-between gap-4">
          <div class="max-w-sm flex-1">
            <BaseSearchInput v-model="search" :placeholder="$t('admin_blog_filter_placeholder')" />
          </div>
          <div class="flex items-center gap-2">
            <USelectMenu
              v-model="categoryFilter"
              :items="categoryOptions"
              value-key="value"
              label-key="label"
              class="w-45"
            />
            <USelectMenu
              v-model="statusFilter"
              :items="[
                { label: $t('admin_blog_status_all'), value: 'ALL' },
                { label: $t('status_blog_published'), value: 'PUBLISHED' },
                { label: $t('admin_blog_kpi_draft'), value: 'DRAFT' }
              ]"
              value-key="value"
              label-key="label"
              class="w-45"
            />
          </div>
        </div>
        <div class="bg-surface ring-surface-border overflow-hidden rounded-lg ring-1">
          <BaseDataTable
            :columns="columns"
            :rows="filteredPosts"
            :empty-title="$t('admin_blog_empty_title')"
            :empty-description="$t('admin_blog_empty_desc')"
            empty-icon="i-lucide-file-text"
          >
            <template #title-cell="{ row }">
              <div class="flex max-w-sm gap-3">
                <NuxtImg
                  :src="getImageUrl(row.thumbnailUrl) || '/images/logo_sm.webp'"
                  width="100"
                  height="100"
                  class="border-surface-border h-12 w-12 flex-shrink-0 rounded border object-cover"
                />
                <div class="min-w-0">
                  <NuxtLink
                    :to="`/admin/blog/edit?id=${row.id}`"
                    class="text-surface-foreground hover:text-primary-600 line-clamp-1 cursor-pointer text-sm font-medium transition-colors"
                  >
                    {{ row.title }}
                  </NuxtLink>
                  <p class="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-zinc-400">
                    {{ row.excerpt }}
                  </p>
                </div>
              </div>
            </template>
            <template #category-cell="{ row }">
              <UBadge color="primary" variant="subtle" size="sm">
                {{ row.category?.name || $t('admin_blog_default_cat') }}
              </UBadge>
            </template>
            <template #author-cell="{ row }">
              <div class="flex items-center gap-2">
                <UAvatar :alt="row.author?.fullName || 'A'" size="xs" />
                <span class="text-surface-foreground text-sm font-medium">
                  {{ row.author?.fullName || `ID: ${row.authorId}` }}
                </span>
              </div>
            </template>
            <template #status-cell="{ row }">
              <UBadge :color="row.isPublished ? 'success' : 'warning'" variant="subtle" size="sm">
                <span class="flex items-center gap-1">
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="row.isPublished ? 'bg-success-500' : 'bg-warning-500'"
                  />
                  {{ row.isPublished ? $t('status_blog_published') : $t('admin_blog_kpi_draft') }}
                </span>
              </UBadge>
            </template>
            <template #date-cell="{ row }">
              <span class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-zinc-400">
                <UIcon name="i-lucide-clock" class="h-3.5 w-3.5" />
                {{
                  row.isPublished && row.publishedAt
                    ? formatDate(row.publishedAt)
                    : $t('admin_blog_unpublished')
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
                  :to="`/admin/blog/edit?id=${row.id}`"
                />
                <UButton
                  variant="ghost"
                  color="error"
                  size="sm"
                  icon="i-lucide-trash-2"
                  @click="handleDelete(row.id)"
                />
              </div>
            </template>
            <template #pagination>
              <div
                v-if="meta.total > 0"
                class="border-surface-border flex items-center justify-between border-t px-4 py-3"
              >
                <span class="text-sm text-slate-500 tabular-nums">
                  {{ (page - 1) * perPage + 1 }}-{{ Math.min(page * perPage, meta.total) }} /
                  {{ meta.total }}
                </span>
                <UPagination v-model:page="page" :total="meta.total" :items-per-page="perPage" />
              </div>
            </template>
          </BaseDataTable>
        </div>
      </div>
    </template>
  </div>
</template>
