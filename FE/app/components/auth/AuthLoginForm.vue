<script setup lang="ts">
import type { z } from 'zod'
import { ArrowRight, ShieldCheck, Truck, User } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useFormSubmit } from '~/composables/useFormSubmit'

import { loginSchema } from '~/utils/validation'

const props = defineProps<{
  role: 'admin' | 'driver' | 'retail' | 'wholesale'
  title: string
  subtitle: string
  icon: 'shield' | 'truck' | 'user'
}>()

const authStore = useAuthStore()
const toast = useToast()

type Schema = z.output<typeof loginSchema>
const state = reactive<Schema>({ phoneNumber: '', password: '' })
const formErrors = reactive<Record<string, string>>({})

const formRef = ref({
  setErrors: (errors: { path: string; message: string }[]) => {
    Object.keys(formErrors).forEach((key) => {
      Reflect.deleteProperty(formErrors, key)
    })
    errors.forEach((e) => {
      formErrors[e.path] = e.message
    })
  },
  clearErrors: () => {
    Object.keys(formErrors).forEach((key) => {
      Reflect.deleteProperty(formErrors, key)
    })
  }
})

const validateForm = () => {
  formRef.value.clearErrors()
  const result = loginSchema.safeParse(state)
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path[0]?.toString() || '',
      message: issue.message
    }))
    formRef.value.setErrors(errors)
    return false
  }
  return true
}

const { handleSubmit, isSubmitting: loading } = useFormSubmit()

const handleLogin = handleSubmit(
  async (data: Schema) => {
    await authStore.login({ phoneNumber: data.phoneNumber, password: data.password })

    if (authStore.role?.toLowerCase() !== props.role) {
      toast.add({ title: 'Bạn không có quyền truy cập vào trang này', color: 'error' })
      await authStore.logout()
      return
    }

    if (props.role === 'admin') navigateTo('/admin')
    else if (props.role === 'driver') navigateTo('/driver')
    else navigateTo('/portal')
  },
  { formRef }
)

const handleFormSubmit = () => {
  if (validateForm()) {
    handleLogin(state)
  }
}
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/70"
  >
    <!-- Premium Glow Effect -->
    <div
      class="bg-primary-500/20 pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl"
    />
    <div
      class="bg-accent-500/20 pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-3xl"
    />

    <!-- Header -->
    <div class="relative mb-8 text-center">
      <div
        class="bg-primary-50/80 text-primary-700 ring-primary-200/50 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-800/40 mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 backdrop-blur-md"
      >
        <ShieldCheck v-if="icon === 'shield'" class="h-4 w-4" aria-hidden="true" />
        <Truck v-else-if="icon === 'truck'" class="h-4 w-4" aria-hidden="true" />
        <User v-else class="h-4 w-4" aria-hidden="true" />
        {{ title }}
      </div>
      <h2
        class="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        style="letter-spacing: -0.02em"
      >
        Chào mừng trở lại
      </h2>
      <p class="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">{{ subtitle }}</p>
    </div>

    <!-- Form -->
    <form class="relative z-10 space-y-5" @submit.prevent="handleFormSubmit">
      <UFormField label="Số điện thoại" name="phoneNumber" :error="formErrors.phoneNumber">
        <UInput
          v-model="state.phoneNumber"
          type="tel"
          :placeholder="props.role === 'admin' ? '0901234567' : '0912345678'"
          autocomplete="tel"
          size="xl"
          class="group/input focus-within:ring-primary-500/20 transition-all duration-300 focus-within:ring-4"
        />
      </UFormField>

      <UFormField label="Mật khẩu" name="password" :error="formErrors.password">
        <UInput
          v-model="state.password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          size="xl"
          class="group/input focus-within:ring-primary-500/20 transition-all duration-300 focus-within:ring-4"
        />
      </UFormField>

      <div class="-mt-2 flex justify-end">
        <NuxtLink
          :to="`/auth/${props.role}/forgot-password`"
          class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-semibold transition-all hover:underline"
        >
          Quên mật khẩu?
        </NuxtLink>
      </div>

      <div class="mt-6">
        <UButton
          type="submit"
          :loading="loading"
          block
          size="xl"
          color="primary"
          variant="solid"
          class="group from-primary-600 to-primary-500 shadow-primary-500/25 hover:shadow-primary-500/40 mt-6 flex w-full items-center justify-center rounded-xl bg-gradient-to-r font-bold shadow-lg transition-all hover:scale-[1.02]"
        >
          Đăng nhập
          <ArrowRight
            v-if="!loading"
            class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </UButton>
      </div>
    </form>

    <!-- Divider -->
    <div class="relative my-8">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-slate-200/50 dark:border-zinc-800/50" />
      </div>
      <div class="relative flex justify-center">
        <span
          class="bg-white/80 px-4 text-xs font-medium tracking-wider text-slate-400 uppercase backdrop-blur-sm dark:bg-zinc-900/80 dark:text-zinc-500"
        >
          hoặc đăng nhập với
        </span>
      </div>
    </div>

    <!-- Quick links -->
    <div class="grid grid-cols-2 gap-3">
      <UButton
        v-if="role !== 'driver'"
        to="/auth/driver/login"
        color="neutral"
        variant="soft"
        block
        class="rounded-xl !text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-zinc-800"
      >
        Tài xế giao hàng
      </UButton>
      <UButton
        v-if="role !== 'admin'"
        to="/auth/admin/login"
        color="neutral"
        variant="soft"
        block
        class="rounded-xl !text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-zinc-800"
      >
        Admin Portal
      </UButton>
      <UButton
        v-if="role !== 'retail' && role !== 'wholesale'"
        to="/auth/customer/login"
        color="neutral"
        variant="soft"
        block
        class="rounded-xl !text-sm font-medium transition-all hover:bg-slate-100 dark:hover:bg-zinc-800"
      >
        Khách hàng
      </UButton>
    </div>

    <p class="mt-8 text-center text-xs font-medium text-slate-400 dark:text-zinc-500">
      Cần hỗ trợ? Liên hệ
      <a
        href="mailto:support@buntech.vn"
        class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-bold transition-colors"
      >
        support@buntech.vn
      </a>
    </p>
  </div>
</template>
