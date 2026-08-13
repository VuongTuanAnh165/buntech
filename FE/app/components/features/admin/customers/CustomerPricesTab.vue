<script setup lang="ts">
import { z } from 'zod'
import { productService } from '~/services/productService'
import type { CustomPrice, AdminProduct } from '~/utils/types'
import { useCustomerPrices } from '~/composables/admin/useCustomerPrices'
import type { PaginationMeta } from '~/types/api'

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
    title: 'Xóa giá riêng',
    description:
      'Bạn có chắc chắn muốn xóa giá riêng của sản phẩm này? Hệ thống sẽ sử dụng lại giá gốc.',
    color: 'error',
    confirmLabel: 'Xóa'
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
  productId: z.number({ message: 'Vui lòng chọn sản phẩm' }),
  customPrice: z.number({ message: 'Vui lòng nhập giá riêng' }).min(1, 'Giá phải lớn hơn 0')
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
    handleSave(state as { productId: number; customPrice: number })
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
      <UButton icon="i-lucide-plus" color="primary" @click="openAddModal">Thiết lập giá</UButton>
    </div>

    <BaseDataTable
      :columns="[
        { accessorKey: 'product', header: 'Sản phẩm' },
        { accessorKey: 'price', header: 'Giá riêng', class: 'text-right' },
        { accessorKey: 'actions', header: '', class: 'w-16' }
      ]"
      :rows="prices"
      :loading="loading"
      :meta="meta"
      empty-title="Chưa có giá riêng"
      @page-change="handlePageChange"
    >
      <template #product-cell="{ row }">
        <div class="flex items-center gap-3">
          <UAvatar
            :src="(row as CustomPrice).product?.thumbnailUrl || undefined"
            :alt="(row as CustomPrice).product?.name"
            icon="i-lucide-image"
            size="md"
            class="bg-slate-100 dark:bg-slate-800"
          />
          <span class="text-surface-foreground font-medium">{{
            (row as CustomPrice).product?.name || 'Sản phẩm đã xoá'
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

    <UModal v-model:open="showModal" title="Thiết lập giá riêng">
      <template #body>
        <form id="custom-price-form" class="space-y-4" @submit.prevent="handleFormSubmit">
          <UFormField label="Sản phẩm" name="productId" required :error="formErrors.productId">
            <USelectMenu
              v-model="selectedProduct"
              v-model:search-term="searchQuery"
              :items="searchProducts"
              placeholder="Tìm kiếm sản phẩm..."
              label-key="name"
              class="w-full"
              :disabled="isEditing"
            >
              <template #item="{ item }">
                <div class="flex items-center gap-2">
                  <UAvatar
                    :src="(item as AdminProduct).thumbnailUrl || undefined"
                    icon="i-lucide-image"
                    size="2xs"
                  />
                  <span>{{ (item as AdminProduct).name }}</span>
                </div>
              </template>
            </USelectMenu>
          </UFormField>

          <UFormField label="Giá riêng" name="customPrice" required :error="formErrors.customPrice">
            <div class="relative">
              <UInput
                v-model.number="state.customPrice"
                type="number"
                placeholder="Ví dụ: 15000"
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
          <UButton color="neutral" variant="ghost" @click="showModal = false">Hủy</UButton>
          <UButton form="custom-price-form" type="submit" color="primary" :loading="isSubmitting"
            >Lưu giá</UButton
          >
        </div>
      </template>
    </UModal>
  </div>
</template>
