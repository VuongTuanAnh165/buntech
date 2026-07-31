<script setup lang="ts">
interface Option {
  value: string | number
  label: string
}
interface Props {
  modelValue?: string | number
  label?: string
  options: Option[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  id?: string
}
const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  placeholder: '',
})
defineEmits<{ 'update:modelValue': [value: string] }>()
const selectId = props.id || `select-${Math.random().toString(36).slice(2, 9)}`
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-gray-700 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :class="[
        'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        error ? 'border-danger-500' : 'border-gray-300',
        disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white',
      ]"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <p v-if="error" class="mt-1 text-sm text-danger-600">{{ error }}</p>
  </div>
</template>
