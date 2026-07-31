<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import DOMPurify from 'dompurify'
import { mockBlogPosts, mockBlogCategories, generateId } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()
const { slugify } = useFormat()
useHead({ title: `${t('blog.editPost')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const categories = ref<Record<string, unknown>[]>([])
const form = ref({ title: '', slug: '', excerpt: '', content: '', category_id: '', status: 'DRAFT', image_url: '' })
const saving = ref(false)
const showPreview = ref(false)
const editingId = computed(() => route.query.id as string | undefined)

const editor = useEditor({
  extensions: [StarterKit],
  content: '',
  onUpdate: ({ editor }) => {
    form.value.content = editor.getHTML()
  },
})

async function loadCategories() {
  await new Promise(r => setTimeout(r, 300))
  categories.value = mockBlogCategories.value.slice().sort((a,b) => a.name.localeCompare(b.name))
}

async function loadPost() {
  if (!editingId.value) return
  await new Promise(r => setTimeout(r, 300))
  const post = mockBlogPosts.value.find(p => p.id === editingId.value)
  if (post) {
    form.value = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      category_id: post.category_id || '',
      status: post.status,
      image_url: post.image_url || '',
    }
    editor.value?.commands.setContent(form.value.content)
  }
}

async function save(status?: string) {
  if (!form.value.title) { toast.error(t('common.required')); return }
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    const slug = form.value.slug || slugify(form.value.title)
    const payload = {
      title: form.value.title,
      slug,
      excerpt: form.value.excerpt,
      content: form.value.content,
      category_id: form.value.category_id || null,
      status: (status || form.value.status) as 'DRAFT' | 'PUBLISHED',
      image_url: form.value.image_url,
    }
    if (editingId.value) {
      const idx = mockBlogPosts.value.findIndex(p => p.id === editingId.value)
      if (idx !== -1) {
        Object.assign(mockBlogPosts.value[idx], payload, { updated_at: new Date().toISOString() })
      }
    } else {
      mockBlogPosts.value.push({
        id: generateId(),
        author_id: 'mock-admin-id',
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      })
    }
    toast.success(t('blog.saveSuccess'))
    router.push('/admin/blog')
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}

const sanitizedContent = computed(() => DOMPurify.sanitize(form.value.content))

onMounted(() => {
  loadCategories()
  loadPost()
})
onUnmounted(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.blog'), to: '/admin/blog' }, { label: editingId ? t('blog.editPost') : t('blog.addNew') }]" />
    <button class="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4" @click="router.push('/admin/blog')">
      <ArrowLeft class="w-4 h-4" /> {{ t('common.back') }}
    </button>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ editingId ? t('blog.editPost') : t('blog.addNew') }}</h1>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div class="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <AppInput v-model="form.title" :label="t('blog.postTitle')" :required="true" />
          <AppInput v-model="form.slug" :label="t('common.slug')" :placeholder="t('common.slug')" />
          <AppInput v-model="form.excerpt" :label="t('blog.postExcerpt')" />
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">{{ t('blog.postContent') }}</label>
            <div v-if="editor" class="border border-gray-200 rounded-lg overflow-hidden">
              <div class="flex gap-1 p-2 border-b border-gray-100 bg-gray-50">
                <button class="px-2 py-1 rounded hover:bg-gray-200 text-sm" @click="editor.chain().focus().toggleBold().run()">B</button>
                <button class="px-2 py-1 rounded hover:bg-gray-200 text-sm italic" @click="editor.chain().focus().toggleItalic().run()">I</button>
                <button class="px-2 py-1 rounded hover:bg-gray-200 text-sm" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
                <button class="px-2 py-1 rounded hover:bg-gray-200 text-sm" @click="editor.chain().focus().toggleBulletList().run()">•</button>
                <button class="px-2 py-1 rounded hover:bg-gray-200 text-sm" @click="editor.chain().focus().toggleOrderedList().run()">1.</button>
              </div>
              <EditorContent :editor="editor" class="prose prose-sm max-w-none p-4 min-h-[200px]" />
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <AppSelect
            v-model="form.category_id"
            :label="t('common.category')"
            :options="categories.map(c => ({ value: c.id as string, label: c.name as string }))"
            :placeholder="t('common.category')"
          />
          <AppInput v-model="form.image_url" :label="t('blog.featuredImage')" placeholder="URL" />
          <div class="flex gap-2">
            <AppButton variant="outline" block @click="save('DRAFT')">{{ t('blog.saveDraft') }}</AppButton>
            <AppButton block @click="save('PUBLISHED')">{{ t('blog.publish') }}</AppButton>
          </div>
          <AppButton variant="ghost" block @click="showPreview = !showPreview">{{ t('blog.preview') }}</AppButton>
        </div>

        <div v-if="showPreview" class="bg-white rounded-xl border border-gray-100 p-6">
          <h2 class="text-xl font-bold mb-2">{{ form.title || 'Tiêu đề' }}</h2>
          <p class="text-sm text-gray-500 mb-4">{{ form.excerpt }}</p>
          <div class="prose prose-sm max-w-none" v-html="sanitizedContent" />
        </div>
      </div>
    </div>
  </div>
</template>
