<script setup lang="ts">
import { ref } from 'vue'
import { driverNavigationItems } from '~/utils/navigation'
const route = useRoute()
const isOnline = ref(true)
</script>
<template>
  <div class="min-h-screen bg-neutral-100 dark:bg-neutral-900 font-sans pb-16">
    <!-- Top Bar -->
    <header class="sticky top-0 z-40 bg-gradient-to-r from-primary-600 to-primary-700 shadow-md">
      <div class="max-w-md mx-auto px-4 h-14 flex items-center justify-between text-white">
        <div class="flex items-center gap-2">
          <UAvatar src="https://i.pravatar.cc/150?u=driver" size="sm" class="ring-2 ring-white/20" />
          <div class="font-medium text-sm">Tài xế Tâm</div>
        </div>
        <UButton 
          size="xs" 
          :color="isOnline ? 'success' : 'neutral'" 
          :variant="isOnline ? 'solid' : 'soft'"
          class="rounded-full transition-all duration-300"
          :class="isOnline ? 'shadow-[0_0_10px_rgba(16,185,129,0.4)]' : ''"
          @click="() => { isOnline = !isOnline }"
        >
          <template #leading>
            <div class="w-1.5 h-1.5 rounded-full" :class="isOnline ? 'bg-white animate-pulse' : 'bg-neutral-500'"/>
          </template>
          {{ isOnline ? 'Đang nhận chuyến' : 'Ngoại tuyến' }}
        </UButton>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-md mx-auto min-h-screen">
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 glass border-t border-neutral-200 dark:border-neutral-800 safe-area-bottom">
      <div class="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        <NuxtLink
          v-for="item in driverNavigationItems"
          :key="String(item.to)"
          :to="item.to"
          class="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors duration-200 group relative"
          :class="route.path.startsWith(String(item.to)) ? 'text-primary-500' : 'text-neutral-500 dark:text-neutral-400 hover:text-primary-400'"
        >
          <UIcon 
            :name="item.icon" 
            class="w-6 h-6 transition-transform duration-300"
            :class="route.path.startsWith(String(item.to)) ? 'scale-110' : 'group-active:scale-95'"
          />
          <span class="text-[10px] font-medium">{{ item.label }}</span>
          
          <div v-if="route.path.startsWith(String(item.to))" class="absolute top-0 inset-x-4 h-0.5 bg-primary-500 rounded-b-full"/>
        </NuxtLink>
      </div>
    </nav>
  </div>
</template>
