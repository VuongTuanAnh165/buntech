<script setup lang="ts">
const { options, isOpen, handleConfirm, handleCancel } = useConfirmDialog()
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="p-6 sm:p-8">
        <!-- Icon -->
        <div
          v-if="options.icon"
          class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full"
          :class="
            options.color === 'error'
              ? 'bg-red-50 dark:bg-red-950/30'
              : 'bg-primary-50 dark:bg-primary-950/30'
          "
        >
          <UIcon
            :name="options.icon"
            class="size-6"
            :class="
              options.color === 'error'
                ? 'text-error-600 dark:text-error-400'
                : 'text-primary-600 dark:text-primary-400'
            "
          />
        </div>

        <!-- Content -->
        <div class="text-center">
          <h3 class="text-surface-foreground text-lg font-semibold">
            {{ options.title }}
          </h3>
          <p v-if="options.description" class="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            {{ options.description }}
          </p>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex items-center justify-end gap-3">
          <UButton color="neutral" variant="outline" @click="handleCancel">
            {{ options.cancelLabel || $t('common_cancel') }}
          </UButton>
          <UButton :color="options.color === 'error' ? 'error' : 'primary'" @click="handleConfirm">
            {{ options.confirmLabel || $t('confirm') }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
