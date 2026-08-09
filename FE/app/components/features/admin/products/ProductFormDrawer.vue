<!--
  Responsibility: Form for adding and editing products
  Dependency: UI components (USlideover, UForm, UInput), slugify
  Lifecycle: Mounted on product list page, toggled via v-model:open
  Reason: Extracted to keep admin/products/index.vue under 400 lines
-->
<script setup lang="ts">
import { ProductStatus } from '~/utils/enums'
import type { Product, Category } from '~/utils/types'

const props = defineProps<{
  product: Product | null
  categories: Category[]
}>()

const emit = defineEmits<{
  (e: 'save', productData: Record<string, unknown>): void
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const form = ref({
  name: '',
  slug: '',
  description: '',
  price: 0,
  stock: 0,
  unit: 'kg',
  category_id: '',
  status: ProductStatus.ACTIVE,
  image_url: ''
})
const imagePreview = ref<string | null>(null)
const formErrors = ref<Record<string, string>>({})
const saving = ref(false)

watch(
  () => props.product,
  (newVal) => {
    if (newVal) {
      form.value = {
        name: newVal.name,
        slug: newVal.slug,
        description: newVal.description || '',
        price: newVal.price,
        stock: newVal.stock,
        unit: newVal.unit || 'kg',
        category_id: newVal.category_id || '',
        status: newVal.status,
        image_url: newVal.image_url || ''
      }
      imagePreview.value = newVal.image_url
    } else {
      form.value = {
        name: '',
        slug: '',
        description: '',
        price: 0,
        stock: 0,
        unit: 'kg',
        category_id: props.categories[0]?.id || '',
        status: ProductStatus.ACTIVE,
        image_url: ''
      }
      imagePreview.value = null
    }
    formErrors.value = {}
  },
  { immediate: true }
)

function validateForm() {
  formErrors.value = {}
  if (!form.value.name.trim()) formErrors.value.name = 'Vui lòng nhập tên sản phẩm'
  if (form.value.price < 0) formErrors.value.price = 'Giá không hợp lệ'
  if (form.value.stock < 0) formErrors.value.stock = 'Tồn kho không hợp lệ'
  return Object.keys(formErrors.value).length === 0
}

function handleSave() {
  if (!validateForm()) return
  saving.value = true
  // Fake API delay
  setTimeout(() => {
    emit('save', {
      ...form.value,
      imagePreview: imagePreview.value
    })
    saving.value = false
    isOpen.value = false
  }, 400)
}
</script>

<template>
  <USlideover v-model:open="isOpen" :title="product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'">
    <template #body>
      <form class="space-y-4" @submit.prevent="handleSave">
        <UFormField label="Tên sản phẩm" required :error="formErrors.name">
          <UInput v-model="form.name" @update:model-value="form.slug = slugify($event)" />
        </UFormField>
        <UFormField label="Slug" help="Tự động tạo từ tên sản phẩm">
          <UInput v-model="form.slug" />
        </UFormField>
        <UFormField label="Hình ảnh">
          <BaseDropzone v-model="imagePreview" help-text="Định dạng JPG, PNG, WEBP. Tối đa 5MB." />
        </UFormField>
        <UFormField label="Mô tả">
          <UTextarea v-model="form.description" />
        </UFormField>
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Giá (VND)" required :error="formErrors.price">
            <UInput v-model.number="form.price" type="number" :min="0" :step="1000" />
          </UFormField>
          <UFormField label="Tồn kho" required :error="formErrors.stock">
            <UInput v-model.number="form.stock" type="number" :min="0" />
          </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <UFormField label="Đơn vị">
            <UInput v-model="form.unit" />
          </UFormField>
          <UFormField label="Danh mục">
            <USelectMenu
              v-model="form.category_id"
              :items="[
                { value: '', label: 'Chọn danh mục' },
                ...categories.map((c) => ({ value: c.id, label: c.name }))
              ]"
              value-key="value"
              label-key="label"
            />
          </UFormField>
        </div>
        <UFormField label="Trạng thái">
          <USelectMenu
            v-model="form.status"
            :items="[
              { value: ProductStatus.ACTIVE, label: 'Đang bán' },
              { value: ProductStatus.INACTIVE, label: 'Ngừng bán' }
            ]"
            value-key="value"
            label-key="label"
          />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <UButton color="neutral" variant="ghost" @click="isOpen = false"> Hủy </UButton>
        <UButton :loading="saving" color="primary" @click="handleSave">
          {{ product ? 'Cập nhật' : 'Thêm mới' }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
