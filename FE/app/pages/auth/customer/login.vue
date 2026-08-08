<script setup lang="ts">
useSeoMeta({ title: 'Đăng nhập - BunTech' })
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
