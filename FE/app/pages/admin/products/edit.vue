<script setup lang="ts">
import { z } from 'zod'
import { productService } from '~/services/productService'
import { slugify } from '~/utils/string'
import type { ProductImage, ProductCategory } from '~/utils/types'
import { t } from '~/utils/i18n'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: t('admin_product_edit_seo_title') })

const route = useRoute()
const toast = useToast()

const isEditing = computed(() => !!route.query.id)
const productId = computed(() => Number(route.query.id))
const pageTitle = computed(() =>
  isEditing.value ? t('admin_prod_form_edit_title') : t('admin_prod_form_add_title')
)

// ─── Data fetching ─────────────────────────────────────────
const { data: catData } = useAsyncData('admin-product-categories', () =>
  productService.getAdminCategories()
)
const categoryOptions = computed(() => {
  return (
    catData.value?.data?.data?.map((c: ProductCategory) => ({ label: c.name, value: c.id })) || []
  )
})

// ─── Form State ───────────────────────────────────────────
const formState = reactive({
  name: '',
  categoryId: '' as string | number,
  basePrice: 0,
  unit: t('admin_prod_default_unit'),
  shortDescription: '',
  content: '',
  isActive: true
})

const schema = z.object({
  name: z
    .string()
    .min(1, t('admin_prod_form_name_req'))
    .max(191, t('admin_product_edit_form_name_max')),
  categoryId: z.number().min(1, t('admin_blog_edit_form_cat_invalid')),
  basePrice: z.number().min(0, t('admin_prod_form_price_invalid')),
  unit: z
    .string()
    .min(1, t('admin_product_edit_form_unit_req'))
    .max(20, t('admin_product_edit_form_unit_max')),
  shortDescription: z.string().optional().or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
  isActive: z.boolean()
})

const { formErrors, formRef: _formRef, validate } = useZodForm(schema)
const submitting = ref(false)

// ─── Media State ─────────────────────────────────────────
// Thumbnail
const selectedThumbnail = ref<File | null>(null)
const thumbnailPreviewUrl = ref<string>('')
const thumbnailInputRef = ref<HTMLInputElement | null>(null)

// Gallery
const existingImages = ref<ProductImage[]>([])
const deletedImageIds = ref<number[]>([])
const selectedGalleryFiles = ref<File[]>([])
const galleryPreviews = ref<string[]>([])

// ─── Lifecycle ────────────────────────────────────────────
onMounted(async () => {
  if (isEditing.value && productId.value) {
    try {
      const res = await productService.getAdminProduct(productId.value)
      if (res.data) {
        formState.name = res.data.name
        formState.categoryId = res.data.categoryId || ''
        formState.basePrice = res.data.basePrice
        formState.unit = res.data.unit || t('admin_prod_default_unit')
        formState.shortDescription = res.data.shortDescription || ''
        formState.content = res.data.content || ''
        formState.isActive = res.data.isActive ?? true

        if (res.data.thumbnailUrl) {
          thumbnailPreviewUrl.value = getImageUrl(res.data.thumbnailUrl)
        }
        if (res.data.images && res.data.images.length > 0) {
          existingImages.value = [...res.data.images]
        }
      }
    } catch {
      toast.add({ title: t('admin_product_edit_load_err'), color: 'error' })
      navigateTo('/admin/products')
    }
  }
})

// ─── Handlers ─────────────────────────────────────────────
// Thumbnail
function triggerThumbnailSelect() {
  thumbnailInputRef.value?.click()
}
function handleThumbnailChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    toast.add({ title: t('admin_categories_file_size_err'), color: 'warning' })
    return
  }
  selectedThumbnail.value = file
  thumbnailPreviewUrl.value = URL.createObjectURL(file)
}
function clearThumbnail() {
  selectedThumbnail.value = null
  thumbnailPreviewUrl.value = ''
  if (thumbnailInputRef.value) thumbnailInputRef.value.value = ''
}

// Gallery
function handleFilesSelected(files: File[]) {
  for (const file of files) {
    selectedGalleryFiles.value.push(file)
    galleryPreviews.value.push(URL.createObjectURL(file))
  }
}
function removeExistingImage(id: number) {
  existingImages.value = existingImages.value.filter((img) => img.id !== id)
  deletedImageIds.value.push(id)
}
function removeNewGalleryImage(index: number) {
  selectedGalleryFiles.value.splice(index, 1)
  galleryPreviews.value.splice(index, 1)
}

