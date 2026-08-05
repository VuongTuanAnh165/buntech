<script setup lang="ts">
import { Inbox, ArrowRight } from 'lucide-vue-next'

withDefaults(defineProps<{
  title?: string
  description?: string
  ctaText?: string
  secondaryCtaText?: string
}>(), {
  title: '',
  description: '',
  ctaText: '',
  secondaryCtaText: '',
})

const emit = defineEmits<{ action: [], secondaryAction: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center max-w-sm mx-auto py-16">
    <div class="relative mb-5">
      <div class="w-20 h-20 rounded-2xl bg-surface-hover flex items-center justify-center ring-1 ring-surface-border">
        <Inbox class="w-9 h-9 text-slate-300 dark:text-zinc-600" aria-hidden="true" />
      </div>
      <div class="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary-50 dark:bg-primary-900/40 flex items-center justify-center ring-4 ring-surface">
        <span class="text-xs font-bold text-primary-600 dark:text-primary-400">!</span>
      </div>
    </div>
    <p class="text-base font-semibold text-surface-foreground">{{ title || t('common.noData') }}</p>
    <p v-if="description" class="text-sm text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">{{ description }}</p>
    <div v-if="ctaText || secondaryCtaText" class="flex gap-3 mt-6">
      <button
        v-if="secondaryCtaText"
        type="button"
        class="text-sm font-medium px-4 py-2.5 border border-surface-border text-surface-foreground hover:bg-surface-hover rounded-lg min-h-[44px] active:scale-95 transition-all"
        @click="emit('secondaryAction')"
      >{{ secondaryCtaText }}</button>
      <button
        v-if="ctaText"
        type="button"
        class="inline-flex items-center gap-1.5 bg-primary-600 text-white hover:bg-primary-700 text-sm font-medium px-4 py-2.5 rounded-lg min-h-[44px] active:scale-95 transition-all group shadow-sm shadow-primary-600/10"
        @click="emit('action')"
      >
        {{ ctaText }}
        <ArrowRight v-if="ctaText" class="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>
