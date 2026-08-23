<script setup lang="ts">
import { customerService } from '~/services/customerService'
import { formatCurrency } from '~/utils/format'
import type { AdminProduct, Address } from '~/utils/types'
import { t } from '~/utils/i18n'

useSeoMeta({ title: t('wholesale_order_seo_title') })
definePageMeta({ layout: 'default' })

const toast = useToast()

// State for products
const page = ref(1)
const search = ref('')
const selectedCategoryId = ref<number | undefined>(undefined)

// Selected Items mapping: productId -> quantity
const selectedItems = ref<
  Record<
    number,
    {
      product: AdminProduct & { originalBasePrice?: string; hasCustomPrice?: boolean }
      quantity: number
    }
  >
>({})

// Debounce search
const searchDebounced = refDebounced(search, 300)

// Data fetching for products
const { data: productsResponse, pending: loadingProducts } = useAsyncData(
  'wholesale-products',
  () =>
    customerService.getProducts({
      page: page.value,
      limit: 12, // Show more per page for easy ordering
      search: searchDebounced.value,
      categoryId: selectedCategoryId.value
    }),
  {
    watch: [page, searchDebounced, selectedCategoryId]
  }
)

const products = computed(
  () =>
    (productsResponse.value?.data?.data as unknown as Array<
      AdminProduct & { originalBasePrice?: string; hasCustomPrice?: boolean }
    >) || []
)
const totalProducts = computed(() => productsResponse.value?.data?.meta?.total || 0)

// Data fetching for addresses
const { data: addressesResponse, pending: loadingAddresses } = useAsyncData(
  'customer-addresses',
  () => customerService.getAddresses()
)
const addresses = computed(() => addressesResponse.value?.data || [])

// Form State
const shippingAddressId = ref<number | undefined>(undefined)
const deliveryDate = ref<string>('')
const note = ref<string>('')
const isSubmitting = ref(false)

// Set default address if available
watchEffect(() => {
  if (addresses.value.length > 0 && !shippingAddressId.value) {
    const defaultAddr = addresses.value.find((a: Address) => a.isDefault)
    if (defaultAddr) shippingAddressId.value = Number(defaultAddr.id)
    else shippingAddressId.value = Number(addresses.value[0]?.id)
  }
})

// Address Options for Select
const addressOptions = computed(() => {
  return addresses.value.map((addr: Address) => ({
    label:
      (addr.addressLine || addr.street || '') +
      (addr.ward ? `, ${addr.ward}` : '') +
      (addr.province ? `, ${addr.province}` : ''),
    value: Number(addr.id)
  }))
})

// Calculations
const selectedItemsList = computed(() =>
  Object.values(selectedItems.value).filter((item) => item.quantity > 0)
)
const totalAmount = computed(() => {
  return selectedItemsList.value.reduce((total, item) => {
    return total + Number(item.product.basePrice) * item.quantity
  }, 0)
})

// Handlers
const handleQuantityChange = (
  product: AdminProduct & { originalBasePrice?: string; hasCustomPrice?: boolean },
  qty: number
) => {
  if (qty <= 0) {
    const newItems = { ...selectedItems.value }
    Reflect.deleteProperty(newItems, product.id)
    selectedItems.value = newItems
  } else {
    selectedItems.value[Number(product.id)] = { product, quantity: qty }
  }
}

const getProductQuantity = (productId: number) => {
  return selectedItems.value[productId]?.quantity || 0
}

const submitOrder = async () => {
  if (!shippingAddressId.value) {
    toast.add({
      title: t('wholesale_msg_error'),
      description: t('wholesale_order_err_no_address'),
      color: 'error'
    })
    return
  }
  if (selectedItemsList.value.length === 0) {
    toast.add({
      title: t('wholesale_msg_error'),
      description: t('wholesale_order_err_no_items'),
      color: 'error'
    })
    return
  }

  try {
    isSubmitting.value = true
    const payload = {
      shippingAddressId: shippingAddressId.value,
      note: note.value,
      deliveryDate: deliveryDate.value ? new Date(deliveryDate.value).toISOString() : undefined,
      items: selectedItemsList.value.map((item) => ({
        productId: Number(item.product.id),
        quantity: item.quantity
      }))
    }

    await customerService.createOrder(payload)
    navigateTo('/wholesale/orders')
  } catch {
    // Error handled globally
  } finally {
    isSubmitting.value = false
  }
}