// ─── Save ─────────────────────────────────────────────────
async function handleSave() {
  const dataToValidate = {
    ...formState,
    categoryId: Number(formState.categoryId),
    basePrice: Number(formState.basePrice)
  }

  if (!validate(dataToValidate)) {
    toast.add({ title: t('admin_blog_edit_form_invalid'), color: 'warning' })
    return
  }

  const parseResult = schema.safeParse(dataToValidate)
  if (!parseResult.success) return

  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('name', parseResult.data.name)
    formData.append('slug', slugify(parseResult.data.name))
    formData.append('categoryId', parseResult.data.categoryId.toString())
    formData.append('basePrice', parseResult.data.basePrice.toString())
    formData.append('unit', parseResult.data.unit)
    if (parseResult.data.shortDescription)
      formData.append('shortDescription', parseResult.data.shortDescription)
    if (parseResult.data.content) formData.append('content', parseResult.data.content)

    formData.append('metaTitle', parseResult.data.name.substring(0, 60))
    formData.append(
      'metaDescription',
      (parseResult.data.shortDescription || parseResult.data.name).substring(0, 160)
    )

    formData.append('isActive', parseResult.data.isActive ? 'true' : 'false')

    if (selectedThumbnail.value) {
      formData.append('thumbnail', selectedThumbnail.value)
    }

    if (selectedGalleryFiles.value.length > 0) {
      selectedGalleryFiles.value.forEach((file) => {
        formData.append('images[]', file)
      })
    }

    if (deletedImageIds.value.length > 0) {
      deletedImageIds.value.forEach((id) => {
        formData.append('deletedImageIds[]', id.toString())
      })
    }

    if (isEditing.value) {
      await productService.updateProduct(productId.value, formData)
    } else {
      await productService.createProduct(formData)
    }

    navigateTo('/admin/products')
  } catch {
    // API client handles global errors
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-5xl">
    <BasePageHeader
      :title="pageTitle"
      :description="$t('admin_product_edit_desc')"
      :breadcrumbs="[
        { label: $t('nav_home'), to: '/admin', icon: 'i-lucide-home' },
        { label: $t('nav_products'), to: '/admin/products' },
        { label: pageTitle }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/products">
          {{ $t('common_cancel') }}
        </UButton>
        <UButton type="button" :loading="submitting" @click="handleSave">
          <UIcon name="i-lucide-save" class="mr-1 h-4 w-4" />
          {{ $t('admin_product_edit_btn_save') }}
        </UButton>
      </template>
    </BasePageHeader>

    <form
      id="productForm"
      class="animate-fade-in-up grid grid-cols-1 gap-6 lg:grid-cols-3"
      @submit.prevent
    >
      <!-- Main Content Area -->
      <div class="space-y-6 lg:col-span-2">
        <div class="card p-6">
          <h2 class="text-surface-foreground mb-4 text-lg font-semibold">
            {{ $t('admin_product_edit_basic_info') }}
          </h2>

          <div class="space-y-4">
            <UFormField :label="$t('admin_prod_form_name')" :error="formErrors.name" required>
              <UInput
                v-model="formState.name"
                :placeholder="$t('admin_product_edit_form_name_placeholder')"
                size="lg"
              />
            </UFormField>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <UFormField
                :label="$t('admin_product_edit_form_price')"
                :error="formErrors.basePrice"
                required
              >
                <UInput
                  v-model="formState.basePrice"
                  type="number"
                  :placeholder="$t('admin_product_edit_form_price_placeholder')"
                />
              </UFormField>

              <UFormField
                :label="$t('admin_product_edit_form_unit')"
                :error="formErrors.unit"
                required
              >
                <UInput
                  v-model="formState.unit"
                  :placeholder="$t('admin_product_edit_form_unit_placeholder')"
                />
              </UFormField>
            </div>

            <UFormField
              :label="$t('admin_blog_edit_form_excerpt')"
              :error="formErrors.shortDescription"
            >
              <UTextarea
                v-model="formState.shortDescription"
                :placeholder="$t('admin_product_edit_form_short_desc_placeholder')"
                :rows="3"
              />
            </UFormField>

            <UFormField :label="$t('admin_product_edit_form_detail')" :error="formErrors.content">
              <BaseRichTextEditor v-model="formState.content" />
            </UFormField>
          </div>
        </div>

        <FeaturesAdminProductsProductGalleryUploader
          :existing-images="existingImages"
          :gallery-previews="galleryPreviews"
          @remove-existing="removeExistingImage"
          @remove-new="removeNewGalleryImage"
          @files-selected="handleFilesSelected"
        />
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <div class="card p-6">
          <h2 class="text-surface-foreground mb-4 text-sm font-semibold">{{ $t('status') }}</h2>

          <div class="space-y-4">
            <UFormField :error="formErrors.isActive">
              <USelectMenu
                v-model="formState.isActive"
                :items="[
                  { label: $t('admin_product_edit_status_active'), value: true },
                  { label: $t('status_product_inactive'), value: false }
                ]"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-surface-foreground mb-4 text-sm font-semibold">
            {{ $t('admin_product_edit_form_cat') }}
          </h2>

          <div class="space-y-4">
            <UFormField :label="$t('nav_categories')" :error="formErrors.categoryId" required>
              <USelectMenu
                v-model="formState.categoryId as any"
                :items="categoryOptions"
                value-key="value"
                :placeholder="$t('admin_prod_form_cat_ph')"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-surface-foreground mb-4 text-sm font-semibold">
            {{ $t('admin_categories_form_thumb') }}
          </h2>

          <input
            ref="thumbnailInputRef"
            type="file"
            class="hidden"
            accept="image/jpeg,image/png,image/webp"
            @change="handleThumbnailChange"
          />

          <div
            v-if="!thumbnailPreviewUrl"
            class="border-surface-border hover:bg-surface-50 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors dark:hover:bg-zinc-800/50"
            @click="triggerThumbnailSelect"
          >
            <UIcon name="i-lucide-image-plus" class="mb-2 h-8 w-8 text-slate-400" />
            <p class="text-surface-foreground text-center text-sm font-medium">
              {{ $t('admin_blog_edit_file_click') }}
            </p>
            <p class="mt-1 text-xs text-slate-500">{{ $t('admin_categories_file_hint') }}</p>
          </div>

          <div
            v-else
            class="group border-surface-border relative aspect-square overflow-hidden rounded-xl border"
          >
            <img :src="thumbnailPreviewUrl" class="h-full w-full object-cover" />
            <div
              class="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <UButton color="neutral" variant="solid" size="sm" @click="triggerThumbnailSelect">
                {{ $t('admin_categories_btn_change_img') }}
              </UButton>
              <UButton
                color="error"
                variant="solid"
                size="sm"
                icon="i-lucide-trash-2"
                :aria-label="$t('aria_del_img')"
                @click="clearThumbnail"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
