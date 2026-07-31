<script setup lang="ts">
const { t } = useI18n()
const authStore = useAuthStore()
useHead({ title: `${t('nav.profile')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })
const { formatDate } = useFormat()
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.profile') }]" />
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t('nav.profile') }}</h1>
    <div class="max-w-lg bg-white rounded-xl border border-gray-100 p-6">
      <div class="flex items-center gap-4 mb-6">
        <AppAvatar :name="authStore.user?.full_name" :src="authStore.user?.avatar_url" size="lg" />
        <div>
          <h2 class="text-xl font-bold text-gray-900">{{ authStore.user?.full_name }}</h2>
          <AppBadge color="danger">{{ t('roles.ADMIN') }}</AppBadge>
        </div>
      </div>
      <div class="space-y-3 text-sm">
        <div class="flex justify-between"><span class="text-gray-500">{{ t('common.phone') }}:</span><span class="font-medium">{{ authStore.user?.phone || '—' }}</span></div>
        <div class="flex justify-between"><span class="text-gray-500">{{ t('common.createdAt') }}:</span><span>{{ formatDate(authStore.user?.created_at) }}</span></div>
      </div>
    </div>
  </div>
</template>