// Columns for table
const columns = computed(() => [
  { accessorKey: 'product', header: t('nav_products') },
  { accessorKey: 'price', header: t('wholesale_order_col_price') },
  { accessorKey: 'quantity', header: t('wholesale_order_col_qty') }
])
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6 px-4 py-8 pb-24 sm:px-6 sm:py-12 sm:pb-12 lg:px-8">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div class="flex items-center gap-3">
        <div
          class="bg-primary-50 dark:bg-primary-900/20 flex h-10 w-10 items-center justify-center rounded-xl"
        >
          <UIcon
            name="i-lucide-shopping-cart"
            class="text-primary-600 dark:text-primary-400 h-5 w-5"
          />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            {{ $t('wholesale_order_title') }}
          </h1>
          <p class="mt-1 text-sm text-gray-500">{{ $t('wholesale_order_subtitle') }}</p>
        </div>
      </div>
      <UButton to="/wholesale/orders" color="neutral" variant="ghost" icon="i-lucide-arrow-left">{{
        $t('wholesale_order_btn_back')
      }}</UButton>
    </div>

    <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <!-- Left: Product Selection -->
      <div class="space-y-4 xl:col-span-2">
        <UCard>
          <template #header>
            <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <h2 class="text-lg font-semibold">{{ $t('driver_delivery_detail_items_title') }}</h2>
              <BaseSearchInput
                v-model="search"
                :placeholder="$t('public_products_search_ph')"
                class="w-full sm:w-64"
              />
            </div>
          </template>

          <UTable :data="products" :columns="columns" :loading="loadingProducts" class="w-full">
            <template #product-cell="{ row }">
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="getImageUrl((row as any).thumbnailUrl) || undefined"
                  :alt="(row as any).name"
                  size="lg"
                  class="shrink-0 rounded-md bg-gray-100"
                />
                <div>
                  <div class="line-clamp-1 font-medium text-gray-900 dark:text-white">
                    {{ (row as any).name }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ $t('wholesale_order_product_code') }}: {{ (row as any).slug }}
                  </div>
                </div>
              </div>
            </template>

            <template #price-cell="{ row }">
              <div>
                <div class="text-primary-600 dark:text-primary-400 font-semibold whitespace-nowrap">
                  {{ formatCurrency(Number((row as any).basePrice)) }} / {{ (row as any).unit }}
                </div>
                <div
                  v-if="(row as any).hasCustomPrice"
                  class="text-success-600 mt-0.5 flex items-center gap-1 text-xs"
                >
                  <UIcon name="i-lucide-check-circle-2" class="h-3 w-3" />
                  {{ $t('wholesale_order_custom_price') }}
                </div>
                <div v-else class="mt-0.5 text-xs text-gray-400">
                  {{ $t('wholesale_order_listed_price') }}
                </div>
              </div>
            </template>

            <template #quantity-cell="{ row }">
              <div class="flex items-center gap-2">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-minus"
                  :disabled="getProductQuantity(Number((row as any).id)) <= 0"
                  @click="
                    handleQuantityChange(
                      row as any,
                      getProductQuantity(Number((row as any).id)) - 1
                    )
                  "
                />
                <UInput
                  :model-value="getProductQuantity(Number((row as any).id))"
                  type="number"
                  min="0"
                  class="w-16 text-center"
                  @update:model-value="(val) => handleQuantityChange(row as any, Number(val))"
                />
                <UButton
                  size="xs"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-plus"
                  @click="
                    handleQuantityChange(
                      row as any,
                      getProductQuantity(Number((row as any).id)) + 1
                    )
                  "
                />
              </div>
            </template>
          </UTable>

          <div v-if="totalProducts > 0" class="mt-4 flex justify-end">
            <UPagination v-model:page="page" :total="totalProducts" :items-per-page="12" />
          </div>
        </UCard>
      </div>

      <!-- Right: Order Summary -->
      <div class="xl:col-span-1">
        <UCard class="sticky top-20">
          <template #header>
            <h2 class="flex items-center gap-2 text-lg font-semibold">
              <UIcon name="i-lucide-receipt" class="h-5 w-5 text-gray-500" />
              {{ $t('wholesale_order_summary_title') }}
            </h2>
          </template>

          <div class="space-y-4">
            <UFormField :label="$t('admin_order_create_address')" required>
              <USelectMenu
                v-model="shippingAddressId"
                :items="addressOptions"
                value-key="value"
                label-key="label"
                :placeholder="$t('wholesale_order_address_ph')"
                :loading="loadingAddresses"
                class="w-full"
              >
                <template #empty>
                  <div class="p-2 text-sm text-gray-500">
                    {{ $t('wholesale_order_address_empty') }}
                  </div>
                </template>
              </USelectMenu>
            </UFormField>

            <UFormField :label="$t('wholesale_order_date_label')">
              <UInput v-model="deliveryDate" type="date" class="w-full" />
            </UFormField>

            <UFormField :label="$t('wholesale_order_note_label')">
              <UTextarea v-model="note" :placeholder="$t('wholesale_order_note_ph')" :rows="3" />
            </UFormField>

            <UDivider class="my-4" />

            <div>
              <div class="mb-2 flex items-center justify-between">
                <span class="text-gray-500">{{ $t('wholesale_order_summary_items_count') }}</span>
                <span class="font-medium"
                  >{{ selectedItemsList.length }}
                  {{ $t('wholesale_order_summary_items_unit') }}</span
                >
              </div>
              <div class="mb-2 flex items-center justify-between">
                <span class="text-gray-500">{{ $t('wholesale_order_summary_total_qty') }}</span>
                <span class="font-medium">{{
                  selectedItemsList.reduce((acc, item) => acc + item.quantity, 0)
                }}</span>
              </div>
              <div
                class="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-4 text-lg dark:bg-gray-800"
              >
                <span class="font-semibold text-gray-900 dark:text-white">{{
                  $t('wholesale_order_summary_total_price')
                }}</span>
                <span class="text-primary-600 dark:text-primary-400 text-xl font-bold">{{
                  formatCurrency(totalAmount)
                }}</span>
              </div>
            </div>

            <UButton
              block
              color="primary"
              size="lg"
              class="mt-6"
              icon="i-lucide-check"
              :loading="isSubmitting"
              :disabled="selectedItemsList.length === 0 || !shippingAddressId"
              @click="submitOrder"
            >
              {{ $t('wholesale_order_btn_submit') }}
            </UButton>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
