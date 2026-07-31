<script setup lang="ts">
import { Plus, Pencil, Trash2, Eye } from 'lucide-vue-next'
import { mockBlogPosts, mockBlogCategories } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const { formatDate } = useFormat()
useHead({ title: `${t('nav.blog')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const error = ref(false)
const posts = ref<Record<string, unknown>[]>([])

const deleteTarget = ref<string | null>(null)

async function loadData() {
  loading.value = true
  error.value = false
  try {
    await new Promise(r => setTimeout(r, 300))
    posts.value = mockBlogPosts.value
      .filter(p => !p.deleted_at)
      .sort((a,b) => b.created_at.localeCompare(a.created_at))
      .map(p => ({
        ...p,
        category: mockBlogCategories.value.find(c => c.id === p.category_id) || null
      }))
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function deletePost() {
  if (!deleteTarget.value) return
  try {
    await new Promise(r => setTimeout(r, 300))
    const index = mockBlogPosts.value.findIndex(p => p.id === deleteTarget.value)
    if (index !== -1) mockBlogPosts.value[index].deleted_at = new Date().toISOString()
    toast.success(t('blog.deleteSuccess'))
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
    <AppBreadcrumb :items="[{ label: t('nav.blog') }]" />
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-900">{{ t('blog.title') }}</h1>
      <div class="flex gap-2">
        <NuxtLink to="/admin/blog/categories"><AppButton variant="outline">{{ t('blog.blogCategories') }}</AppButton></NuxtLink>
        <NuxtLink to="/admin/blog/edit"><AppButton><Plus class="w-4 h-4" /> {{ t('blog.addNew') }}</AppButton></NuxtLink>
      </div>
    </div>

    <AppErrorState v-if="error" @retry="loadData" />

    <div v-else class="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <template v-if="loading">
        <div v-for="i in 5" :key="i" class="px-4 py-3 border-b border-gray-50">
          <div class="skeleton h-5 w-3/4 mb-2" />
          <div class="skeleton h-4 w-1/3" />
        </div>
      </template>
      <template v-else-if="posts.length">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">{{ t('blog.postTitle') }}</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">{{ t('common.category') }}</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">{{ t('common.status') }}</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-600">{{ t('common.date') }}</th>
              <th class="px-4 py-3 text-right font-semibold text-gray-600">{{ t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="post in posts" :key="post.id as string" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium text-gray-900">{{ post.title }}</td>
              <td class="px-4 py-3 text-gray-500">{{ (post.category as Record<string, unknown>)?.name || '—' }}</td>
              <td class="px-4 py-3">
                <AppBadge :color="(post.status as string) === 'PUBLISHED' ? 'success' : 'gray'">
                  {{ (post.status as string) === 'PUBLISHED' ? t('blog.published') : t('blog.draft') }}
                </AppBadge>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ formatDate(post.created_at as string) }}</td>
              <td class="px-4 py-3 text-right">
                <div class="flex justify-end gap-1">
                  <NuxtLink :to="`/admin/blog/edit?id=${post.id}`" class="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Pencil class="w-4 h-4" /></NuxtLink>
                  <button class="p-1.5 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg" @click="deleteTarget = post.id as string"><Trash2 class="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
      <AppEmptyState v-else :cta-text="t('blog.addNew')" @action="router.push('/admin/blog/edit')" />
    </div>

    <AppConfirmDialog :model-value="!!deleteTarget" :title="t('common.delete')" :message="t('blog.deleteConfirm')" @confirm="deletePost" @cancel="deleteTarget = null" />
  </div>
</template>
