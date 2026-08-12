<script setup lang="ts">
import { z } from 'zod'
import { blogService } from '~/services/blogService'
import { slugify } from '~/utils/string'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: 'Viết bài - BunTech Admin' })

const route = useRoute()
const toast = useToast()

const isEditing = computed(() => !!route.query.id)
const postId = computed(() => Number(route.query.id))
const pageTitle = computed(() => (isEditing.value ? 'Chỉnh sửa bài viết' : 'Viết bài mới'))

// ─── Data fetching ─────────────────────────────────────────
const { data: catData } = useAsyncData('admin-categories', () => blogService.getAdminCategories())
const categoryOptions = computed(() => {
  return catData.value?.data?.map((c) => ({ label: c.name, value: c.id })) || []
})

// ─── Form State ───────────────────────────────────────────
const formState = reactive({
  title: '',
  blogCategoryId: '' as string | number,
  excerpt: '',
  content: '',
  metaTitle: '',
  metaDescription: '',
  isPublished: false
})

const formErrors = reactive<Record<string, string>>({})
const submitting = ref(false)

const schema = z.object({
  title: z.string().min(1, 'Vui lòng nhập tiêu đề').max(191, 'Tối đa 191 ký tự'),
  blogCategoryId: z.number().min(1, 'Danh mục không hợp lệ'),
  excerpt: z.string().optional().or(z.literal('')),
  content: z.string().min(1, 'Vui lòng nhập nội dung'),
  metaTitle: z.string().max(60, 'Tối đa 60 ký tự').optional(),
  metaDescription: z.string().max(160, 'Tối đa 160 ký tự').optional(),
  isPublished: z.boolean()
})

// Thumbnail
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// ─── Lifecycle ────────────────────────────────────────────
onMounted(async () => {
  if (isEditing.value && postId.value) {
    try {
      const res = await blogService.getAdminPost(postId.value)
      if (res.data) {
        formState.title = res.data.title
        formState.blogCategoryId = res.data.blogCategoryId
        formState.excerpt = res.data.excerpt || ''
        formState.content = res.data.content || ''
        formState.metaTitle = res.data.metaTitle || ''
        formState.metaDescription = res.data.metaDescription || ''
        formState.isPublished = res.data.isPublished || false
        if (res.data.thumbnailUrl) {
          previewUrl.value = getImageUrl(res.data.thumbnailUrl)
        }
      }
    } catch {
      toast.add({ title: 'Lỗi tải bài viết', color: 'error' })
      navigateTo('/admin/blog')
    }
  }
})

