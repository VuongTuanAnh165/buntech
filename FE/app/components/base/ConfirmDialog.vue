<script setup lang="ts">
const { options, isOpen, resolve } = useConfirmDialog()

const handleConfirm = () => {
  resolve(true)
}

const handleCancel = () => {
  resolve(false)
}
</script>

<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="p-6 sm:p-8">
        <!-- Icon -->
        <div
          v-if="options.icon"
          class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full"
          :class="options.variant === 'danger'
            ? 'bg-red-50 dark:bg-red-950/30'
            : 'bg-primary-50 dark:bg-primary-950/30'"
        >
          <UIcon
            :name="options.icon"
            class="size-6"
            :class="options.variant === 'danger'
              ? 'text-red-600 dark:text-red-400'
              : 'text-primary-600 dark:text-primary-400'"
          />
        </div>

        <!-- Content -->
        <div class="text-center">
          <h3 class="text-lg font-semibold text-surface-foreground">
            {{ options.title }}
          </h3>
          <p
            v-if="options.description"
            class="mt-2 text-sm text-gray-500 dark:text-zinc-400"
          >
            {{ options.description }}
          </p>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex items-center justify-end gap-3">
          <UButton
            color="neutral"
            variant="outline"
            @click="handleCancel"
          >
            {{ options.cancelText || 'Hủy' }}
          </UButton>
          <UButton
            :color="options.variant === 'danger' ? 'error' : 'primary'"
            @click="handleConfirm"
          >
            {{ options.confirmText || 'Xác nhận' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
