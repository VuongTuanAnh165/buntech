<script setup lang="ts">
import type { Category } from '~/utils/types'
import { mockCategories, mockProducts } from '~/utils/mockData'
const toast = useToast()
useSeoMeta({ title: `Danh mục sản phẩm - BunTech Admin` })
definePageMeta({ layout: 'admin' })
// ─── State ──────────────────────────────────────────────
const loading = ref(true)
const categories = ref<Category[]>([...mockCategories])
const products = ref([...mockProducts])
const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ name: '', slug: '' })
const saving = ref(false)
const deleteTarget = ref<Category | null>(null)
const deleting = ref(false)
onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 300)
})
// ─── Product count per category ──────────────────────────
function productCount(catId: string): number {
  return products.value.filter((p) => p.category_id === catId).length
}
function activeProductCount(catId: string): number {
  return products.value.filter(
    (p) => p.category_id === catId && p.status === 'ACTIVE' && !p.deleted_at
  ).length
}
// ─── CRUD ───────────────────────────────────────────────
function openAdd() {
  editingId.value = null
  form.value = { name: '', slug: '' }
  showModal.value = true
}
function openEdit(cat: Category) {
  editingId.value = cat.id
  form.value = { name: cat.name, slug: cat.slug }
  showModal.value = true
}
function save() {
  if (!form.value.name.trim()) {
    toast.add({ title: 'Vui lòng nhập tên danh mục', color: 'error' })
    return
  }
  saving.value = true
  const slug = form.value.slug.trim() || slugify(form.value.name)
  setTimeout(() => {
    if (editingId.value) {
      const idx = categories.value.findIndex((c) => c.id === editingId.value)
      if (idx !== -1) {
        categories.value[idx] = {
          ...categories.value[idx],
          name: form.value.name.trim(),
          slug
        } as Category
      }
      toast.add({ title: 'Đã cập nhật danh mục', color: 'success' })
    } else {
      categories.value.push({
        id: `cat-${Date.now()}`,
        name: form.value.name.trim(),
        slug,
        created_at: new Date().toISOString()
      })
      toast.add({ title: 'Đã thêm danh mục mới', color: 'success' })
    }
    showModal.value = false
    saving.value = false
  }, 400)
}
function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  setTimeout(() => {
    categories.value = categories.value.filter((c) => c.id !== deleteTarget.value!.id)
    toast.add({ title: 'Đã xóa danh mục', color: 'success' })
    deleteTarget.value = null
    deleting.value = false
  }, 400)
}
const deleteConfirmMessage = computed(() =>
  deleteTarget.value
    ? `Bạn có chắc muốn xóa danh mục "${deleteTarget.value.name}"? Các sản phẩm thuộc danh mục này sẽ không bị xóa.`
    : ''
)
const isDeleteModalOpen = computed({
  get: () => !!deleteTarget.value,
  set: (val) => {
    if (!val) deleteTarget.value = null
  }
})
</script>
<template>
  <div>
    <BasePageHeader title="Danh mục sản phẩm" description="Phân loại sản phẩm bún, phở, miến...">
      <template #actions>
        <UButton icon="i-lucide-plus" color="primary" @click="openAdd"> Thêm danh mục </UButton>
      </template>
    </BasePageHeader>
    <!-- Stats Summary -->
    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div class="card stagger-item p-4" style="animation-delay: 0ms">
        <div class="flex items-center gap-3">
          <div
            class="bg-primary-50 dark:bg-primary-900/20 flex h-9 w-9 items-center justify-center rounded-lg"
          >
            <span
              class="i-lucide-folder-open text-primary-600 dark:text-primary-400 h-[18px] w-[18px]"
              aria-hidden="true"
            />
          </div>
          <div>
            <p class="text-xs font-medium text-slate-500 dark:text-zinc-400">Tổng danh mục</p>
            <p class="text-surface-foreground text-xl font-bold tabular-nums">
              {{ categories.length }}
            </p>
          </div>
        </div>
      </div>
      <div class="card stagger-item p-4" style="animation-delay: 40ms">
        <div class="flex items-center gap-3">
          <div
            class="bg-info-50 dark:bg-info-900/20 flex h-9 w-9 items-center justify-center rounded-lg"
          >
            <span
              class="i-lucide-package text-info-600 dark:text-info-400 h-[18px] w-[18px]"
              aria-hidden="true"
            />
          </div>
          <div>
            <p class="text-xs font-medium text-slate-500 dark:text-zinc-400">Tổng sản phẩm</p>
            <p class="text-surface-foreground text-xl font-bold tabular-nums">
              {{ products.length }}
            </p>
          </div>
        </div>
      </div>
      <div class="card stagger-item col-span-2 p-4 sm:col-span-1" style="animation-delay: 80ms">
        <div class="flex items-center gap-3">
          <div
            class="bg-success-50 dark:bg-success-900/20 flex h-9 w-9 items-center justify-center rounded-lg"
          >
            <span
              class="i-lucide-hash text-success-600 dark:text-success-400 h-[18px] w-[18px]"
              aria-hidden="true"
            />
          </div>
          <div>
            <p class="text-xs font-medium text-slate-500 dark:text-zinc-400">TB SP/danh mục</p>
            <p class="text-surface-foreground text-xl font-bold tabular-nums">
              {{ categories.length ? Math.round(products.length / categories.length) : 0 }}
            </p>
          </div>
        </div>
      </div>
    </div>
    <!-- Category Grid -->
    <template v-if="loading">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="card p-5">
          <div class="mb-4 flex items-center gap-3">
            <div class="skeleton h-10 w-10 rounded-lg" />
            <div class="flex-1">
              <div class="skeleton mb-1.5 h-4" />
              <div class="skeleton h-3 w-1/2" />
            </div>
          </div>
          <div class="skeleton mb-2 h-3" />
          <div class="skeleton h-3 w-2/3" />
        </div>
      </div>
    </template>
    <template v-else-if="categories.length">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(cat, idx) in categories"
          :key="cat.id"
          class="card card-hover stagger-item group p-5"
          :style="{ animationDelay: `${idx * 40}ms` }"
        >
          <div class="mb-4 flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br transition-transform group-hover:scale-105"
              >
                <span
                  class="i-lucide-tag text-primary-600 dark:text-primary-400 h-5 w-5"
                  aria-hidden="true"
                />
              </div>
              <div class="min-w-0">
                <p class="text-surface-foreground truncate font-semibold">{{ cat.name }}</p>
                <p class="truncate font-mono text-xs text-slate-400 dark:text-zinc-500">
                  {{ cat.slug }}
                </p>
              </div>
            </div>
            <div class="flex flex-shrink-0 gap-1">
              <UButton
                variant="ghost"
                color="neutral"
                class="hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg p-2 text-slate-400 transition-colors dark:text-zinc-500"
                aria-label="Sửa danh mục"
                @click="openEdit(cat)"
              >
                <span class="i-lucide-pencil h-4 w-4" aria-hidden="true" />
              </UButton>
              <UButton
                variant="ghost"
                color="neutral"
                class="hover:text-danger-600 dark:hover:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20 flex min-h-[36px] min-w-[36px] items-center justify-center rounded-lg p-2 text-slate-400 transition-colors dark:text-zinc-500"
                aria-label="Xóa danh mục"
                @click="
                  () => {
                    deleteTarget = cat
                  }
                "
              >
                <span class="i-lucide-trash-2 h-4 w-4" aria-hidden="true" />
              </UButton>
            </div>
          </div>
          <div class="border-surface-border flex items-center gap-3 border-t pt-3">
            <div class="flex items-center gap-1.5">
              <span
                class="i-lucide-package h-3.5 w-3.5 text-slate-400 dark:text-zinc-500"
                aria-hidden="true"
              />
              <span class="text-surface-foreground text-sm font-medium tabular-nums">{{
                productCount(cat.id)
              }}</span>
              <span class="text-xs text-slate-500 dark:text-zinc-400">sản phẩm</span>
            </div>
            <div class="bg-surface-border h-3 w-px" aria-hidden="true" />
            <div class="flex items-center gap-1.5">
              <span class="bg-success-500 h-2 w-2 rounded-full" aria-hidden="true" />
              <span class="text-surface-foreground text-sm font-medium tabular-nums">{{
                activeProductCount(cat.id)
              }}</span>
              <span class="text-xs text-slate-500 dark:text-zinc-400">đang bán</span>
            </div>
            <span class="ml-auto text-xs text-slate-400 tabular-nums dark:text-zinc-500">{{
              formatDate(cat.created_at)
            }}</span>
          </div>
        </div>
      </div>
    </template>
    <BaseEmptyState
      v-else
      title="Chưa có danh mục nào"
      description="Tạo danh mục để phân loại sản phẩm bún, phở, miến..."
      icon="i-lucide-folder"
    >
      <template #action>
        <UButton color="primary" @click="openAdd">Thêm danh mục</UButton>
      </template>
    </BaseEmptyState>
    <!-- Add/Edit Modal -->
    <UModal v-model:open="showModal" :title="editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'">
      <template #body>
        <form class="space-y-4" @submit.prevent="save">
          <UFormField label="Tên danh mục" required>
            <UInput v-model="form.name" placeholder="VD: Bún tươi, Phở tươi..." autofocus />
          </UFormField>
          <UFormField label="Đường dẫn (slug)" help="Để trống để tự tạo từ tên danh mục">
            <UInput v-model="form.slug" placeholder="tu-dong-tao-tu-ten" />
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
                showModal = false
              }
            "
            >Hủy</UButton
          >
          <UButton :loading="saving" color="primary" @click="save">{{
            editingId ? 'Cập nhật' : 'Thêm mới'
          }}</UButton>
        </div>
      </template>
    </UModal>
    <UModal v-model:open="isDeleteModalOpen" title="Xóa danh mục">
      <template #body>
        <p>{{ deleteConfirmMessage }}</p>
      </template>
      <template #footer>
        <div class="flex w-full justify-end gap-3">
          <UButton
            color="neutral"
            variant="ghost"
            @click="
              () => {
                isDeleteModalOpen = false
              }
            "
            >Hủy</UButton
          >
          <UButton color="error" :loading="deleting" @click="confirmDelete">Xóa</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
