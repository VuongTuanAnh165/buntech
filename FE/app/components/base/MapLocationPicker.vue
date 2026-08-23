<script setup lang="ts">
import type { Map, Marker } from 'leaflet'

const props = defineProps<{
  latitude?: string | null
  longitude?: string | null
}>()

const emit = defineEmits<{
  'update:location': [payload: { latitude: string; longitude: string }]
  close: []
}>()

// Default center (e.g., Hanoi)
const defaultCenter: [number, number] = [21.028511, 105.804817]

const mapContainer = ref<HTMLElement | null>(null)
const currentLatLng = ref<[number, number]>(defaultCenter)
let mapInstance: Map | null = null
let markerInstance: Marker | null = null

onMounted(async () => {
  if (import.meta.client && mapContainer.value) {
    const L = await import('leaflet')
    const { GeoSearchControl, OpenStreetMapProvider } = await import('leaflet-geosearch')

    // Fix Vite/Leaflet default icon paths
    const iconRetinaUrl = (await import('leaflet/dist/images/marker-icon-2x.png')).default
    const iconUrl = (await import('leaflet/dist/images/marker-icon.png')).default
    const shadowUrl = (await import('leaflet/dist/images/marker-shadow.png')).default

    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl,
      iconUrl,
      shadowUrl
    })

    const initialLat = props.latitude ? parseFloat(props.latitude) : defaultCenter[0]
    const initialLng = props.longitude ? parseFloat(props.longitude) : defaultCenter[1]

    currentLatLng.value = [initialLat, initialLng]

    mapInstance = L.map(mapContainer.value).setView(currentLatLng.value, 15)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance)

    markerInstance = L.marker(currentLatLng.value, { draggable: true }).addTo(mapInstance)

    markerInstance.on('dragend', (e: unknown) => {
      const event = e as { target: { getLatLng: () => { lat: number; lng: number } } }
      const position = event.target.getLatLng()
      currentLatLng.value = [position.lat, position.lng]
    })

    mapInstance.on('click', (e: unknown) => {
      const event = e as { latlng: { lat: number; lng: number } }
      if (markerInstance) {
        markerInstance.setLatLng(event.latlng)
      }
      currentLatLng.value = [event.latlng.lat, event.latlng.lng]
    })

    // Setup GeoSearch
    const provider = new OpenStreetMapProvider()
    const GeoControl = GeoSearchControl as unknown as new (
      options: Record<string, unknown>
    ) => unknown
    const searchControl = new GeoControl({
      provider,
      style: 'bar',
      showMarker: false,
      retainZoomLevel: false,
      animateZoom: true,
      autoClose: true,
      searchLabel: 'Nhập địa chỉ để tìm kiếm...'
    })

    if (mapInstance) {
      mapInstance.addControl(searchControl as import('leaflet').Control)

      mapInstance.on('geosearch/showlocation', (e: unknown) => {
        const event = e as { location: { x: number; y: number } }
        const { location } = event
        if (markerInstance) {
          markerInstance.setLatLng([location.y, location.x])
        }
        currentLatLng.value = [location.y, location.x]
      })
    }

    // Fix for Leaflet blank map in Modals (wait for transition)
    setTimeout(() => {
      if (mapInstance) {
        mapInstance.invalidateSize()
      }
    }, 300)
  }
})

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove()
  }
})

const handleConfirm = () => {
  emit('update:location', {
    latitude: currentLatLng.value[0].toString(),
    longitude: currentLatLng.value[1].toString()
  })
}

const handleCancel = () => {
  emit('close')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      class="relative z-0 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800"
    >
      <div ref="mapContainer" class="z-10 h-[400px] w-full" />
    </div>

    <div class="flex items-center justify-between">
      <div class="rounded bg-gray-50 px-2 py-1 font-mono text-sm text-gray-500 dark:bg-gray-800">
        {{ currentLatLng[0].toFixed(5) }}, {{ currentLatLng[1].toFixed(5) }}
      </div>
      <div class="flex items-center gap-2">
        <UButton color="neutral" variant="ghost" @click="handleCancel"> Hủy </UButton>
        <UButton color="primary" @click="handleConfirm"> Xác nhận vị trí </UButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import 'leaflet/dist/leaflet.css';
@import 'leaflet-geosearch/dist/geosearch.css';

/* Fix geosearch z-index to stay under modals if necessary */
:deep(.leaflet-control-geosearch form) {
  z-index: 1000;
}
</style>
