<script setup lang="ts">
import { AlertCircle, Eye, EyeOff } from 'lucide-vue-next'
import { useId } from '#imports'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  hint?: string
  prefix?: string
  suffix?: string
  id?: string
  min?: number
  max?: number
  autocomplete?: string
}>(), {
  modelValue: '',
  type: 'text',
  required: false,
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const generatedId = useId()
const inputId = props.id || generatedId
const errorId = `${inputId}-error`
const hintId = `${inputId}-hint`
const showPassword = ref(false)

const isPassword = computed(() => props.type === 'password')
const actualType = computed(() => {
  if (isPassword.value) return showPassword.value ? 'text' : 'password'
  return props.type
})

const describedBy = computed(() => {
  const parts: string[] = []
  if (props.error) parts.push(errorId)
  if (props.hint) parts.push(hintId)
  return parts.length ? parts.join(' ') : undefined
})

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div>
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger-500" aria-hidden="true">*</span>
    </label>
    <div class="relative">
      <span v-if="prefix" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-zinc-500 pointer-events-none">{{ prefix }}</span>
      <input
        :id="inputId"
        :value="modelValue"
        :type="actualType"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :min="min"
        :max="max"
        :autocomplete="autocomplete"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-required="required"
        :class="['form-input', error ? 'form-input-error' : '', prefix ? 'pl-8' : '', suffix || isPassword ? 'pr-10' : '', disabled ? 'opacity-60 cursor-not-allowed' : '']"
        @input="onInput"
      >
      <button
        v-if="isPassword"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 p-1.5 rounded-md transition-colors"
        :aria-label="showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
        :aria-pressed="showPassword"
        tabindex="0"
        @click="showPassword = !showPassword"
      >
        <Eye v-if="showPassword" class="w-4 h-4" aria-hidden="true" />
        <EyeOff v-else class="w-4 h-4" aria-hidden="true" />
      </button>
      <span v-else-if="suffix" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-zinc-500 pointer-events-none">{{ suffix }}</span>
    </div>
    <p v-if="error" :id="errorId" class="form-error" role="alert">
      <AlertCircle class="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      {{ error }}
    </p>
    <p v-else-if="hint" :id="hintId" class="form-hint">{{ hint }}</p>
  </div>
</template>
