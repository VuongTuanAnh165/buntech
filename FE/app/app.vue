<script setup lang="ts">
import { vi } from '@nuxt/ui/locale'

const toast = useToast()
const nuxtApp = useNuxtApp()

// Đăng ký global hook cho toast
nuxtApp.hook('app:toast', (options) => {
  toast.add(options)
})

const { isOpen: isConfirmDialogOpen } = useConfirmDialog()

// Tối ưu Performance: Chỉ tải chunk js của ConfirmDialog khi nó thực sự được mở lần đầu.
// Giữ lại state true để không cắt đứt animation đóng modal.
const hasConfirmDialogOpened = ref(false)
watch(isConfirmDialogOpen, (val) => {
  if (val) hasConfirmDialogOpened.value = true
})

const isDev = import.meta.dev

const reloadPage = () => {
  if (import.meta.client) {
    window.location.reload()
  }
}
</script>

<template>
  <UApp :locale="vi" :toaster="{ position: 'top-right' }">
    <NuxtLoadingIndicator color="var(--ui-primary)" :height="3" :throttle="200" />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtErrorBoundary @error="(err) => console.error('[NuxtErrorBoundary]', err)">
        <NuxtPage />

        <template #error="{ error, clearError }">
          <div class="flex min-h-[50vh] flex-col items-center justify-center p-4 text-center">
            <UIcon name="i-lucide-alert-triangle" class="text-error mb-4 size-16" />
            <h2 class="text-highlighted mb-2 text-xl font-bold">Đã có lỗi xảy ra</h2>
            <p class="text-muted mb-6 max-w-md">
              Rất xin lỗi, màn hình này đang gặp sự cố kỹ thuật. Vui lòng thử tải lại trang hoặc
              quay về trang chủ.
            </p>
            <div class="flex gap-4">
              <!-- Dùng window.location.reload() để reset toàn bộ state (Store, RAM) thay vì chỉ clearError dễ lặp lại lỗi -->
              <UButton
                label="Tải lại trang"
                color="primary"
                @click="
                  () => {
                    clearError()
                    reloadPage()
                  }
                "
              />
              <UButton
                label="Về trang chủ"
                variant="outline"
                color="neutral"
                to="/"
                @click="clearError"
              />
            </div>
            <!-- Chỉ hiển thị chi tiết lỗi trong môi trường dev -->
            <div
              v-if="isDev"
              class="bg-error/10 text-error mt-8 w-full max-w-2xl overflow-auto rounded-md p-4 text-left text-sm"
            >
              <code>{{ error }}</code>
            </div>
          </div>
        </template>
      </NuxtErrorBoundary>
    </NuxtLayout>
    <LazyBaseConfirmDialog v-if="hasConfirmDialogOpened" />
  </UApp>
</template>
