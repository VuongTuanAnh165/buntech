<script setup lang="ts">
useHead({ title: 'Đăng nhập - BunTech' })
definePageMeta({ layout: 'auth' })
</script>

<template>
  <AuthLoginForm
    role="retail"
    title="Khách hàng"
    subtitle="Đăng nhập để đặt bún tươi"
    icon="user"
  />
</template>
