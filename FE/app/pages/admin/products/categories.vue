<script setup lang="ts">
import { z } from 'zod'
import { productService } from '~/services/productService'
import type { ProductCategory } from '~/utils/types'
import { slugify } from '~/utils/string'
import { normalizePaginationResponse } from '~/utils/api'
import { t } from '~/utils/i18n'

definePageMeta({ layout: 'admin' })
useSeoMeta({ title: t('admin_categories_seo_title') })
const toast = useToast()

// ─── State ────────────────────────────────────────────────
const page = ref(1)
const perPage = ref(10)

const {
  data: rawRes,
  pending,
  refresh
} = useAsyncData(
  'admin-product-categories',
  () => productService.getAdminCategories({ page: page.value, limit: perPage.value }),
  { watch: [page, perPage] }
)

const normalized = computed(() => normalizePaginationResponse<ProductCategory>(rawRes.value))
const categories = computed(() => normalized.value.data)
const meta = computed(() => normalized.value.meta)

const search = ref('')
const filteredCategories = computed(() => {
  if (!search.value.trim()) return categories.value
  const q = search.value.toLowerCase()
  return categories.value.filter((c) => c.name.toLowerCase().includes(q))
})

const columns = [
  { accessorKey: 'thumbnail', header: t('admin_categories_col_thumb') },
  { accessorKey: 'name', header: t('admin_blog_cat_form_name') },
  { accessorKey: 'slug', header: t('admin_categories_col_slug') },
  { accessorKey: 'description', header: t('admin_prod_form_desc') },
  { accessorKey: 'actions', header: t('actions') }
]

// ─── Form State ───────────────────────────────────────────
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const isSubmitting = ref(false)

const formState = reactive({
  name: '',
  description: ''
})

const schema = z.object({
  name: z
    .string()
    .min(1, t('admin_blog_cat_form_name_req'))
    .max(100, t('admin_categories_form_name_max')),
  description: z.string().optional()
})

const { formErrors, formRef, validate } = useZodForm(schema)

// Thumbnail
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const fileInputRef = ref<HTMLInputElement | null>(null)

