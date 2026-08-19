/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'vue3-leaflet' {
  import type { DefineComponent } from 'vue'

  export const LMap: DefineComponent<any, any, any>
  export const LTileLayer: DefineComponent<any, any, any>
  export const LMarker: DefineComponent<any, any, any>
  export const LPopup: DefineComponent<any, any, any>
}
