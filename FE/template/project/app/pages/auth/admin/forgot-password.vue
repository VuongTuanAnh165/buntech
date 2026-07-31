<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()
definePageMeta({ layout: 'auth' })
useHead({ title: `${t('auth.forgotPasswordTitle')} - BunTech` })

const email = ref('')
const sent = ref(false)
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    // Mock network request
    await new Promise(r => setTimeout(r, 500))
    sent.value = true
    toast.success(t('auth.resetLinkSent'))
  } catch {
    toast.error(t('errors.unexpected'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-6">
    <div class="w-full max-w-sm">
      <div class="flex items-center gap-2 mb-8 justify-center">
        <div class="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">B</div>
        <span class="text-xl font-bold text-gray-900">BunTech</span>
      </div>
      <template v-if="!sent">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ t('auth.forgotPasswordTitle') }}</h2>
        <p class="text-gray-500 mb-8">{{ t('auth.forgotPasswordDescription') }}</p>
        <form class="space-y-5" @submit.prevent="handleSubmit">
          <AppInput
            v-model="email"
            :label="t('auth.email')"
            type="email"
            :required="true"
            placeholder="email@example.com"
          />
          <AppButton type="submit" :loading="loading" block>
            {{ t('auth.sendResetLink') }}
          </AppButton>
        </form>
      </template>
      <template v-else>
        <div class="text-center py-8">
          <div class="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">{{ t('auth.resetLinkSent') }}</h2>
          <p class="text-gray-500 mb-6">{{ t('auth.resetLinkSentDescription') }}</p>
        </div>
      </template>
      <NuxtLink to="/auth/admin/login" class="block text-center text-sm text-primary-600 hover:text-primary-700 mt-6">
        {{ t('auth.backToLogin') }}
      </NuxtLink>
    </div>
  </div>
</template>
