<script setup lang="ts">
useHead({ title: 'Đăng nhập - BunTech Admin' })
definePageMeta({ layout: 'auth' })
</script>

<template>
  <AuthLoginForm
    role="admin"
    title="Admin Portal"
    subtitle="Vui lòng đăng nhập để tiếp tục"
    icon="shield"
  />
</template>
