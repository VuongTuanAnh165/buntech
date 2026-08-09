<script setup lang="ts">
import { mockBlogCategories, mockBlogPosts } from '~/utils/mockData'
import { BlogStatus } from '~/utils/enums'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Viết bài - BunTech Admin' })

const route = useRoute()
const toast = useToast()

const isEditing = computed(() => !!route.query.id)
const pageTitle = computed(() => (isEditing.value ? 'Chỉnh sửa bài viết' : 'Viết bài mới'))

// ─── State ────────────────────────────────────────────────
const title = ref('')
const categoryId = ref('')
const excerpt = ref('')
const content = ref('')
const status = ref<BlogStatus>(BlogStatus.DRAFT)
const imageUrl = ref('')

const categoryOptions = mockBlogCategories.map((c) => ({ label: c.name, value: c.id }))

// ─── Lifecycle ────────────────────────────────────────────
onMounted(() => {
  if (isEditing.value) {
    const post = mockBlogPosts.find((p) => p.id === route.query.id)
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
  await new Promise((r) => setTimeout(r, 600))
  toast.add({
    title: 'Thành công',
    description: isEditing.value ? 'Cập nhật bài viết thành công' : 'Đã lưu bài viết mới',
    color: 'success'
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
  <div class="mx-auto max-w-5xl">
    <BasePageHeader
      :title="pageTitle"
      description="Biên tập và xuất bản nội dung blog"
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Blog', to: '/admin/blog' },
        { label: pageTitle }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/blog"> Hủy </UButton>
        <UButton :loading="submitting" @click="handleSave">
          <UIcon name="i-lucide-save" class="mr-1 h-4 w-4" />
          {{ status === BlogStatus.PUBLISHED ? 'Xuất bản' : 'Lưu nháp' }}
        </UButton>
      </template>
    </BasePageHeader>

    <div class="animate-fade-in-up grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Main Content Area -->
      <div class="space-y-6 lg:col-span-2">
        <div class="card p-6">
          <h2 class="text-surface-foreground mb-4 text-lg font-semibold">Nội dung bài viết</h2>

          <div class="space-y-4">
            <UFormField label="Tiêu đề" required>
              <UInput v-model="title" placeholder="Nhập tiêu đề bài viết..." size="lg" />
            </UFormField>

            <UFormField label="Tóm tắt (Excerpt)">
              <UTextarea
                v-model="excerpt"
                placeholder="Đoạn văn ngắn giới thiệu nội dung..."
                :rows="3"
              />
            </UFormField>

            <UFormField label="Nội dung" required>
              <!-- A simple dummy editor area for now -->
              <div class="border-surface-border overflow-hidden rounded-md border">
                <div
                  class="bg-surface-50 border-surface-border flex gap-1 border-b p-2 dark:bg-zinc-800/50"
                >
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-bold" />
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-italic" />
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-underline" />
                  <div class="bg-surface-border mx-1 my-auto h-6 w-px" />
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-align-left" />
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-align-center" />
                  <UButton variant="ghost" color="neutral" size="sm" icon="i-lucide-align-right" />
                  <div class="bg-surface-border mx-1 my-auto h-6 w-px" />
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
          <h2 class="text-surface-foreground mb-4 text-sm font-semibold">Thông tin xuất bản</h2>

          <div class="space-y-4">
            <UFormField label="Trạng thái">
              <USelectMenu
                v-model="status"
                :items="[
                  { label: 'Bản nháp', value: BlogStatus.DRAFT },
                  { label: 'Xuất bản', value: BlogStatus.PUBLISHED }
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
          <h2 class="text-surface-foreground mb-4 text-sm font-semibold">Ảnh bìa (Thumbnail)</h2>

          <div
            v-if="!imageUrl"
            class="border-surface-border hover:bg-surface-50 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors dark:hover:bg-zinc-800/50"
            @click="handleImageSelect"
          >
            <UIcon name="i-lucide-image-plus" class="mb-2 h-8 w-8 text-slate-400" />
            <p class="text-surface-foreground text-center text-sm font-medium">Click để chọn ảnh</p>
            <p class="mt-1 text-xs text-slate-500">JPG, PNG, WebP (Max 2MB)</p>
          </div>

          <div
            v-else
            class="group border-surface-border relative aspect-[16/9] overflow-hidden rounded-xl border"
          >
            <NuxtImg :src="imageUrl" class="h-full w-full object-cover" />
            <div
              class="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <UButton color="white" variant="solid" size="sm" @click="handleImageSelect">
                Đổi ảnh
              </UButton>
              <UButton
                color="error"
                variant="solid"
                size="sm"
                icon="i-lucide-trash-2"
                @click="imageUrl = ''"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
