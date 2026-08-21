<script setup lang="ts">
import {
  Sparkles,
  Award,
  Users,
  Heart,
  Leaf,
  Truck,
  Target,
  Eye,
  MapPin,
  Phone,
  ChevronRight,
  Factory,
  ShieldCheck
} from 'lucide-vue-next'
import { t } from '~/utils/i18n'

useSeoMeta({ title: t('public_about_seo_title') })
definePageMeta({ layout: 'default' })

const heroImage = '/images/banner_1.webp'

const stats = computed(() => [
  { value: t('public_about_stat_1_val'), label: t('public_about_stat_1_lbl'), icon: Award },
  { value: t('public_about_stat_2_val'), label: t('public_about_stat_2_lbl'), icon: Users },
  { value: t('public_about_stat_3_val'), label: t('public_about_stat_3_lbl'), icon: Leaf },
  { value: t('public_about_stat_4_val'), label: t('public_about_stat_4_lbl'), icon: Factory }
])

const values = computed(() => [
  {
    icon: Leaf,
    title: t('public_about_val_1_title'),
    desc: t('public_about_val_1_desc')
  },
  {
    icon: Heart,
    title: t('public_about_val_2_title'),
    desc: t('public_about_val_2_desc')
  },
  {
    icon: Truck,
    title: t('public_about_val_3_title'),
    desc: t('public_about_val_3_desc')
  },
  {
    icon: ShieldCheck,
    title: t('public_about_val_4_title'),
    desc: t('public_about_val_4_desc')
  }
])

const milestones = computed(() => [
  {
    year: t('public_about_ms_1_year'),
    title: t('public_about_ms_1_title'),
    text: t('public_about_ms_1_text')
  },
  {
    year: t('public_about_ms_2_year'),
    title: t('public_about_ms_2_title'),
    text: t('public_about_ms_2_text')
  },
  {
    year: t('public_about_ms_3_year'),
    title: t('public_about_ms_3_title'),
    text: t('public_about_ms_3_text')
  },
  {
    year: t('public_about_ms_4_year'),
    title: t('public_about_ms_4_title'),
    text: t('public_about_ms_4_text')
  }
])

const team = computed(() => [
  {
    name: t('public_about_team_1_name'),
    role: t('public_about_team_1_role'),
    bio: t('public_about_team_1_bio'),
    avatar: ''
  },
  {
    name: t('public_about_team_2_name'),
    role: t('public_about_team_2_role'),
    bio: t('public_about_team_2_bio'),
    avatar: ''
  },
  {
    name: t('public_about_team_3_name'),
    role: t('public_about_team_3_role'),
    bio: t('public_about_team_3_bio'),
    avatar: ''
  },
  {
    name: t('public_about_team_4_name'),
    role: t('public_about_team_4_role'),
    bio: t('public_about_team_4_bio'),
    avatar: ''
  }
])

const faqs = computed(() => [
  {
    q: t('public_about_faq_1_q'),
    a: t('public_about_faq_1_a')
  },
  {
    q: t('public_about_faq_2_q'),
    a: t('public_about_faq_2_a')
  },
  {
    q: t('public_about_faq_3_q'),
    a: t('public_about_faq_3_a')
  },
  {
    q: t('public_about_faq_4_q'),
    a: t('public_about_faq_4_a')
  },
  {
    q: t('public_about_faq_5_q'),
    a: t('public_about_faq_5_a')
  },
  {
    q: t('public_about_faq_6_q'),
    a: t('public_about_faq_6_a')
  }
])

const openFaq = ref(-1)

