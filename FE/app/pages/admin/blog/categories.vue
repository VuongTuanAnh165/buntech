<script setup lang="ts">
import { z } from 'zod'
import { blogService } from '~/services/blogService'
import type { BlogCategory } from '~/utils/types'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Danh mục Blog - BunTech Admin' })

// ─── State ────────────────────────────────────────────────
const {
  data: rawCategories,
  pending,
  refresh
} = useAsyncData('admin-categories', () => blogService.getAdminCategories())
const categories = computed(() => rawCategories.value?.data || [])

const search = ref('')
const filteredCategories = computed(() => {
  if (!search.value.trim()) return categories.value
  const q = search.value.toLowerCase()
  return categories.value.filter((c) => c.name.toLowerCase().includes(q))
})

const columns = [
  { accessorKey: 'name', header: 'Tên danh mục' },
  { accessorKey: 'slug', header: 'Đường dẫn (Slug)' },
  { accessorKey: 'description', header: 'Mô tả' },
  { accessorKey: 'createdAt', header: 'Ngày tạo' },
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
  description: z.string().max(191, 'Mô tả không quá 191 ký tự').optional()
})

// ─── Handlers ─────────────────────────────────────────────
async function handleDelete(id: number) {
  if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return
  try {
    await blogService.deleteCategory(id)
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
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  Object.keys(formErrors).forEach((k) => delete formErrors[k])
  showModal.value = true
}

function openEdit(cat: BlogCategory) {
  isEditing.value = true
  editingId.value = cat.id
  formState.name = cat.name
  formState.description = cat.description || ''
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
    const payload = {
      name: result.data.name,
      slug: slugify(result.data.name),
      description: result.data.description
    }

    if (isEditing.value && editingId.value) {
      await blogService.updateCategory(editingId.value, payload)
    } else {
      await blogService.createCategory(payload)
    }
    showModal.value = false
    await refresh()
  } catch {
    // Xử lý lỗi toàn cục trong ApiClient đã có toast, không cần thêm ở đây
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <BasePageHeader
      title="Danh mục Blog"
      description="Quản lý các chuyên mục bài viết"
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Blog', to: '/admin/blog' },
        { label: 'Danh mục' }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/blog">
          <UIcon name="i-lucide-arrow-left" class="mr-1 h-4 w-4" /> Quay lại
        </UButton>
        <UButton @click="openAdd">
          <UIcon name="i-lucide-plus" class="mr-1 h-4 w-4" /> Thêm danh mục
        </UButton>
      </template>
    </BasePageHeader>
    <template v-if="pending">
      <BasePageLoading />
    </template>
    <template v-else>
      <div class="card animate-fade-in-up p-5">
        <div class="mb-4 flex items-center gap-4">
          <div class="max-w-sm flex-1">
            <UInput v-model="search" icon="i-lucide-search" placeholder="Tìm kiếm danh mục..." />
          </div>
        </div>
        <div class="bg-surface ring-surface-border overflow-hidden rounded-lg ring-1">
          <BaseDataTable
            :columns="columns"
            :rows="filteredCategories"
            empty-title="Không tìm thấy danh mục"
            empty-description="Chưa có danh mục nào được tìm thấy."
            empty-icon="i-lucide-folder"
          >
            <template #name-cell="{ row }">
              <span class="text-surface-foreground font-semibold">{{ row.name }}</span>
            </template>
            <template #slug-cell="{ row }">
              <span
                class="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
              >
                /{{ row.slug }}
              </span>
            </template>
            <template #description-cell="{ row }">
              <span class="text-sm text-slate-500">{{ row.description || '-' }}</span>
            </template>
            <template #createdAt-cell="{ row }">
              <span class="text-sm text-slate-500 tabular-nums">{{
                formatDate(row.createdAt)
              }}</span>
            </template>
            <template #actions-cell="{ row }">
              <div class="flex items-center gap-1">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-lucide-pencil"
                  @click="openEdit(row)"
                />
                <UButton
                  variant="ghost"
                  color="error"
                  size="sm"
                  icon="i-lucide-trash-2"
                  @click="handleDelete(row.id)"
                />
              </div>
            </template>
          </BaseDataTable>
        </div>
      </div>
      <!-- Add/Edit Modal -->
      <UModal v-model:open="showModal" :title="isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'">
        <template #body>
          <form id="categoryForm" class="space-y-4" @submit.prevent="handleSave">
            <UFormField label="Tên danh mục" :error="formErrors.name" required>
              <UInput v-model="formState.name" placeholder="VD: Khuyến mãi, Tin tức..." />
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
                <span class="text-xs text-slate-500">Tự động tạo từ tên danh mục</span>
              </template>
            </UFormField>

            <UFormField label="Mô tả" :error="formErrors.description">
              <UTextarea
                v-model="formState.description"
                placeholder="Mô tả ngắn gọn về danh mục..."
              />
            </UFormField>
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              variant="outline"
              color="neutral"
              @click="
                () => {
                  showModal = false
                }
              "
              >Hủy</UButton
            >
            <UButton type="submit" form="categoryForm" :loading="isSubmitting">
              <UIcon name="i-lucide-check" class="mr-1 h-4 w-4" /> Lưu
            </UButton>
          </div>
        </template>
      </UModal>
    </template>
  </div>
</template>
