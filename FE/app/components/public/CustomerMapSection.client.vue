<script setup lang="ts">
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import type { PublicCustomer, PublicCustomerAddress } from '~/services/publicCustomerService'

interface MarkerItem {
  customer: PublicCustomer
  address: PublicCustomerAddress
}

interface Props {
  markers: MarkerItem[]
}

defineProps<Props>()

const mapCenter = ref<[number, number]>([16.0, 106.0])
const mapZoom = ref(6)

const getDirectionsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

const tierColors: Record<string, string> = {
  diamond: 'text-blue-500',
  gold: 'text-yellow-500',
  silver: 'text-gray-400',
  bronze: 'text-orange-600'
}

const tierLabels: Record<string, string> = {
  diamond: '💎 Diamond',
  gold: '🥇 Gold',
  silver: '🥈 Silver',
  bronze: '🥉 Bronze'
}
</script>

<template>
  <div
    class="relative z-0 h-[500px] overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700"
  >
    <LMap :center="mapCenter" :zoom="mapZoom" class="h-full w-full" :use-global-leaflet="false">
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        :attribution="'&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a>'"
      />

      <LMarker
        v-for="(item, idx) in markers"
        :key="`marker-${item.customer.id}-${item.address.id}-${idx}`"
        :lat-lng="[item.address.latitude!, item.address.longitude!]"
      >
        <LPopup>
          <div class="min-w-[200px] space-y-2 p-1">
            <div class="flex items-center gap-2">
              <img
                v-if="item.customer.avatarUrl"
                :src="item.customer.avatarUrl"
                :alt="item.customer.storeName || item.customer.fullName"
                class="h-10 w-10 rounded-full object-cover"
              />
              <div
                v-else
                class="bg-primary-100 text-primary-600 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
              >
                {{ (item.customer.storeName || item.customer.fullName).charAt(0) }}
              </div>
              <div>
                <p class="text-sm font-semibold text-neutral-900">
                  {{ item.customer.storeName || item.customer.fullName }}
                </p>
                <p :class="['text-xs font-medium', tierColors[item.customer.tier]]">
                  {{ tierLabels[item.customer.tier] }}
                </p>
              </div>
            </div>
            <p class="text-xs text-neutral-600">📞 {{ item.customer.phoneNumber }}</p>
            <p v-if="item.address.addressLine" class="text-xs text-neutral-500">
              {{ item.address.addressLine }}, {{ item.address.ward }}, {{ item.address.province }}
            </p>
            <a
              :href="getDirectionsUrl(item.address.latitude!, item.address.longitude!)"
              target="_blank"
              rel="noopener noreferrer"
              class="bg-primary-500 dark:bg-primary-700 hover:bg-primary-600 dark:hover:bg-primary-800 mt-1 inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium text-white! transition-colors"
            >
              📍 Chỉ đường ngay
            </a>
          </div>
        </LPopup>
      </LMarker>
    </LMap>
  </div>
</template>