// ─── Handlers ─────────────────────────────────────────────
function triggerFileSelect() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Validate file
  if (file.size > 5 * 1024 * 1024) {
    toast.add({ title: 'Ảnh không được vượt quá 5MB', color: 'warning' })
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

async function handleSave(publish: boolean) {
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  Object.keys(formErrors).forEach((key) => delete formErrors[key as keyof typeof formErrors])

  formState.isPublished = publish

  const parseResult = schema.safeParse({
    ...formState,
    blogCategoryId: Number(formState.blogCategoryId)
  })

  if (!parseResult.success) {
    parseResult.error.issues.forEach((e: import('zod').ZodIssue) => {
      if (e.path[0]) formErrors[e.path[0].toString()] = e.message
    })
    toast.add({ title: 'Vui lòng kiểm tra lại thông tin', color: 'warning' })
    return
  }

  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('title', parseResult.data.title)
    formData.append('slug', slugify(parseResult.data.title))
    formData.append('blogCategoryId', parseResult.data.blogCategoryId.toString())
    if (parseResult.data.excerpt) formData.append('excerpt', parseResult.data.excerpt)
    formData.append('content', parseResult.data.content)
    const finalMetaTitle = parseResult.data.metaTitle || parseResult.data.title
    const finalMetaDescription =
      parseResult.data.metaDescription || parseResult.data.excerpt || parseResult.data.title

    formData.append('metaTitle', finalMetaTitle)
    formData.append('metaDescription', finalMetaDescription)

    formData.append('isPublished', parseResult.data.isPublished ? 'true' : 'false')

    if (parseResult.data.isPublished) {
      formData.append('publishedAt', new Date().toISOString())
    }

    if (selectedFile.value) {
      formData.append('thumbnail', selectedFile.value)
    }

    if (isEditing.value) {
      await blogService.updatePost(postId.value, formData)
    } else {
      await blogService.createPost(formData)
    }

    navigateTo('/admin/blog')
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
      description="Biên tập và xuất bản nội dung blog"
      :breadcrumbs="[
        { label: 'Trang chủ', to: '/admin', icon: 'i-lucide-home' },
        { label: 'Blog', to: '/admin/blog' },
        { label: pageTitle }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/blog"> Hủy </UButton>
        <UButton variant="outline" color="primary" :loading="submitting" @click="handleSave(false)">
          <UIcon name="i-lucide-save" class="mr-1 h-4 w-4" /> Lưu nháp
        </UButton>
        <UButton type="button" :loading="submitting" @click="handleSave(true)">
          <UIcon name="i-lucide-send" class="mr-1 h-4 w-4" /> Xuất bản
        </UButton>
      </template>
    </BasePageHeader>

    <form
      id="postForm"
      class="animate-fade-in-up grid grid-cols-1 gap-6 lg:grid-cols-3"
      @submit.prevent
    >
      <!-- Main Content Area -->
      <div class="space-y-6 lg:col-span-2">
        <div class="card p-6">
          <h2 class="text-surface-foreground mb-4 text-lg font-semibold">Nội dung bài viết</h2>

          <div class="space-y-4">
            <UFormField label="Tiêu đề" :error="formErrors.title" required>
              <UInput v-model="formState.title" placeholder="Nhập tiêu đề bài viết..." size="lg" />
            </UFormField>

            <UFormField label="Tóm tắt (Excerpt)" :error="formErrors.excerpt">
              <UTextarea
                v-model="formState.excerpt"
                placeholder="Đoạn văn ngắn giới thiệu nội dung..."
                :rows="3"
              />
            </UFormField>

            <UFormField label="Nội dung" :error="formErrors.content" required>
              <BaseRichTextEditor v-model="formState.content" />
            </UFormField>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-surface-foreground mb-4 text-sm font-semibold">SEO Meta Data</h2>
          <div class="space-y-4">
            <UFormField label="Meta Title" :error="formErrors.metaTitle">
              <UInput
                :model-value="formState.metaTitle || formState.title"
                @update:model-value="formState.metaTitle = $event"
              />
            </UFormField>
            <UFormField label="Meta Description" :error="formErrors.metaDescription">
              <UTextarea
                :model-value="formState.metaDescription || formState.excerpt || formState.title"
                @update:model-value="formState.metaDescription = $event"
              />
            </UFormField>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <div class="card p-6">
          <h2 class="text-surface-foreground mb-4 text-sm font-semibold">Thông tin xuất bản</h2>

          <div class="space-y-4">
            <UFormField label="Danh mục" :error="formErrors.blogCategoryId" required>
              <USelectMenu
                v-model="formState.blogCategoryId as any"
                :items="categoryOptions"
                value-key="value"
                placeholder="Chọn danh mục..."
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-surface-foreground mb-4 text-sm font-semibold">Ảnh bìa (Thumbnail)</h2>

          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            accept="image/jpeg,image/png,image/webp"
            @change="handleFileChange"
          />

          <div
            v-if="!previewUrl"
            class="border-surface-border hover:bg-surface-50 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors dark:hover:bg-zinc-800/50"
            @click="triggerFileSelect"
          >
            <UIcon name="i-lucide-image-plus" class="mb-2 h-8 w-8 text-slate-400" />
            <p class="text-surface-foreground text-center text-sm font-medium">Click để chọn ảnh</p>
            <p class="mt-1 text-xs text-slate-500">JPG, PNG, WebP (Max 5MB)</p>
          </div>

          <div
            v-else
            class="group border-surface-border relative aspect-[16/9] overflow-hidden rounded-xl border"
          >
            <img :src="previewUrl" class="h-full w-full object-cover" />
            <div
              class="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <UButton color="neutral" variant="solid" size="sm" @click="triggerFileSelect">
                Đổi ảnh
              </UButton>
              <UButton
                color="error"
                variant="solid"
                size="sm"
                icon="i-lucide-trash-2"
                @click="clearImage"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
