<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

// Sử dụng layout false vì UI này là split-screen hoàn toàn tùy chỉnh
definePageMeta({
  layout: false,
  middleware: ['guest']
})

// Chuẩn SEO theo Rule 9 của AGENTS.md
useSeoMeta({
  title: 'Đăng nhập - BunTech',
  description: 'Đăng nhập vào hệ thống quản lý xưởng bún BunTech'
})

const { login } = useAuth()

const schema = z.object({
  phoneNumber: z.string().min(1, 'Vui lòng nhập số điện thoại'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu')
})

type Schema = z.output<typeof schema>
const state = reactive<Partial<Schema>>({ phoneNumber: '', password: '' })

const showPassword = ref(false)
const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const formRef = ref()

// Lấy hàm handleSubmit từ useFormSubmit
const { handleSubmit } = useFormSubmit()

// Bọc logic API trong handleSubmit để tự động bắt lỗi API 422
const onSubmit = handleSubmit(
  async (event: FormSubmitEvent<unknown>) => {
    // FormWrapper emit ra nguyên event của Nuxt UI (FormSubmitEvent<unknown>)
    // nên payload thực tế nằm ở event.data, ta cần ép kiểu về LoginPayload
    await login(event.data as import('~/types/auth').LoginPayload)
  },
  {
    formRef
  }
)
</script>

<template>
  <div class="flex min-h-dvh bg-slate-950">
    <!-- CỘT TRÁI: Ảnh nền (Ẩn trên màn hình nhỏ) -->
    <div class="relative hidden lg:block lg:w-1/2">
      <!-- Dùng NuxtImg thay cho img theo Rule 9 của AGENTS.md -->
      <NuxtImg
        src="/images/login_bg.webp"
        alt="Space Theme Background"
        class="absolute inset-0 h-full w-full object-cover"
        format="webp"
      />
      <!-- Gradient tối mờ giúp text dễ đọc hơn -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

      <!-- Content đè lên ảnh -->
      <div class="absolute inset-0 flex flex-col items-start justify-between p-12">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-wheat" class="size-8 text-white" />
          <span class="text-2xl font-bold text-white">BunTech</span>
        </div>

        <div class="mb-10 max-w-lg text-white">
          <h1 class="mb-4 text-5xl font-bold tracking-tight">BẮT ĐẦU HÀNH TRÌNH CỦA BẠN!</h1>
          <p class="text-xl text-gray-300">
            Khám phá không gian công nghệ với hệ thống quản lý xưởng bún thông minh.
          </p>
        </div>
      </div>
    </div>

    <!-- CỘT PHẢI: Form Đăng nhập -->
    <div
      class="relative flex w-full items-center justify-center overflow-hidden p-6 sm:p-12 lg:w-1/2"
    >
      <!-- Ảnh nền cho Mobile (chỉ hiện trên màn nhỏ, ở phần trên cùng) -->
      <div class="absolute inset-x-0 top-0 -z-10 h-1/2 lg:hidden">
        <!-- Dùng NuxtImg thay cho img theo Rule 9 của AGENTS.md -->
        <NuxtImg
          src="/images/login_bg.webp"
          alt="Space Theme Background Mobile"
          class="h-full w-full object-cover opacity-80"
          format="webp"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />
      </div>

      <!-- Form Container -->
      <div class="z-10 w-full max-w-md">
        <div class="mt-10 mb-6 text-left lg:mt-0">
          <h2 class="mb-2 text-4xl font-bold tracking-wide text-white uppercase">ĐĂNG NHẬP</h2>
        </div>

        <!-- Dùng FormWrapper theo Rule 7 của AGENTS.md -->
        <BaseFormWrapper
          ref="formRef"
          :schema="schema"
          :state="state"
          form-class="space-y-5"
          @submit="onSubmit"
        >
          <UFormField name="phoneNumber">
            <UInput
              v-model="state.phoneNumber"
              placeholder="Nhập số điện thoại"
              icon="i-lucide-phone"
              size="xl"
              variant="soft"
              class="w-full text-white"
              :ui="{
                base: 'bg-slate-900/80 backdrop-blur-sm border-slate-800 focus:border-primary-500 h-12'
              }"
            />
          </UFormField>

          <UFormField name="password">
            <template #hint>
              <ULink
                to="/forgot-password"
                class="text-primary-400 hover:text-primary-300 text-sm font-medium"
              >
                Quên mật khẩu?
              </ULink>
            </template>
            <UInput
              v-model="state.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Nhập mật khẩu"
              icon="i-lucide-lock"
              size="xl"
              variant="soft"
              class="w-full text-white"
              :ui="{
                base: 'bg-slate-900/80 backdrop-blur-sm border-slate-800 focus:border-primary-500 h-12'
              }"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="ghost"
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  :padded="false"
                  class="text-gray-400 hover:text-white"
                  @click="togglePassword"
                />
              </template>
            </UInput>
          </UFormField>

          <!-- Tận dụng slot actions của FormWrapper (vừa bổ sung) để custom nút submit -->
          <template #actions="{ isSubmitting }">
            <div class="w-full pt-2">
              <UButton
                type="submit"
                label="Đăng nhập"
                color="primary"
                variant="solid"
                block
                size="xl"
                :loading="isSubmitting"
                class="border-none bg-gradient-to-r from-purple-600 to-blue-600 py-3 font-semibold text-white hover:from-purple-500 hover:to-blue-500"
              />
            </div>
          </template>
        </BaseFormWrapper>

        <div class="mt-8 mb-4">
          <div class="relative mb-6 flex items-center">
            <div class="flex-grow border-t border-slate-800" />
            <span class="mx-4 flex-shrink-0 text-sm text-slate-400">Hoặc tiếp tục với</span>
            <div class="flex-grow border-t border-slate-800" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UButton
              label="Google"
              icon="i-simple-icons-google"
              color="neutral"
              variant="soft"
              block
              size="lg"
              class="border border-slate-800 bg-slate-900/80 py-2.5 text-white backdrop-blur-sm hover:bg-slate-800"
            />
            <UButton
              label="Facebook"
              icon="i-simple-icons-facebook"
              color="neutral"
              variant="soft"
              block
              size="lg"
              class="border border-slate-800 bg-slate-900/80 py-2.5 text-white backdrop-blur-sm hover:bg-slate-800"
            />
          </div>

          <p class="mt-8 text-center text-sm text-slate-400">
            Chưa có tài khoản?
            <ULink to="/signup" class="text-primary-400 hover:text-primary-300 font-medium"
              >Đăng ký ngay</ULink
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
