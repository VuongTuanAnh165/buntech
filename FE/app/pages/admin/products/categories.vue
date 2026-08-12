<script setup lang="ts">
import { z } from 'zod'
import { productService } from '~/services/productService'
import type { ProductCategory } from '~/utils/types'
import { slugify } from '~/utils/string'
import { normalizePaginationResponse } from '~/utils/api'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Danh mục Sản phẩm - BunTech Admin' })
const toast = useToast()

// ─── State ────────────────────────────────────────────────
const page = ref(1)
const perPage = ref(10)

const {
  data: rawRes,
  pending,
  refresh
} = useAsyncData(
  'admin-product-categories',
  () => productService.getAdminCategories({ page: page.value, limit: perPage.value }),
  { watch: [page, perPage] }
)

const normalized = computed(() => normalizePaginationResponse<ProductCategory>(rawRes.value))
const categories = computed(() => normalized.value.data)
const meta = computed(() => normalized.value.meta)

const search = ref('')
const filteredCategories = computed(() => {
  if (!search.value.trim()) return categories.value
  const q = search.value.toLowerCase()
  return categories.value.filter((c) => c.name.toLowerCase().includes(q))
})

const columns = [
  { accessorKey: 'thumbnail', header: 'Ảnh' },
  { accessorKey: 'name', header: 'Tên danh mục' },
  { accessorKey: 'slug', header: 'Đường dẫn (Slug)' },
  { accessorKey: 'description', header: 'Mô tả' },
  { accessorKey: 'actions', header: 'Hành động' }
]

// ─── Form State ───────────────────────────────────────────
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const isSubmitting = ref(false)

const formState = reactive({
  name: '',
  description: ''
})

const formErrors = reactive<Record<string, string>>({})

const schema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống').max(100, 'Tên không quá 100 ký tự'),
  description: z.string().optional()
})

