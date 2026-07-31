
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('toast', useToast())
})
