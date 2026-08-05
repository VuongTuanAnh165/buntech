<script setup lang="ts">
import {
  Plus, Trash2, Minus, CheckCircle2, Package, Search, X,
  ShoppingCart, ArrowRight, Phone, MapPin, User, FileText,
} from 'lucide-vue-next'

const { t } = useI18n()
const toast = useToast()
const { formatVND } = useFormat()

useHead({ title: 'Đặt hàng nhanh - BunTech' })
definePageMeta({ layout: 'default' })

const loading = ref(true)
const search = ref('')
const selectedCategory = ref('')
const orderItems = ref<{ product_id: string; product_name: string; quantity: number; price: number; stock: number; unit: string }[]>([])
const website_url = ref('')
const form = ref({ name: '', phone: '', address: '', note: '' })
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const success = ref(false)
const successOrderCode = ref('')

const availableProducts = computed(() => {
  let result = mockProducts.filter((p: any) => p.status === 'ACTIVE')
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((p: any) => p.name.toLowerCase().includes(q))
  }
  if (selectedCategory.value) {
    result = result.filter((p: any) => p.category_id === selectedCategory.value)
  }
  return result
})

const total = computed(() => orderItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0))

function addProduct(productId: string) {
  const product = mockProducts.find((p: any) => p.id === productId)
  if (!product) return
  const existing = orderItems.value.find(i => i.product_id === productId)
  if (existing) {
    if (existing.quantity >= existing.stock) {
      toast.warning('Đã đạt giới hạn tồn kho')
      return
    }
    existing.quantity++
    toast.success(`Đã thêm ${product.name}`)
    return
  }
  orderItems.value.push({
    product_id: productId,
    product_name: product.name,
    quantity: 1,
    price: Number(product.price),
    stock: Number(product.stock),
    unit: product.unit,
  })
  toast.success(`Đã thêm ${product.name}`)
}

function incrementQty(index: number) {
  const item = orderItems.value[index]
  if (item.quantity >= item.stock) {
    toast.warning('Đã đạt giới hạn tồn kho')
    return
  }
  item.quantity++
}

function decrementQty(index: number) {
  if (orderItems.value[index].quantity > 1) {
    orderItems.value[index].quantity--
  }
}

function removeItem(index: number) {
  const item = orderItems.value[index]
  orderItems.value.splice(index, 1)
  toast.info(`Đã xóa ${item.product_name}`)
}

function clearCart() {
  orderItems.value = []
  toast.info('Đã xóa giỏ hàng')
}

function submitOrder() {
  errors.value = {}
  if (website_url.value) return
  if (!form.value.name) errors.value.name = 'Vui lòng nhập họ tên'
  if (!form.value.phone) errors.value.phone = 'Vui lòng nhập số điện thoại'
  else if (!/^(0[0-9]{9,10})$/.test(form.value.phone)) errors.value.phone = 'Số điện thoại không hợp lệ'
  if (!form.value.address) errors.value.address = 'Vui lòng nhập địa chỉ'
  if (orderItems.value.length === 0) {
    toast.error('Vui lòng chọn ít nhất một sản phẩm')
    return
  }
  if (Object.keys(errors.value).length) return

  submitting.value = true
  setTimeout(() => {
    successOrderCode.value = 'BT' + Math.random().toString(36).substring(2, 8).toUpperCase()
    submitting.value = false
    success.value = true
    toast.success('Đặt hàng thành công!')
  }, 1200)
}

function resetForm() {
  success.value = false
  orderItems.value = []
  form.value = { name: '', phone: '', address: '', note: '' }
  search.value = ''
  selectedCategory.value = ''
}

