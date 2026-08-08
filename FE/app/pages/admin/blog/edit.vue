<script setup lang="ts">
import { mockBlogCategories, mockBlogPosts } from '~/utils/mockData'
import { BlogStatus } from '~/utils/enums'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Viết bài - BunTech Admin' })

const route = useRoute()
const toast = useToast()

const isEditing = computed(() => !!route.query.id)
const pageTitle = computed(() => isEditing.value ? 'Chỉnh sửa bài viết' : 'Viết bài mới')

// ─── State ────────────────────────────────────────────────
const title = ref('')
const categoryId = ref('')
const excerpt = ref('')
const content = ref('')
const status = ref<BlogStatus>(BlogStatus.DRAFT)
const imageUrl = ref('')

const categoryOptions = mockBlogCategories.map(c => ({ label: c.name, value: c.id }))

// ─── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  if (isEditing.value) {
    const post = mockBlogPosts.find(p => p.id === route.query.id)
    if (post) {
      title.value = post.title
      categoryId.value = post.category_id || ''
      excerpt.value = post.excerpt
      content.value = post.content
      status.value = post.status
      imageUrl.value = post.image_url || ''
    }
  }
})

// ─── Handlers ─────────────────────────────────────────────
const submitting = ref(false)

async function handleSave() {
  if (!title.value.trim() || !categoryId.value || !content.value.trim()) {
    toast.add({ title: 'Vui lòng điền các trường bắt buộc', color: 'warning' })
    return
  }
  submitting.value = true
  await new Promise(r => setTimeout(r, 600))
  toast.add({
    title: 'Thành công',
    description: isEditing.value ? 'Cập nhật bài viết thành công' : 'Đã lưu bài viết mới',
    color: 'success',
  })
  submitting.value = false
  navigateTo('/admin/blog')
}

// ─── Dummy Image Upload ───────────────────────────────────
function handleImageSelect() {
  imageUrl.value = `https://picsum.photos/800/500?random=${Math.floor(Math.random() * 1000)}`
}
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <BasePageHeader
      :title="pageTitle"
      description="Biên tập và xuất bản nội dung blog"
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Blog', to: '/admin/blog' },
        { label: pageTitle },
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/blog">
          Hủy
        </UButton>
        <UButton :loading="submitting" @click="handleSave">
          <UIcon name="i-lucide-save" class="w-4 h-4 mr-1" />
          {{ status === BlogStatus.PUBLISHED ? 'Xuất bản' : 'Lưu nháp' }}
        </UButton>
      </template>
    </BasePageHeader>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
      <!-- Main Content Area -->
      <div class="lg:col-span-2 space-y-6">
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-surface-foreground mb-4">Nội dung bài viết</h2>
          
          <div class="space-y-4">
            <UFormField label="Tiêu đề" required>
              <UInput v-model="title" placeholder="Nhập tiêu đề bài viết..." size="lg" />
            </UFormField>

            <UFormField label="Tóm tắt (Excerpt)">
              <UTextarea v-model="excerpt" placeholder="Đoạn văn ngắn giới thiệu nội dung..." :rows="3" />
            </UFormField>

            <UFormField label="Nội dung" required>
              <!-- A simple dummy editor area for now -->
              <div class="border border-surface-border rounded-md overflow-hidden">
                <div class="bg-surface-50 dark:bg-zinc-800/50 p-2 flex gap-1 border-b border-surface-border">
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-bold" />
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-italic" />
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-underline" />
                  <div class="w-px h-6 bg-surface-border mx-1 my-auto" />
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-align-left" />
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-align-center" />
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-align-right" />
                  <div class="w-px h-6 bg-surface-border mx-1 my-auto" />
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-image" />
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-link" />
                </div>
                <UTextarea 
                  v-model="content" 
                  placeholder="Bắt đầu viết nội dung ở đây..." 
                  :rows="15" 
                  :ui="{ base: 'border-0 focus:ring-0 rounded-none resize-y', wrapper: 'static' }"
                />
              </div>
            </UFormField>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <div class="card p-6">
          <h2 class="text-sm font-semibold text-surface-foreground mb-4">Thông tin xuất bản</h2>
          
          <div class="space-y-4">
            <UFormField label="Trạng thái">
              <USelectMenu
                v-model="status"
                :items="[
                  { label: 'Bản nháp', value: BlogStatus.DRAFT },
                  { label: 'Xuất bản', value: BlogStatus.PUBLISHED },
                ]"
                value-key="value"
              />
            </UFormField>

            <UFormField label="Danh mục" required>
              <USelectMenu
                v-model="categoryId"
                :items="categoryOptions"
                value-key="value"
                placeholder="Chọn danh mục..."
              />
            </UFormField>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-sm font-semibold text-surface-foreground mb-4">Ảnh bìa (Thumbnail)</h2>
          
          <div 
            v-if="!imageUrl"
            class="border-2 border-dashed border-surface-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-50 dark:hover:bg-zinc-800/50 transition-colors"
            @click="handleImageSelect"
          >
            <UIcon name="i-lucide-image-plus" class="w-8 h-8 text-slate-400 mb-2" />
            <p class="text-sm font-medium text-surface-foreground text-center">Click để chọn ảnh</p>
            <p class="text-xs text-slate-500 mt-1">JPG, PNG, WebP (Max 2MB)</p>
          </div>
          
          <div v-else class="relative group rounded-xl overflow-hidden aspect-[16/9] border border-surface-border">
            <NuxtImg :src="imageUrl" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <UButton color="white" variant="solid" size="sm" @click="handleImageSelect">
                Đổi ảnh
              </UButton>
              <UButton color="error" variant="solid" size="sm" icon="i-lucide-trash-2" @click="imageUrl = ''" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
