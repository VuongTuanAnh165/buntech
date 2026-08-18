<script setup lang="ts">
import { z } from 'zod'
import { productService } from '~/services/productService'
import { slugify } from '~/utils/string'
import type { ProductImage, ProductCategory } from '~/utils/types'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Sản phẩm - BunTech Admin' })

const route = useRoute()
const toast = useToast()

const isEditing = computed(() => !!route.query.id)
const productId = computed(() => Number(route.query.id))
const pageTitle = computed(() => (isEditing.value ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'))

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
  unit: 'phần',
  shortDescription: '',
  content: '',
  isActive: true
})

const { formErrors, formRef, validate } = useZodForm(schema)
const submitting = ref(false)

const schema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên sản phẩm').max(191, 'Tối đa 191 ký tự'),
  categoryId: z.number().min(1, 'Danh mục không hợp lệ'),
  basePrice: z.number().min(0, 'Giá không hợp lệ'),
  unit: z.string().min(1, 'Vui lòng nhập đơn vị tính').max(20, 'Tối đa 20 ký tự'),
  shortDescription: z.string().optional().or(z.literal('')),
  content: z.string().optional().or(z.literal('')),
  isActive: z.boolean()
})

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
        formState.unit = res.data.unit || 'phần'
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
      toast.add({ title: 'Lỗi tải sản phẩm', color: 'error' })
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
    toast.add({ title: 'Ảnh không được vượt quá 2MB', color: 'warning' })
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
    toast.add({ title: 'Vui lòng kiểm tra lại thông tin', color: 'warning' })
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
      description="Quản lý thông tin, giá bán và hình ảnh của sản phẩm"
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Sản phẩm', to: '/admin/products' },
        { label: pageTitle }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/products"> Hủy </UButton>
        <UButton type="button" :loading="submitting" @click="handleSave">
          <UIcon name="i-lucide-save" class="mr-1 h-4 w-4" /> Lưu Sản Phẩm
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
          <h2 class="text-surface-foreground mb-4 text-lg font-semibold">Thông tin cơ bản</h2>

          <div class="space-y-4">
            <UFormField label="Tên sản phẩm" :error="formErrors.name" required>
              <UInput v-model="formState.name" placeholder="Nhập tên sản phẩm..." size="lg" />
            </UFormField>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <UFormField label="Giá bán (VND)" :error="formErrors.basePrice" required>
                <UInput v-model="formState.basePrice" type="number" placeholder="VD: 50000" />
              </UFormField>

              <UFormField label="Đơn vị tính" :error="formErrors.unit" required>
                <UInput v-model="formState.unit" placeholder="VD: kg, phần, gói..." />
              </UFormField>
            </div>

            <UFormField label="Mô tả ngắn" :error="formErrors.shortDescription">
              <UTextarea
                v-model="formState.shortDescription"
                placeholder="Đoạn mô tả ngắn gọn về sản phẩm..."
                :rows="3"
              />
            </UFormField>

            <UFormField label="Mô tả chi tiết" :error="formErrors.content">
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
          <h2 class="text-surface-foreground mb-4 text-sm font-semibold">Trạng thái</h2>

          <div class="space-y-4">
            <UFormField :error="formErrors.isActive">
              <USelectMenu
                v-model="formState.isActive"
                :items="[
                  { label: 'Đang bán (Hiển thị)', value: true },
                  { label: 'Ngừng bán', value: false }
                ]"
                value-key="value"
                label-key="label"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-surface-foreground mb-4 text-sm font-semibold">Phân loại</h2>

          <div class="space-y-4">
            <UFormField label="Danh mục" :error="formErrors.categoryId" required>
              <USelectMenu
                v-model="formState.categoryId as any"
                :items="categoryOptions"
                value-key="value"
                placeholder="Chọn danh mục..."
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-surface-foreground mb-4 text-sm font-semibold">
            Ảnh đại diện (Thumbnail)
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
            <p class="text-surface-foreground text-center text-sm font-medium">Click để chọn ảnh</p>
            <p class="mt-1 text-xs text-slate-500">JPG, PNG, WebP (Max 2MB)</p>
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
                Đổi ảnh
              </UButton>
              <UButton
                color="error"
                variant="solid"
                size="sm"
                icon="i-lucide-trash-2"
                @click="clearThumbnail"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
