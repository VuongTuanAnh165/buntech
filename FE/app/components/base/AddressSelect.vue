<script setup lang="ts">
import { useMasterData } from '~/composables/useMasterData'

const props = defineProps<{
  modelValue: {
    province: string
    ward: string
    addressLine: string
    latitude?: string | null
    longitude?: string | null
  }
  errors?: {
    province?: string
    ward?: string
    addressLine?: string
    latitude?: string | null
    longitude?: string | null
  }
}>()

const emit = defineEmits<{
  'update:modelValue': [
    value: {
      province: string
      ward: string
      addressLine: string
      latitude?: string | null
      longitude?: string | null
    }
  ]
}>()

const isMapOpen = ref(false)

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

const handleLocationUpdate = (payload: { latitude: string; longitude: string }) => {
  state.value = {
    ...state.value,
    latitude: payload.latitude,
    longitude: payload.longitude
  }
  isMapOpen.value = false
}

const clearLocation = () => {
  state.value = {
    ...state.value,
    latitude: null,
    longitude: null
  }
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
    <div class="space-y-4">
      <UFormField :label="$t('province')" name="province" :error="props.errors?.province">
        <USelectMenu
          v-model="provinceModel"
          :items="provinceOptions"
          value-key="value"
          label-key="label"
          class="w-full"
          :placeholder="$t('province_placeholder')"
          searchable
          :searchable-placeholder="$t('search')"
        />
      </UFormField>

      <UFormField :label="$t('ward')" name="ward" :error="props.errors?.ward">
        <USelectMenu
          v-model="wardModel"
          :items="wardOptions"
          value-key="value"
          label-key="label"
          class="w-full"
          :disabled="!state.province"
          :placeholder="$t('ward_placeholder')"
          searchable
          :searchable-placeholder="$t('search')"
        />
      </UFormField>
    </div>

    <UFormField
      :label="$t('address_specific')"
      name="addressLine"
      :error="props.errors?.addressLine"
    >
      <div class="mt-2 flex items-center gap-2">
        <UInput
          :model-value="state.addressLine"
          :placeholder="$t('address_placeholder')"
          class="flex-1"
          @update:model-value="(val) => updateField('addressLine', String(val))"
        />
        <UTooltip text="Bản đồ">
          <UButton
            icon="i-heroicons-map"
            color="primary"
            variant="soft"
            @click="isMapOpen = true"
          />
        </UTooltip>
      </div>

      <!-- Coordinate Display -->
      <div
        v-if="state.latitude && state.longitude"
        class="bg-primary-50 dark:bg-primary-950/50 mt-2 flex items-center justify-between rounded-md px-3 py-2 text-sm"
      >
        <div class="text-primary-700 dark:text-primary-300 flex items-center gap-2">
          <UIcon name="i-heroicons-map-pin" class="h-4 w-4" />
          <span
            >{{ Number(state.latitude).toFixed(5) }}, {{ Number(state.longitude).toFixed(5) }}</span
          >
        </div>
        <UButton
          icon="i-heroicons-x-mark"
          color="neutral"
          variant="ghost"
          size="xs"
          padded
          @click="clearLocation"
        />
      </div>
    </UFormField>

    <!-- Map Modal -->
    <UModal v-model:open="isMapOpen" title="Chọn vị trí trên bản đồ" prevent-close>
      <template #body>
        <template v-if="isMapOpen">
          <BaseMapLocationPicker
            :latitude="state.latitude"
            :longitude="state.longitude"
            @update:location="handleLocationUpdate"
            @close="isMapOpen = false"
          />
        </template>
      </template>
    </UModal>
  </div>
</template>
