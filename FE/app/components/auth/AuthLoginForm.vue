<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'
import { ArrowRight, ShieldCheck, Truck, User, _AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useFormSubmit } from '~/composables/useFormSubmit'

const props = defineProps<{
  role: 'admin' | 'driver' | 'retail' | 'wholesale'
  title: string
  subtitle: string
  icon: 'shield' | 'truck' | 'user'
}>()

const authStore = useAuthStore()
const toast = useToast()
const formRef = ref()

const schema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
})

type Schema = z.output<typeof schema>
const state = reactive<Schema>({ email: '', password: '' })

const { isSubmitting, handleSubmit } = useFormSubmit()

const onSubmit = handleSubmit(async (event: FormSubmitEvent<Schema>) => {
  const data = event.data
  try {
    await authStore.login(data.email, data.password)

    if (authStore.role?.toLowerCase() !== props.role) {
      toast.add({ title: 'Bạn không có quyền truy cập vào trang này', color: 'error' })
      await authStore.logout()
      return
    }

    toast.add({ title: 'Đăng nhập thành công', color: 'success' })
    if (props.role === 'admin') navigateTo('/admin')
    else if (props.role === 'driver') navigateTo('/driver')
    else navigateTo('/portal')
  } catch {
    toast.add({ title: 'Email hoặc mật khẩu không chính xác', color: 'error' })
  }
})
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <div
        class="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 ring-primary-200/50 dark:ring-primary-800/40 mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ring-1"
      >
        <ShieldCheck v-if="icon === 'shield'" class="h-4 w-4" aria-hidden="true" />
        <Truck v-else-if="icon === 'truck'" class="h-4 w-4" aria-hidden="true" />
        <User v-else class="h-4 w-4" aria-hidden="true" />
        {{ title }}
      </div>
      <h2
        class="text-surface-foreground mb-2 text-2xl font-bold tracking-tight"
        style="letter-spacing: -0.02em"
      >
        Đăng nhập
      </h2>
      <p class="text-sm leading-relaxed text-slate-500 dark:text-zinc-400">{{ subtitle }}</p>
    </div>

    <!-- Form -->
    <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Email" name="email" :ui="{ label: 'form-label' }">
        <UInput
          v-model="state.email"
          type="email"
          :placeholder="props.role === 'admin' ? 'admin@buntech.vn' : 'user@example.com'"
          autocomplete="email"
          size="lg"
          class="form-input focus:ring-primary-500/10 focus:border-primary-500 shadow-none focus:ring-4"
        />
      </UFormField>

      <UFormField label="Mật khẩu" name="password" :ui="{ label: 'form-label' }">
        <UInput
          v-model="state.password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
          size="lg"
          class="form-input focus:ring-primary-500/10 focus:border-primary-500 shadow-none focus:ring-4"
        />
      </UFormField>

      <div class="-mt-3 flex justify-end">
        <NuxtLink
          :to="`/auth/${props.role}/forgot-password`"
          class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors"
        >
          Quên mật khẩu?
        </NuxtLink>
      </div>

      <UButton
        type="submit"
        :loading="isSubmitting"
        block
        size="lg"
        color="primary"
        variant="solid"
        class="group !mt-6 flex items-center justify-center rounded-lg font-semibold shadow-sm"
      >
        Đăng nhập
        <ArrowRight
          v-if="!isSubmitting"
          class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </UButton>
    </UForm>

    <!-- Divider -->
    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="border-surface-border w-full border-t" />
      </div>
      <div class="relative flex justify-center">
        <span
          class="bg-surface-muted px-3 text-xs tracking-wider text-slate-400 uppercase dark:text-zinc-500"
          >hoặc</span
        >
      </div>
    </div>

    <!-- Quick links -->
    <div class="grid grid-cols-2 gap-3">
      <NuxtLink v-if="role !== 'driver'" to="/auth/driver/login">
        <UButton color="neutral" variant="outline" block class="rounded-lg !text-sm">
          Tài xế giao hàng
        </UButton>
      </NuxtLink>
      <NuxtLink v-if="role !== 'admin'" to="/auth/admin/login">
        <UButton color="neutral" variant="outline" block class="rounded-lg !text-sm">
          Admin Portal
        </UButton>
      </NuxtLink>
      <NuxtLink v-if="role !== 'retail' && role !== 'wholesale'" to="/auth/customer/login">
        <UButton color="neutral" variant="outline" block class="rounded-lg !text-sm">
          Khách hàng
        </UButton>
      </NuxtLink>
    </div>

    <p class="mt-8 text-center text-xs text-slate-400 dark:text-zinc-500">
      Cần hỗ trợ? Liên hệ
      <a
        href="mailto:support@buntech.vn"
        class="text-primary-600 dark:text-primary-400 font-medium hover:underline"
        >support@buntech.vn</a
      >
    </p>
  </div>
</template>
