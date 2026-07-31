<script setup lang="ts">
import { LogOut } from 'lucide-vue-next'
const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
function handleLogout() {
  authStore.logout()
  router.push('/auth/driver/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
    <header class="bg-gray-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">B</div>
        <span class="font-bold">BunTech Driver</span>
      </div>
      <button class="text-gray-400 hover:text-white p-2" @click="handleLogout">
        <LogOut class="w-5 h-5" />
      </button>
    </header>
    <main class="flex-1 pb-20">
      <slot />
    </main>
  </div>
</template>
