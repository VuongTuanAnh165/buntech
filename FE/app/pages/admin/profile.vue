<script setup lang="ts">
import { ConstantKey } from '~/enums/constantKeys'
import type { CurrentUser } from '~/types/common'
import { updateProfileSchema } from '~/utils/validation'
import { authService } from '~/services/authService'
import { useAuthStore } from '~/stores/auth'
import type { z } from 'zod'
import { t } from '~/utils/i18n'

const authStore = useAuthStore()
const { constants } = useMasterData()

const ROLE_LABELS = computed<Record<string, string>>(() => {
  const roleConstants = constants.value?.[ConstantKey.Role] || {}
  return {
    [roleConstants.ADMIN || 'admin']: t('admin_role_admin'),
    [roleConstants.DRIVER || 'driver']: t('admin_role_driver'),
    [roleConstants.CUSTOMER || 'customer']: t('common_customer')
  }
})

useSeoMeta({ title: t('admin_profile_seo_title') })
definePageMeta({ layout: 'admin' })

const ROLE_COLORS = computed<Record<string, string>>(() => {
  const roleConstants = constants.value?.[ConstantKey.Role] || {}
  return {
    [roleConstants.ADMIN || 'admin']: 'primary',
    [roleConstants.DRIVER || 'driver']: 'warning',
    [roleConstants.CUSTOMER || 'customer']: 'success'
  }
})

const user = computed(() => {
  return authStore.user as CurrentUser | null
})

// Derived email from login convention
const email = computed(() => {
  if (!user.value) return '—'
  const roleConstants = constants.value?.[ConstantKey.Role] || {}
  if (user.value.role === (roleConstants.ADMIN || 'admin')) return 'admin@buntech.vn'
  if (user.value.role === (roleConstants.DRIVER || 'driver')) return 'driver@buntech.vn'
  return `${user.value.fullName.toLowerCase().replace(/\s+/g, '.')}@buntech.vn`
})

