<script setup lang="ts">
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { mockBlogCategories, generateId } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
useHead({ title: `${t('blog.blogCategories')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const categories = ref<Record<string, unknown>[]>([])
const showModal = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ name: '', slug: '' })
const saving = ref(false)
const deleteTarget = ref<string | null>(null)

async function loadData() {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    categories.value = mockBlogCategories.value.slice().sort((a,b) => a.name.localeCompare(b.name))
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingId.value = null
  form.value = { name: '', slug: '' }
  showModal.value = true
}
function openEdit(row: Record<string, unknown>) {
  editingId.value = row.id as string
  form.value = { name: row.name as string, slug: row.slug as string }
  showModal.value = true
}

async function save() {
  if (!form.value.name) { toast.error(t('common.required')); return }
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    const { slugify } = useFormat()
    const slug = form.value.slug || slugify(form.value.name)
    if (editingId.value) {
      const idx = mockBlogCategories.value.findIndex(c => c.id === editingId.value)
      if (idx !== -1) {
        mockBlogCategories.value[idx].name = form.value.name
        mockBlogCategories.value[idx].slug = slug
      }
    } else {
      mockBlogCategories.value.push({
        id: generateId(),
        name: form.value.name,
        slug
      })
    }
    toast.success(t('common.save'))
    showModal.value = false
    loadData()
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}

async function deleteCategory() {
  if (!deleteTarget.value) return
  try {
    await new Promise(r => setTimeout(r, 300))
    const idx = mockBlogCategories.value.findIndex(c => c.id === deleteTarget.value)
    if (idx !== -1) mockBlogCategories.value.splice(idx, 1)
    toast.success(t('common.delete'))
    deleteTarget.value = null
    loadData()
  } catch {
    toast.error(t('errors.deleteFailed'))
  }
}

onMounted(loadData)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.blog'), to: '/admin/blog' }, { label: t('blog.blogCategories') }]" />
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('blog.blogCategories') }}</h1>
      <AppButton @click="openAdd"><Plus class="w-4 h-4" /> {{ t('blog.addCategory') }}</AppButton>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <template v-if="loading">
        <div v-for="i in 5" :key="i" class="px-4 py-3 border-b border-gray-50">
          <div class="skeleton h-5 w-48" />
        </div>
      </template>
      <template v-else-if="categories.length">
        <div v-for="cat in categories" :key="cat.id as string" class="px-4 py-3 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50">
          <div>
            <p class="font-medium text-gray-900">{{ cat.name }}</p>
            <p class="text-xs text-gray-400 font-mono">{{ cat.slug }}</p>
          </div>
          <div class="flex gap-1">
            <button class="p-1.5 text-gray-400 hover:text-primary-600" @click="openEdit(cat)"><Pencil class="w-4 h-4" /></button>
            <button class="p-1.5 text-gray-400 hover:text-danger-600" @click="deleteTarget = cat.id as string"><Trash2 class="w-4 h-4" /></button>
          </div>
        </div>
      </template>
      <AppEmptyState v-else :cta-text="t('blog.addCategory')" @action="openAdd" />
    </div>

    <AppModal v-model="showModal" :title="editingId ? t('blog.addCategory') : t('blog.addCategory')" size="sm">
      <form class="space-y-4" @submit.prevent="save">
        <AppInput v-model="form.name" :label="t('common.name')" :required="true" />
        <AppInput v-model="form.slug" :label="t('common.slug')" />
      </form>
      <template #footer>
        <AppButton variant="ghost" @click="showModal = false">{{ t('common.cancel') }}</AppButton>
        <AppButton :loading="saving" @click="save">{{ t('common.save') }}</AppButton>
      </template>
    </AppModal>

    <AppConfirmDialog :model-value="!!deleteTarget" :title="t('common.delete')" :message="t('blog.deleteConfirm')" @confirm="deleteCategory" @cancel="deleteTarget = null" />
  </div>
</template>
