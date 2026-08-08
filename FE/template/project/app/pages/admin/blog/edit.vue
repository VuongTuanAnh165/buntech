<script setup lang="ts">
import {
  ArrowLeft, Save, Upload, Eye, EyeOff, Bold, Italic, Heading2,
  List, ListOrdered, Link2, Image as ImageIcon, Globe, FileEdit, CheckCircle2,
  Tag, Clock, User,
} from 'lucide-vue-next'
import { BlogStatus } from '../../../core/enums'
import type { BlogPost, BlogCategory } from '../../../core/types'
import { mockBlogPosts, mockBlogCategories } from '../../../core/mock/data'

const { t } = useI18n()
const toast = useToast()
const router = useRouter()
const route = useRoute()
const { slugify, formatDate } = useFormat()

useHead({ title: `Bài viết - BunTech Admin` })
definePageMeta({ layout: 'admin' })

// ─── State ──────────────────────────────────────────────
const loading = ref(true)
const saving = ref(false)
const showPreview = ref(false)
const isDirty = ref(false)

const posts = ref<BlogPost[]>(mockBlogPosts.map(p => ({ ...p })))
const categories = ref<BlogCategory[]>([...mockBlogCategories])

const editingId = computed(() => route.query.id as string | undefined)
const isEditing = computed(() => !!editingId.value)

const form = ref({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category_id: '',
  status: BlogStatus.DRAFT as BlogStatus,
  image_url: '',
  author_name: 'Nguyễn Quang Admin',
})

const contentTextarea = ref<HTMLTextAreaElement | null>(null)

// ─── Load post if editing ────────────────────────────────
onMounted(() => {
  setTimeout(() => {
    if (editingId.value) {
      const post = posts.value.find(p => p.id === editingId.value)
      if (post) {
        form.value = {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          content: post.content || '',
          category_id: post.category_id || '',
          status: post.status,
          image_url: post.image_url || '',
          author_name: post.author_name || 'Nguyễn Quang Admin',
        }
        useHead({ title: `Sửa: ${post.title} - BunTech Admin` })
      }
    }
    loading.value = false
    nextTick(() => {
      // isDirty starts false, track changes after mount
      watch(form, () => { isDirty.value = true }, { deep: true })
    })
  }, 300)
})

// ─── Auto-generate slug ──────────────────────────────────
watch(() => form.value.title, (title) => {
  if (!isEditing.value || !form.value.slug) {
    form.value.slug = slugify(title)
  }
})

// ─── Category options ────────────────────────────────────
const categoryOptions = computed(() =>
  categories.value.map(c => ({ value: c.id, label: c.name })),
)

// ─── Selected category ───────────────────────────────────
const selectedCategory = computed(() => categories.value.find(c => c.id === form.value.category_id))

