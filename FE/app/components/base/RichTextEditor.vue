<!--
  Responsibility: Trình soạn thảo văn bản giàu định dạng (Rich Text) tích hợp Tiptap
  Dependency: @tiptap/vue-3, Nuxt UI, uploadService
  Lifecycle: Mount cùng với các Form nhập liệu có nội dung dài (như bài viết)
  Reason: Cung cấp giao diện soạn thảo giống Word, thay thế textarea nhàm chán.
-->
<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { uploadService } from '~/services/uploadService'

const modelValue = defineModel<string>({ default: '' })

const toast = useToast()

const editor = useEditor({
  content: modelValue.value,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4]
      }
    }),
    Image,
    Link.configure({
      openOnClick: false
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    Highlight.configure({ multicolor: true }),
    TextStyle,
    Color
  ],
  onUpdate: ({ editor }) => {
    modelValue.value = editor.getHTML()
  },
  editorProps: {
    attributes: {
      class:
        'prose dark:prose-invert prose-sm sm:prose-base focus:outline-none min-h-[300px] max-w-none p-4'
    },
    handleDrop: (view, event, slice, moved) => {
      if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
        event.preventDefault()
        const file = event.dataTransfer.files[0]
        uploadAndInsertImage(file)
        return true
      }
      return false
    }
  }
})

// Watch for external modelValue changes
watch(
  () => modelValue.value,
  (value) => {
    if (editor.value && editor.value.getHTML() !== value) {
      editor.value.commands.setContent(value || '', { emitUpdate: false })
    }
  }
)

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

// Image Upload Logic
const fileInput = ref<HTMLInputElement | null>(null)

function triggerImageUpload() {
  fileInput.value?.click()
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  await uploadAndInsertImage(file)

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function uploadAndInsertImage(file: File) {
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

  try {
    const url = await uploadService.uploadImage(file)
    if (url) {
      editor.value?.chain().focus().setImage({ src: url }).run()
    }
  } catch (error) {
    toast.add({
      title: 'Lỗi tải ảnh',
      description: (error as Error).message || 'Có lỗi xảy ra',
      color: 'error'
    })
  }
}

// Link prompt
function setLink() {
  if (!editor.value) return
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('Nhập đường dẫn:', previousUrl)

  // cancelled
  if (url === null) {
    return
  }

  // empty
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }

  // update link
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}
</script>

