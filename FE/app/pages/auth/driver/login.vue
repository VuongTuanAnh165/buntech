<script setup lang="ts">
import { t } from '~/utils/i18n'

useSeoMeta({ title: t('auth_login_seo_driver') })
definePageMeta({ layout: 'auth' })
</script>

<template>
  <AuthLoginForm
    role="driver"
    :title="$t('auth_login_title_driver')"
    :subtitle="$t('auth_login_sub_driver')"
    icon="truck"
  />
</template>
