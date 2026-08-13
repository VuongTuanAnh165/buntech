<script setup lang="ts">
import { computed } from 'vue'
import { useMasterData } from '~/composables/useMasterData'

const props = defineProps<{
  modelValue: {
    province: string
    ward: string
    addressLine: string
  }
  errors?: {
    province?: string
    ward?: string
    addressLine?: string
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [value: { province: string; ward: string; addressLine: string }]
}>()

// Use Master Data to fetch provinces and wards
const { divisions } = useMasterData()

const state = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const updateField = (
  field: 'province' | 'ward' | 'addressLine',
  value: string | { label: string; value: string }
) => {
  const actualValue = value && typeof value === 'object' ? value.value : String(value || '')
  const newValue = { ...state.value, [field]: actualValue }

  // If province changes, reset the ward
  if (field === 'province' && state.value.province !== actualValue) {
    newValue.ward = ''
  }

  state.value = newValue
}

// 1. Get list of Provinces
const provinceOptions = computed(() => {
  if (!divisions.value) return []
  return divisions.value.map((div) => ({ label: div.name, value: div.name }))
})

type DivisionExtended = {
  name: string
  wards?: { name: string }[]
}

// 2. Get list of Wards based on the selected Province
const wardOptions = computed(() => {
  if (!divisions.value || !state.value.province) return []

  const divs = divisions.value as unknown as DivisionExtended[]
  const selectedProvince = divs.find((div) => div.name === state.value.province)
  if (!selectedProvince || !selectedProvince.wards) return []

  const allWards = selectedProvince.wards.map((w) => w.name)

  return [...new Set(allWards)].map((w) => ({ label: w, value: w }))
})

const provinceModel = computed({
  get: () => state.value.province,
  set: (val) => updateField('province', val)
})

const wardModel = computed({
  get: () => state.value.ward,
  set: (val) => updateField('ward', val)
})
</script>

<template>
  <div class="space-y-4">
    <UFormField label="Địa chỉ cụ thể" name="addressLine" :error="props.errors?.addressLine">
      <UInput
        :model-value="state.addressLine"
        placeholder="Số nhà, tên đường..."
        @update:model-value="(val) => updateField('addressLine', String(val))"
      />
    </UFormField>

    <div class="space-y-4">
      <UFormField label="Tỉnh/Thành phố" name="province" :error="props.errors?.province">
        <USelectMenu
          v-model="provinceModel"
          :items="provinceOptions"
          value-key="value"
          label-key="label"
          class="w-full"
          placeholder="Chọn Tỉnh/Thành phố"
          searchable
          searchable-placeholder="Tìm kiếm..."
        />
      </UFormField>

      <UFormField label="Phường/Xã" name="ward" :error="props.errors?.ward">
        <USelectMenu
          v-model="wardModel"
          :items="wardOptions"
          value-key="value"
          label-key="label"
          class="w-full"
          :disabled="!state.province"
          placeholder="Chọn Phường/Xã"
          searchable
          searchable-placeholder="Tìm kiếm..."
        />
      </UFormField>
    </div>
  </div>
</template>
