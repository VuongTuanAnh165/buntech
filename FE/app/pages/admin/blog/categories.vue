<script setup lang="ts">
import { mockBlogCategories, mockBlogPosts } from '~/utils/mockData'
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Danh mục Blog - BunTech Admin' })
const toast = useToast()
// ─── State ────────────────────────────────────────────────
const loading = ref(true)
const search = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const categoryName = ref('')
// ─── Filter & Data ────────────────────────────────────────
// Add post count to each category
const categoriesWithCount = computed(() => {
  return mockBlogCategories.map((c) => ({
    ...c,
    postCount: mockBlogPosts.filter((p) => p.category_id === c.id).length
  }))
})
const filteredCategories = computed(() => {
  if (!search.value.trim()) return categoriesWithCount.value
  const q = search.value.toLowerCase()
  return categoriesWithCount.value.filter((c) => c.name.toLowerCase().includes(q))
})
const columns = [
  { accessorKey: 'name', header: 'Tên danh mục' },
  { accessorKey: 'slug', header: 'Đường dẫn (Slug)' },
  { accessorKey: 'postCount', header: 'Số bài viết' },
  { accessorKey: 'created_at', header: 'Ngày tạo' },
  { accessorKey: 'actions', header: 'Hành động' }
]
// ─── Handlers ─────────────────────────────────────────────
function openAdd() {
  isEditing.value = false
  categoryName.value = ''
  showModal.value = true
}
function openEdit(cat: (typeof mockBlogCategories)[0]) {
  isEditing.value = true
  categoryName.value = cat.name
  showModal.value = true
}
function handleSave() {
  if (!categoryName.value.trim()) {
    toast.add({ title: 'Vui lòng nhập tên danh mục', color: 'warning' })
    return
  }
  toast.add({
    title: isEditing.value ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới',
    color: 'success'
  })
  showModal.value = false
}
function handleDelete(_id: string) {
  toast.add({ title: 'Đã xóa danh mục', color: 'success' })
}
// ─── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
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
    <template v-if="loading">
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
          <UTable :columns="columns" :data="filteredCategories">
            <template #name-cell="{ row }">
              <span class="text-surface-foreground font-semibold">{{ row.original.name }}</span>
            </template>
            <template #slug-cell="{ row }">
              <span
                class="rounded bg-slate-100 px-2 py-0.5 font-mono text-sm text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
              >
                /{{ row.original.slug }}
              </span>
            </template>
            <template #postCount-cell="{ row }">
              <UBadge color="neutral" variant="subtle"
                >{{ row.original.postCount }} bài viết</UBadge
              >
            </template>
            <template #created_at-cell="{ row }">
              <span class="text-sm text-slate-500 tabular-nums">{{
                formatDate(row.original.created_at)
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
        </div>
      </div>
      <!-- Add/Edit Modal -->
      <UModal v-model:open="showModal" :title="isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'">
        <template #body>
          <div class="space-y-4">
            <UFormField label="Tên danh mục" required>
              <UInput v-model="categoryName" placeholder="VD: Khuyến mãi, Tin tức..." />
            </UFormField>

            <UFormField label="Đường dẫn (Slug)">
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-400">/</span>
                <UInput
                  :model-value="slugify(categoryName)"
                  disabled
                  class="flex-1"
                  :ui="{ base: 'bg-slate-50 dark:bg-zinc-800/50 text-slate-500' }"
                />
              </div>
              <template #hint>
                <span class="text-xs text-slate-500">Tự động tạo từ tên danh mục</span>
              </template>
            </UFormField>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton variant="outline" color="neutral" @click="showModal = false">Hủy</UButton>
            <UButton @click="handleSave">
              <UIcon name="i-lucide-check" class="mr-1 h-4 w-4" /> Lưu
            </UButton>
          </div>
        </template>
      </UModal>
    </template>
  </div>
</template>
