<script setup lang="ts">
import HeroSection from '~/components/landing/HeroSection.vue'
import LandingTrustBadges from '~/components/landing/LandingTrustBadges.vue'
import LandingProductShowcase from '~/components/landing/LandingProductShowcase.vue'
import LandingFeatureGrid from '~/components/landing/LandingFeatureGrid.vue'
import LandingTestimonials from '~/components/landing/LandingTestimonials.vue'
import LandingCTASection from '~/components/landing/LandingCTASection.vue'
import { t } from '~/utils/i18n'

useSeoMeta({ title: t('public_landing_seo_title') })
definePageMeta({ layout: 'default' })
</script>

<template>
  <div>
    <HeroSection />
    <LandingTrustBadges />
    <LandingProductShowcase />
    <LandingFeatureGrid />
    <LandingTestimonials />
    <LandingCTASection />
  </div>
</template>
