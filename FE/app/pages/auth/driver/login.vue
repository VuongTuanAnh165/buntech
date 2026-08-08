<script setup lang="ts">
useHead({ title: 'Tài xế - BunTech' })
definePageMeta({ layout: 'auth' })
</script>

<template>
  <AuthLoginForm
    role="driver"
    title="Tài xế giao hàng"
    subtitle="Đăng nhập để nhận đơn hàng"
    icon="truck"
  />
</template>
