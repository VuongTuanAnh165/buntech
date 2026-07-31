<script setup lang="ts">
interface Props {
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  icon?: string
  id?: string
  min?: number
  max?: number
}
const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
})
defineEmits<{ 'update:modelValue': [value: string] }>()

const inputId = props.id || `input-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>
    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :min="min"
        :max="max"
        :class="[
          'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          error ? 'border-danger-500' : 'border-gray-300',
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>
    <p v-if="error" class="mt-1 text-sm text-danger-600">{{ error }}</p>
  </div>
</template>
