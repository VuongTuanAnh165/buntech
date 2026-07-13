<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

// Sử dụng layout false vì UI này là split-screen hoàn toàn tùy chỉnh
definePageMeta({
  layout: 'auth',
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

const socialProviders = [
  { icon: 'i-simple-icons-linkedin', to: 'https://www.linkedin.com/login' },
  { icon: 'i-simple-icons-x', to: 'https://twitter.com/login' },
  { icon: 'i-simple-icons-facebook', to: 'https://www.facebook.com/' },
  { icon: 'i-simple-icons-google', to: 'https://www.google.com/' }
]
</script>

<template>
  <UCard
    :ui="{
      base: 'w-full login-main',
      background: 'bg-white',
      ring: 'ring-0',
      shadow: 'shadow-2xl',
      rounded: 'rounded-xl',
      body: { padding: 'p-8 sm:p-10' }
    }"
  >
    <div class="mb-6">
      <h4 class="mb-2 text-2xl font-semibold text-slate-800 dark:text-white">
        Đăng nhập tài khoản
      </h4>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        Nhập số điện thoại & mật khẩu để đăng nhập
      </p>
    </div>

    <!-- Dùng FormWrapper theo Rule 7 của AGENTS.md -->
    <BaseFormWrapper
      ref="formRef"
      :schema="schema"
      :state="state"
      form-class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField label="Số điện thoại" name="phoneNumber">
        <UInput
          v-model="state.phoneNumber"
          placeholder="Nhập số điện thoại"
          size="lg"
          class="w-full"
          :ui="{ base: 'h-11' }"
        />
      </UFormField>

      <UFormField label="Mật khẩu" name="password">
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          placeholder="*********"
          size="lg"
          class="w-full"
          :ui="{ base: 'h-11' }"
        >
          <template #trailing>
            <UButton
              color="neutral"
              variant="ghost"
              :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              :padded="false"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              @click="togglePassword"
            />
          </template>
        </UInput>
      </UFormField>

      <div class="mt-2 flex items-center justify-between">
        <UCheckbox id="remember" name="remember" label="Ghi nhớ mật khẩu" />
        <ULink
          to="/forgot-password"
          class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
        >
          Quên mật khẩu?
        </ULink>
      </div>

      <!-- Tận dụng slot actions của FormWrapper (vừa bổ sung) để custom nút submit -->
      <template #actions="{ isSubmitting }">
        <div class="mt-5">
          <UButton
            type="submit"
            label="Đăng nhập"
            color="primary"
            block
            size="lg"
            :loading="isSubmitting"
            class="h-11 text-base font-medium shadow-md"
          />
        </div>
      </template>
    </BaseFormWrapper>

    <div class="mt-8">
      <h6 class="mb-4 text-center text-sm font-medium text-slate-500">Hoặc đăng nhập bằng</h6>
      <div class="flex justify-center gap-3">
        <UButton
          v-for="provider in socialProviders"
          :key="provider.icon"
          :icon="provider.icon"
          color="neutral"
          variant="soft"
          target="_blank"
          :to="provider.to"
          class="bg-slate-100 p-3 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
        />
      </div>
    </div>

    <p class="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
      Chưa có tài khoản?
      <ULink
        to="/signup"
        class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 ml-1 font-medium"
        >Tạo tài khoản</ULink
      >
    </p>
  </UCard>
</template>