onMounted(() => {
  setTimeout(() => { loading.value = false }, 400)
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    <!-- Header -->
    <nav aria-label="Breadcrumb" class="mb-4">
      <ol class="flex items-center gap-1.5 text-sm">
        <li><NuxtLink to="/" class="text-gray-500 dark:text-zinc-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Trang chủ</NuxtLink></li>
        <li class="text-gray-300 dark:text-zinc-600" aria-hidden="true">/</li>
        <li aria-current="page" class="text-surface-foreground font-medium">Đặt hàng nhanh</li>
      </ol>
    </nav>
    <h1 class="text-2xl sm:text-3xl font-bold text-surface-foreground tracking-tight mb-2">Đặt hàng nhanh</h1>
    <p class="text-sm text-gray-500 dark:text-zinc-400 mb-8">Chọn sản phẩm, điền thông tin — giao hàng tận nơi trong 2 giờ</p>

    <!-- Success state -->
    <template v-if="success">
      <div class="card p-8 sm:p-12 text-center max-w-lg mx-auto animate-fade-in-up">
        <div class="w-20 h-20 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 class="w-10 h-10 text-success-600 dark:text-success-400" aria-hidden="true" />
        </div>
        <h2 class="text-2xl font-bold text-surface-foreground mb-2">Đặt hàng thành công!</h2>
        <p class="text-sm text-gray-500 dark:text-zinc-400 mb-2">Mã đơn hàng của bạn:</p>
        <p class="text-xl font-mono font-bold text-primary-600 dark:text-primary-400 mb-6">{{ successOrderCode }}</p>
        <div class="card p-4 mb-6 text-left bg-surface-muted">
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-500 dark:text-zinc-400">Khách hàng</span>
            <span class="font-medium text-surface-foreground">{{ form.name }}</span>
          </div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-500 dark:text-zinc-400">Số điện thoại</span>
            <span class="font-medium text-surface-foreground">{{ form.phone }}</span>
          </div>
          <div class="flex justify-between text-sm mb-2">
            <span class="text-gray-500 dark:text-zinc-400">Số sản phẩm</span>
            <span class="font-medium text-surface-foreground">{{ orderItems.length }} loại</span>
          </div>
          <div class="flex justify-between text-sm pt-2 border-t border-surface-border">
            <span class="font-semibold text-surface-foreground">Tổng tiền</span>
            <span class="font-bold text-primary-600 dark:text-primary-400">{{ formatVND(total) }}</span>
          </div>
        </div>
        <p class="text-sm text-gray-500 dark:text-zinc-400 mb-6">Chúng tôi sẽ liên hệ với bạn trong vòng 15 phút để xác nhận đơn hàng.</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <NuxtLink to="/products"><AppButton variant="outline">Tiếp tục mua sắm</AppButton></NuxtLink>
          <AppButton @click="resetForm">Đặt đơn mới</AppButton>
        </div>
      </div>
    </template>

    <!-- Order form -->
    <template v-else>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Product selection -->
        <div class="lg:col-span-2 space-y-4">
          <div class="card p-4">
            <!-- Search -->
            <div class="relative mb-4">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500" aria-hidden="true" />
              <input
                v-model="search"
                type="text"
                placeholder="Tìm sản phẩm..."
                class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-surface-border bg-surface text-sm text-surface-foreground placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all min-h-[44px]"
              />
            </div>
            <!-- Category pills -->
            <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
              <button
                type="button"
                :class="[
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border min-h-[32px]',
                  !selectedCategory ? 'bg-primary-600 text-white border-primary-600' : 'bg-surface text-surface-foreground border-surface-border hover:border-primary-300',
                ]"
                @click="selectedCategory = ''"
              >
                Tất cả
              </button>
              <button
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
              </button>
            </div>

            <!-- Product grid -->
            <template v-if="loading">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div v-for="i in 6" :key="i" class="p-3 border border-surface-border rounded-lg">
                  <AppSkeleton height="h-24" class="mb-2" />
                  <AppSkeleton height="h-4" class="mb-1" />
                  <AppSkeleton height="h-4" width="w-2/3" />
                </div>
              </div>
            </template>
            <template v-else-if="availableProducts.length">
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
                <button
                  v-for="(product, i) in availableProducts"
                  :key="product.id"
                  type="button"
                  class="text-left p-3 border border-surface-border rounded-lg hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group stagger-item min-h-[44px]"
                  :style="{ animationDelay: `${Math.min(i * 20, 200)}ms` }"
                  :disabled="product.stock <= 0"
                  :class="{ 'opacity-50 cursor-not-allowed': product.stock <= 0 }"
                  @click="addProduct(product.id)"
                >
                  <div class="aspect-square rounded-md bg-surface-muted overflow-hidden mb-2">
                    <img
                      v-if="product.image_url"
                      :src="product.image_url"
                      :alt="product.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    >
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <Package class="w-8 h-8 text-gray-300 dark:text-zinc-600" aria-hidden="true" />
                    </div>
                  </div>
                  <p class="text-xs font-medium text-surface-foreground truncate mb-0.5">{{ product.name }}</p>
                  <p class="text-sm font-bold text-primary-600 dark:text-primary-400">{{ formatVND(product.price) }}</p>
                  <p class="text-xs text-gray-400 dark:text-zinc-500">/{{ product.unit }}</p>
                </button>
              </div>
            </template>
            <div v-else class="text-center py-8 text-sm text-gray-500 dark:text-zinc-400">Không tìm thấy sản phẩm</div>
          </div>
        </div>

        <!-- Cart + Form -->
        <div class="space-y-4">
          <!-- Cart -->
          <div class="card p-4 sticky top-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="font-semibold text-surface-foreground flex items-center gap-2">
                <ShoppingCart class="w-5 h-5" aria-hidden="true" />
                Giỏ hàng ({{ orderItems.length }})
              </h2>
              <button
                v-if="orderItems.length"
                type="button"
                class="text-xs text-gray-400 dark:text-zinc-500 hover:text-danger-600 dark:hover:text-danger-400 transition-colors min-h-[44px] px-2"
                @click="clearCart"
              >
                Xóa tất cả
              </button>
            </div>

            <template v-if="orderItems.length">
              <div class="space-y-2 max-h-64 overflow-y-auto pr-1 mb-4">
                <div
                  v-for="(item, i) in orderItems"
                  :key="item.product_id"
                  class="flex items-center gap-2 py-2 border-b border-surface-border last:border-0"
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-surface-foreground truncate">{{ item.product_name }}</p>
                    <p class="text-xs text-gray-400 dark:text-zinc-500">{{ formatVND(item.price) }} / {{ item.unit }}</p>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      class="w-8 h-8 rounded-md bg-surface-hover hover:bg-surface-border text-surface-foreground flex items-center justify-center transition-colors min-w-[36px] min-h-[36px]"
                      :aria-label="'Giảm số lượng'"
                      @click="decrementQty(i)"
                    >
                      <Minus class="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                    <span class="w-8 text-center text-sm font-medium text-surface-foreground tabular-nums">{{ item.quantity }}</span>
                    <button
                      type="button"
                      class="w-8 h-8 rounded-md bg-surface-hover hover:bg-surface-border text-surface-foreground flex items-center justify-center transition-colors min-w-[36px] min-h-[36px]"
                      :aria-label="'Tăng số lượng'"
                      @click="incrementQty(i)"
                    >
                      <Plus class="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    class="w-8 h-8 rounded-md text-gray-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 flex items-center justify-center transition-colors flex-shrink-0 min-w-[36px] min-h-[36px]"
                    :aria-label="'Xóa ' + item.product_name"
                    @click="removeItem(i)"
                  >
                    <Trash2 class="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div class="flex justify-between items-center pt-3 border-t border-surface-border mb-4">
                <span class="font-semibold text-surface-foreground">Tổng cộng</span>
                <span class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ formatVND(total) }}</span>
              </div>
            </template>
            <div v-else class="flex flex-col items-center justify-center py-8 text-center">
              <div class="w-14 h-14 rounded-full bg-surface-hover flex items-center justify-center mb-3">
                <Package class="w-7 h-7 text-gray-400 dark:text-zinc-500" aria-hidden="true" />
              </div>
              <p class="text-sm text-gray-500 dark:text-zinc-400">Chưa có sản phẩm nào</p>
              <p class="text-xs text-gray-400 dark:text-zinc-500 mt-1">Chọn sản phẩm bên cạnh để thêm vào giỏ</p>
            </div>

            <!-- Customer form -->
            <form v-if="orderItems.length" class="space-y-3 mt-4 pt-4 border-t border-surface-border" @submit.prevent="submitOrder">
              <AppInput v-model="form.name" label="Họ và tên" placeholder="Nguyễn Văn A" :error="errors.name" />
              <AppInput v-model="form.phone" label="Số điện thoại" placeholder="0901234567" :error="errors.phone" />
              <AppInput v-model="form.address" label="Địa chỉ giao hàng" placeholder="123 Lê Lợi, Q.1, TP.HCM" :error="errors.address" />
              <AppInput v-model="form.note" label="Ghi chú (tùy chọn)" placeholder="Giao trước 9h sáng" />

              <!-- Honeypot -->
              <div style="opacity: 0; position: absolute; z-index: -1; left: -9999px;" aria-hidden="true">
                <label>Website URL</label>
                <input v-model="website_url" type="text" name="website_url" tabindex="-1" autocomplete="off">
              </div>

              <AppButton type="submit" :loading="submitting" size="lg" block>
                <ShoppingCart class="w-5 h-5" aria-hidden="true" />
                Đặt hàng — {{ formatVND(total) }}
              </AppButton>
            </form>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
