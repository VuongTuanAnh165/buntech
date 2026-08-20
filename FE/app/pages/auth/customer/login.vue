<script setup lang="ts">
import { t } from '~/utils/i18n'

useSeoMeta({ title: t('auth_login_seo_customer') })
definePageMeta({ layout: 'auth' })
</script>

<template>
  <AuthLoginForm
    role="retail"
    :title="$t('common_customer')"
    :subtitle="$t('auth_login_sub_customer')"
    icon="user"
  />
</template>
