<script setup lang="ts">
import { z } from 'zod'
import { Plus, Trash2, Minus, CheckCircle2, Package, Search, ShoppingCart } from 'lucide-vue-next'
import { productService } from '~/services/productService'
import { publicOrderService } from '~/services/publicOrderService'
import { phoneSchema, requiredString } from '~/utils/validation'
import AddressSelect from '~/components/base/AddressSelect.vue'

const toast = useToast()
useSeoMeta({ title: 'Đặt hàng nhanh - BunTech' })
definePageMeta({ layout: 'default' })

const search = ref('')
const selectedCategory = ref<number | ''>('')
const orderItems = ref<
  {
    productId: number
    productName: string
    quantity: number
    price: number
    unit: string
  }[]
>([])
const website_url = ref('')

const formState = reactive({
  name: '',
  phone: '',
  addressLine: '',
  province: '',
  ward: '',
  note: ''
})

const quickOrderSchema = z.object({
  name: requiredString('Họ tên').max(100, 'Họ tên không được vượt quá 100 ký tự'),
  phone: phoneSchema,
  addressLine: requiredString('Địa chỉ cụ thể').max(191),
  province: requiredString('Tỉnh/Thành phố').max(100),
  ward: requiredString('Phường/Xã').max(100),
  note: z.string().trim().optional()
})

const { formErrors, formRef, validate } = useZodForm(quickOrderSchema)

const success = ref(false)
const successOrderCode = ref('')

const [{ data: categoriesRes }, { data: productsRes, pending: loading }] = await Promise.all([
  useAsyncData('clientCategories', () => productService.getClientCategories()),
  useAsyncData('clientProducts', () => productService.getClientProducts({ limit: 100 }))
])
const categories = computed(() => categoriesRes.value?.data || [])
const products = computed(() => productsRes.value?.data?.data || [])

const availableProducts = computed(() => {
  let result = products.value
  if (selectedCategory.value) {
    result = result.filter((p) => p.categoryId === selectedCategory.value)
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((p) => p.name.toLowerCase().includes(q))
  }
  return result
})

const total = computed(() =>
  orderItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0)
)

const addProduct = (productId: number) => {
  const product = products.value.find((p) => p.id === productId)
  if (!product) return
  const existing = orderItems.value.find((i) => i.productId === productId)
  if (existing) {
    existing.quantity++
    toast.add({ title: 'Thành công', description: 'Đã cập nhật giỏ hàng', color: 'success' })
    return
  }
  orderItems.value.push({
    productId: productId,
    productName: product.name,
    quantity: 1,
    price: Number(product.basePrice),
    unit: product.unit
  })
  toast.add({ title: 'Thành công', description: 'Đã thêm vào giỏ hàng', color: 'success' })
}

const incrementQty = (index: number) => {
  orderItems.value[index]!.quantity++
}

const decrementQty = (index: number) => {
  if (orderItems.value[index]!.quantity > 1) {
    orderItems.value[index]!.quantity--
  }
}

const removeItem = (index: number) => {
  orderItems.value.splice(index, 1)
  toast.add({ title: 'Thông báo', description: 'Đã xóa sản phẩm', color: 'info' })
}

const clearCart = () => {
  orderItems.value = []
  toast.add({ title: 'Thông báo', description: 'Đã xóa toàn bộ giỏ hàng', color: 'info' })
}

const validateForm = () => {
  if (website_url.value) {
    return false // Honeypot trap
  }
  if (orderItems.value.length === 0) {
    toast.add({ title: 'Thất bại', description: 'Giỏ hàng trống', color: 'error' })
    return false
  }
  return validate(formState)
}

const { handleSubmit, isSubmitting: submitting } = useFormSubmit()

const handleQuickOrder = handleSubmit(
  async () => {
    const res = await publicOrderService.createQuickOrder({
      fullName: formState.name,
      phoneNumber: formState.phone,
      addressLine: formState.addressLine,
      province: formState.province,
      ward: formState.ward,
      note: formState.note,
      website_url: website_url.value,
      items: orderItems.value.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    })

    if (res.data?.orderId) {
      successOrderCode.value = `BT${res.data.orderId}`
    } else {
      successOrderCode.value = 'Đã tiếp nhận'
    }
    success.value = true
  },
  { formRef }
)

