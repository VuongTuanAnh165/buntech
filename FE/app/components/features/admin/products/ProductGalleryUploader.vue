<script setup lang="ts">
import type { ProductImage } from '~/utils/types'
import { t } from '~/utils/i18n'

const props = defineProps<{
  existingImages: ProductImage[]
  galleryPreviews: string[]
}>()

const emit = defineEmits<{
  removeExisting: [id: number]
  removeNew: [index: number]
  filesSelected: [files: File[]]
}>()

const galleryInputRef = ref<HTMLInputElement | null>(null)
const toast = useToast()

function triggerGallerySelect() {
  galleryInputRef.value?.click()
}

function handleGalleryChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (!target.files) return

  const files = Array.from(target.files)
  const validFiles: File[] = []

  for (const file of files) {
    if (file.size > 2 * 1024 * 1024) {
      toast.add({ title: t('admin_product_gallery_err_size'), color: 'warning' })
      continue
    }
    validFiles.push(file)
  }

  if (validFiles.length > 0) {
    emit('filesSelected', validFiles)
  }

  if (galleryInputRef.value) galleryInputRef.value.value = ''
}
</script>

<template>
  <div class="card p-6">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-surface-foreground text-lg font-semibold">
        {{ $t('admin_product_gallery_title') }}
      </h2>
      <UButton size="sm" color="neutral" variant="outline" @click="triggerGallerySelect">
        <UIcon name="i-lucide-upload" class="mr-1 h-4 w-4" />
        {{ $t('admin_product_gallery_btn_add') }}
      </UButton>
      <input
        ref="galleryInputRef"
        type="file"
        class="hidden"
        multiple
        accept="image/jpeg,image/png,image/webp"
        @change="handleGalleryChange"
      />
    </div>

    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      <!-- Existing Images -->
      <div
        v-for="img in props.existingImages"
        :key="img.id"
        class="group border-surface-border relative aspect-square overflow-hidden rounded-xl border"
      >
        <img :src="getImageUrl(img.fileUrl)" class="h-full w-full object-cover" />
        <div
          class="absolute inset-0 flex items-center justify-center bg-slate-900/50 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <UButton
            color="error"
            size="sm"
            icon="i-lucide-trash-2"
            @click="emit('removeExisting', img.id)"
          />
        </div>
      </div>

      <!-- New Previews -->
      <div
        v-for="(preview, idx) in props.galleryPreviews"
        :key="idx"
        class="group border-surface-border relative aspect-square overflow-hidden rounded-xl border border-dashed"
      >
        <img :src="preview" class="h-full w-full object-cover opacity-80" />
        <UBadge color="warning" class="absolute top-2 left-2" size="sm">{{
          $t('admin_product_gallery_badge_new')
        }}</UBadge>
        <div
          class="absolute inset-0 flex items-center justify-center bg-slate-900/50 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <UButton
            :aria-label="$t('aria_del_this_img')"
            color="error"
            size="sm"
            icon="i-lucide-x"
            @click="emit('removeNew', idx)"
          />
        </div>
      </div>

      <div
        v-if="props.existingImages.length === 0 && props.galleryPreviews.length === 0"
        class="border-surface-border col-span-full rounded-xl border-2 border-dashed py-8 text-center text-slate-500"
      >
        {{ $t('admin_product_gallery_empty') }}
      </div>
    </div>
  </div>
</template>
