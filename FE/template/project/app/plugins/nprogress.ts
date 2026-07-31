import NProgress from 'nprogress'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:start', () => {
    NProgress.start()
  })
  nuxtApp.hook('page:finish', () => {
    NProgress.done()
  })
})
