<script setup lang="ts">
import { mockSystemConfigs } from '~/core/mockData'

const { t } = useI18n()
const toast = useToast()
useHead({ title: `${t('nav.settings')} - BunTech Admin` })
definePageMeta({ layout: 'admin' })

const loading = ref(true)
const saving = ref(false)
const configs = ref<Record<string, string>>({})

async function loadData() {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    for (const row of mockSystemConfigs.value) {
      configs.value[row.key] = row.value
    }
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    await new Promise(r => setTimeout(r, 300))
    const entries = Object.entries(configs.value)
    for (const [key, value] of entries) {
      const existing = mockSystemConfigs.value.find(c => c.key === key)
      if (existing) {
        existing.value = value
      } else {
        mockSystemConfigs.value.push({ key, value, description: null, updated_at: new Date().toISOString() })
      }
    }
    toast.success(t('settings.saveSuccess'))
  } catch {
    toast.error(t('errors.saveFailed'))
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<template>
  <div>
    <AppBreadcrumb :items="[{ label: t('nav.settings') }]" />
    <h1 class="text-2xl font-bold text-gray-900 mb-6">{{ t('settings.title') }}</h1>

    <template v-if="loading">
      <div class="skeleton h-64 w-full max-w-lg rounded-xl" />
    </template>
    <template v-else>
      <div class="max-w-lg bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        <h2 class="font-semibold text-gray-900">{{ t('settings.general') }}</h2>
        <AppInput v-model="configs.workshop_name" :label="t('settings.workshopName')" />
        <AppInput v-model="configs.workshop_address" :label="t('settings.workshopAddress')" />
        <AppInput v-model="configs.workshop_phone" :label="t('settings.workshopPhone')" />
        <AppInput v-model="configs.currency" :label="t('settings.currency')" />
        <AppButton :loading="saving" @click="save">{{ t('common.save') }}</AppButton>
      </div>
    </template>
  </div>
</template>
