import { t } from '~/utils/i18n'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      t
    }
  }
})