// ─── Handlers ─────────────────────────────────────────────
function triggerFileSelect() {
  fileInputRef.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    toast.add({ title: t('admin_categories_file_size_err'), color: 'warning' })
    return
  }
  const validExts = ['image/jpeg', 'image/png', 'image/webp']
  if (!validExts.includes(file.type)) {
    toast.add({ title: t('image_type_limit'), color: 'warning' })
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

async function handleDelete(id: number) {
  if (!confirm(t('admin_blog_cat_del_confirm'))) return
  try {
    await productService.deleteCategory(id)
    await refresh()
  } catch {
    // API error is handled by interceptor
  }
}

function openAdd() {
  isEditing.value = false
  editingId.value = null
  formState.name = ''
  formState.description = ''
  clearImage()

  formRef.value.clearErrors()
  showModal.value = true
}

function openEdit(cat: ProductCategory) {
  isEditing.value = true
  editingId.value = cat.id
  formState.name = cat.name
  formState.description = cat.description || ''

  clearImage()
  if (cat.thumbnailUrl) {
    previewUrl.value = getImageUrl(cat.thumbnailUrl)
  }

  formRef.value.clearErrors()
  showModal.value = true
}

async function handleSave() {
  if (!validate(formState)) return
  const result = schema.safeParse(formState)
  if (!result.success) return

  isSubmitting.value = true
  try {
    const formData = new FormData()
    formData.append('name', result.data.name)
    formData.append('slug', slugify(result.data.name))
    if (result.data.description) formData.append('description', result.data.description)
    formData.append('metaTitle', result.data.name.substring(0, 60))
    formData.append(
      'metaDescription',
      (result.data.description || result.data.name).substring(0, 160)
    )

    if (selectedFile.value) {
      formData.append('thumbnail', selectedFile.value)
    }

    if (isEditing.value && editingId.value) {
      await productService.updateCategory(editingId.value, formData)
    } else {
      await productService.createCategory(formData)
    }
    showModal.value = false
    await refresh()
  } catch {
    // handled globally
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <BasePageHeader
      :title="$t('admin_categories_title')"
      :description="$t('admin_categories_desc')"
      :breadcrumbs="[
        { label: $t('nav_home'), to: '/admin', icon: 'i-lucide-home' },
        { label: $t('nav_products'), to: '/admin/products' },
        { label: $t('nav_categories') }
      ]"
    >
      <template #actions>
        <UButton variant="outline" color="neutral" to="/admin/products">
          <UIcon name="i-lucide-arrow-left" class="mr-1 h-4 w-4" /> {{ $t('nav_products') }}
        </UButton>
        <UButton @click="openAdd">
          <UIcon name="i-lucide-plus" class="mr-1 h-4 w-4" /> {{ $t('admin_categories_add') }}
        </UButton>
      </template>
    </BasePageHeader>

    <template v-if="pending && !categories.length">
      <BasePageLoading />
    </template>
    <template v-else>
      <div class="card animate-fade-in-up p-5">
        <div class="mb-4 flex items-center gap-4">
          <div class="max-w-sm flex-1">
            <BaseSearchInput
              v-model="search"
              :placeholder="$t('admin_categories_filter_placeholder')"
            />
          </div>
        </div>

        <div class="bg-surface ring-surface-border overflow-hidden rounded-lg ring-1">
          <BaseDataTable
            :columns="columns"
            :rows="filteredCategories"
            :empty-title="$t('admin_blog_cat_empty_title')"
            :empty-description="$t('admin_categories_empty_desc')"
            empty-icon="i-lucide-folder"
          >
            <template #thumbnail-cell="{ row }">
              <NuxtImg
                :src="getImageUrl(row.thumbnailUrl) || '/images/logo_sm.webp'"
                width="100"
                height="100"
                class="border-surface-border h-12 w-12 flex-shrink-0 rounded border object-cover shadow-sm"
                loading="lazy"
              />
            </template>
            <template #name-cell="{ row }">
              <span class="text-surface-foreground font-semibold">{{ row.name }}</span>
            </template>
            <template #slug-cell="{ row }">
              <span
                class="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-500 dark:bg-zinc-800 dark:text-zinc-400"
              >
                /{{ row.slug }}
              </span>
            </template>
            <template #description-cell="{ row }">
              <div class="max-w-xs break-words whitespace-normal md:max-w-sm lg:max-w-md">
                <span
                  class="line-clamp-2 text-sm text-slate-500"
                  :title="row.description || undefined"
                  >{{ row.description || '-' }}</span
                >
              </div>
            </template>
            <template #actions-cell="{ row }">
              <div class="flex items-center gap-1">
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-lucide-pencil"
                  @click="openEdit(row)"
                />
                <UButton
                  variant="ghost"
                  color="error"
                  size="sm"
                  icon="i-lucide-trash-2"
                  @click="handleDelete(row.id)"
                />
              </div>
            </template>
            <template #pagination>
              <div
                v-if="meta.total > 0"
                class="border-surface-border flex items-center justify-between border-t px-4 py-3"
              >
                <span class="text-sm text-slate-500 tabular-nums">
                  {{ (page - 1) * perPage + 1 }}-{{ Math.min(page * perPage, meta.total) }} /
                  {{ meta.total }}
                </span>
                <UPagination v-model:page="page" :total="meta.total" :items-per-page="perPage" />
              </div>
            </template>
          </BaseDataTable>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <UModal
        v-model:open="showModal"
        :title="
          isEditing ? $t('admin_categories_modal_edit_title') : $t('admin_blog_cat_modal_add')
        "
        :ui="{ content: 'sm:max-w-xl' }"
      >
        <template #body>
          <form id="categoryForm" class="space-y-4" @submit.prevent="handleSave">
            <UFormField :label="$t('admin_blog_cat_form_name')" :error="formErrors.name" required>
              <UInput
                v-model="formState.name"
                :placeholder="$t('admin_categories_form_name_placeholder')"
              />
            </UFormField>

            <UFormField :label="$t('admin_categories_form_slug')">
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-400">/</span>
                <UInput
                  :model-value="slugify(formState.name)"
                  disabled
                  class="flex-1"
                  :ui="{ base: 'bg-slate-50 dark:bg-zinc-800/50 text-slate-500' }"
                />
              </div>
              <template #hint>
                <span class="text-xs text-slate-500">{{
                  $t('admin_categories_form_slug_hint')
                }}</span>
              </template>
            </UFormField>

            <UFormField :label="$t('admin_prod_form_desc')" :error="formErrors.description">
              <UTextarea
                v-model="formState.description"
                :placeholder="$t('admin_categories_form_desc_placeholder')"
              />
            </UFormField>

            <UFormField :label="$t('admin_categories_form_thumb')">
              <input
                ref="fileInputRef"
                type="file"
                class="hidden"
                accept="image/jpeg,image/png,image/webp"
                @change="handleFileChange"
              />

              <div
                v-if="!previewUrl"
                class="border-surface-border hover:bg-surface-50 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors dark:hover:bg-zinc-800/50"
                @click="triggerFileSelect"
              >
                <UIcon name="i-lucide-image-plus" class="mb-2 h-8 w-8 text-slate-400" />
                <p class="text-surface-foreground text-center text-sm font-medium">
                  {{ $t('admin_blog_edit_file_click') }}
                </p>
                <p class="mt-1 text-xs text-slate-500">{{ $t('admin_categories_file_hint') }}</p>
              </div>

              <div
                v-else
                class="group border-surface-border relative mx-auto h-32 w-48 overflow-hidden rounded-xl border"
              >
                <img :src="previewUrl" class="h-full w-full object-cover" />
                <div
                  class="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <UButton color="neutral" size="sm" @click="triggerFileSelect">{{
                    $t('admin_categories_btn_change_img')
                  }}</UButton>
                  <UButton
                    :aria-label="$t('aria_del_img')"
                    color="error"
                    size="sm"
                    icon="i-lucide-trash-2"
                    @click="clearImage"
                  />
                </div>
              </div>
            </UFormField>
          </form>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton variant="outline" color="neutral" @click="showModal = false">{{
              $t('common_cancel')
            }}</UButton>
            <UButton type="submit" form="categoryForm" :loading="isSubmitting">
              <UIcon name="i-lucide-check" class="mr-1 h-4 w-4" /> {{ $t('save') }}
            </UButton>
          </div>
        </template>
      </UModal>
    </template>
  </div>
</template>