// Activity timeline mock data
interface ActivityEntry {
  id: string
  type: 'login' | 'profile' | 'order' | 'product' | 'report' | 'password'
  title: string
  description: string
  timestamp: string
  icon: string
  color: 'primary' | 'success' | 'accent' | 'warning' | 'info' | 'secondary'
}
const activities = ref<ActivityEntry[]>([
  {
    id: 'act-1',
    type: 'login',
    title: t('admin_profile_act_login'),
    description: t('admin_profile_act_login_desc'),
    timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    icon: 'i-lucide-log-in',
    color: 'success'
  },
  {
    id: 'act-2',
    type: 'order',
    title: t('admin_profile_act_order'),
    description: t('admin_profile_act_order_desc'),
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    icon: 'i-lucide-package',
    color: 'primary'
  },
  {
    id: 'act-3',
    type: 'profile',
    title: t('admin_profile_modal_edit'),
    description: t('admin_profile_act_profile_desc'),
    timestamp: new Date(Date.now() - 26 * 3600000).toISOString(),
    icon: 'i-lucide-user-cog',
    color: 'info'
  },
  {
    id: 'act-4',
    type: 'report',
    title: t('admin_profile_act_report'),
    description: t('admin_profile_act_report_desc'),
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
    icon: 'i-lucide-file-text',
    color: 'accent'
  },
  {
    id: 'act-5',
    type: 'product',
    title: t('admin_prod_form_add_title'),
    description: t('admin_profile_act_product_desc'),
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
    icon: 'i-lucide-trending-up',
    color: 'warning'
  },
  {
    id: 'act-6',
    type: 'password',
    title: t('admin_profile_act_pw'),
    description: t('admin_profile_act_pw_desc'),
    timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
    icon: 'i-lucide-key-round',
    color: 'secondary'
  }
])
const _activityColorMap = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    text: 'text-primary-600 dark:text-primary-400',
    ring: 'ring-primary-200/60 dark:ring-primary-800/40'
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-900/20',
    text: 'text-success-600 dark:text-success-400',
    ring: 'ring-success-200/60 dark:ring-success-800/40'
  },
  accent: {
    bg: 'bg-accent-50 dark:bg-accent-900/20',
    text: 'text-accent-600 dark:text-accent-400',
    ring: 'ring-accent-200/60 dark:ring-accent-800/40'
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-900/20',
    text: 'text-warning-600 dark:text-warning-400',
    ring: 'ring-warning-200/60 dark:ring-warning-800/40'
  },
  info: {
    bg: 'bg-info-50 dark:bg-info-900/20',
    text: 'text-info-600 dark:text-info-400',
    ring: 'ring-info-200/60 dark:ring-info-800/40'
  },
  secondary: {
    bg: 'bg-secondary-50 dark:bg-secondary-900/20',
    text: 'text-secondary-600 dark:text-secondary-400',
    ring: 'ring-secondary-200/60 dark:ring-secondary-800/40'
  }
}
function _relativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t('admin_profile_time_just_now')
  if (mins < 60) return t('admin_profile_time_min', { min: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t('admin_profile_time_hour', { hour: hours })
  const days = Math.floor(hours / 24)
  if (days < 7) return t('admin_profile_time_day', { day: days })
  return formatDate(isoStr)
}

const showEditModal = ref(false)

type Schema = z.output<typeof updateProfileSchema>

const editForm = reactive({
  fullName: '',
  phone: ''
})

const { formErrors, formRef, validate: validateForm } = useZodForm(updateProfileSchema)

function openEdit() {
  editForm.fullName = user.value?.fullName || ''
  editForm.phone = user.value?.phoneNumber || ''
  formRef.value.clearErrors()
  showEditModal.value = true
}

const { handleSubmit, isSubmitting: saving } = useFormSubmit()
const saveProfile = handleSubmit(
  async (data: Schema) => {
    const res = await authService.updateProfile({
      fullName: data.fullName
    })

    // update store manually or just re-fetch
    if (res.data) {
      await authStore.fetchUser()
    }
  },
  {
    formRef,
    onSuccess() {
      showEditModal.value = false
    }
  }
)

const handleFormSubmit = () => {
  if (validateForm(editForm)) {
    saveProfile(editForm)
  }
}
// Personal info rows
const personalInfo = computed(() => [
  { label: t('val_fullname'), value: user.value?.fullName || '—', icon: 'i-lucide-user-cog' },
  { label: t('auth_login_phone'), value: user.value?.phoneNumber || '—', icon: 'i-lucide-phone' },
  { label: t('admin_profile_info_email'), value: email.value, icon: 'i-lucide-mail' },
  {
    label: t('admin_profile_info_role'),
    value: user.value ? ROLE_LABELS.value[user.value.role] || user.value.role : '—',
    icon: 'i-lucide-badge-check'
  },
  {
    label: t('status'),
    value: t('admin_profile_info_active'),
    icon: 'i-lucide-circle-dot'
  }
])
</script>
<template>
  <div>
    <BasePageHeader
      :title="$t('admin_profile_title')"
      :subtitle="$t('admin_profile_subtitle')"
      :breadcrumb-label="$t('admin_profile_title')"
    >
      <template #actions>
        <UButton
          color="neutral"
          variant="outline"
          to="/admin/change-password"
          icon="i-lucide-key-round"
        >
          {{ $t('auth_reset_btn') }}
        </UButton>
        <UButton icon="i-lucide-pencil" @click="openEdit">
          {{ $t('admin_profile_btn_edit') }}
        </UButton>
      </template>
    </BasePageHeader>
    <!-- Profile Header Card -->
    <div
      class="card card-gradient stagger-item relative mt-6 mb-6 p-5 sm:p-7"
      style="animation-delay: 0ms"
    >
      <div
        class="from-primary-500 via-accent-400 to-primary-400 absolute top-0 right-0 left-0 h-1 rounded-t-xl bg-gradient-to-r"
      />
      <div class="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div class="relative flex-shrink-0">
          <UAvatar
            :alt="user?.fullName"
            size="3xl"
            class="ring-primary-100 dark:ring-primary-900/30 ring-4"
          />
          <span
            class="bg-success-500 ring-surface absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full ring-4"
          >
            <UIcon name="i-lucide-check-circle-2" class="h-3.5 w-3.5 text-white" />
          </span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="mb-1 flex flex-wrap items-center gap-2">
            <h2 class="text-surface-foreground text-2xl font-bold tracking-tight">
              {{ user?.fullName }}
            </h2>
            <UBadge
              :color="
                (ROLE_COLORS[user?.role || 'admin'] as
                  'error' | 'primary' | 'warning' | 'success') || 'primary'
              "
              variant="solid"
            >
              <UIcon name="i-lucide-shield" class="mr-1 h-3 w-3" />
              {{ user ? ROLE_LABELS[user.role] || user.role : '' }}
            </UBadge>
          </div>
          <div
            class="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-500 dark:text-zinc-400"
          >
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-phone" class="h-3.5 w-3.5" />
              {{ user?.phoneNumber || '—' }}
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-mail" class="h-3.5 w-3.5" />
              {{ email }}
            </span>
            <span class="flex items-center gap-1.5">
              <UIcon name="i-lucide-calendar-days" class="h-3.5 w-3.5" />
              {{ $t('admin_profile_member_since') }} {{ formatDate(new Date().toISOString()) }}
            </span>
          </div>
        </div>
        <div class="hidden flex-col items-end gap-1 lg:flex">
          <UBadge color="success" variant="soft"> {{ $t('admin_profile_info_active') }} </UBadge>
          <span class="text-xs text-slate-400 dark:text-zinc-500"
            >ID: {{ user?.id?.toString().slice(0, 12) }}</span
          >
        </div>
      </div>
    </div>
    <!-- Stats Row -->
    <ProfileStatsRow />
    <!-- 2-column grid -->
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
      <!-- Left Column -->
      <div class="space-y-4 lg:col-span-1 lg:space-y-6">
        <!-- Personal Information -->
        <UCard class="stagger-item" style="animation-delay: 200ms">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div
                class="bg-primary-50 dark:bg-primary-900/20 ring-primary-100 dark:ring-primary-900/30 flex h-8 w-8 items-center justify-center rounded-lg ring-1"
              >
                <UIcon
                  name="i-lucide-user-cog"
                  class="text-primary-600 dark:text-primary-400 h-4 w-4"
                />
              </div>
              <h3 class="text-surface-foreground text-sm font-semibold">
                {{ $t('admin_profile_card_title') }}
              </h3>
            </div>
            <UButton
              variant="ghost"
              color="neutral"
              class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-0.5 text-xs font-medium transition-colors"
              @click="openEdit"
            >
              {{ $t('edit') }} <UIcon name="i-lucide-chevron-right" class="h-3 w-3" />
            </UButton>
          </div>
          <dl class="space-y-3">
            <div
              v-for="item in personalInfo"
              :key="item.label"
              class="border-surface-border flex items-center justify-between gap-3 border-b py-2 last:border-0"
            >
              <div class="flex min-w-0 items-center gap-2.5">
                <UIcon
                  :name="item.icon"
                  class="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-zinc-500"
                />
                <dt class="text-sm text-slate-500 dark:text-zinc-400">{{ item.label }}</dt>
              </div>
              <dd class="text-surface-foreground truncate text-right text-sm font-medium">
                {{ item.value }}
              </dd>
            </div>
          </dl>
        </UCard>
        <ProfileSecurityCard class="stagger-item" style="animation-delay: 260ms" />
      </div>
      <AdminActivityTimeline :activities="activities" />
    </div>
    <UModal
      v-model:open="showEditModal"
      :title="$t('admin_profile_modal_edit')"
      :ui="{ content: 'sm:max-w-md' }"
    >
      <template #body>
        <form id="profile-form" class="space-y-4" @submit.prevent="handleFormSubmit">
          <UFormField
            :label="$t('val_fullname')"
            name="fullName"
            required
            :error="formErrors.fullName"
          >
            <UInput v-model="editForm.fullName" class="w-full" />
          </UFormField>
          <UFormField
            :label="$t('admin_profile_form_phone_readonly')"
            :help="$t('admin_profile_form_phone_help')"
          >
            <UInput v-model="editForm.phone" type="tel" class="w-full" disabled />
          </UFormField>

          <div class="flex items-center justify-end gap-3 pt-2">
            <UButton
              variant="ghost"
              color="neutral"
              @click="
                () => {
                  showEditModal = false
                }
              "
            >
              {{ $t('common_cancel') }}
            </UButton>
            <UButton type="submit" color="primary" :loading="saving" size="lg">
              {{ $t('admin_profile_btn_save') }}
            </UButton>
          </div>
        </form>
      </template>
    </UModal>
  </div>
</template>
