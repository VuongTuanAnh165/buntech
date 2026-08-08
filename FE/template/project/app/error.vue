<script setup lang="ts">
import { Home, ArrowLeft, Search } from 'lucide-vue-next'
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()
useHead({ title: `${props.error?.statusCode === 404 ? t('errors.notFound') : t('error.title')} - BunTech` })

const is404 = computed(() => props.error?.statusCode === 404)
const is403 = computed(() => props.error?.statusCode === 403)
const is500 = computed(() => props.error?.statusCode >= 500)

const config = computed(() => {
  if (is404.value) return { code: '404', title: t('errors.notFound'), desc: t('errors.notFoundDescription') }
  if (is403.value) return { code: '403', title: t('errors.forbidden') || 'Không có quyền truy cập', desc: t('errors.forbiddenDescription') || 'Bạn không có quyền truy cập trang này.' }
  if (is500.value) return { code: '500', title: t('error.title'), desc: t('error.description') }
  return { code: String(props.error?.statusCode || 'Error'), title: t('error.title'), desc: t('error.description') }
})
</script>

<template>
  <div class="min-h-screen bg-surface-muted flex items-center justify-center px-4 relative overflow-hidden">
    <!-- Decorative background -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-500/5 blur-3xl" />
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary-500/5 blur-3xl" />
      <div class="absolute inset-0 opacity-[0.02]" style="background-image: linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px); background-size: 48px 48px;" />
    </div>

    <div class="text-center max-w-md relative animate-fade-in-up">
      <!-- Large code -->
      <div class="relative inline-block mb-8">
        <p class="text-[120px] sm:text-[160px] font-bold gradient-text leading-none tracking-tighter" aria-hidden="true">{{ config.code }}</p>
        <div class="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-surface border border-surface-border shadow-lg flex items-center justify-center">
          <Search class="w-8 h-8 text-primary-500" aria-hidden="true" />
        </div>
      </div>

      <h1 class="text-2xl sm:text-3xl font-bold text-surface-foreground mb-3 tracking-tight">{{ config.title }}</h1>
      <p class="text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed max-w-sm mx-auto">{{ config.desc }}</p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink to="/">
          <AppButton variant="primary" size="lg" class="w-full sm:w-auto group">
            <Home class="w-4 h-4" aria-hidden="true" />
            {{ t('errors.goHome') }}
          </AppButton>
        </NuxtLink>
        <AppButton variant="outline" size="lg" class="w-full sm:w-auto" @click="clearError({ redirect: '/' })">
          <ArrowLeft class="w-4 h-4" aria-hidden="true" />
          {{ t('common.back') }}
        </AppButton>
      </div>
    </div>
  </div>
</template>