<template>
  <div class="border-surface-border overflow-hidden rounded-xl border bg-white dark:bg-zinc-900">
    <div
      v-if="editor"
      class="border-surface-border flex flex-wrap items-center gap-1 border-b bg-slate-50 p-2 dark:bg-zinc-800/50"
    >
      <!-- History -->
      <div class="flex items-center gap-1">
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-undo"
          :disabled="!editor.can().undo()"
          @click="
            () => {
              editor?.chain().focus().undo().run()
            }
          "
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-redo"
          :disabled="!editor.can().redo()"
          @click="
            () => {
              editor?.chain().focus().redo().run()
            }
          "
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-remove-formatting"
          @click="
            () => {
              editor?.chain().focus().clearNodes().unsetAllMarks().run()
            }
          "
        />
      </div>
      <div class="bg-surface-border mx-1 my-auto h-6 w-px" />

      <!-- Headings -->
      <div class="flex items-center gap-1">
        <UButton
          :color="editor.isActive('heading', { level: 2 }) ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-heading-2"
          @click="
            () => {
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
          "
        />
        <UButton
          :color="editor.isActive('heading', { level: 3 }) ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-heading-3"
          @click="
            () => {
              editor?.chain().focus().toggleHeading({ level: 3 }).run()
            }
          "
        />
      </div>
      <div class="bg-surface-border mx-1 my-auto h-6 w-px" />

      <!-- Formats -->
      <div class="flex items-center gap-1">
        <UButton
          :color="editor.isActive('bold') ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-bold"
          @click="
            () => {
              editor?.chain().focus().toggleBold().run()
            }
          "
        />
        <UButton
          :color="editor.isActive('italic') ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-italic"
          @click="
            () => {
              editor?.chain().focus().toggleItalic().run()
            }
          "
        />
        <UButton
          :color="editor.isActive('underline') ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-underline"
          @click="
            () => {
              editor?.chain().focus().toggleUnderline().run()
            }
          "
        />
        <UButton
          :color="editor.isActive('strike') ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-strikethrough"
          @click="
            () => {
              editor?.chain().focus().toggleStrike().run()
            }
          "
        />
        <UButton
          :color="editor.isActive('highlight') ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-highlighter"
          @click="
            () => {
              editor?.chain().focus().toggleHighlight().run()
            }
          "
        />
        <div
          class="relative flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-200 dark:hover:bg-zinc-700"
        >
          <input
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            :value="editor.getAttributes('textStyle').color || '#000000'"
            @input="
              ($event) => {
                editor
                  ?.chain()
                  .focus()
                  .setColor(($event.target as HTMLInputElement).value)
                  .run()
              }
            "
          />
          <UIcon name="i-lucide-palette" class="h-5 w-5 text-gray-700 dark:text-gray-200" />
          <div
            class="absolute right-2 bottom-1 left-2 h-1 rounded-full"
            :style="{ backgroundColor: editor.getAttributes('textStyle').color || 'transparent' }"
          />
        </div>
      </div>
      <div class="bg-surface-border mx-1 my-auto h-6 w-px" />

      <!-- Blocks -->
      <div class="flex items-center gap-1">
        <UButton
          :color="editor.isActive('blockquote') ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-quote"
          @click="
            () => {
              editor?.chain().focus().toggleBlockquote().run()
            }
          "
        />
        <UButton
          :color="editor.isActive('codeBlock') ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-square-code"
          @click="
            () => {
              editor?.chain().focus().toggleCodeBlock().run()
            }
          "
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-lucide-minus"
          @click="
            () => {
              editor?.chain().focus().setHorizontalRule().run()
            }
          "
        />
      </div>
      <div class="bg-surface-border mx-1 my-auto h-6 w-px" />

      <!-- Alignment -->
      <div class="flex items-center gap-1">
        <UButton
          :color="editor.isActive({ textAlign: 'left' }) ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-align-left"
          @click="
            () => {
              editor?.chain().focus().setTextAlign('left').run()
            }
          "
        />
        <UButton
          :color="editor.isActive({ textAlign: 'center' }) ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-align-center"
          @click="
            () => {
              editor?.chain().focus().setTextAlign('center').run()
            }
          "
        />
        <UButton
          :color="editor.isActive({ textAlign: 'right' }) ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-align-right"
          @click="
            () => {
              editor?.chain().focus().setTextAlign('right').run()
            }
          "
        />
      </div>
      <div class="bg-surface-border mx-1 my-auto h-6 w-px" />

      <!-- Lists -->
      <div class="flex items-center gap-1">
        <UButton
          :color="editor.isActive('bulletList') ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-list"
          @click="
            () => {
              editor?.chain().focus().toggleBulletList().run()
            }
          "
        />
        <UButton
          :color="editor.isActive('orderedList') ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-list-ordered"
          @click="
            () => {
              editor?.chain().focus().toggleOrderedList().run()
            }
          "
        />
      </div>
      <div class="bg-surface-border mx-1 my-auto h-6 w-px" />

      <!-- Insert -->
      <div class="flex items-center gap-1">
        <UButton
          :color="editor.isActive('link') ? 'primary' : 'neutral'"
          variant="ghost"
          icon="i-lucide-link"
          @click="setLink"
        />
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-image"
          @click="triggerImageUpload"
        />
      </div>

      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleImageUpload"
      />
    </div>

    <!-- Tiptap Editor Content -->
    <EditorContent :editor="editor" class="w-full" />
  </div>
</template>

<style>
/* Prose CSS is applied natively via Tailwind Typography, but we can override tiptap-specific things here */
.tiptap p.is-editor-empty:first-child::before {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
.tiptap img {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 0.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
