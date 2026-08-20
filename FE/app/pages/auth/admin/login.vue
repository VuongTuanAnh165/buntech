<script setup lang="ts">
import { t } from '~/utils/i18n'

useSeoMeta({ title: t('auth_login_seo_admin') })
definePageMeta({ layout: 'auth' })
</script>

<template>
  <AuthLoginForm
    role="admin"
    :title="$t('auth_login_title_admin')"
    :subtitle="$t('auth_login_sub_admin')"
    icon="shield"
  />
</template>
