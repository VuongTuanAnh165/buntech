<script setup lang="ts">
import { mockProducts, mockCategories } from '~/utils/mockData'
const toast = useToast()
useSeoMeta({ title: 'Đặt hàng sỉ - BunTech' })
definePageMeta({ layout: 'default' })
const loading = ref(true)
const search = ref('')
const selectedCategory = ref('')
const orderItems = ref<{ product_id: string; product_name: string; quantity: number; price: number; stock: number; unit: string }[]>([])
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
const total = computed(() => orderItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0))
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
  const existing = orderItems.value.find(i => i.product_id === productId)
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
    unit: product.unit || 'Phần',
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
  if(item) {
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
  else if (!/^(0[0-9]{9,10})$/.test(form.value.phone)) errors.value.phone = 'Số điện thoại không hợp lệ'
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
  setTimeout(() => { loading.value = false }, 400)
})
</script>
<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 sm:pb-12">
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
    <div class="flex items-center gap-3 mb-2">
      <div class="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
        <UIcon name="i-lucide-tag" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
      </div>
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-surface-foreground tracking-tight">Đặt hàng sỉ</h1>
        <p class="text-sm text-slate-500 dark:text-zinc-400">Giá sỉ giảm 10% — đặt số lượng lớn, giao tận nơi</p>
      </div>
    </div>
    <!-- Discount banner -->
    <div class="flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/10 text-success-700 dark:text-success-400 text-sm font-medium mb-6 animate-fade-in-up">
      <UIcon name="i-lucide-percent" class="w-4 h-4" />
      Giảm 10% cho đơn hàng sỉ — áp dụng tự động khi thêm vào giỏ
    </div>
    <!-- Success state -->
    <template v-if="success">
      <div class="card p-8 sm:p-12 text-center max-w-lg mx-auto animate-fade-in-up">
        <div class="w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-lucide-check-circle-2" class="w-10 h-10 text-success-600 dark:text-success-400" />
        </div>
        <h2 class="text-2xl font-bold text-surface-foreground mb-2">Đặt hàng sỉ thành công!</h2>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mb-2">Mã đơn hàng:</p>
        <p class="text-xl font-mono font-bold text-primary-600 dark:text-primary-400 mb-6">{{ successOrderCode }}</p>
        
        <div class="card p-4 mb-6 text-left bg-surface-muted border-0 shadow-none">
          <div class="flex justify-between text-sm mb-2">
            <span class="text-slate-500 dark:text-zinc-400">Khách hàng</span>
            <span class="font-medium text-surface-foreground">{{ form.name }}</span>
          </div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-slate-500 dark:text-zinc-400">Số điện thoại</span>
            <span class="font-medium text-surface-foreground">{{ form.phone }}</span>
          </div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-slate-500 dark:text-zinc-400">Số loại sản phẩm</span>
            <span class="font-medium text-surface-foreground">{{ orderItems.length }} loại</span>
          </div>
          <div class="flex justify-between text-sm pt-2 border-t border-surface-border">
            <span class="font-semibold text-surface-foreground">Tổng cộng</span>
            <span class="font-bold text-primary-600 dark:text-primary-400">{{ formatVND(total) }}</span>
          </div>
        </div>
        
        <p class="text-sm text-slate-500 dark:text-zinc-400 mb-6">Chúng tôi sẽ liên hệ để xác nhận đơn hàng và thời gian giao hàng.</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <UButton variant="outline" color="neutral" to="/wholesale">Về cổng khách hàng</UButton>
          <UButton @click="resetForm">Đặt đơn mới</UButton>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
              <UButton variant="ghost" color="neutral"
                type="button"
                :class="[
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border min-h-[32px]',
                  !selectedCategory ? 'bg-primary-600 text-white border-primary-600' : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300',
                ]"
                @click="selectedCategory = ''"
              >
                Tất cả
              </UButton>
              <UButton variant="ghost" color="neutral"
                v-for="cat in mockCategories"
                :key="cat.id"
                type="button"
                :class="[
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border min-h-[32px]',
                  selectedCategory === cat.id ? 'bg-primary-600 text-white border-primary-600' : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300',
                ]"
                @click="selectedCategory = cat.id"
              >
                {{ cat.name }}
              </UButton>
            </div>
            <!-- Product grid -->
            <template v-if="loading">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div v-for="i in 6" :key="i" class="p-3 border border-surface-border rounded-lg">
                  <USkeleton class="h-24 mb-2 w-full" />
                  <USkeleton class="h-4 mb-1 w-full" />
                  <USkeleton class="h-4 w-2/3" />
                </div>
              </div>
            </template>
            <template v-else-if="availableProducts.length">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
                <UButton variant="ghost" color="neutral"
                  v-for="(product, i) in availableProducts"
                  :key="product.id"
                  type="button"
                  class="text-left p-3 border border-surface-border rounded-lg hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group min-h-[44px] relative"
                  :style="{ animationDelay: `${Math.min(i * 20, 200)}ms` }"
                  :disabled="product.stock <= 0"
                  :class="{ 'opacity-50 cursor-not-allowed': product.stock <= 0, 'animate-fade-in-up': true }"
                  @click="addProduct(product.id)"
                >
                  <div class="aspect-square rounded-md bg-surface-muted overflow-hidden mb-2 relative">
                    <NuxtImg
                      v-if="product.image_url"
                      :src="product.image_url"
                      :alt="product.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <UIcon name="i-lucide-package" class="w-8 h-8 text-slate-300 dark:text-zinc-600" />
                    </div>
                  </div>
                  <p class="text-xs font-medium text-surface-foreground truncate mb-0.5">{{ product.name }}</p>
                  <div class="flex items-baseline gap-1">
                    <p class="text-sm font-bold text-primary-600 dark:text-primary-400">{{ formatVND(getWholesalePrice(Number(product.price))) }}</p>
                    <span class="text-[10px] text-slate-400 dark:text-zinc-500 line-through">{{ formatVND(Number(product.price)) }}</span>
                  </div>
                  <p class="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">SL còn: {{ product.stock }}</p>
                </UButton>
              </div>
            </template>
            <div v-else class="text-center py-8 text-sm text-slate-500 dark:text-zinc-400">Không tìm thấy sản phẩm</div>
          </div>
        </div>
        <!-- Cart + Form -->
        <div class="space-y-4">
          <div class="card p-4 sticky top-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold text-surface-foreground flex items-center gap-2">
                <UIcon name="i-lucide-shopping-cart" class="w-5 h-5" />
                Giỏ hàng ({{ orderItems.length }})
              </h2>
              <UButton variant="ghost" color="neutral"
                v-if="orderItems.length"
                type="button"
                class="text-xs text-slate-400 dark:text-zinc-500 hover:text-error-600 dark:hover:text-error-400 transition-colors min-h-[44px] px-2"
                @click="clearCart"
              >
                Xóa tất cả
              </UButton>
            </div>
            <template v-if="orderItems.length">
              <div class="space-y-2 max-h-48 overflow-y-auto pr-1 mb-4">
                <div
                  v-for="(item, i) in orderItems"
                  :key="item.product_id"
                  class="flex items-center gap-2 py-2 border-b border-surface-border last:border-0"
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-surface-foreground truncate">{{ item.product_name }}</p>
                    <p class="text-xs text-slate-400 dark:text-zinc-500">{{ formatVND(item.price) }} / {{ item.unit }}</p>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <UButton variant="ghost" color="neutral"
                      type="button"
                      class="w-7 h-7 rounded-md bg-surface-hover hover:bg-surface-border text-surface-foreground flex items-center justify-center transition-colors min-w-[28px] min-h-[28px]"
                      @click="decrementQty(i)"
                    >
                      <UIcon name="i-lucide-minus" class="w-3.5 h-3.5" />
                    </UButton>
                    <span class="w-8 text-center text-sm font-medium text-surface-foreground tabular-nums">{{ item.quantity }}</span>
                    <UButton variant="ghost" color="neutral"
                      type="button"
                      class="w-7 h-7 rounded-md bg-surface-hover hover:bg-surface-border text-surface-foreground flex items-center justify-center transition-colors min-w-[28px] min-h-[28px]"
                      @click="incrementQty(i)"
                    >
                      <UIcon name="i-lucide-plus" class="w-3.5 h-3.5" />
                    </UButton>
                  </div>
                  <UButton variant="ghost" color="neutral"
                    type="button"
                    class="w-8 h-8 rounded-md text-slate-400 hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 flex items-center justify-center transition-colors flex-shrink-0"
                    @click="removeItem(i)"
                  >
                    <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
                  </UButton>
                </div>
              </div>
              <!-- Savings -->
              <div v-if="totalSavings > 0" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-success-50 dark:bg-success-900/20 text-success-700 dark:text-success-400 text-sm mb-3">
                <UIcon name="i-lucide-percent" class="w-4 h-4" />
                Tiết kiệm {{ formatVND(totalSavings) }} với giá sỉ
              </div>
              <div class="flex justify-between items-center pt-3 border-t border-surface-border mb-4">
                <span class="font-semibold text-surface-foreground">Tổng cộng</span>
                <span class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ formatVND(total) }}</span>
              </div>
            </template>
            <div v-else class="flex flex-col items-center justify-center py-8 text-center">
              <div class="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center mb-3">
                <UIcon name="i-lucide-package" class="w-7 h-7 text-slate-400 dark:text-zinc-500" />
              </div>
              <p class="text-sm text-slate-500 dark:text-zinc-400">Chưa có sản phẩm</p>
            </div>
            <!-- Delivery form -->
            <form v-if="orderItems.length" class="space-y-4 mt-4 pt-4 border-t border-surface-border" @submit.prevent="submitOrder">
              <UFormField label="Họ và tên" :error="errors.name">
                <UInput v-model="form.name" placeholder="Nguyễn Văn A" class="w-full" />
              </UFormField>
              <UFormField label="Số điện thoại" :error="errors.phone">
                <UInput v-model="form.phone" placeholder="0901234567" class="w-full" />
              </UFormField>
              <UFormField label="Địa chỉ giao hàng" :error="errors.address">
                <UInput v-model="form.address" placeholder="123 Lê Lợi, Q.1, TP.HCM" class="w-full" />
              </UFormField>
              <UFormField label="Ghi chú (tùy chọn)">
                <UInput v-model="note" placeholder="Giao trước 9h sáng" class="w-full" />
              </UFormField>
              <UButton type="submit" :loading="submitting" size="lg" block>
                <template #leading>
                  <UIcon name="i-lucide-truck" class="w-5 h-5" />
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
