<script setup lang="ts">
import HeroSection from '~/components/landing/HeroSection.vue'
import LandingTrustBadges from '~/components/landing/LandingTrustBadges.vue'
import LandingProductShowcase from '~/components/landing/LandingProductShowcase.vue'
import LandingFeatureGrid from '~/components/landing/LandingFeatureGrid.vue'
import LandingTestimonials from '~/components/landing/LandingTestimonials.vue'
import LandingCTASection from '~/components/landing/LandingCTASection.vue'

useSeoMeta({ title: 'BunTech - Xưởng bún gia đình truyền thống 3 đời' })
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