// Thumbnail
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// ─── Handlers ─────────────────────────────────────────────
function triggerFileSelect() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    toast.add({ title: 'Ảnh không được vượt quá 2MB', color: 'warning' })
    return
  }
  const validExts = ['image/jpeg', 'image/png', 'image/webp']
  if (!validExts.includes(file.type)) {
    toast.add({ title: 'Chỉ hỗ trợ ảnh JPG, PNG, WebP', color: 'warning' })
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function clearImage() {
  selectedFile.value = null
  previewUrl.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function handleDelete(id: number) {
  if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return
  try {
    await productService.deleteCategory(id)
    await refresh()
  } catch {
    // API error is handled by interceptor
  }
}

function openAdd() {
  isEditing.value = false
  editingId.value = null
  formState.name = ''
  formState.description = ''
  clearImage()

  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  Object.keys(formErrors).forEach((k) => delete formErrors[k])
  showModal.value = true
}

function openEdit(cat: ProductCategory) {
  isEditing.value = true
  editingId.value = cat.id
  formState.name = cat.name
  formState.description = cat.description || ''

  clearImage()
  if (cat.thumbnailUrl) {
    previewUrl.value = getImageUrl(cat.thumbnailUrl)
  }

  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  Object.keys(formErrors).forEach((k) => delete formErrors[k])
  showModal.value = true
}

async function handleSave() {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  Object.keys(formErrors).forEach((k) => delete formErrors[k])
  const result = schema.safeParse(formState)
  if (!result.success) {
    result.error.issues.forEach((e: import('zod').ZodIssue) => {
      if (e.path[0]) formErrors[e.path[0].toString()] = e.message
    })
    return
  }

  isSubmitting.value = true
  try {
    const formData = new FormData()
    formData.append('name', result.data.name)
    formData.append('slug', slugify(result.data.name))
    if (result.data.description) formData.append('description', result.data.description)
    formData.append('metaTitle', result.data.name.substring(0, 60))
    formData.append(
      'metaDescription',
      (result.data.description || result.data.name).substring(0, 160)
    )

    if (selectedFile.value) {
      formData.append('thumbnail', selectedFile.value)
    }

    if (isEditing.value && editingId.value) {
      await productService.updateCategory(editingId.value, formData)
    } else {
      await productService.createCategory(formData)
    }
    showModal.value = false
    await refresh()
  } catch {
    // handled globally
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <BasePageHeader
      title="Danh mục Sản phẩm"
      description="Quản lý phân loại sản phẩm, hỗ trợ SEO và tìm kiếm dễ dàng."
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Sản phẩm', to: '/admin/products' },
        { label: 'Danh mục' }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/products">
          <UIcon name="i-lucide-arrow-left" class="mr-1 h-4 w-4" /> Sản phẩm
        </UButton>
        <UButton @click="openAdd">
          <UIcon name="i-lucide-plus" class="mr-1 h-4 w-4" /> Thêm danh mục
        </UButton>
      </template>
    </BasePageHeader>

    <template v-if="pending && !categories.length">
      <BasePageLoading />
    </template>
    <template v-else>
      <div class="card animate-fade-in-up p-5">
        <div class="mb-4 flex items-center gap-4">
          <div class="max-w-sm flex-1">
            <BaseSearchInput v-model="search" placeholder="Lọc danh mục theo tên..." />
          </div>
        </div>

        <div class="bg-surface ring-surface-border overflow-hidden rounded-lg ring-1">
          <UTable :columns="columns" :data="filteredCategories">
            <template #thumbnail-cell="{ row }">
              <NuxtImg
                :src="
                  getImageUrl(row.original.thumbnailUrl) || 'https://picsum.photos/100/100?random=3'
                "
                class="border-surface-border h-12 w-12 flex-shrink-0 rounded border object-cover shadow-sm"
              />
            </template>
            <template #name-cell="{ row }">
              <span class="text-surface-foreground font-semibold">{{ row.original.name }}</span>
            </template>
            <template #slug-cell="{ row }">
              <span
                class="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
              >
                /{{ row.original.slug }}
              </span>
            </template>
            <template #description-cell="{ row }">
              <span class="line-clamp-2 text-sm text-slate-500">{{
                row.original.description || '-'
              }}</span>
            </template>
            <template #actions-cell="{ row }">
              <div class="flex items-center gap-1">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-lucide-pencil"
                  @click="openEdit(row.original)"
                />
                <UButton
                  variant="ghost"
                  color="error"
                  size="sm"
                  icon="i-lucide-trash-2"
                  @click="handleDelete(row.original.id)"
                />
              </div>
            </template>
          </UTable>

          <div
            v-if="meta.total > 0"
            class="border-surface-border flex items-center justify-between border-t px-4 py-3"
          >
            <span class="text-sm text-slate-500 tabular-nums">
              {{ (page - 1) * perPage + 1 }}-{{ Math.min(page * perPage, meta.total) }} /
              {{ meta.total }}
            </span>
            <UPagination v-model="page" :total="meta.total" :items-per-page="perPage" />
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <UModal
        v-model:open="showModal"
        :title="isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'"
        :ui="{ content: 'sm:max-w-xl' }"
      >
        <template #body>
          <form id="categoryForm" class="space-y-4" @submit.prevent="handleSave">
            <UFormField label="Tên danh mục" :error="formErrors.name" required>
              <UInput v-model="formState.name" placeholder="VD: Bún Tươi, Phở Khô..." />
            </UFormField>

            <UFormField label="Đường dẫn (Slug)">
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-400">/</span>
                <UInput
                  :model-value="slugify(formState.name)"
                  disabled
                  class="flex-1"
                  :ui="{ base: 'bg-slate-50 dark:bg-zinc-800/50 text-slate-500' }"
                />
              </div>
              <template #hint>
                <span class="text-xs text-slate-500">Tự tạo từ tên danh mục. VD: bun-tuoi</span>
              </template>
            </UFormField>

            <UFormField label="Mô tả" :error="formErrors.description">
              <UTextarea
                v-model="formState.description"
                placeholder="Mô tả ngắn gọn về danh mục..."
              />
            </UFormField>

            <UFormField label="Ảnh đại diện (Thumbnail)">
              <input
                ref="fileInputRef"
                type="file"
                class="hidden"
                accept="image/jpeg,image/png,image/webp"
                @change="handleFileChange"
              />

              <div
                v-if="!previewUrl"
                class="border-surface-border hover:bg-surface-50 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors dark:hover:bg-zinc-800/50"
                @click="triggerFileSelect"
              >
                <UIcon name="i-lucide-image-plus" class="mb-2 h-8 w-8 text-slate-400" />
                <p class="text-surface-foreground text-center text-sm font-medium">
                  Click để chọn ảnh
                </p>
                <p class="mt-1 text-xs text-slate-500">JPG, PNG, WebP (Max 2MB)</p>
              </div>

              <div
                v-else
                class="group border-surface-border relative mx-auto h-32 w-48 overflow-hidden rounded-xl border"
              >
                <img :src="previewUrl" class="h-full w-full object-cover" />
                <div
                  class="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <UButton color="neutral" size="sm" @click="triggerFileSelect">Đổi ảnh</UButton>
                  <UButton color="error" size="sm" icon="i-lucide-trash-2" @click="clearImage" />
                </div>
              </div>
            </UFormField>
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton variant="outline" color="neutral" @click="showModal = false">Hủy</UButton>
            <UButton type="submit" form="categoryForm" :loading="isSubmitting">
              <UIcon name="i-lucide-check" class="mr-1 h-4 w-4" /> Lưu
            </UButton>
          </div>
        </template>
      </UModal>
    </template>
  </div>
</template>
