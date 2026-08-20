<script setup lang="ts">
import { productService } from '~/services/productService'
import type { AdminProduct, ProductCategory } from '~/utils/types'
import { normalizePaginationResponse } from '~/utils/api'
import { t } from '~/utils/i18n'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: t('admin_products_seo_title') })

// ─── State ────────────────────────────────────────────────
const search = ref('')
const statusFilter = ref<string>('ALL')
const categoryFilter = ref<number | string>('ALL')
const page = ref(1)
const perPage = ref(10)

const { data: catData } = useAsyncData('admin-product-categories', () =>
  productService.getAdminCategories()
)
const categoryOptions = computed(() => {
  const options =
    catData.value?.data?.data?.map((c: ProductCategory) => ({ label: c.name, value: c.id })) || []
  return [{ label: t('admin_blog_all_cats'), value: 'ALL' }, ...options]
})

const {
  data: rawRes,
  pending,
  refresh
} = useAsyncData(
  'admin-products',
  () =>
    productService.getAdminProducts({
      page: page.value,
      limit: perPage.value,
      search: search.value,
      status: statusFilter.value,
      categoryId: categoryFilter.value !== 'ALL' ? categoryFilter.value : undefined
    }),
  { watch: [page, perPage, search, statusFilter, categoryFilter] }
)

const normalized = computed(() => normalizePaginationResponse<AdminProduct>(rawRes.value))
const products = computed(() => normalized.value.data)
const meta = computed(() => normalized.value.meta)

// ─── Computed KPIs ────────────────────────────────────────
const totalProducts = computed(() => meta.value.total || 0)
const activeProducts = computed(() => products.value.filter((p) => p.isActive).length)
const inactiveProducts = computed(() => products.value.filter((p) => !p.isActive).length)

const kpiStats = computed(() => [
  {
    title: t('admin_prod_kpi_total'),
    value: totalProducts.value,
    icon: 'i-lucide-package',
    color: 'primary' as const,
    trend: { value: 0, isPositive: true }
  },
  {
    title: t('admin_products_kpi_active'),
    value: activeProducts.value,
    icon: 'i-lucide-check-circle-2',
    color: 'success' as const,
    trend: { value: 0, isPositive: true }
  },
  {
    title: t('admin_products_kpi_inactive'),
    value: inactiveProducts.value,
    icon: 'i-lucide-minus-circle',
    color: 'warning' as const,
    trend: { value: 0, isPositive: false }
  }
])

const columns = [
  { accessorKey: 'product', header: t('nav_products') },
  { accessorKey: 'category', header: t('nav_categories') },
  { accessorKey: 'price', header: t('admin_products_col_price') },
  { accessorKey: 'status', header: t('status') },
  { accessorKey: 'actions', header: t('actions') }
]

async function handleDelete(id: number) {
  if (!confirm(t('admin_products_del_confirm'))) return
  try {
    await productService.deleteProduct(id)
    await refresh()
  } catch {
    // Error is handled by global interceptor
  }
}
</script>

<template>
  <div>
    <BasePageHeader
      :title="$t('nav_products')"
      :description="$t('admin_products_desc')"
      :breadcrumbs="[
        { label: $t('nav_home'), to: '/admin', icon: 'i-lucide-home' },
        { label: $t('nav_products') }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/products/categories">
          <UIcon name="i-lucide-layers" class="mr-1 h-4 w-4" /> {{ $t('nav_categories') }}
        </UButton>
        <UButton to="/admin/products/edit">
          <UIcon name="i-lucide-plus" class="mr-1 h-4 w-4" /> {{ $t('admin_products_add') }}
        </UButton>
      </template>
    </BasePageHeader>

    <template v-if="pending && !products.length">
      <BasePageLoading />
    </template>
    <template v-else>
      <div class="mb-6">
        <BaseStatsGrid :stats="kpiStats" :columns="3" />
      </div>

      <!-- Table Section -->
      <div class="card stagger-item p-5" style="animation-delay: 200ms">
        <div class="mb-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div class="w-full max-w-sm flex-1">
            <BaseSearchInput
              v-model="search"
              :placeholder="$t('admin_products_filter_placeholder')"
            />
          </div>
          <div class="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
            <USelectMenu
              v-model="categoryFilter"
              :items="categoryOptions"
              value-key="value"
              label-key="label"
              class="w-full sm:w-48"
            />
            <USelectMenu
              v-model="statusFilter"
              :items="[
                { label: $t('admin_blog_status_all'), value: 'ALL' },
                { label: $t('status_published'), value: 'PUBLISHED' },
                { label: $t('status_draft'), value: 'DRAFT' }
              ]"
              value-key="value"
              label-key="label"
              class="w-full sm:w-48"
            />
          </div>
        </div>

        <div class="bg-surface ring-surface-border overflow-hidden rounded-lg ring-1">
          <BaseDataTable
            :columns="columns"
            :rows="products"
            :empty-title="$t('admin_order_picker_empty')"
            :empty-description="$t('admin_products_empty_desc')"
            empty-icon="i-lucide-package-x"
          >
            <template #product-cell="{ row }">
              <div class="flex max-w-sm gap-3">
                <NuxtImg
                  :src="getImageUrl(row.thumbnailUrl) || '/images/logo_sm.webp'"
                  width="100"
                  height="100"
                  class="border-surface-border h-12 w-12 flex-shrink-0 rounded-lg border object-cover shadow-sm"
                />
                <div class="flex min-w-0 flex-col justify-center">
                  <NuxtLink
                    :to="`/admin/products/edit?id=${row.id}`"
                    class="text-surface-foreground hover:text-primary-600 line-clamp-1 cursor-pointer text-sm font-semibold transition-colors"
                  >
                    {{ row.name }}
                  </NuxtLink>
                  <p
                    class="mt-0.5 line-clamp-1 font-mono text-xs text-slate-500 dark:text-zinc-400"
                  >
                    {{ row.slug }}
                  </p>
                </div>
              </div>
            </template>
            <template #category-cell="{ row }">
              <UBadge color="primary" variant="subtle" size="sm">
                {{ row.category?.name || $t('admin_blog_default_cat') }}
              </UBadge>
            </template>
            <template #price-cell="{ row }">
              <div class="flex flex-col">
                <span
                  class="text-surface-foreground text-primary-600 dark:text-primary-400 text-sm font-semibold"
                >
                  {{
                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                      row.basePrice || 0
                    )
                  }}
                </span>
                <span class="text-xs text-slate-500">
                  / {{ row.unit || $t('admin_products_default_unit') }}
                </span>
              </div>
            </template>
            <template #status-cell="{ row }">
              <UBadge :color="row.isActive ? 'success' : 'warning'" variant="subtle" size="sm">
                <span class="flex items-center gap-1">
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="row.isActive ? 'bg-success-500' : 'bg-warning-500'"
                  />
                  {{ row.isActive ? $t('status_published') : $t('status_draft') }}
                </span>
              </UBadge>
            </template>
            <template #actions-cell="{ row }">
              <div class="flex items-center gap-1">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-lucide-pencil"
                  :to="`/admin/products/edit?id=${row.id}`"
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