const toggleFaq = (index: number) => {
  openFaq.value = openFaq.value === index ? -1 : index
}
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative flex min-h-[480px] items-center overflow-hidden">
      <div class="absolute inset-0">
        <NuxtImg :src="heroImage" alt="" class="h-full w-full object-cover" aria-hidden="true" />
        <div
          class="to-primary-950/70 absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-900/80"
        />
      </div>
      <div
        class="bg-primary-500/20 absolute top-1/4 -left-20 h-72 w-72 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        class="bg-accent-400/15 absolute right-0 bottom-0 h-80 w-80 rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div
        class="relative mx-auto w-full max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8"
      >
        <div
          class="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md"
        >
          <Sparkles class="h-4 w-4" aria-hidden="true" />
          {{ $t('public_about_hero_badge') }}
        </div>
        <h1
          class="animate-fade-in-up mb-5 text-3xl leading-tight font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
        >
          {{ $t('public_about_hero_title') }}
        </h1>
        <p
          class="animate-fade-in-up mx-auto max-w-2xl text-lg leading-relaxed text-gray-200 sm:text-xl"
          style="animation-delay: 100ms"
        >
          {{ $t('public_about_hero_desc') }}
        </p>
      </div>
    </section>

    <!-- Stats -->
    <section class="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          v-for="(stat, i) in stats"
          :key="i"
          class="card animate-fade-in-up p-6 text-center"
          :style="{ animationDelay: `${i * 80}ms` }"
        >
          <div
            class="bg-primary-50 dark:bg-primary-900/20 mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
          >
            <component
              :is="stat.icon"
              class="text-primary-600 dark:text-primary-400 h-6 w-6"
              aria-hidden="true"
            />
          </div>
          <p class="text-surface-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {{ stat.value }}
          </p>
          <p class="mt-1 text-sm text-gray-500 dark:text-zinc-400">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <!-- Story -->
    <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div class="relative">
          <div class="aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
            <NuxtImg
              src="/images/banner_2.webp"
              :alt="$t('public_about_image_alt')"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div
            class="bg-primary-600 absolute -right-4 -bottom-4 -z-10 hidden h-32 w-32 rounded-2xl sm:block"
            aria-hidden="true"
          />
          <div
            class="bg-accent-400/20 absolute -top-4 -left-4 -z-10 hidden h-24 w-24 rounded-full sm:block"
            aria-hidden="true"
          />
        </div>
        <div>
          <div
            class="text-primary-600 dark:text-primary-400 mb-4 inline-flex items-center gap-2 text-sm font-medium"
          >
            <Target class="h-4 w-4" aria-hidden="true" />
            {{ $t('public_about_story_mission') }}
          </div>
          <h2 class="text-surface-foreground mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
            {{ $t('public_about_story_title') }}
          </h2>
          <p class="mb-4 leading-relaxed text-gray-600 dark:text-zinc-300">
            {{ $t('public_about_story_p1') }}
          </p>
          <p class="mb-6 leading-relaxed text-gray-600 dark:text-zinc-300">
            {{ $t('public_about_story_p2') }}
          </p>
          <div
            class="text-primary-600 dark:text-primary-400 inline-flex items-center gap-2 text-sm font-medium"
          >
            <Eye class="h-4 w-4" aria-hidden="true" />
            {{ $t('public_about_story_vision_lbl') }}
          </div>
          <p class="mt-2 leading-relaxed text-gray-600 dark:text-zinc-300">
            {{ $t('public_about_story_vision_desc') }}
          </p>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="bg-surface py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="text-surface-foreground mb-2 text-2xl font-bold sm:text-3xl">
            {{ $t('public_about_values_title') }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-zinc-400">
            {{ $t('public_about_values_subtitle') }}
          </p>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(value, i) in values"
            :key="i"
            class="card card-hover animate-fade-in-up p-6"
            :style="{ animationDelay: `${i * 80}ms` }"
          >
            <div
              class="bg-primary-50 dark:bg-primary-900/20 mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
            >
              <component
                :is="value.icon"
                class="text-primary-600 dark:text-primary-400 h-6 w-6"
                aria-hidden="true"
              />
            </div>
            <h3 class="text-surface-foreground mb-1.5 font-semibold">{{ value.title }}</h3>
            <p class="text-sm leading-relaxed text-gray-500 dark:text-zinc-400">{{ value.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <h2
        class="text-surface-foreground mb-12 text-center text-2xl font-bold tracking-tight sm:text-3xl"
      >
        {{ $t('public_about_ms_title') }}
      </h2>
      <div class="relative">
        <div
          class="bg-surface-border absolute top-0 bottom-0 left-4 w-0.5 sm:left-1/2"
          aria-hidden="true"
        />
        <div
          v-for="(milestone, i) in milestones"
          :key="i"
          :class="[
            'animate-fade-in-up relative mb-8 flex items-center',
            i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
          ]"
          :style="{ animationDelay: `${i * 100}ms` }"
        >
          <div class="hidden flex-1 sm:block" />
          <div
            class="bg-primary-600 ring-primary-100 dark:ring-primary-900/30 absolute left-4 h-3 w-3 -translate-x-1/2 rounded-full ring-4 sm:left-1/2"
            aria-hidden="true"
          />
          <div class="ml-12 sm:ml-0 sm:w-1/2 sm:px-8">
            <div class="card card-hover p-5">
              <p class="text-primary-600 dark:text-primary-400 mb-1 text-lg font-bold">
                {{ milestone.year }}
              </p>
              <p class="text-surface-foreground mb-1 text-sm font-semibold">
                {{ milestone.title }}
              </p>
              <p class="text-sm leading-relaxed text-gray-600 dark:text-zinc-300">
                {{ milestone.text }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team -->
    <section class="bg-surface py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="text-surface-foreground mb-2 text-2xl font-bold sm:text-3xl">
            {{ $t('public_about_team_title') }}
          </h2>
          <p class="text-sm text-gray-500 dark:text-zinc-400">
            {{ $t('public_about_team_subtitle') }}
          </p>
        </div>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(member, i) in team"
            :key="i"
            class="card card-hover animate-fade-in-up p-6 text-center"
            :style="{ animationDelay: `${i * 80}ms` }"
          >
            <div
              class="from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/10 ring-primary-100 dark:ring-primary-900/30 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ring-1"
            >
              <UAvatar :alt="member.name" size="lg" />
            </div>
            <h3 class="text-surface-foreground mb-0.5 font-semibold">{{ member.name }}</h3>
            <p class="text-primary-600 dark:text-primary-400 mb-2 text-sm font-medium">
              {{ member.role }}
            </p>
            <p class="text-xs leading-relaxed text-gray-500 dark:text-zinc-400">{{ member.bio }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <h2
        class="text-surface-foreground mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl"
      >
        {{ $t('public_about_faq_title') }}
      </h2>
      <div class="space-y-3">
        <div v-for="(faq, i) in faqs" :key="i" class="card overflow-hidden">
          <UButton
            variant="ghost"
            color="neutral"
            type="button"
            class="text-surface-foreground hover:bg-surface-hover flex min-h-[44px] w-full items-center justify-between p-4 text-left font-medium transition-colors"
            :aria-expanded="openFaq === i"
            @click="toggleFaq(i)"
          >
            {{ faq.q }}
            <ChevronRight
              :class="[
                'ml-2 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-300 dark:text-zinc-500',
                openFaq === i ? 'rotate-90' : ''
              ]"
              aria-hidden="true"
            />
          </UButton>
          <div
            v-show="openFaq === i"
            class="animate-fade-in px-4 pb-4 text-sm leading-relaxed text-gray-600 dark:text-zinc-300"
          >
            {{ faq.a }}
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div
        class="from-primary-600 to-primary-800 relative overflow-hidden rounded-3xl bg-gradient-to-br px-6 py-12 text-center sm:px-12 sm:py-16"
      >
        <div
          class="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 blur-3xl"
          aria-hidden="true"
        />
        <div
          class="bg-accent-400/10 absolute bottom-0 left-0 h-72 w-72 rounded-full blur-3xl"
          aria-hidden="true"
        />
        <div class="relative">
          <h2 class="mb-4 text-2xl font-bold text-white sm:text-3xl">
            {{ $t('public_about_cta_title') }}
          </h2>
          <p class="mx-auto mb-8 max-w-xl text-white/80">
            {{ $t('public_about_cta_desc') }}
          </p>
          <div class="flex flex-col justify-center gap-3 sm:flex-row">
            <NuxtLink to="/quick-order">
              <UButton
                color="primary"
                size="lg"
                class="!text-primary-600 group !bg-white hover:!bg-white/90"
              >
                {{ $t('public_about_cta_btn_order') }}
                <ChevronRight
                  class="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </UButton>
            </NuxtLink>
            <NuxtLink :to="`tel:${$config.public.contactPhone}`">
              <UButton
                variant="outline"
                size="lg"
                class="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20"
              >
                <Phone class="h-4 w-4" aria-hidden="true" />
                {{ $t('public_about_cta_btn_call') }}
              </UButton>
            </NuxtLink>
          </div>
          <div class="mt-6 flex items-center justify-center gap-2 text-sm text-white/60">
            <MapPin class="h-4 w-4" aria-hidden="true" />
            {{ $t('public_about_cta_address') }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
