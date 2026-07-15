<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const formRef = ref()
const state = reactive({ email: '' })
const schema = z.object({
  email: z.string().email('Email không hợp lệ')
})

const { handleSubmit, isSubmitting } = useFormSubmit()

const onSubmit = handleSubmit(
  async (event: FormSubmitEvent<{ email: string }>) => {
    // Mock form submit
    console.log('Subscribe with email:', event.data.email)
    state.email = ''
  },
  {
    formRef,
    successMessage: 'Đăng ký thành công!'
  }
)
</script>

<template>
  <footer class="safe-area-bottom bg-inverted text-background/80">
    <div class="mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
        <!-- About Us & Contact -->
        <div class="space-y-8">
          <NuxtLink to="/" class="text-background text-3xl font-bold"> BúnTech. </NuxtLink>
          <p class="text-sm leading-relaxed">
            Chúng tôi cung cấp các giải pháp công nghệ toàn diện giúp doanh nghiệp của bạn phát
            triển mạnh mẽ trong kỷ nguyên số.
          </p>
          <div class="flex items-center gap-4">
            <div
              class="bg-primary-600/10 text-primary-500 flex h-12 w-12 items-center justify-center rounded-full"
            >
              <UIcon name="i-lucide-phone" class="h-6 w-6" />
            </div>
            <div>
              <p class="text-sm">Liên hệ ngay</p>
              <a
                href="tel:0901234567"
                class="text-background hover:text-primary text-lg font-semibold transition-colors"
                >090-123-4567</a
              >
            </div>
          </div>
        </div>

        <!-- Company Links -->
        <div>
          <h3 class="text-background mb-6 text-lg font-semibold">Công ty</h3>
          <ul class="space-y-4">
            <li>
              <NuxtLink to="/gioi-thieu" class="hover:text-primary transition-colors"
                >Giới thiệu</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/tin-tuc" class="hover:text-primary transition-colors"
                >Tin tức</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/tuyen-dung" class="hover:text-primary transition-colors"
                >Tuyển dụng</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/dieu-khoan" class="hover:text-primary transition-colors"
                >Điều khoản sử dụng</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/chinh-sach" class="hover:text-primary transition-colors"
                >Chính sách bảo mật</NuxtLink
              >
            </li>
          </ul>
        </div>

        <!-- Services Links -->
        <div>
          <h3 class="text-background mb-6 text-lg font-semibold">Dịch vụ</h3>
          <ul class="space-y-4">
            <li>
              <NuxtLink to="/san-pham" class="hover:text-primary transition-colors"
                >Sản phẩm của chúng tôi</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/don-vi-ban-buon" class="hover:text-primary transition-colors"
                >Dành cho Đại lý</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/tu-van" class="hover:text-primary transition-colors"
                >Tư vấn kinh doanh</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/ho-tro" class="hover:text-primary transition-colors"
                >Hỗ trợ khách hàng</NuxtLink
              >
            </li>
          </ul>
        </div>

        <!-- Newsletter Subscribe -->
        <div>
          <h3 class="text-background mb-6 text-lg font-semibold">Đăng ký nhận tin</h3>
          <p class="mb-6 text-sm">Đăng ký để nhận các thông tin mới nhất và ưu đãi từ chúng tôi.</p>

          <FormWrapper ref="formRef" :schema="schema" :state="state" @submit="onSubmit">
            <UFormField name="email" class="mb-4">
              <UInput
                v-model="state.email"
                placeholder="Nhập email của bạn..."
                icon="i-lucide-mail"
                size="lg"
              />
            </UFormField>
            <template #actions>
              <UButton type="submit" block size="lg" icon="i-lucide-send" :loading="isSubmitting">
                Đăng ký ngay
              </UButton>
            </template>
          </FormWrapper>
          <p class="text-background/60 mt-4 text-xs italic">
            Chúng tôi cam kết bảo mật thông tin của bạn.
          </p>
        </div>
      </div>
    </div>

    <!-- Bottom Footer -->
    <div class="border-background/10 bg-inverted border-t">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8"
      >
        <p class="text-background/80 text-sm">
          © {{ new Date().getFullYear() }} BúnTech. All rights reserved.
        </p>

        <div class="flex items-center gap-4">
          <a href="#" class="text-background/60 hover:text-background transition-colors">
            <UIcon name="i-lucide-facebook" class="h-5 w-5" />
          </a>
          <a href="#" class="text-background/60 hover:text-background transition-colors">
            <UIcon name="i-lucide-twitter" class="h-5 w-5" />
          </a>
          <a href="#" class="text-background/60 hover:text-background transition-colors">
            <UIcon name="i-lucide-youtube" class="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>
