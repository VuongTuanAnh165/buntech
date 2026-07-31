import type { Directive, DirectiveBinding } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  const authStore = useAuthStore()

  const permissionDirective: Directive<HTMLElement, string[]> = {
    mounted(el: HTMLElement, binding: DirectiveBinding<string[]>) {
      const allowedRoles = binding.value || []
      if (allowedRoles.length === 0) return
      if (!authStore.role || !allowedRoles.includes(authStore.role)) {
        el.parentNode?.removeChild(el)
      }
    },
    updated(el: HTMLElement, binding: DirectiveBinding<string[]>) {
      const allowedRoles = binding.value || []
      if (allowedRoles.length === 0) return
      if (!authStore.role || !allowedRoles.includes(authStore.role)) {
        el.parentNode?.removeChild(el)
      }
    },
  }

  nuxtApp.vueApp.directive('permission', permissionDirective)
})
