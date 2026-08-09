<script setup lang="ts">
import { mockProducts, mockCategories } from '~/utils/mockData'
const toast = useToast()
useSeoMeta({ title: 'Đặt hàng sỉ - BunTech' })
definePageMeta({ layout: 'default' })
const loading = ref(true)
const search = ref('')
const selectedCategory = ref('')
const orderItems = ref<
  {
    product_id: string
    product_name: string
    quantity: number
    price: number
    stock: number
    unit: string
  }[]
>([])
const note = ref('')
const form = ref({ name: '', phone: '', address: '', delivery_date: '' })
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const success = ref(false)
const successOrderCode = ref('')
const WHOLESALE_DISCOUNT = 0.1 // 10% discount
const availableProducts = computed(() => {
  let result = mockProducts.filter((p: Product) => p.status === 'ACTIVE')
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((p: Product) => p.name.toLowerCase().includes(q))
  }
  if (selectedCategory.value) {
    result = result.filter((p: Product) => p.category_id === selectedCategory.value)
  }
  return result
})
function getWholesalePrice(price: number): number {
  return Math.round(price * (1 - WHOLESALE_DISCOUNT))
}
const total = computed(() =>
  orderItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0)
)
const totalSavings = computed(() => {
  const retailTotal = orderItems.value.reduce((sum, item) => {
    const product = mockProducts.find((p: Product) => p.id === item.product_id)
    return sum + (product ? Number(product.price) * item.quantity : 0)
  }, 0)
  return retailTotal - total.value
})
function addProduct(productId: string) {
  const product = mockProducts.find((p: Product) => p.id === productId)
  if (!product) return
  const existing = orderItems.value.find((i) => i.product_id === productId)
  if (existing) {
    if (existing.quantity >= existing.stock) {
      toast.add({ title: 'Đã đạt giới hạn tồn kho', color: 'warning' })
      return
    }
    existing.quantity++
    toast.add({ title: `Đã thêm ${product.name}`, color: 'success' })
    return
  }
  orderItems.value.push({
    product_id: productId as string,
    product_name: product.name,
    quantity: 1,
    price: getWholesalePrice(Number(product.price)),
    stock: Number(product.stock),
    unit: product.unit || 'Phần'
  })
  toast.add({ title: `Đã thêm ${product.name}`, color: 'success' })
}
function incrementQty(index: number) {
  const item = orderItems.value[index]
  if (item && item.quantity >= item.stock) {
    toast.add({ title: 'Đã đạt giới hạn tồn kho', color: 'warning' })
    return
  }
  if (item) item.quantity++
}
function decrementQty(index: number) {
  const item = orderItems.value[index]
  if (item && item.quantity > 1) {
    item.quantity--
  }
}
function removeItem(index: number) {
  const item = orderItems.value[index]
  if (item) {
    orderItems.value.splice(index, 1)
    toast.add({ title: `Đã xóa ${item.product_name}`, color: 'info' })
  }
}
function clearCart() {
  orderItems.value = []
  toast.add({ title: 'Đã xóa giỏ hàng', color: 'info' })
}
function submitOrder() {
  errors.value = {}
  if (!form.value.name) errors.value.name = 'Vui lòng nhập họ tên'
  if (!form.value.phone) errors.value.phone = 'Vui lòng nhập số điện thoại'
  else if (!/^(0[0-9]{9,10})$/.test(form.value.phone))
    errors.value.phone = 'Số điện thoại không hợp lệ'
  if (!form.value.address) errors.value.address = 'Vui lòng nhập địa chỉ'
  if (orderItems.value.length === 0) {
    toast.add({ title: 'Vui lòng chọn ít nhất một sản phẩm', color: 'error' })
    return
  }
  if (Object.keys(errors.value).length) return
  submitting.value = true
  setTimeout(() => {
    successOrderCode.value = 'BT' + Math.random().toString(36).substring(2, 8).toUpperCase()
    submitting.value = false
    success.value = true
    toast.add({ title: 'Đặt hàng sỉ thành công!', color: 'success' })
  }, 1200)
}
function resetForm() {
  success.value = false
  orderItems.value = []
  form.value = { name: '', phone: '', address: '', delivery_date: '' }
  note.value = ''
  search.value = ''
  selectedCategory.value = ''
}
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 400)
})
</script>
<template>
  <div class="mx-auto max-w-6xl px-4 py-8 pb-24 sm:px-6 sm:py-12 sm:pb-12 lg:px-8">
    <!-- Back -->
    <UButton
      to="/wholesale"
      variant="ghost"
      color="neutral"
      icon="i-lucide-arrow-left"
      class="mb-4"
    >
      Quay lại
    </UButton>
    <!-- Header -->
    <div class="mb-2 flex items-center gap-3">
      <div
        class="bg-primary-50 dark:bg-primary-900/20 flex h-10 w-10 items-center justify-center rounded-xl"
      >
        <UIcon name="i-lucide-tag" class="text-primary-600 dark:text-primary-400 h-5 w-5" />
      </div>
      <div>
        <h1 class="text-surface-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Đặt hàng sỉ
        </h1>
        <p class="text-sm text-slate-500 dark:text-zinc-400">
          Giá sỉ giảm 10% — đặt số lượng lớn, giao tận nơi
        </p>
      </div>
    </div>
    <!-- Discount banner -->
    <div
      class="from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/10 text-success-700 dark:text-success-400 animate-fade-in-up mb-6 flex items-center gap-2 rounded-xl bg-gradient-to-r px-4 py-3 text-sm font-medium"
    >
      <UIcon name="i-lucide-percent" class="h-4 w-4" />
      Giảm 10% cho đơn hàng sỉ — áp dụng tự động khi thêm vào giỏ
    </div>
    <!-- Success state -->
    <template v-if="success">
      <div class="card animate-fade-in-up mx-auto max-w-lg p-8 text-center sm:p-12">
        <div
          class="bg-success-100 dark:bg-success-900/30 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        >
          <UIcon
            name="i-lucide-check-circle-2"
            class="text-success-600 dark:text-success-400 h-10 w-10"
          />
        </div>
        <h2 class="text-surface-foreground mb-2 text-2xl font-bold">Đặt hàng sỉ thành công!</h2>
        <p class="mb-2 text-sm text-slate-500 dark:text-zinc-400">Mã đơn hàng:</p>
        <p class="text-primary-600 dark:text-primary-400 mb-6 font-mono text-xl font-bold">
          {{ successOrderCode }}
        </p>

        <div class="card bg-surface-muted mb-6 border-0 p-4 text-left shadow-none">
          <div class="mb-2 flex justify-between text-sm">
            <span class="text-slate-500 dark:text-zinc-400">Khách hàng</span>
            <span class="text-surface-foreground font-medium">{{ form.name }}</span>
          </div>
          <div class="mb-2 flex justify-between text-sm">
            <span class="text-slate-500 dark:text-zinc-400">Số điện thoại</span>
            <span class="text-surface-foreground font-medium">{{ form.phone }}</span>
          </div>
          <div class="mb-2 flex justify-between text-sm">
            <span class="text-slate-500 dark:text-zinc-400">Số loại sản phẩm</span>
            <span class="text-surface-foreground font-medium">{{ orderItems.length }} loại</span>
          </div>
          <div class="border-surface-border flex justify-between border-t pt-2 text-sm">
            <span class="text-surface-foreground font-semibold">Tổng cộng</span>
            <span class="text-primary-600 dark:text-primary-400 font-bold">{{
              formatVND(total)
            }}</span>
          </div>
        </div>

        <p class="mb-6 text-sm text-slate-500 dark:text-zinc-400">
          Chúng tôi sẽ liên hệ để xác nhận đơn hàng và thời gian giao hàng.
        </p>
        <div class="flex flex-col justify-center gap-3 sm:flex-row">
          <UButton variant="outline" color="neutral" to="/wholesale">Về cổng khách hàng</UButton>
          <UButton @click="resetForm">Đặt đơn mới</UButton>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Product selection -->
        <div class="lg:col-span-2">
          <div class="card p-4">
            <!-- Search -->
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="Tìm sản phẩm..."
              size="lg"
              class="mb-4"
            />

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
                v-for="cat in mockCategories"
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
                  class="border-surface-border hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 group relative min-h-[44px] rounded-lg border p-3 text-left transition-all"
                  :style="{ animationDelay: `${Math.min(i * 20, 200)}ms` }"
                  :disabled="product.stock <= 0"
                  :class="{
                    'cursor-not-allowed opacity-50': product.stock <= 0,
                    'animate-fade-in-up': true
                  }"
                  @click="addProduct(product.id)"
                >
                  <div
                    class="bg-surface-muted relative mb-2 aspect-square overflow-hidden rounded-md"
                  >
                    <NuxtImg
                      v-if="product.image_url"
                      :src="product.image_url"
                      :alt="product.name"
                      class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center">
                      <UIcon
                        name="i-lucide-package"
                        class="h-8 w-8 text-slate-300 dark:text-zinc-600"
                      />
                    </div>
                  </div>
                  <p class="text-surface-foreground mb-0.5 truncate text-xs font-medium">
                    {{ product.name }}
                  </p>
                  <div class="flex items-baseline gap-1">
                    <p class="text-primary-600 dark:text-primary-400 text-sm font-bold">
                      {{ formatVND(getWholesalePrice(Number(product.price))) }}
                    </p>
                    <span class="text-[10px] text-slate-400 line-through dark:text-zinc-500">{{
                      formatVND(Number(product.price))
                    }}</span>
                  </div>
                  <p class="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
                    SL còn: {{ product.stock }}
                  </p>
                </UButton>
              </div>
            </template>
            <div v-else class="py-8 text-center text-sm text-slate-500 dark:text-zinc-400">
              Không tìm thấy sản phẩm
            </div>
          </div>
        </div>
        <!-- Cart + Form -->
        <div class="space-y-4">
          <div class="card sticky top-4 p-4">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-surface-foreground flex items-center gap-2 font-semibold">
                <UIcon name="i-lucide-shopping-cart" class="h-5 w-5" />
                Giỏ hàng ({{ orderItems.length }})
              </h2>
              <UButton
                v-if="orderItems.length"
                variant="ghost"
                color="neutral"
                type="button"
                class="hover:text-error-600 dark:hover:text-error-400 min-h-[44px] px-2 text-xs text-slate-400 transition-colors dark:text-zinc-500"
                @click="clearCart"
              >
                Xóa tất cả
              </UButton>
            </div>
            <template v-if="orderItems.length">
              <div class="mb-4 max-h-48 space-y-2 overflow-y-auto pr-1">
                <div
                  v-for="(item, i) in orderItems"
                  :key="item.product_id"
                  class="border-surface-border flex items-center gap-2 border-b py-2 last:border-0"
                >
                  <div class="min-w-0 flex-1">
                    <p class="text-surface-foreground truncate text-sm font-medium">
                      {{ item.product_name }}
                    </p>
                    <p class="text-xs text-slate-400 dark:text-zinc-500">
                      {{ formatVND(item.price) }} / {{ item.unit }}
                    </p>
                  </div>
                  <div class="flex flex-shrink-0 items-center gap-1">
                    <UButton
                      variant="ghost"
                      color="neutral"
                      type="button"
                      class="bg-surface-hover hover:bg-surface-border text-surface-foreground flex h-7 min-h-[28px] w-7 min-w-[28px] items-center justify-center rounded-md transition-colors"
                      @click="decrementQty(i)"
                    >
                      <UIcon name="i-lucide-minus" class="h-3.5 w-3.5" />
                    </UButton>
                    <span
                      class="text-surface-foreground w-8 text-center text-sm font-medium tabular-nums"
                      >{{ item.quantity }}</span
                    >
                    <UButton
                      variant="ghost"
                      color="neutral"
                      type="button"
                      class="bg-surface-hover hover:bg-surface-border text-surface-foreground flex h-7 min-h-[28px] w-7 min-w-[28px] items-center justify-center rounded-md transition-colors"
                      @click="incrementQty(i)"
                    >
                      <UIcon name="i-lucide-plus" class="h-3.5 w-3.5" />
                    </UButton>
                  </div>
                  <UButton
                    variant="ghost"
                    color="neutral"
                    type="button"
                    class="hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors"
                    @click="removeItem(i)"
                  >
                    <UIcon name="i-lucide-trash-2" class="h-3.5 w-3.5" />
                  </UButton>
                </div>
              </div>
              <!-- Savings -->
              <div
                v-if="totalSavings > 0"
                class="bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-400 mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
              >
                <UIcon name="i-lucide-percent" class="h-4 w-4" />
                Tiết kiệm {{ formatVND(totalSavings) }} với giá sỉ
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
                <UIcon name="i-lucide-package" class="h-7 w-7 text-slate-400 dark:text-zinc-500" />
              </div>
              <p class="text-sm text-slate-500 dark:text-zinc-400">Chưa có sản phẩm</p>
            </div>
            <!-- Delivery form -->
            <form
              v-if="orderItems.length"
              class="border-surface-border mt-4 space-y-4 border-t pt-4"
              @submit.prevent="submitOrder"
            >
              <UFormField label="Họ và tên" :error="errors.name">
                <UInput v-model="form.name" placeholder="Nguyễn Văn A" class="w-full" />
              </UFormField>
              <UFormField label="Số điện thoại" :error="errors.phone">
                <UInput v-model="form.phone" placeholder="0901234567" class="w-full" />
              </UFormField>
              <UFormField label="Địa chỉ giao hàng" :error="errors.address">
                <UInput
                  v-model="form.address"
                  placeholder="123 Lê Lợi, Q.1, TP.HCM"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Ghi chú (tùy chọn)">
                <UInput v-model="note" placeholder="Giao trước 9h sáng" class="w-full" />
              </UFormField>
              <UButton type="submit" :loading="submitting" size="lg" block>
                <template #leading>
                  <UIcon name="i-lucide-truck" class="h-5 w-5" />
                </template>
                Đặt hàng sỉ — {{ formatVND(total) }}
              </UButton>
            </form>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
