<script setup lang="ts">
import { z } from 'zod'
import { productService } from '~/services/productService'
import type { CustomPrice, AdminProduct } from '~/utils/types'
import { useCustomerPrices } from '~/composables/admin/useCustomerPrices'
import type { PaginationMeta } from '~/types/api'
import { t } from '~/utils/i18n'

const props = defineProps<{
  userId: string | number
}>()

const { fetchPrices, upsertPrice, deletePrice } = useCustomerPrices()

// --- Table Data ---
const prices = ref<CustomPrice[]>([])
const loading = ref(true)
const meta = ref<PaginationMeta>({
  currentPage: 1,
  perPage: 10,
  total: 0,
  lastPage: 1,
  firstPage: 1,
  from: 0,
  to: 0
})

async function loadPrices() {
  loading.value = true
  try {
    const res = await fetchPrices(props.userId, {
      page: meta.value.currentPage,
      limit: meta.value.perPage
    })
    if (res.data) {
      prices.value = res.data.data
      meta.value = res.data.meta
    }
  } catch {
    // Error is handled by ApiClient
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPrices()
})

function handlePageChange(p: number) {
  meta.value.currentPage = p
  loadPrices()
}

// --- Delete ---
const { confirm } = useConfirmDialog()
async function handleDelete(productId: number) {
  const confirmed = await confirm({
    title: t('admin_price_del_title'),
    description: t('admin_price_del_desc'),
    color: 'error',
    confirmLabel: t('delete')
  })
  if (!confirmed) return

  loading.value = true
  try {
    await deletePrice(props.userId, productId)
    await loadPrices()
  } catch {
    // Error is handled by ApiClient
  } finally {
    loading.value = false
  }
}

// --- Modal & Form ---
const showModal = ref(false)
const isEditing = ref(false)
const selectedProduct = ref<AdminProduct | undefined>(undefined)

const schema = z.object({
  productId: z.number({ message: t('admin_price_err_product') }),
  customPrice: z.coerce
    .number({ message: t('admin_price_err_price_req') })
    .min(1, t('admin_price_err_price_min'))
})

const state = reactive({
  productId: undefined as number | undefined,
  customPrice: undefined as number | undefined
})

const formErrors = reactive<Record<string, string>>({})
const formRef = ref({
  setErrors: (errors: { path: string; message: string }[]) => {
    Object.keys(formErrors).forEach((key) => {
      formErrors[key] = ''
    })
    errors.forEach((e) => {
      formErrors[e.path] = e.message
    })
  },
  clearErrors: () => {
    Object.keys(formErrors).forEach((key) => {
      formErrors[key] = ''
    })
  }
})

const validateForm = () => {
  formRef.value.clearErrors()
  const result = schema.safeParse(state)
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path[0]?.toString() || '',
      message: issue.message
    }))
    formRef.value.setErrors(errors)
    return false
  }
  return true
}

function openAddModal() {
  isEditing.value = false
  state.productId = undefined
  state.customPrice = undefined
  formRef.value.clearErrors()
  selectedProduct.value = undefined
  showModal.value = true
}

function openEditModal(row: CustomPrice) {
  isEditing.value = true
  state.productId = Number(row.productId)
  state.customPrice = Number(row.customPrice)
  selectedProduct.value = row.product as unknown as AdminProduct
  formRef.value.clearErrors()
  showModal.value = true
}

const { isSubmitting, handleSubmit } = useFormSubmit()

const handleSave = handleSubmit(
  async (data: { productId: number; customPrice: number }) => {
    await upsertPrice(props.userId, {
      productId: data.productId,
      customPrice: data.customPrice
    })
    showModal.value = false
    await loadPrices()
  },
  { formRef }
)

const handleFormSubmit = () => {
  if (validateForm()) {
    handleSave({
      productId: Number(state.productId),
      customPrice: Number(state.customPrice)
    })
  }
}

const searchQuery = ref('')
const searchProducts = ref<AdminProduct[]>([])

