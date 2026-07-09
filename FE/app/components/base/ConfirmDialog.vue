<script setup lang="ts">
/**
 * Component Modal xác nhận hành động nguy hiểm.
 * Kết nối với composable useConfirmDialog().
 *
 * CÁCH DÙNG:
 * 1. Đặt component này 1 lần duy nhất ở app.vue hoặc layout
 * 2. Gọi confirm() từ bất kỳ đâu thông qua useConfirmDialog()
 *
 * @example
 * <!-- Trong app.vue hoặc layout -->
 * <BaseConfirmDialog />
 *
 * <!-- Trong component bất kỳ -->
 * const { confirm } = useConfirmDialog()
 * const confirmed = await confirm({ title: 'Xóa?', color: 'error' })
 */
const { isOpen, options, handleConfirm, handleCancel } = useConfirmDialog()

const isOpenModel = computed({
  get: () => isOpen.value,
  set: (val: boolean) => {
    if (!val) handleCancel()
  }
})
</script>

<template>
  <UModal v-model:open="isOpenModel">
    <template #content>
      <div class="p-6">
        <!-- Icon + Title -->
        <div class="flex items-start gap-4">
          <div
            v-if="options.icon"
            class="flex size-10 shrink-0 items-center justify-center rounded-full"
            :class="[
              options.color === 'error'
                ? 'bg-error/10'
                : options.color === 'warning'
                  ? 'bg-warning/10'
                  : 'bg-primary/10'
            ]"
          >
            <UIcon
              :name="options.icon"
              class="size-5"
              :class="[
                options.color === 'error'
                  ? 'text-error'
                  : options.color === 'warning'
                    ? 'text-warning'
                    : 'text-primary'
              ]"
            />
          </div>

          <div class="flex-1">
            <h3 class="text-highlighted text-base font-semibold">
              {{ options.title }}
            </h3>
            <p v-if="options.description" class="text-muted mt-1 text-sm">
              {{ options.description }}
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex justify-end gap-3">
          <UButton
            :label="options.cancelLabel || 'Hủy'"
            color="neutral"
            variant="outline"
            @click="handleCancel"
          />
          <UButton
            :label="options.confirmLabel || 'Xác nhận'"
            :color="options.color || 'error'"
            @click="handleConfirm"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
