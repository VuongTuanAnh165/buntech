<script setup lang="ts">
import { productService } from '~/services/productService'
import type { AdminProduct, ProductCategory } from '~/utils/types'
import { normalizePaginationResponse } from '~/utils/api'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Quản lý Sản phẩm - BunTech Admin' })

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
  return [{ label: 'Tất cả danh mục', value: 'ALL' }, ...options]
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
    title: 'Tổng sản phẩm',
    value: totalProducts.value,
    icon: 'i-lucide-package',
    color: 'primary' as const,
    trend: { value: 0, isPositive: true }
  },
  {
    title: 'Đang bán (trang này)',
    value: activeProducts.value,
    icon: 'i-lucide-check-circle-2',
    color: 'success' as const,
    trend: { value: 0, isPositive: true }
  },
  {
    title: 'Ngừng bán (trang này)',
    value: inactiveProducts.value,
    icon: 'i-lucide-minus-circle',
    color: 'warning' as const,
    trend: { value: 0, isPositive: false }
  }
])

const columns = [
  { accessorKey: 'product', header: 'Sản phẩm' },
  { accessorKey: 'category', header: 'Danh mục' },
  { accessorKey: 'price', header: 'Giá / Đơn vị' },
  { accessorKey: 'status', header: 'Trạng thái' },
  { accessorKey: 'actions', header: 'Hành động' }
]

async function handleDelete(id: number) {
  if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
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
      title="Sản phẩm"
      description="Quản lý danh sách sản phẩm, giá bán và hình ảnh hiển thị."
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Sản phẩm' }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/products/categories">
          <UIcon name="i-lucide-layers" class="mr-1 h-4 w-4" /> Danh mục
        </UButton>
        <UButton to="/admin/products/edit">
          <UIcon name="i-lucide-plus" class="mr-1 h-4 w-4" /> Thêm sản phẩm
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
            <BaseSearchInput v-model="search" placeholder="Lọc sản phẩm theo tên..." />
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
                { label: 'Tất cả trạng thái', value: 'ALL' },
                { label: 'Đang bán', value: 'PUBLISHED' },
                { label: 'Ngừng bán', value: 'DRAFT' }
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
            empty-title="Không tìm thấy sản phẩm"
            empty-description="Thử đổi bộ lọc hoặc thêm sản phẩm mới."
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
                {{ row.category?.name || 'Chưa phân loại' }}
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
                <span class="text-xs text-slate-500"> / {{ row.unit || 'sản phẩm' }} </span>
              </div>
            </template>
            <template #status-cell="{ row }">
              <UBadge :color="row.isActive ? 'success' : 'warning'" variant="subtle" size="sm">
                <span class="flex items-center gap-1">
                  <span
                    class="h-1.5 w-1.5 rounded-full"
                    :class="row.isActive ? 'bg-success-500' : 'bg-warning-500'"
                  />
                  {{ row.isActive ? 'Đang bán' : 'Ngừng bán' }}
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