watch(
  searchQuery,
  async (q) => {
    try {
      const res = await productService.getAdminProducts({ search: q || '', limit: 50 })
      searchProducts.value = res.data?.data || []
    } catch {
      searchProducts.value = []
    }
  },
  { immediate: true }
)

watch(selectedProduct, (val) => {
  state.productId = val?.id
})
</script>

<template>
  <div>
    <div class="mb-4 flex justify-end">
      <UButton icon="i-lucide-plus" color="primary" @click="openAddModal">{{
        $t('admin_price_btn_add')
      }}</UButton>
    </div>

    <BaseDataTable
      :columns="[
        { accessorKey: 'product', header: $t('nav_products') },
        { accessorKey: 'price', header: $t('admin_price_col_price'), class: 'text-right' },
        { accessorKey: 'actions', header: '', class: 'w-16' }
      ]"
      :rows="prices"
      :loading="loading"
      :meta="meta"
      :empty-title="$t('admin_price_empty_title')"
      :empty-description="$t('admin_price_empty_desc')"
      @page-change="handlePageChange"
    >
      <template #product-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="getImageUrl((row as CustomPrice).product?.thumbnailUrl || undefined) || undefined"
            :alt="(row as CustomPrice).product?.name"
            icon="i-lucide-image"
            size="md"
            class="bg-slate-100 dark:bg-slate-800"
          />
          <span class="text-surface-foreground font-medium">{{
            (row as CustomPrice).product?.name || $t('admin_price_col_product_deleted')
          }}</span>
        </div>
      </template>

      <template #price-cell="{ row }">
        <div class="text-right">
          <span class="text-primary-600 font-semibold">{{
            formatVND(Number((row as CustomPrice).customPrice))
          }}</span>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-1">
          <UButton
            icon="i-lucide-pencil"
            color="primary"
            variant="ghost"
            @click.stop="openEditModal(row as CustomPrice)"
          />
          <UButton
            icon="i-lucide-trash-2"
            color="error"
            variant="ghost"
            @click.stop="handleDelete(Number((row as CustomPrice).productId))"
          />
        </div>
      </template>
    </BaseDataTable>

    <UModal v-model:open="showModal" :title="$t('admin_price_modal_title')">
      <template #body>
        <form id="custom-price-form" class="space-y-4" @submit.prevent="handleFormSubmit">
          <UFormField
            :label="$t('nav_products')"
            name="productId"
            required
            :error="formErrors.productId"
          >
            <USelectMenu
              v-model="selectedProduct"
              v-model:search-term="searchQuery"
              :items="searchProducts"
              :placeholder="$t('public_products_search_ph')"
              label-key="name"
              class="w-full"
              :disabled="isEditing"
            >
              <template #item="{ item }">
                <div class="flex items-center gap-2">
                  <UAvatar
                    :src="
                      getImageUrl((item as AdminProduct).thumbnailUrl || undefined) || undefined
                    "
                    icon="i-lucide-image"
                    size="2xs"
                  />
                  <span>{{ (item as AdminProduct).name }}</span>
                </div>
              </template>
            </USelectMenu>
          </UFormField>

          <UFormField
            :label="$t('admin_price_modal_price')"
            name="customPrice"
            required
            :error="formErrors.customPrice"
          >
            <div class="relative">
              <UInput
                v-model.number="state.customPrice"
                type="number"
                :placeholder="$t('admin_price_modal_price_ph')"
                class="w-full"
              />
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span class="text-sm text-slate-400">VND</span>
              </div>
            </div>
            <template v-if="state.customPrice" #description>
              {{ formatVND(Number(state.customPrice)) }}
            </template>
          </UFormField>
        </form>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="ghost" @click="showModal = false">{{
            $t('common_cancel')
          }}</UButton>
          <UButton form="custom-price-form" type="submit" color="primary" :loading="isSubmitting">{{
            $t('admin_price_modal_btn_save2')
          }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