// ─── Preview (sanitized) ─────────────────────────────────
const previewHtml = computed(() => {
  // Basic sanitize (remove script tags)
  return (form.value.content || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
})

// ─── Editor toolbar actions ──────────────────────────────
function insertMarkdown(before: string, after = '') {
  const el = contentTextarea.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const selected = form.value.content.slice(start, end)
  const newContent =
    form.value.content.slice(0, start) +
    before +
    selected +
    after +
    form.value.content.slice(end)
  form.value.content = newContent
  nextTick(() => {
    el.focus()
    const newCursor = start + before.length + selected.length + after.length
    el.setSelectionRange(newCursor, newCursor)
  })
}

function insertHeading2() {
  const el = contentTextarea.value
  if (!el) return
  const lineStart = form.value.content.lastIndexOf('\n', el.selectionStart - 1) + 1
  form.value.content =
    form.value.content.slice(0, lineStart) +
    '<h2>' +
    form.value.content.slice(lineStart, el.selectionEnd) +
    '</h2>' +
    form.value.content.slice(el.selectionEnd)
}

function insertList() {
  insertMarkdown('<ul>\n  <li>', '</li>\n</ul>')
}

function insertOrderedList() {
  insertMarkdown('<ol>\n  <li>', '</li>\n</ol>')
}

const toolbarButtons = [
  { label: 'Bold', action: () => insertMarkdown('<strong>', '</strong>'), icon: Bold, shortcut: 'B' },
  { label: 'Italic', action: () => insertMarkdown('<em>', '</em>'), icon: Italic, shortcut: 'I' },
  { label: 'Heading 2', action: insertHeading2, icon: Heading2, shortcut: 'H2' },
  { label: 'List', action: insertList, icon: List, shortcut: 'UL' },
  { label: 'Ordered List', action: insertOrderedList, icon: ListOrdered, shortcut: 'OL' },
  { label: 'Link', action: () => insertMarkdown('<a href="">', '</a>'), icon: Link2, shortcut: 'A' },
]

function insertImage() {
  insertMarkdown('<img src="" alt="', '" />')
}

const emptyPreviewHtml = '<p class="text-slate-400">Nội dung bài viết sẽ hiển thị tại đây...</p>'

// ─── Save / Publish ──────────────────────────────────────
async function save(overrideStatus?: BlogStatus) {
  if (!form.value.title.trim()) {
    toast.error('Vui lòng nhập tiêu đề bài viết')
    return
  }
  saving.value = true
  const slug = form.value.slug || slugify(form.value.title)
  const status = overrideStatus || form.value.status

  setTimeout(() => {
    if (isEditing.value) {
      const idx = posts.value.findIndex(p => p.id === editingId.value)
      if (idx !== -1) {
        posts.value[idx] = {
          ...posts.value[idx],
          ...form.value,
          slug,
          status,
          published_at: status === BlogStatus.PUBLISHED && !posts.value[idx].published_at
            ? new Date().toISOString()
            : posts.value[idx].published_at,
          updated_at: new Date().toISOString(),
        }
      }
    } else {
      const newPost: BlogPost = {
        id: `blg-${Date.now()}`,
        category_id: form.value.category_id || null,
        category: selectedCategory.value || null,
        title: form.value.title.trim(),
        slug,
        excerpt: form.value.excerpt.trim(),
        content: form.value.content,
        image_url: form.value.image_url || null,
        featured_image: form.value.image_url || null,
        author_name: form.value.author_name,
        published_at: status === BlogStatus.PUBLISHED ? new Date().toISOString() : null,
        status,
        deleted_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      posts.value.unshift(newPost)
    }

    toast.success(
      status === BlogStatus.PUBLISHED ? 'Bài viết đã được xuất bản!' : 'Đã lưu bản nháp',
    )
    isDirty.value = false
    saving.value = false
    router.push('/admin/blog')
  }, 600)
}

function publishNow() {
  form.value.status = BlogStatus.PUBLISHED
  save(BlogStatus.PUBLISHED)
}

function saveDraft() {
  form.value.status = BlogStatus.DRAFT
  save(BlogStatus.DRAFT)
}

const existingPost = computed(() =>
  isEditing.value ? posts.value.find(p => p.id === editingId.value) : null,
)

const wordCount = computed(() => {
  const stripped = form.value.content.replace(/<[^>]+>/g, ' ')
  return stripped.trim().split(/\s+/).filter(Boolean).length
})
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: 'Blog', to: '/admin/blog' }, { label: isEditing ? 'Sửa bài viết' : 'Viết bài mới' }]" />

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in-up">
      <div class="flex items-center gap-3 min-w-0">
        <button
          class="w-9 h-9 rounded-lg border border-surface-border bg-surface hover:bg-surface-hover flex items-center justify-center transition-colors flex-shrink-0"
          aria-label="Quay lại"
          @click="router.push('/admin/blog')"
        >
          <ArrowLeft class="w-4 h-4 text-slate-500 dark:text-zinc-400" aria-hidden="true" />
        </button>
        <div class="min-w-0">
          <h1 class="page-title truncate">
            {{ isEditing ? 'Sửa bài viết' : 'Viết bài mới' }}
          </h1>
          <p class="page-subtitle">{{ isEditing && existingPost ? existingPost.title : 'Tạo nội dung mới cho blog BunTech' }}</p>
        </div>
      </div>
      <div class="flex flex-wrap gap-2 flex-shrink-0">
        <AppButton variant="outline" :loading="saving" size="md" @click="saveDraft">
          <Save class="w-4 h-4" aria-hidden="true" /> Lưu nháp
        </AppButton>
        <AppButton variant="primary" :loading="saving" size="md" @click="publishNow">
          <Globe class="w-4 h-4" aria-hidden="true" /> Xuất bản
        </AppButton>
      </div>
    </div>

    <template v-if="loading">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-4">
          <div class="card p-5">
            <AppSkeleton height="h-5" width="w-24" class="mb-3" />
            <AppSkeleton height="h-11" class="mb-4" />
            <AppSkeleton height="h-5" width="w-24" class="mb-3" />
            <AppSkeleton height="h-11" class="mb-4" />
            <AppSkeleton height="h-5" width="w-24" class="mb-3" />
            <AppSkeleton height="h-40" />
          </div>
        </div>
        <div class="space-y-4">
          <div class="card p-5"><AppSkeleton height="h-48" /></div>
        </div>
      </div>
    </template>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: Editor 2/3 -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Main Content Card -->
        <div class="card p-5 space-y-5 animate-fade-in-up" style="animation-delay: 0ms">
          <!-- Title -->
          <div>
            <label class="form-label" for="post-title">
              Tiêu đề bài viết <span class="text-danger-500">*</span>
            </label>
            <input
              id="post-title"
              v-model="form.title"
              type="text"
              class="form-input text-lg font-semibold"
              placeholder="Nhập tiêu đề hấp dẫn..."
              :required="true"
            >
          </div>

          <!-- Slug -->
          <div>
            <label class="form-label" for="post-slug">Đường dẫn (slug)</label>
            <div class="flex items-center gap-0">
              <span class="inline-flex items-center px-3 h-11 rounded-l-lg border border-r-0 border-surface-border bg-surface-muted text-sm text-slate-500 dark:text-zinc-400 whitespace-nowrap">/blog/</span>
              <input
                id="post-slug"
                v-model="form.slug"
                type="text"
                class="form-input rounded-l-none"
                placeholder="tieu-de-bai-viet"
              >
            </div>
          </div>

          <!-- Excerpt -->
          <div>
            <label class="form-label" for="post-excerpt">Mô tả ngắn</label>
            <textarea
              id="post-excerpt"
              v-model="form.excerpt"
              rows="2"
              placeholder="Mô tả ngắn hiển thị trong danh sách bài viết..."
              class="form-input resize-none"
            />
          </div>

          <!-- Content Editor -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="form-label mb-0" for="post-content">Nội dung</label>
              <div class="flex items-center gap-2">
                <span class="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">{{ wordCount }} từ</span>
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 px-2 py-1 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  @click="showPreview = !showPreview"
                >
                  <component :is="showPreview ? EyeOff : Eye" class="w-3.5 h-3.5" aria-hidden="true" />
                  {{ showPreview ? 'Đóng xem trước' : 'Xem trước' }}
                </button>
              </div>
            </div>

            <!-- Toolbar -->
            <div class="flex flex-wrap gap-1 p-2 border border-b-0 border-surface-border rounded-t-lg bg-surface-muted">
              <button
                v-for="btn in toolbarButtons"
                :key="btn.label"
                type="button"
                :title="btn.label"
                :aria-label="btn.label"
                class="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-surface-border text-slate-600 dark:text-zinc-300 text-xs font-medium transition-colors"
                @click="btn.action"
              >
                <component :is="btn.icon" class="w-4 h-4" aria-hidden="true" />
              </button>
              <div class="w-px bg-surface-border mx-1" aria-hidden="true" />
              <button
                type="button"
                title="Chèn ảnh"
                class="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md hover:bg-surface-border text-slate-600 dark:text-zinc-300 text-xs font-medium transition-colors"
                @click="insertImage"
              >
                <ImageIcon class="w-3.5 h-3.5" aria-hidden="true" /> Ảnh
              </button>
            </div>

            <textarea
              id="post-content"
              ref="contentTextarea"
              v-model="form.content"
              rows="16"
              placeholder="Viết nội dung bài viết bằng HTML... Ví dụ: <p>Đoạn văn</p> <h2>Tiêu đề</h2>"
              class="form-input rounded-t-none font-mono text-sm resize-y"
            />
          </div>
        </div>
      </div>

      <!-- Right: Sidebar 1/3 -->
      <div class="space-y-4">
        <!-- Publish Settings -->
        <div class="card p-5 space-y-4 animate-fade-in-up" style="animation-delay: 60ms">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <Globe class="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            </div>
            <h3 class="text-sm font-semibold text-surface-foreground">Xuất bản</h3>
          </div>

          <!-- Status toggle -->
          <div class="flex items-center justify-between p-3 rounded-xl bg-surface-muted border border-surface-border">
            <div class="flex items-center gap-2">
              <component
                :is="form.status === BlogStatus.PUBLISHED ? CheckCircle2 : FileEdit"
                :class="['w-4 h-4', form.status === BlogStatus.PUBLISHED ? 'text-success-600 dark:text-success-400' : 'text-warning-600 dark:text-warning-400']"
                aria-hidden="true"
              />
              <span class="text-sm font-medium text-surface-foreground">
                {{ form.status === BlogStatus.PUBLISHED ? 'Đã xuất bản' : 'Bản nháp' }}
              </span>
            </div>
            <button
              type="button"
              :class="[
                'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                form.status === BlogStatus.PUBLISHED ? 'bg-success-500' : 'bg-surface-border',
              ]"
              :aria-checked="form.status === BlogStatus.PUBLISHED"
              role="switch"
              @click="form.status = form.status === BlogStatus.PUBLISHED ? BlogStatus.DRAFT : BlogStatus.PUBLISHED"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  form.status === BlogStatus.PUBLISHED ? 'translate-x-5' : 'translate-x-0',
                ]"
              />
            </button>
          </div>

          <!-- Author -->
          <div>
            <label class="form-label" for="post-author">
              <User class="w-3.5 h-3.5 inline mr-1" aria-hidden="true" /> Tác giả
            </label>
            <input id="post-author" v-model="form.author_name" type="text" class="form-input" placeholder="Tên tác giả..." />
          </div>

          <AppButton block size="lg" variant="primary" :loading="saving" @click="publishNow">
            <Globe class="w-4 h-4" aria-hidden="true" /> Xuất bản ngay
          </AppButton>
          <AppButton block size="md" variant="outline" :loading="saving" @click="saveDraft">
            <Save class="w-4 h-4" aria-hidden="true" /> Lưu bản nháp
          </AppButton>
        </div>

        <!-- Category & Meta -->
        <div class="card p-5 space-y-4 animate-fade-in-up" style="animation-delay: 100ms">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center">
              <Tag class="w-4 h-4 text-info-600 dark:text-info-400" aria-hidden="true" />
            </div>
            <h3 class="text-sm font-semibold text-surface-foreground">Phân loại</h3>
          </div>

          <AppSelect
            v-model="form.category_id"
            label="Danh mục"
            :options="categoryOptions"
            placeholder="Chọn danh mục..."
          />
        </div>

        <!-- Featured Image -->
        <div class="card p-5 space-y-4 animate-fade-in-up" style="animation-delay: 140ms">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center">
              <ImageIcon class="w-4 h-4 text-accent-600 dark:text-accent-400" aria-hidden="true" />
            </div>
            <h3 class="text-sm font-semibold text-surface-foreground">Ảnh đại diện</h3>
          </div>

          <!-- Image Preview -->
          <Transition name="fade">
            <div v-if="form.image_url" class="rounded-xl overflow-hidden bg-surface-muted ring-1 ring-surface-border aspect-[16/10]">
              <img
                :src="form.image_url"
                alt="Ảnh đại diện"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="form.image_url = ''"
              >
            </div>
            <div v-else class="aspect-[16/10] rounded-xl bg-surface-muted border-2 border-dashed border-surface-border flex flex-col items-center justify-center gap-2">
              <ImageIcon class="w-8 h-8 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
              <p class="text-xs text-slate-400 dark:text-zinc-500">Nhập URL ảnh bên dưới</p>
            </div>
          </Transition>

          <div>
            <label class="form-label" for="post-image">URL ảnh</label>
            <input
              id="post-image"
              v-model="form.image_url"
              type="url"
              placeholder="https://example.com/image.jpg"
              class="form-input"
            >
          </div>
        </div>

        <!-- Live Preview Card -->
        <Transition name="fade">
          <div v-if="showPreview" class="card p-5 animate-fade-in-up" style="animation-delay: 160ms">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-7 h-7 rounded-lg bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center">
                <Eye class="w-4 h-4 text-secondary-600 dark:text-secondary-400" aria-hidden="true" />
              </div>
              <h3 class="text-sm font-semibold text-surface-foreground">Xem trước</h3>
            </div>
            <div class="space-y-3">
              <div v-if="form.image_url" class="rounded-xl overflow-hidden bg-surface-muted aspect-[16/10]">
                <img :src="form.image_url" :alt="form.title" class="w-full h-full object-cover" loading="lazy">
              </div>
              <div>
                <AppBadge v-if="selectedCategory" color="info" variant="soft" size="sm">{{ selectedCategory.name }}</AppBadge>
                <h2 class="text-lg font-bold text-surface-foreground mt-2 leading-snug">{{ form.title || 'Tiêu đề bài viết' }}</h2>
                <p v-if="form.excerpt" class="text-sm text-slate-500 dark:text-zinc-400 mt-1">{{ form.excerpt }}</p>
              </div>
              <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 pb-2 border-b border-surface-border">
                <span class="flex items-center gap-1"><User class="w-3.5 h-3.5" aria-hidden="true" /> {{ form.author_name }}</span>
                <span class="flex items-center gap-1"><Clock class="w-3.5 h-3.5" aria-hidden="true" /> {{ formatDate(new Date().toISOString()) }}</span>
              </div>
              <div
                class="prose prose-sm max-w-none dark:prose-invert text-surface-foreground overflow-auto max-h-60 text-sm"
                v-html="previewHtml || emptyPreviewHtml"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>
