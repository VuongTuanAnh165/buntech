<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { mockProducts, mockOrders, mockOrderItems, generateId } from '~/core/mockData'

const { t } = useI18n()
const nuxt = useNuxtApp()
const toast = useToast()
const { formatVND } = useFormat()
useHead({ title: `${t('customer.quickOrder')} - BunTech` })
definePageMeta({ layout: 'default' })

const products = ref<Record<string, unknown>[]>([])
const orderItems = ref<{ product_id: string; product_name: string; quantity: number; price: number }[]>([])

// Honeypot field - must stay empty
const website_url = ref('')
const form = ref({ name: '', phone: '', address: '', note: '' })
const errors = ref<Record<string, string>>({})
const submitting = ref(false)
const success = ref(false)

async function loadProducts() {
  await new Promise(r => setTimeout(r, 300))
  products.value = mockProducts.value
    .filter(p => !p.deleted_at && p.status === 'ACTIVE')
    .sort((a, b) => a.name.localeCompare(b.name)) as Record<string, unknown>[]
}

function addProduct(productId: string) {
  if (!productId) return
  const existing = orderItems.value.find(i => i.product_id === productId)
  if (existing) {
    existing.quantity++
    return
  }
  const product = products.value.find(p => p.id === productId)
  if (product) {
    orderItems.value.push({
      product_id: productId,
      product_name: product.name as string,
      quantity: 1,
      price: Number(product.price),
    })
  }
}

function removeItem(index: number) {
  orderItems.value.splice(index, 1)
}

const total = computed(() => orderItems.value.reduce((sum, item) => sum + item.quantity * item.price, 0))

async function submitOrder() {
  errors.value = {}
  // Honeypot check
  if (website_url.value) {
    return
  }
  if (!form.value.name) errors.value.name = t('common.required')
  if (!form.value.phone) errors.value.phone = t('common.required')
  else if (!/^(0[0-9]{9,10})$/.test(form.value.phone)) errors.value.phone = t('auth.phoneInvalid')
  if (!form.value.address) errors.value.address = t('common.required')
  if (orderItems.value.length === 0) {
    toast.error(t('orders.selectItems'))
    return
  }
  if (Object.keys(errors.value).length) return

  submitting.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    const orderId = generateId()
    const newOrder = {
      id: orderId,
      status: 'PENDING',
      total: total.value,
      amount_collected: 0,
      guest_info: { name: form.value.name, phone: form.value.phone, address: form.value.address },
      shipping_address: form.value.address,
      note: form.value.note,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockOrders.value.push(newOrder as any)

    const itemInserts = orderItems.value.map(item => ({
      id: generateId(),
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      price: item.price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
    mockOrderItems.value.push(...(itemInserts as any))
    
    success.value = true
    toast.success(t('customer.orderSuccess'))
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    submitting.value = false
  }
}

onMounted(loadProducts)
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ t('customer.quickOrderTitle') }}</h1>
    <p class="text-gray-500 mb-8">{{ t('customer.quickOrder') }}</p>

    <template v-if="!success">
      <form class="space-y-6" @submit.prevent="submitOrder">
        <div class="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 class="font-semibold text-gray-900">{{ t('orders.customer') }}</h2>
          <AppInput v-model="form.name" :label="t('customer.yourName')" :required="true" :error="errors.name" />
          <AppInput v-model="form.phone" :label="t('customer.yourPhone')" :required="true" :error="errors.phone" placeholder="0901234567" />
          <AppInput v-model="form.address" :label="t('customer.yourAddress')" :required="true" :error="errors.address" />
          <AppInput v-model="form.note" :label="t('common.note')" />

          <!-- Honeypot anti-spam -->
          <div style="opacity: 0; position: absolute; z-index: -1; left: -9999px;" aria-hidden="true">
            <label>Website URL</label>
            <input v-model="website_url" type="text" name="website_url" tabindex="-1" autocomplete="off">
          </div>
        </div>

        <div class="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 class="font-semibold text-gray-900">{{ t('orders.items') }}</h2>
          <select class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" @change="addProduct(($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''">
            <option value="">{{ t('orders.selectProduct') }}</option>
            <option v-for="p in products" :key="p.id as string" :value="p.id as string">{{ p.name }} - {{ formatVND(Number(p.price)) }}</option>
          </select>
          <template v-if="orderItems.length">
            <div v-for="(item, i) in orderItems" :key="item.product_id" class="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ item.product_name }}</p>
                <p class="text-sm text-gray-500">{{ formatVND(item.price) }}</p>
              </div>
              <div class="flex items-center gap-1">
                <button type="button" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center" @click="item.quantity--">-</button>
                <span class="w-10 text-center text-sm font-medium">{{ item.quantity }}</span>
                <button type="button" class="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center" @click="item.quantity++">+</button>
              </div>
              <span class="font-medium ml-4 w-24 text-right">{{ formatVND(item.quantity * item.price) }}</span>
              <button type="button" class="p-1 text-gray-400 hover:text-danger-600 ml-2" @click="removeItem(i)"><Trash2 class="w-4 h-4" /></button>
            </div>
            <div class="flex justify-between pt-3 border-t border-gray-100">
              <span class="font-semibold">{{ t('orders.grandTotal') }}</span>
              <span class="text-lg font-bold text-primary-600">{{ formatVND(total) }}</span>
            </div>
          </template>
          <AppEmptyState v-else :description="t('orders.emptyItems')" />
        </div>

        <AppButton type="submit" :loading="submitting" size="lg" block>{{ t('customer.placeOrder') }}</AppButton>
      </form>
    </template>

    <template v-else>
      <div class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <div class="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">{{ t('customer.orderSuccess') }}</h2>
        <NuxtLink to="/"><AppButton variant="outline">{{ t('common.back') }}</AppButton></NuxtLink>
      </div>
    </template>
  </div>
</template>
