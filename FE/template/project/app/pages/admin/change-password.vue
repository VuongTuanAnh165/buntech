<script setup lang="ts">
const { t } = useI18n()
const authStore = useAuthStore()
const toast = useToast()
useHead({ title: `${t('nav.changePassword')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errors = ref<Record<string, string>>({})
const saving = ref(false)

async function handleSubmit() {
  errors.value = {}
  if (!oldPassword.value) { errors.value.oldPassword = t('common.required'); return }
  if (newPassword.value.length < 6) { errors.value.newPassword = t('auth.passwordTooShort'); return }
  if (newPassword.value !== confirmPassword.value) { errors.value.confirmPassword = t('auth.passwordMismatch'); return }
  saving.value = true
  try {
    await authStore.changePassword(oldPassword.value, newPassword.value)
    toast.success(t('auth.passwordChanged'))
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.changePassword') }]" />
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t('nav.changePassword') }}</h1>
    <div class="max-w-md bg-white rounded-xl border border-gray-100 p-6">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <AppInput v-model="oldPassword" :label="t('auth.oldPassword')" type="password" :required="true" :error="errors.oldPassword" />
        <AppInput v-model="newPassword" :label="t('auth.newPassword')" type="password" :required="true" :error="errors.newPassword" />
        <AppInput v-model="confirmPassword" :label="t('auth.confirmPassword')" type="password" :required="true" :error="errors.confirmPassword" />
        <AppButton type="submit" :loading="saving" block>{{ t('common.save') }}</AppButton>
      </form>
    </div>
  </div>
</template>