const submitOrder = () => {
  if (validateForm()) {
    handleQuickOrder(null)
  }
}

const resetForm = () => {
  success.value = false
  orderItems.value = []
  formState.name = ''
  formState.phone = ''
  formState.addressLine = ''
  formState.province = ''
  formState.ward = ''
  formState.note = ''
  website_url.value = ''
  search.value = ''
  selectedCategory.value = ''
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
    <!-- Header -->
    <nav aria-label="Breadcrumb" class="mb-4">
      <ol class="flex items-center gap-1.5 text-sm">
        <li>
          <NuxtLink
            to="/"
            class="hover:text-primary-600 dark:hover:text-primary-400 text-gray-500 transition-colors dark:text-zinc-400"
            >Trang chủ</NuxtLink
          >
        </li>
        <li class="text-gray-300 dark:text-zinc-600" aria-hidden="true">/</li>
        <li aria-current="page" class="text-surface-foreground font-medium">Đặt hàng nhanh</li>
      </ol>
    </nav>
    <h1 class="text-surface-foreground mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
      Đặt hàng nhanh
    </h1>
    <p class="mb-8 text-sm text-gray-500 dark:text-zinc-400">
      Chọn sản phẩm, điền thông tin — giao hàng tận nơi trong 2 giờ
    </p>

    <!-- Success state -->
    <template v-if="success">
      <div class="card animate-fade-in-up mx-auto max-w-lg p-8 text-center sm:p-12">
        <div
          class="bg-success-100 dark:bg-success-900/30 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        >
          <CheckCircle2
            class="text-success-600 dark:text-success-400 h-10 w-10"
            aria-hidden="true"
          />
        </div>
        <h2 class="text-surface-foreground mb-2 text-2xl font-bold">Đặt hàng thành công!</h2>
        <p class="mb-2 text-sm text-gray-500 dark:text-zinc-400">Mã đơn hàng của bạn:</p>
        <p class="text-primary-600 dark:text-primary-400 mb-6 font-mono text-xl font-bold">
          {{ successOrderCode }}
        </p>
        <div class="card bg-surface-muted mb-6 p-4 text-left">
          <div class="mb-2 flex justify-between text-sm">
            <span class="text-gray-500 dark:text-zinc-400">Khách hàng</span>
            <span class="text-surface-foreground font-medium">{{ formState.name }}</span>
          </div>
          <div class="mb-2 flex justify-between text-sm">
            <span class="text-gray-500 dark:text-zinc-400">Số điện thoại</span>
            <span class="text-surface-foreground font-medium">{{ formState.phone }}</span>
          </div>
          <div class="mb-2 flex justify-between text-sm">
            <span class="text-gray-500 dark:text-zinc-400">Số sản phẩm</span>
            <span class="text-surface-foreground font-medium">{{ orderItems.length }} loại</span>
          </div>
          <div class="border-surface-border flex justify-between border-t pt-2 text-sm">
            <span class="text-surface-foreground font-semibold">Tổng tiền</span>
            <span class="text-primary-600 dark:text-primary-400 font-bold">{{
              formatVND(total)
            }}</span>
          </div>
        </div>
        <p class="mb-6 text-sm text-gray-500 dark:text-zinc-400">
          Chúng tôi sẽ liên hệ với bạn trong vòng 15 phút để xác nhận đơn hàng.
        </p>
        <div class="flex flex-col justify-center gap-3 sm:flex-row">
          <NuxtLink to="/products"><UButton variant="outline">Tiếp tục mua sắm</UButton></NuxtLink>
          <UButton @click="resetForm">Đặt đơn mới</UButton>
        </div>
      </div>
    </template>

    <!-- Order form -->
    <template v-else>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Product selection -->
        <div class="space-y-4 lg:col-span-2">
          <div class="card p-4">
            <!-- Search -->
            <div class="relative mb-4">
              <Search
                class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-zinc-500"
                aria-hidden="true"
              />
              <UInput
                v-model="search"
                type="text"
                placeholder="Tìm sản phẩm..."
                class="border-surface-border bg-surface text-surface-foreground focus:border-primary-400 focus:ring-primary-500/10 min-h-[44px] w-full rounded-lg border py-2.5 pr-4 pl-10 text-sm placeholder-gray-400 transition-all focus:ring-4 focus:outline-none dark:placeholder-zinc-500"
              />
            </div>

            <!-- Category pills -->
            <div class="scrollbar-hide mb-4 flex items-center gap-2 overflow-x-auto pb-1">
              <UButton
                variant="ghost"
                color="neutral"
                type="button"
                :class="[
                  'min-h-[32px] rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
                  !selectedCategory
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300'
                ]"
                @click="
                  () => {
                    selectedCategory = ''
                  }
                "
              >
                Tất cả
              </UButton>
              <UButton
                v-for="cat in categories"
                :key="cat.id"
                variant="ghost"
                color="neutral"
                type="button"
                :class="[
                  'min-h-[32px] rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all',
                  selectedCategory === cat.id
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300'
                ]"
                @click="
                  () => {
                    selectedCategory = cat.id
                  }
                "
              >
                {{ cat.name }}
              </UButton>
            </div>

            <!-- Product grid -->
            <template v-if="loading">
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div v-for="i in 6" :key="i" class="border-surface-border rounded-lg border p-3">
                  <USkeleton class="mb-2 h-24 w-full" />
                  <USkeleton class="mb-1 h-4 w-full" />
                  <USkeleton class="h-4 w-2/3" />
                </div>
              </div>
            </template>
            <template v-else-if="availableProducts.length">
              <div class="grid max-h-[500px] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3">
                <UButton
                  v-for="(product, i) in availableProducts"
                  :key="product.id"
                  variant="ghost"
                  color="neutral"
                  type="button"
                  class="border-surface-border hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 group stagger-item h-auto w-full items-start justify-start rounded-lg border p-0 transition-all"
                  :style="{ animationDelay: `${Math.min(i * 20, 200)}ms` }"
                  @click="addProduct(product.id)"
                >
                  <div class="flex w-full flex-col p-3 text-left">
                    <div
                      class="bg-surface-muted mb-3 aspect-square w-full overflow-hidden rounded-md"
                    >
                      <NuxtImg
                        v-if="product.thumbnailUrl"
                        :src="product.thumbnailUrl"
                        :alt="product.name"
                        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div v-else class="flex h-full w-full items-center justify-center">
                        <Package
                          class="h-8 w-8 text-gray-300 dark:text-zinc-600"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    <p
                      class="text-surface-foreground mb-1 line-clamp-2 text-sm leading-tight font-medium"
                      :title="product.name"
                    >
                      {{ product.name }}
                    </p>
                    <div class="mt-auto flex flex-wrap items-baseline gap-1 pt-1">
                      <span
                        class="text-primary-600 dark:text-primary-400 text-sm font-bold sm:text-base"
                      >
                        {{ formatVND(product.basePrice) }}
                      </span>
                      <span class="text-xs text-gray-400 dark:text-zinc-500"
                        >/{{ product.unit }}</span
                      >
                    </div>
                  </div>
                </UButton>
              </div>
            </template>
            <div v-else class="py-8 text-center text-sm text-gray-500 dark:text-zinc-400">
              Không tìm thấy sản phẩm
            </div>
          </div>
        </div>

        <!-- Cart + Form -->
        <div class="space-y-4">
          <!-- Cart -->
          <div class="card sticky top-4 p-4">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-surface-foreground flex items-center gap-2 font-semibold">
                <ShoppingCart class="h-5 w-5" aria-hidden="true" />
                Giỏ hàng ({{ orderItems.length }})
              </h2>
              <UButton
                v-if="orderItems.length"
                variant="ghost"
                color="neutral"
                type="button"
                class="hover:text-danger-600 dark:hover:text-danger-400 min-h-[44px] px-2 text-xs text-gray-400 transition-colors dark:text-zinc-500"
                @click="clearCart"
              >
                Xóa tất cả
              </UButton>
            </div>

            <template v-if="orderItems.length">
              <div class="mb-4 max-h-64 space-y-2 overflow-y-auto pr-1">
                <div
                  v-for="(item, i) in orderItems"
                  :key="item.productId"
                  class="border-surface-border flex items-center gap-2 border-b py-2 last:border-0"
                >
                  <div class="min-w-0 flex-1">
                    <p class="text-surface-foreground truncate text-sm font-medium">
                      {{ item.productName }}
                    </p>
                    <p class="text-xs text-gray-400 dark:text-zinc-500">
                      {{ formatVND(item.price) }} / {{ item.unit }}
                    </p>
                  </div>
                  <div class="flex flex-shrink-0 items-center gap-1">
                    <UButton
                      variant="ghost"
                      color="neutral"
                      type="button"
                      class="bg-surface-hover hover:bg-surface-border text-surface-foreground flex h-8 min-h-[36px] w-8 min-w-[36px] items-center justify-center rounded-md transition-colors"
                      :aria-label="'Giảm số lượng'"
                      @click="decrementQty(i)"
                    >
                      <Minus class="h-3.5 w-3.5" aria-hidden="true" />
                    </UButton>
                    <span
                      class="text-surface-foreground w-8 text-center text-sm font-medium tabular-nums"
                      >{{ item.quantity }}</span
                    >
                    <UButton
                      variant="ghost"
                      color="neutral"
                      type="button"
                      class="bg-surface-hover hover:bg-surface-border text-surface-foreground flex h-8 min-h-[36px] w-8 min-w-[36px] items-center justify-center rounded-md transition-colors"
                      :aria-label="'Tăng số lượng'"
                      @click="incrementQty(i)"
                    >
                      <Plus class="h-3.5 w-3.5" aria-hidden="true" />
                    </UButton>
                  </div>
                  <UButton
                    variant="ghost"
                    color="neutral"
                    type="button"
                    class="hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 flex h-8 min-h-[36px] w-8 min-w-[36px] flex-shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors"
                    :aria-label="'Xóa ' + item.productName"
                    @click="removeItem(i)"
                  >
                    <Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
                  </UButton>
                </div>
              </div>
              <div
                class="border-surface-border mb-4 flex items-center justify-between border-t pt-3"
              >
                <span class="text-surface-foreground font-semibold">Tổng cộng</span>
                <span class="text-primary-600 dark:text-primary-400 text-xl font-bold">{{
                  formatVND(total)
                }}</span>
              </div>
            </template>
            <div v-else class="flex flex-col items-center justify-center py-8 text-center">
              <div
                class="bg-surface-hover mb-3 flex h-14 w-14 items-center justify-center rounded-full"
              >
                <Package class="h-7 w-7 text-gray-400 dark:text-zinc-500" aria-hidden="true" />
              </div>
              <p class="text-sm text-gray-500 dark:text-zinc-400">Chưa có sản phẩm nào</p>
              <p class="mt-1 text-xs text-gray-400 dark:text-zinc-500">
                Chọn sản phẩm bên cạnh để thêm vào giỏ
              </p>
            </div>

            <!-- Customer form -->
            <form
              v-if="orderItems.length"
              class="border-surface-border mt-4 space-y-3 border-t pt-4"
              @submit.prevent="submitOrder"
            >
              <UFormField label="Họ và tên" :error="formErrors.name">
                <UInput v-model="formState.name" placeholder="Nguyễn Văn A" class="w-full" />
              </UFormField>

              <UFormField label="Số điện thoại" :error="formErrors.phone">
                <UInput v-model="formState.phone" placeholder="0901234567" class="w-full" />
              </UFormField>

              <AddressSelect
                :model-value="formState"
                :errors="formErrors"
                @update:model-value="Object.assign(formState, $event)"
              />

              <UFormField label="Ghi chú (tùy chọn)" :error="formErrors.note">
                <UInput v-model="formState.note" placeholder="Giao trước 9h sáng" class="w-full" />
              </UFormField>

              <!-- Honeypot -->
              <div
                style="opacity: 0; position: absolute; z-index: -1; left: -9999px"
                aria-hidden="true"
              >
                <label>Website URL</label>
                <UInput
                  v-model="website_url"
                  type="text"
                  name="website_url"
                  tabindex="-1"
                  autocomplete="off"
                />
              </div>

              <UButton type="submit" :loading="submitting" size="lg" class="w-full justify-center">
                <ShoppingCart class="mr-2 h-5 w-5" aria-hidden="true" />
                Đặt hàng — {{ formatVND(total) }}
              </UButton>
            </form>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
