<!--
  Responsibility: Form for adding and editing products
  Dependency: UI components (USlideover, UForm, UInput), slugify
  Lifecycle: Mounted on product list page, toggled via v-model:open
  Reason: Extracted to keep admin/products/index.vue under 400 lines
-->
<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import type { Product, Category } from '~/utils/types'
import { t } from '~/utils/i18n'

const { constants } = useMasterData()

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
  status: constants.value?.[ConstantKey.ProductStatus]?.ACTIVE,
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
        status: constants.value?.[ConstantKey.ProductStatus]?.ACTIVE,
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
  if (!form.value.name.trim()) formErrors.value.name = t('admin_prod_form_name_req')
  if (form.value.price < 0) formErrors.value.price = t('admin_prod_form_price_invalid')
  if (form.value.stock < 0) formErrors.value.stock = t('admin_prod_form_stock_invalid')
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
  <USlideover
    v-model:open="isOpen"
    :title="product ? $t('admin_prod_form_edit_title') : $t('admin_prod_form_add_title')"
  >
    <template #body>
      <form class="space-y-4" @submit.prevent="handleSave">
        <UFormField :label="$t('admin_prod_form_name')" required :error="formErrors.name">
          <UInput v-model="form.name" @update:model-value="form.slug = slugify($event)" />
        </UFormField>
        <UFormField :label="$t('admin_prod_form_slug')" :help="$t('admin_prod_form_slug_help')">
          <UInput v-model="form.slug" />
        </UFormField>
        <UFormField :label="$t('admin_prod_form_image')">
          <BaseDropzone v-model="imagePreview" :help-text="$t('admin_prod_form_image_help')" />
        </UFormField>
        <UFormField :label="$t('admin_prod_form_desc')">
          <UTextarea v-model="form.description" />
        </UFormField>
        <div class="grid grid-cols-2 gap-3">
          <UFormField :label="$t('admin_prod_form_price')" required :error="formErrors.price">
            <UInput v-model.number="form.price" type="number" :min="0" :step="1000" />
          </UFormField>
          <UFormField :label="$t('nav_inventory')" required :error="formErrors.stock">
            <UInput v-model.number="form.stock" type="number" :min="0" />
          </UFormField>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <UFormField :label="$t('admin_prod_form_unit')">
            <UInput v-model="form.unit" />
          </UFormField>
          <UFormField :label="$t('nav_categories')">
            <USelectMenu
              v-model="form.category_id"
              :items="[
                { value: '', label: $t('admin_prod_form_cat_ph') },
                ...categories.map((c) => ({ value: c.id, label: c.name }))
              ]"
              value-key="value"
              label-key="label"
            />
          </UFormField>
        </div>
        <UFormField :label="$t('status')">
          <USelectMenu
            v-model="form.status"
            :items="[
              {
                value: constants?.[ConstantKey.ProductStatus]?.ACTIVE,
                label: $t('status_product_active')
              },
              {
                value: constants?.[ConstantKey.ProductStatus]?.INACTIVE,
                label: $t('status_product_inactive')
              }
            ]"
            value-key="value"
            label-key="label"
          />
        </UFormField>
      </form>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          @click="
            () => {
              isOpen = false
            }
          "
        >
          {{ $t('common_cancel') }}
        </UButton>
        <UButton :loading="saving" color="primary" @click="handleSave">
          {{ product ? $t('common_update') : $t('common_add_new') }}
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
